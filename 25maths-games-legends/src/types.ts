export type Language = 'zh' | 'zh_TW' | 'en';

export type BilingualText = { zh: string; en: string };

export type Character = {
  id: string;
  name: BilingualText;
  role: BilingualText;
  image: string;
  color: string;
  description: BilingualText;
  skill: BilingualText;
  stats: { power: number; speed: number; wisdom: number };
};

export type QuestionType =
  | 'LINEAR'
  | 'AREA'
  | 'QUADRATIC'
  | 'INDICES'
  | 'PYTHAGORAS'
  | 'SIMULTANEOUS'
  | 'ESTIMATION'
  | 'PERCENTAGE'
  | 'FRACTION'
  | 'VENN'
  | 'SIMPLE_EQ'
  | 'ANGLES'
  | 'VOLUME'
  | 'TRIGONOMETRY'
  | 'PROBABILITY'
  | 'INTEGRATION'
  | 'FUNC_VAL'
  | 'DERIVATIVE'
  | 'ROOTS'
  | 'CIRCLE'
  | 'ARITHMETIC'
  | 'STATISTICS'
  | 'RATIO'
  | 'SIMILARITY'
  | 'HCF'
  | 'LCM'
  | 'FACTOR_TREE'
  | 'PRIME'
  | 'INTEGER_ADD'
  | 'FRAC_ADD'
  | 'FRAC_MUL'
  | 'SQUARE_CUBE'
  | 'SQUARE_ROOT'
  | 'SUBSTITUTION'
  | 'PERIMETER'
  | 'FACTORS_LIST'
  | 'INTEGER_MUL'
  | 'FDP_CONVERT'
  | 'BODMAS'
  | 'SIMPLIFY'
  | 'COORDINATES'
  | 'MIXED_IMPROPER'
  | 'EXPAND'
  | 'FACTORISE'
  | 'INEQUALITY'
  | 'STD_FORM'
  | 'SYMMETRY';

export type KnowledgePoint = 'Algebra' | 'Geometry' | 'Functions' | 'Calculus' | 'Statistics';

export type DifficultyMode = 'green' | 'amber' | 'red';

export type TutorialStep = {
  narrator?: string;
  dialogue?: BilingualText;
  mathStep?: BilingualText;
  text: BilingualText;
  formula?: string;
  hint?: BilingualText;
  highlightField?: string;
  validation?: { field: string; answer: number };
};

export type Mission = {
  id: number;
  grade: number;
  unitId: number;
  order: number;
  unitTitle: BilingualText;
  topic: KnowledgePoint;
  type: QuestionType;
  title: BilingualText;
  skillName?: BilingualText;
  skillSummary?: BilingualText;
  story: BilingualText;
  description: BilingualText;
  data: any;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: number;
  tutorialSteps?: TutorialStep[];
  secret: {
    concept: BilingualText;
    formula: string | BilingualText;
    tips: BilingualText[];
  };
  storyConsequence?: {
    correct: BilingualText;
    wrong: BilingualText;
  };
  kpId?: string;
  sectionId?: string;
};

export type MissionCompletion = {
  green: boolean;
  amber: boolean;
  red: boolean;
};

export type CompletedMissions = { [missionId: string]: MissionCompletion };

export type UserProfile = {
  user_id: string;
  display_name: string;
  total_score: number;
  grade: number | null;
  class_name?: string | null;
  class_tags?: string[];
  selected_char_id: string;
  completed_missions: CompletedMissions;
  stats: { [key in KnowledgePoint]: number };
  updated_at?: string;
};

export type Room = {
  id: string;
  type: 'team' | 'pk';
  missionId: number;
  status: 'waiting' | 'playing' | 'finished';
  players: { [uid: string]: { name: string; score: number; isReady: boolean; charId: string } };
  hostId: string;
  winnerId?: string;
};

export type BattleResult = {
  user_id: string;
  mission_id: number;
  kp_id?: string;
  difficulty_mode: DifficultyMode;
  success: boolean;
  score: number;
  duration_secs: number;
  hp_remaining: number;
};

export type GameState = 'welcome' | 'map' | 'battle' | 'lobby' | 'practice' | 'dashboard';
