'use client';

import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  message?: string;
};

export function FieldErrorMessage({ message }: Props) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="overflow-hidden"
        >
          <p className="mt-1.5 text-xs text-red-400">⚠ {message}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
