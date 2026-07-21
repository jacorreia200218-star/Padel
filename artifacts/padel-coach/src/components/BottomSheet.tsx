import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, children }: Props) {
  // Lock body scroll while sheet is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#060E11]/75 backdrop-blur-[4px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#132C34] w-full max-w-[520px] mx-auto rounded-t-[22px] max-h-[88dvh] flex flex-col border-t border-[rgba(216,255,62,0.14)]"
            style={{ touchAction: 'auto' }}
          >
            {/* Drag handle — only this area triggers dismiss-on-drag */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) {
                  onClose();
                }
              }}
              className="shrink-0 pt-5 pb-2 flex flex-col items-center cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            >
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </motion.div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/10 border-none text-white w-8 h-8 rounded-full flex items-center justify-center text-sm z-10"
            >
              ✕
            </button>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-[calc(30px+env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
