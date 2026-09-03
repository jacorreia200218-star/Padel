/*
 * Service worker da Padel Coach AI.
 *
 * Objetivo: a app abrir sem rede. Não há dados no servidor — tudo o que
 * interessa está no localStorage do telemóvel — por isso basta ter o código
 * em cache.
 *
 * Estratégia deliberadamente conservadora:
 * - Navegações: rede primeiro, cache só se a rede falhar. Assim uma versão
 *   nova chega sempre que houver ligação, e nunca ficamos presos a uma antiga.
 * - Recursos com hash no nome (o que o Vite gera): cache primeiro, porque o
 *   conteúdo nunca muda para o mesmo nome.
 *
 * Ao mudar este ficheiro, sobe CACHE_VERSION — senão os browsers com a versão
 * antiga em cache podem nunca chegar à nova.
 */

const CACHE_VERSION = 'padel-coach-v1';

self.addEventListener('install', (event) => {
  // Entra em funcionamento sem esperar que os separadores antigos fechem.
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_VERSION));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Só tratamos GET do próprio site. Pedidos a terceiros (tipos de letra do
  // Google, por exemplo) seguem o caminho normal.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return cached ?? caches.match('index.html');
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      // Só guardamos respostas boas — uma resposta de erro em cache seria
      // servida para sempre.
      if (response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, response.clone());
      }
      return response;
    })(),
  );
});
