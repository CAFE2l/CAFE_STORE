'use client';

import { motion } from 'framer-motion';

type Props = {
  progress: number;
};

export function TimerBar({ progress }: Props) {
  return (
    <div className="h-1 overflow-hidden rounded-full bg-zinc-700">
      <motion.div
        className="h-full origin-left rounded-full bg-orange-500"
        animate={{ scaleX: Math.max(0, Math.min(1, progress)) }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </div>
  );
}
