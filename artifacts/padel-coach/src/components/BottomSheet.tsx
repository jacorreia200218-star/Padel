import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, children }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#060E11]/75 backdrop-blur-[4px] flex items-end"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#132C34] w-full max-w-[520px] mx-auto rounded-t-[22px] max-h-[88dvh] overflow-y-auto pt-5 px-5 pb-[calc(30px+env(safe-area-inset-bottom))] border-t border-[rgba(216,255,62,0.14)]"
            style={{ touchAction: 'none' }}
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4 shrink-0" />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/10 border-none text-white w-8 h-8 rounded-full flex items-center justify-center text-sm"
            >
              ✕
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
