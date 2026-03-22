import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, Trophy, MapIcon, Shield, Swords, ChevronRight, ChevronLeft, Volume2, VolumeX, Flame, Heart, Zap, Eye } from 'lucide-react';
import type { Mission, Character, Language, Room, DifficultyMode } from '../../types';
import { translations } from '../../i18n/translations';
import { lt, resolveFormula } from '../../i18n/resolveText';
import { checkAnswer, checkPartialCredit } from '../../utils/checkCorrectness';
import { interpolate } from '../../utils/interpolate';
import { tapScale, hoverGlow, buttonBase, VICTORY_TIMING, BATTLE_TIMING } from '../../utils/animationPresets';
import { LatexText, MathView } from '../MathView';
import { InputFields } from './InputFields';
import { VisualData } from './VisualData';
import { AnimatedTutorial } from './AnimatedTutorial';
import { useAudio } from '../../audio';
import { CharacterAvatar } from '../CharacterAvatar';
import { Confetti } from '../Confetti';
import { AchievementCard } from '../AchievementCard';
import { AnimatedCounter } from '../AnimatedCounter';
import { SkillBadgeCard } from '../SkillBadgeCard';
import { WrongAnswerPanel } from './WrongAnswerPanel';
import { generateMission } from '../../utils/generateMission';
import { SKILL_CARDS } from '../SkillCardSelector';
import { CalculatorWidget } from '../Calculator';

const DIFFICULTY_MULTIPLIER: Record<DifficultyMode, number> = { green: 1, amber: 1.5, red: 2 };
const TOTAL_QUESTIONS = 5;

