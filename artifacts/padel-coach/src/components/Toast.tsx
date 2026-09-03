import { useEffect, useState } from 'react';

type Listener = (msg: string) => void;

const listeners = new Set<Listener>();

/** Mostra uma mensagem breve no fundo do ecrã. Pode ser chamada fora de React. */
export function showToast(msg: string) {
  listeners.forEach((l) => l(msg));
}

export function Toast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const listener: Listener = (m) => setMsg(m);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3200);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}
