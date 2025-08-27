const CACHE_NAME = 'decentralized-game-room-v1';
const CACHE_FILES = ['/', '/index.html', '/styles.css', '/app.js', '/sw.js'];

self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache = await caches.open(CACHE_NAME);
    try{
      await cache.addAll(CACHE_FILES);
      console.log('Cached app shell');
    }catch(e){
      console.warn('Cache addAll failed, trying individual adds',e);
      for(const f of CACHE_FILES){
        try{ await cache.add(f); }catch(err){console.warn('Failed caching',f,err)}
      }
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.map(k=> k!==CACHE_NAME ? caches.delete(k) : null));
  })());
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const appShell = ['/', '/index.html', '/styles.css', '/app.js', '/sw.js'].includes(url.pathname);
  if(appShell){
    event.respondWith(caches.match(event.request).then(res=> res || fetch(event.request).then(resp=>{ if(resp && resp.status===200){ caches.open(CACHE_NAME).then(c=>c.put(event.request, resp.clone())); } return resp; }).catch(()=> caches.match('/index.html'))));
  }
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'CLEAR_CACHE') event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k=>caches.delete(k)))));
});
