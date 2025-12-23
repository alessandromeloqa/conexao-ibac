const CACHE_NAME = 'conexao-ibac-v1';
const ASSETS = [
  '/index.html',
  '/avaliacao.html',
  '/ranking.html',
  '/styles.css',
  '/ranking.css',
  '/app.js',
  '/avaliacao.js',
  '/ranking.js',
  '/offline.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  // Ignorar requisições da API
  if (e.request.url.includes('/api/')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
      .catch(() => caches.match('/index.html'))
  );
});
