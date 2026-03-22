import { type ReactNode } from 'react';
import { motion } from 'motion/react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
};

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center p-12 text-center bg-white/5 border-2 border-dashed border-white/20 rounded-3xl h-64 w-full"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-white/40 mb-4"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-black text-white mb-2">{title}</h3>
      {description && <p className="text-sm font-bold text-white/50">{description}</p>}
    </motion.div>
  );
};
