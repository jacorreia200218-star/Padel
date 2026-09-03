import type { ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}

/** Folha que sobe de baixo. Fecha ao tocar fora, como na versão anterior. */
export function Modal({ onClose, children }: ModalProps) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet">
        <div className="modal-handle" />
        {children}
      </div>
    </div>
  );
}
