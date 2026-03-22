import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

export const AnimatedCounter = ({ 
  value, 
  duration = 1,
  format = 'integer' // 'integer' | 'percent'
}: { 
  value: number; 
  duration?: number;
  format?: 'integer' | 'percent';
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    format === 'percent' 
      ? `${Math.round(latest)}%` 
      : Math.round(latest).toString()
  );

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [value, duration, count]);

  return <motion.span>{rounded}</motion.span>;
};