export const MathBattle = ({
  mission,
  character,
  onComplete,
  onCancel,
  lang,
  difficultyMode,
  isMultiplayer = false,
  roomData = null,
  skillCard = null,
  isFirstClear = false,
  completedDifficulties = {},
  isDailyChallenge = false,
  dailyMultiplier = 1,
  onStreakToken,
}: {
  mission: Mission;
  character: Character;
  onComplete: (success: boolean, score?: number, durationSecs?: number, hpRemaining?: number) => void;
  onCancel: () => void;
  lang: Language;
  difficultyMode: DifficultyMode;
  isMultiplayer?: boolean;
  roomData?: Room | null;
  skillCard?: string | null;
  isFirstClear?: boolean;
  completedDifficulties?: Record<string, boolean>;
  isDailyChallenge?: boolean;
  dailyMultiplier?: number;
  onStreakToken?: () => void;
}) => {
  const isMultiQuestion = !!mission.data?.generatorType;

  // Build question queue: 5 generated questions for multi-question, or just [mission] for single
  const [questionQueue] = useState<Mission[]>(() => {
    if (!isMultiQuestion) return [mission];
    return Array.from({ length: TOTAL_QUESTIONS }, () => generateMission(mission));
  });

  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [peakStreak, setPeakStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [floatingScore, setFloatingScore] = useState<{ value: string; key: number } | null>(null);

  const currentQuestion = questionQueue[currentQIdx];

  // Tutorial only for single-question green mode
  const showTutorial = !isMultiQuestion && difficultyMode === 'green' && mission.tutorialSteps && !isMultiplayer;
  const [mode, setMode] = useState<'tutorial' | 'battle'>(showTutorial ? 'tutorial' : 'battle');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [encouragement, setEncouragement] = useState('');
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [showResult, setShowResult] = useState<'none' | 'success' | 'fail'>('none');
  const [wrongAnswerData, setWrongAnswerData] = useState<{ userInputs: Record<string, string>; expected: Record<string, string> } | null>(null);
  const [hp, setHp] = useState(4);
  const [startTime] = useState(Date.now());
  const [victoryPhase, setVictoryPhase] = useState<0|1|2|3|4|5>(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confettiTheme, setConfettiTheme] = useState<'default' | 'goldWhite'>('default');
  const [finalScore, setFinalScore] = useState(0);
  const [finalDuration, setFinalDuration] = useState(0);
  const [shieldCharges, setShieldCharges] = useState(skillCard === 'shield' ? 2 : 0);
  const [streakMilestone, setStreakMilestone] = useState<number | null>(null);
  const [partialCreditInfo, setPartialCreditInfo] = useState<{ score: number } | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const shaking = shakeKey > 0;
  const achievementTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const milestoneTimerRef = useRef<number | null>(null);
  const victoryReturnTimerRef = useRef<number | null>(null);
  const floatingKeyRef = useRef(0);

  const {
    playBGM, stopBGM, playClick, muted, toggleMute,
    playCorrect, playWrong, playVictory, playDefeat,
    playStreak, playStreakBreak, playHpLoss,
    playShieldBlock, playBattleEnter, playPartialCredit,
  } = useAudio();

  const t = translations[lang];
  const isTutorial = mode === 'tutorial' && !!mission.tutorialSteps;

  // Interpolate {param} placeholders using current question's data
  const p = currentQuestion.data ?? {};
  const storyText = interpolate(lt(currentQuestion.story, lang), p);
  const descText = interpolate(lt(currentQuestion.description, lang), p);

  // Interpolate tutorialSteps with mission data (same as story/description)
  const interpolatedTutorialSteps = currentQuestion.tutorialSteps?.map(step => ({
    ...step,
    text: { zh: interpolate(step.text.zh, p), en: interpolate(step.text.en, p) },
    ...(step.hint ? { hint: { zh: interpolate(step.hint.zh, p), en: interpolate(step.hint.en, p) } } : {}),
  }));

  // Streak multiplier: >=5 -> x2, >=3 -> x1.5, else x1
  const getStreakMultiplier = (s: number) => s >= 5 ? 2 : s >= 3 ? 1.5 : 1;

  // Battle enter stinger → BGM start on mount
  useEffect(() => {
    playBattleEnter();
    playBGM();
    return () => {
      stopBGM();
      if (achievementTimerRef.current !== null) clearTimeout(achievementTimerRef.current);
      if (shakeTimerRef.current !== null) clearTimeout(shakeTimerRef.current);
      if (advanceTimerRef.current !== null) clearTimeout(advanceTimerRef.current);
      if (milestoneTimerRef.current !== null) clearTimeout(milestoneTimerRef.current);
      if (victoryReturnTimerRef.current !== null) clearTimeout(victoryReturnTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (showResult === 'fail') {
      const randomEnc = t.encouragements[Math.floor(Math.random() * t.encouragements.length)];
      setEncouragement(randomEnc);
    }
  }, [showResult]);

  const triggerVictorySequence = () => {
    setShowResult('success');
    
    // Phase A: Dim screen transition & Shockwave/Confetti
    setVictoryPhase(0); // Ensure dimming is visible first
    window.setTimeout(() => stopBGM(), VICTORY_TIMING.dimScreen - 50);
    window.setTimeout(() => {
      playVictory();
      setConfettiTheme('default');
      setConfettiTrigger(prev => prev + 1);
      setVictoryPhase(1); // Shockwave starts after dimming and audio setup
    }, VICTORY_TIMING.dimScreen);

    // Phase B: Badge drop
    achievementTimerRef.current = window.setTimeout(() => {
      setVictoryPhase(2);
    }, VICTORY_TIMING.badgeDrop);

    // Phase C: Stats show
    advanceTimerRef.current = window.setTimeout(() => setVictoryPhase(3), VICTORY_TIMING.statsReveal);

    // Phase D: Skill Badge or skip to E
    shakeTimerRef.current = window.setTimeout(() => {
      if (mission.skillName) {
        setVictoryPhase(4);
        setConfettiTheme('goldWhite');
        setConfettiTrigger(prev => prev + 1);
        // Return button appears after badge animation
        victoryReturnTimerRef.current = window.setTimeout(() => setVictoryPhase(5), VICTORY_TIMING.returnButton - VICTORY_TIMING.skillBadge);
      } else if (isFirstClear) {
        setConfettiTheme('goldWhite');
        setConfettiTrigger(prev => prev + 1);
        setVictoryPhase(5); // Skip SkillBadge phase, go straight to return button
      } else {
        setVictoryPhase(5); // No skill, no first clear, just show return button
      }
    }, VICTORY_TIMING.skillBadge);
  };

  const handleSubmit = () => {
    playClick();
    const rawResult = checkAnswer(currentQuestion, inputs);
    const result = checkPartialCredit(currentQuestion, inputs, rawResult);

    if (result.correct) {
      if (isMultiQuestion) {
        // Multi-question: combo scoring
        const newStreak = streak + 1;
        // Play streak sound (which supersedes correct) or plain correct
        if (newStreak >= 2) playStreak(newStreak);
        else playCorrect();
        const streakMult = getStreakMultiplier(newStreak);
        const diffMult = DIFFICULTY_MULTIPLIER[difficultyMode];
        const doubleMult = (skillCard === 'double' && currentQIdx >= 2) ? 2 : 1;
        const score = Math.round(currentQuestion.reward * streakMult * diffMult * doubleMult * dailyMultiplier);

        setStreak(newStreak);
        setPeakStreak(prev => Math.max(prev, newStreak));
        setCorrectCount(prev => prev + 1);
        const newTotal = totalScore + score;
        setTotalScore(newTotal);

        // Streak milestone flash (3/5/8)
        if ([3, 5, 8].includes(newStreak)) {
          setStreakMilestone(newStreak);
          if (milestoneTimerRef.current !== null) clearTimeout(milestoneTimerRef.current);
          milestoneTimerRef.current = window.setTimeout(() => setStreakMilestone(null), 800);
          // Award streak token at streak 5
          if (newStreak === 5 && onStreakToken) onStreakToken();
        }

        // Floating score
        const multLabel = doubleMult > 1 ? `x${streakMult * doubleMult}` : streakMult > 1 ? `x${streakMult}` : '';
        const label = multLabel ? `+${score} (${multLabel})` : `+${score}`;
        floatingKeyRef.current += 1;
        setFloatingScore({ value: label, key: floatingKeyRef.current });

        // Check if this was the last question
        if (currentQIdx + 1 >= questionQueue.length) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          setFinalDuration(duration);
          setFinalScore(newTotal);
          advanceTimerRef.current = window.setTimeout(() => {
            triggerVictorySequence();
          }, BATTLE_TIMING.advance);
        } else {
          advanceTimerRef.current = window.setTimeout(() => {
            setInputs({});
            setWrongAnswerData(null);
            setPartialCreditInfo(null);
            setCurrentQIdx(prev => prev + 1);
          }, BATTLE_TIMING.advance);
        }
      } else {
        // Single-question: victory replaces correct (avoid overlap)
        const duration = (Date.now() - startTime) / 1000;
        const speedBonus = Math.max(0, 100 - Math.floor(duration));
        const multiplier = DIFFICULTY_MULTIPLIER[difficultyMode];
        const score = Math.round((mission.reward + speedBonus) * multiplier * dailyMultiplier);
        setFinalScore(score);
        setFinalDuration(Math.round(duration));
        triggerVictorySequence();
      }
    } else if (result.partial) {
      // Partial credit: 50% score, no HP loss, no streak break
      playPartialCredit();
      if (isMultiQuestion) {
        const diffMult = DIFFICULTY_MULTIPLIER[difficultyMode];
        const partialScore = Math.round(currentQuestion.reward * 0.5 * diffMult * dailyMultiplier);
        const newTotal = totalScore + partialScore;
        setTotalScore(newTotal);
        // Don't break streak, don't increment correctCount (partial ≠ correct)

        floatingKeyRef.current += 1;
        setFloatingScore({ value: `+${partialScore} (50%)`, key: floatingKeyRef.current });
        setPartialCreditInfo({ score: partialScore });

        // Show partial wrong answer panel then advance
        setWrongAnswerData({ userInputs: { ...inputs }, expected: result.expected });
      } else {
        // Single question partial: show encouraging review panel, let them retry
        // No score awarded — score only on full correct
        setPartialCreditInfo({ score: 0 });
        setWrongAnswerData({ userInputs: { ...inputs }, expected: result.expected });
      }
    } else {
      playWrong();
      setPartialCreditInfo(null);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      setShakeKey(k => k + 1);
      shakeTimerRef.current = window.setTimeout(() => setShakeKey(0), BATTLE_TIMING.shake);
      // Show wrong answer panel with solution before deducting HP
      setWrongAnswerData({ userInputs: { ...inputs }, expected: result.expected });
    }
  };

  const handleWrongAnswerContinue = () => {
    const wasPartial = !!partialCreditInfo;
    setWrongAnswerData(null);
    setInputs({});
    setPartialCreditInfo(null);

    // Partial credit: no HP loss, no streak break — just advance
    if (wasPartial) {
      if (isMultiQuestion) {
        if (currentQIdx + 1 >= questionQueue.length) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          setFinalDuration(duration);
          setFinalScore(totalScore);
          advanceTimerRef.current = window.setTimeout(() => triggerVictorySequence(), BATTLE_TIMING.advance);
        } else {
          setCurrentQIdx(prev => prev + 1);
        }
      }
      // Single question partial: just close the panel, let them retry
      return;
    }

    if (isMultiQuestion) {
      // Reset streak on wrong
      if (streak >= 2) playStreakBreak();
      setStreak(0);

      // Shield absorbs wrong answer damage
      if (shieldCharges > 0) {
        playShieldBlock();
        setShieldCharges(prev => prev - 1);
        // Shield absorbed — still alive, advance
        if (currentQIdx + 1 >= questionQueue.length) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          setFinalDuration(duration);
          setFinalScore(totalScore);
          advanceTimerRef.current = window.setTimeout(() => {
            triggerVictorySequence();
          }, BATTLE_TIMING.shieldVictory);
        } else {
          setCurrentQIdx(prev => prev + 1);
        }
        return;
      }

      playHpLoss();
      const nextHp = hp - 1;
      setHp(nextHp);
      if (nextHp <= 0) {
        // Show fail overlay immediately to block interaction;
        // defeat sound plays after hpLoss fades
        setShowResult('fail');
        stopBGM();
        advanceTimerRef.current = window.setTimeout(() => playDefeat(), BATTLE_TIMING.defeatSound);
      }

      // Still alive — advance to next question
      if (nextHp > 0) {
        if (currentQIdx + 1 >= questionQueue.length) {
          // Was last question, show success (they survived)
          const duration = Math.round((Date.now() - startTime) / 1000);
          setFinalDuration(duration);
          setFinalScore(totalScore);
          advanceTimerRef.current = window.setTimeout(() => {
            stopBGM();
            triggerVictorySequence();
          }, BATTLE_TIMING.shieldVictory);
        } else {
          setCurrentQIdx(prev => prev + 1);
        }
      }
    } else {
      // Single-question: original behavior
      const nextSingleHp = hp - 1;
      setHp(nextSingleHp);
      if (nextSingleHp <= 0) {
        setShowResult('fail');
        stopBGM();
        advanceTimerRef.current = window.setTimeout(() => playDefeat(), BATTLE_TIMING.defeatSound);
      }
    }
  };

  const handleAchievementClose = () => {
    onComplete(true, isMultiQuestion ? totalScore : finalScore, finalDuration, hp);
  };

  const handleRetry = () => {
    setHp(4);
    setShowResult('none');
    setInputs({});
    setWrongAnswerData(null);
    setPartialCreditInfo(null);
    setStreakMilestone(null);
    setCurrentQIdx(0);
    setCorrectCount(0);
    setStreak(0);
    setPeakStreak(0);
    setTotalScore(0);
    setFloatingScore(null);
    setShieldCharges(skillCard === 'shield' ? 2 : 0);
    setConfettiTheme('default');
    setVictoryPhase(0);
    playBGM();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 bg-slate-900/95 backdrop-blur-md">
    <div className="min-h-full flex items-center justify-center py-4">
      <Confetti trigger={confettiTrigger} />
      <CalculatorWidget
        lang={lang}
        onUseResult={(val) => setInputs(prev => {
          // Put result in the first empty field, or the first field
          const fields = Object.keys(prev);
          const emptyField = fields.find(f => !prev[f]) || fields[0];
          if (emptyField) return { ...prev, [emptyField]: val };
          return prev;
        })}
      />

      <motion.div
        key={`battle-${shakeKey}`}
        initial={shakeKey > 0 ? false : { scale: 0.9, opacity: 0 }}
        animate={shaking ? { x: [0, -6, 6, -4, 4, -2, 2, 0], scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={shaking ? { duration: 0.4, ease: 'easeOut' } : undefined}
        className={`bg-parchment w-full max-w-3xl rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[3px] md:border-[6px] border-ink relative ${shaking ? 'border-red-600' : ''}`}
      >
        {/* Header */}
        <div className="bg-[#3d2b1f] p-4 text-[#f4e4bc] flex justify-between items-center border-b-4 border-[#5c4033]">
          <div className="flex items-center gap-4">
            <CharacterAvatar characterId={character.id} size={56} />
            <div>
              <h2 className="text-base md:text-xl font-black tracking-widest">{lt(character.name, lang)} - {lt(mission.title, lang)}</h2>
              <div className="flex gap-1 mt-1 items-center">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full border border-black ${i < hp ? 'bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.8)]' : 'bg-slate-800'}`} />
                ))}
                <span className="text-[10px] ml-2 font-bold text-red-400 uppercase">{t.hp}</span>

                {/* Streak badge */}
                {isMultiQuestion && streak >= 2 && (
                  <span className="ml-3 flex items-center gap-1 px-2 py-0.5 rounded bg-orange-600 text-[10px] font-black uppercase animate-pulse">
                    <Flame size={12} />
                    {streak} {t.streakLabel}
                  </span>
                )}

                {/* Shield charges indicator */}
                {skillCard === 'shield' && shieldCharges > 0 && (
                  <span className="ml-3 px-2 py-0.5 rounded bg-blue-600/60 text-[10px] font-black flex items-center gap-1">
                    <Shield size={12} /> {'\u00D7'}{shieldCharges}
                  </span>
                )}

                {/* Difficulty badge */}
                <span className="ml-4 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600">
                  {t.challenge}
                </span>

                {/* Daily challenge indicator */}
                {isDailyChallenge && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-yellow-500 text-black flex items-center gap-1">
                    {t.dailyChallenge} ×{dailyMultiplier}
                  </span>
                )}

                {/* Active skill card badge */}
                {skillCard && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-600/50 flex items-center gap-1">
                    {skillCard === 'shield' ? <Shield size={10} /> : skillCard === 'double' ? <Zap size={10} /> : <Eye size={10} />}
                    {lt(SKILL_CARDS.find(c => c.id === skillCard)!.name, lang)}
                  </span>
                )}
              </div>

              {/* Progress indicator for multi-question */}
              {isMultiQuestion && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold text-[#f4e4bc]/70">
                    {(t.questionProgress as string).replace('{n}', String(currentQIdx + 1)).replace('{total}', String(questionQueue.length))}
                  </span>
                  <div className="hidden sm:flex gap-1">
                    {questionQueue.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < currentQIdx ? 'bg-emerald-400' :
                          i === currentQIdx ? 'bg-yellow-400' :
                          'bg-parchment/30'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex sm:hidden flex-1 h-1.5 bg-parchment/20 rounded-full overflow-hidden max-w-[80px]">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{ width: `${((currentQIdx + 1) / questionQueue.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mute button */}
            <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            {!isMultiplayer && (
              <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <XCircle size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Battle Content */}
        <div className="p-2 md:p-4 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Left: Tactical Map */}
          <div className="bg-parchment-dark rounded-lg p-6 border-2 border-ink/20 shadow-inner">
            <div className="flex items-center gap-2 mb-4 text-ink font-bold border-b border-ink/10 pb-2">
              <MapIcon size={18} />
              <span>{t.calculating}</span>
            </div>

            <div className="bg-white/40 p-3 rounded-lg mb-4 italic text-xs text-ink-light border-l-4 border-[#8b0000]">
              <LatexText text={storyText} />
            </div>

            <div className="text-ink-light text-sm font-bold mb-6 leading-relaxed">
              <LatexText text={descText} />
            </div>
            <VisualData mission={currentQuestion} lang={lang} />

            {/* Reveal skill card: show formula hint on Q1 */}
            {skillCard === 'reveal' && currentQIdx === 0 && (
              <div className="mt-4 p-3 bg-purple-100 border-2 border-purple-300 rounded-lg">
                <div className="text-purple-800 text-xs font-bold mb-1">{'\u{1F52E}'} {t.secretFormula}</div>
                <MathView tex={resolveFormula(currentQuestion.secret.formula, lang)} className="text-lg font-black text-purple-900" />
              </div>
            )}

            {/* Amber mode: show formula hint */}
            {difficultyMode === 'amber' && (
              <div className="mt-4 p-3 bg-amber-100 border-2 border-amber-300 rounded-lg">
                <div className="text-amber-800 text-xs font-bold mb-1">{t.secretFormula}</div>
                <MathView tex={resolveFormula(currentQuestion.secret.formula, lang)} className="text-lg font-black text-amber-900" />
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-ink/10">
              <div className="flex items-center gap-2 text-ink-light text-xs font-bold">
                <Shield size={14} />
                <span>{t.defense}：{character.stats.wisdom}</span>
              </div>
            </div>
          </div>

          {/* Right: Inputs */}
          <div className="space-y-6">
            {/* Tutorial overlay for Green mode (single-question only) */}
            {isTutorial && interpolatedTutorialSteps && (
              <AnimatedTutorial
                tutorialSteps={interpolatedTutorialSteps}
                equationSteps={mission.data?.tutorialEquationSteps}
                characterId={character.id}
                currentStep={tutorialStep}
                lang={lang}
              />
            )}

            <InputFields
              mission={currentQuestion}
              inputs={inputs}
              setInputs={setInputs}
              difficultyMode={difficultyMode}
              tutorialStep={tutorialStep}
              isTutorial={isTutorial}
              lang={lang}
            />

            {/* Wrong answer review panel (with partial credit variant) */}
            {wrongAnswerData && (
              <WrongAnswerPanel
                questionType={currentQuestion.type}
                userInputs={wrongAnswerData.userInputs}
                expected={wrongAnswerData.expected}
                formula={resolveFormula(currentQuestion.secret.formula, lang)}
                tutorialSteps={interpolatedTutorialSteps}
                lang={lang}
                onContinue={handleWrongAnswerContinue}
                storyText={!partialCreditInfo && mission.storyConsequence ? lt(mission.storyConsequence.wrong, lang) : undefined}
                isPartial={!!partialCreditInfo}
                partialScore={partialCreditInfo?.score}
              />
            )}

            {isTutorial ? (
              <div className="flex gap-2">
                {tutorialStep > 0 && (
                  <button
                    onClick={() => { playClick(); setTutorialStep(prev => prev - 1); }}
                    className="flex-1 py-4 bg-slate-500 text-white font-black rounded-lg shadow-lg hover:bg-slate-600 transition-all flex items-center justify-center gap-2 min-h-12"
                  >
                    <ChevronLeft size={20} />
                    {t.prevStep}
                  </button>
                )}
                <button
                  onClick={() => {
                    playClick();
                    if (tutorialStep < (mission.tutorialSteps?.length || 0) - 1) {
                      setTutorialStep(prev => prev + 1);
                    } else {
                      setMode('battle');
                      setInputs({});
                    }
                  }}
                  className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 min-h-12"
                >
                  {tutorialStep < (mission.tutorialSteps?.length || 0) - 1 ? t.nextStep : t.tutorialStartBattle}
                  <ChevronRight size={20} />
                </button>
              </div>
            ) : (
              <motion.button
                {...(wrongAnswerData ? {} : { ...tapScale, ...hoverGlow })}
                onClick={handleSubmit}
                disabled={!!wrongAnswerData}
                className={`w-full py-4 md:py-6 text-[#f4e4bc] text-lg md:text-2xl font-black rounded-lg transition-shadow flex items-center justify-center gap-4 border-2 min-h-12 ${wrongAnswerData ? 'bg-slate-500 border-slate-600 cursor-not-allowed' : 'bg-[#8b0000] shadow-[0_4px_0_#5c0000] border-[#5c0000]'}`}
              >
                <Swords size={28} />
                {t.attack}
              </motion.button>
            )}

          </div>
        </div>

        {/* Streak Milestone Golden Flash */}
        <AnimatePresence>
          {streakMilestone && (
            <motion.div
              key={`milestone-${streakMilestone}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-0 bg-gradient-to-b from-yellow-400/30 via-yellow-500/10 to-transparent pointer-events-none z-[25]"
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {streakMilestone && (
            <motion.div
              key={`milestone-text-${streakMilestone}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.3, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8 }}
              className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 text-center"
            >
              <div className="text-5xl font-black text-yellow-400 drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(250,204,21,0.5)' }}>
                {streakMilestone} {t.streakLabel}!
              </div>
              {streakMilestone === 5 && (
                <div className="text-lg font-black text-amber-300 mt-1">{t.streakToken} +1</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Score Animation */}
        <AnimatePresence>
          {floatingScore && (
            <motion.div
              key={floatingScore.key}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -60, opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 pointer-events-none z-30 text-3xl font-black text-yellow-500 drop-shadow-lg"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
            >
              {floatingScore.value}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Overlay */}
        <AnimatePresence>
          {showResult !== 'none' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className={`absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 text-center z-20 overflow-hidden ${
                showResult === 'success' ? 'bg-transparent' : 'bg-ink/90'
              }`}
            >
              {showResult === 'success' ? (() => {
                const willBePerfect = Object.values({ ...completedDifficulties, [difficultyMode]: true }).filter(Boolean).length === 3;
                
                return (
                  <>
                    {/* Phase A: Background & Shockwave */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-black pointer-events-none"
                    />
                    {victoryPhase >= 1 && (
                      <>
                        <motion.div
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{ scale: 3, opacity: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="absolute inset-0 m-auto w-[300px] h-[300px] rounded-full border-[20px] border-yellow-400 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.2)_0%,transparent_70%)] pointer-events-none" />
                      </>
                    )}

                    {/* Phase B: Badge Drop */}
                    {victoryPhase >= 2 && (
                      <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                          initial={{ y: -200, scale: 1.5, rotateZ: -15 }}
                          animate={{ y: 0, scale: 1, rotateZ: 0 }}
                          transition={{ type: "spring", bounce: 0.4 }}
                          className="relative"
                        >
                          {/* First Clear / Perfect Clear Halo */}
                          {(isFirstClear || willBePerfect) && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className={`absolute -inset-8 rounded-full border-4 border-dashed opacity-50 ${willBePerfect ? 'border-purple-400' : 'border-yellow-400'}`}
                            />
                          )}
                          <div className={`w-32 h-32 rounded-full border-8 shadow-2xl flex items-center justify-center overflow-hidden ${willBePerfect ? 'border-purple-500 bg-gradient-to-br from-yellow-400 to-purple-600' : 'border-yellow-500 bg-gradient-to-br from-ink to-ink-light'}`}>
                            <CharacterAvatar characterId={character.id} size={96} />
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="mt-6"
                        >
                          <h3 className="text-4xl md:text-6xl font-black text-ink mb-2 drop-shadow-md">
                            {willBePerfect ? (lang === 'zh' ? '完美通关！' : lang === 'zh_TW' ? '完美通關！' : 'Perfect Clear!') : t.successTitle}
                          </h3>
                          {(isFirstClear || willBePerfect) && (
                            <motion.p
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className={`font-black text-xl tracking-widest ${willBePerfect ? 'text-purple-600' : 'text-yellow-600'}`}
                            >
                              {willBePerfect ? (lang === 'zh' ? '三星达成！' : lang === 'zh_TW' ? '三星達成！' : '3 Stars Achieved!') : (lang === 'zh' ? '首次通关！' : lang === 'zh_TW' ? '首次通關！' : 'First Clear!')}
                            </motion.p>
                          )}
                        </motion.div>
                      </div>
                    )}

                    {/* Phase C: Stats Bubbles */}
                    {victoryPhase >= 3 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex gap-4 mt-8 z-10"
                      >
                        {[
                          { icon: <Trophy size={20} className="text-yellow-600" />, label: t.score, value: finalScore, color: 'bg-yellow-100 border-yellow-300' },
                          { icon: <span className="text-xl">⏱️</span>, label: t.time, value: `${finalDuration}s`, color: 'bg-blue-100 border-blue-300' },
                          { icon: <Heart size={20} className="text-red-500 fill-red-500" />, label: lang === 'zh' ? '剩余体力' : lang === 'zh_TW' ? '剩餘體力' : 'HP Left', value: hp, color: 'bg-red-100 border-red-300' },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", delay: 0.4 + i * 0.2 }}
                            className={`flex flex-col items-center p-3 md:p-4 rounded-2xl border-2 shadow-lg w-24 md:w-32 ${stat.color}`}
                          >
                            <div className="mb-1">{stat.icon}</div>
                            <div className="text-[10px] font-bold text-ink/60 uppercase">{stat.label}</div>
                            <div className="text-xl font-black text-ink mt-1">
                              {typeof stat.value === 'number' && i === 0 ? (
                                <AnimatedCounter value={stat.value} />
                              ) : (
                                stat.value
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Phase D: Skill Badge */}
                    <AnimatePresence>
                      {victoryPhase === 4 && mission.skillName && (
                        <motion.div
                          key="skill-badge"
                          exit={{ scale: 0.5, opacity: 0, y: -50 }}
                          className="absolute inset-0 z-20"
                        >
                          <SkillBadgeCard
                            characterId={character.id}
                            skillName={mission.skillName}
                            skillSummary={mission.skillSummary || ''}
                            formula={resolveFormula(mission.secret.formula, lang)}
                            missionTitle={mission.title}
                            lang={lang}
                            onClose={() => {}} // Disabled as it closes automatically or is unclickable here
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Phase E: Return Button */}
                    {victoryPhase >= 5 && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => onComplete(true, isMultiQuestion ? totalScore : finalScore, finalDuration, hp)}
                        className="absolute bottom-8 px-12 py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-indigo-500 transition-colors z-30"
                      >
                        {t.backToMap}
                      </motion.button>
                    )}
                  </>
                );
              })() : (
                <motion.div initial={{ y: 50 }} animate={{ y: 0 }}>
                  <XCircle size={80} className="text-red-500 mb-6 mx-auto" />
                  <h3 className="text-3xl md:text-5xl font-black text-white mb-4">{t.failTitle}</h3>
                  <p className="text-slate-400 mb-2">{t.failDesc}</p>
                  {mission.storyConsequence ? (
                    <p className="text-amber-400 font-bold mb-8 italic">{lt(mission.storyConsequence.wrong, lang)}</p>
                  ) : (
                    <p className="text-indigo-400 font-bold mb-8 italic">"{encouragement}"</p>
                  )}
                  <button
                    onClick={handleRetry}
                    className="px-12 py-5 bg-red-700 text-white font-black rounded-xl shadow-xl hover:bg-red-600 transition-all"
                  >
                    {t.retry}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
    </div>
  );
};
