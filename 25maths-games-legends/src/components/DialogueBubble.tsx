import { memo } from 'react';
import { motion } from 'motion/react';
import { LatexText } from './MathView';

/**
 * Dialogue bubble with LaTeX support and typewriter effect.
 */
export const DialogueBubble = memo(function DialogueBubble({
  text,
  speaker,
  onComplete: _onComplete,
}: {
  text: string;
  speaker: string;
  onComplete?: () => void;
}) {
  // Split by KaTeX blocks to avoid typing out LaTeX code character by character
  const tokens = text.split(/(\$[^$]+\$)/g);
  let charCount = 0;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative bg-white/90 rounded-2xl px-4 py-3 border-2 shadow-lg max-w-sm border-ink"
    >
      {/* Bubble tail pointing left */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className="absolute top-4 -left-2.5 w-0 h-0 origin-right border-y-[6px] border-y-transparent border-r-[10px] border-r-ink"
      />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className="absolute top-4 -left-1.5 w-0 h-0 origin-right border-y-[5px] border-y-transparent border-r-[9px] border-r-white/90"
      />

      {/* Speaker name */}
      <div className="text-xs font-bold mb-1 text-[#8b0000]">
        {speaker}
      </div>

      {/* Text with LaTeX rendering */}
      <div className="text-sm leading-relaxed text-ink">
        {tokens.map((token, index) => {
          if (token.startsWith('$') && token.endsWith('$')) {
            const delay = charCount * 0.03;
            charCount += 1;
            return (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay, duration: 0 }}
                className="inline-block"
              >
                <LatexText text={token} />
              </motion.span>
            );
          } else {
            return token.split('').map((char, i) => {
              const delay = charCount * 0.03;
              charCount += 1;
              return (
                <motion.span
                  key={`${index}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay, duration: 0 }}
                >
                  {char}
                </motion.span>
              );
            });
          }
        })}
      </div>
    </motion.div>
  );
});
