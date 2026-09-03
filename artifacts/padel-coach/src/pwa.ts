/**
 * Registo do service worker.
 *
 * Só em produção: em desenvolvimento um service worker serve versões em cache
 * e faz parecer que as alterações não fazem efeito.
 */

export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/';
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {
      // Sem service worker a app funciona à mesma, só não abre offline.
    });
  });
}

/** Se está a correr adicionada ao ecrã principal, e não dentro do browser. */
export function isInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // O Safari do iOS não suporta display-mode e usa esta propriedade sua.
    (navigator as { standalone?: boolean }).standalone === true
  );
}
