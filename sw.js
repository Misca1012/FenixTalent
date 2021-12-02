const CACHE ='cache-1';
const CACHE_DINAMICO ='dinamico-1';
const CACHE_INMUTABLE ='inmutable-1';

self.addEventListener('install', evento=>{
 
    const promesa =caches.open(CACHE)
        .then(cache=>{
            return cache.addAll([
                '/',
                '/index.html',
                '/js/app.js',
                '/offline.html'

            ]);
        });
        const cacheInmutable =  caches.open(CACHE_INMUTABLE)
            .then(cache=>{
                cache.add('');
            });
       
        evento.waitUntil(Promise.all([promesa, cacheInmutable]));
});

self.addEventListener('activate', evento =>{
    const respuesta=caches.keys().then(keys =>{
        keys.forEach(key =>{
            if(key !== CACHE && key.includes('cache')){
                return caches.delete(key);
            }
        });
    });
    evento.waitUntil(respuesta);
});

self.addEventListener('fetch', evento =>{

    const respuesta = fetch(evento.request)
    .then(resp=>{

        caches.open(CACHE_DINAMICO)
            .then(cache=>{
                cache.put(evento.request,resp);
                limpiarCache(CACHE_DINAMICO,50);
            });

            return resp.clone();
    }).catch(()=>{
        return caches.match(evento.request);
    })
        .catch(err => {
            if(evento.request.headers.get('accept').includes('text/html')){
                return caches.match('offline.html');
            }
        });
        evento.respondWith(respuesta);

});


function limpiarCache(nombreCache, numeroItems){
    caches.open(nombreCache)
        .then(cache=>{
            return cache.keys()
                .then(keys=>{
                    if (keys.length>numeroItems){
                        cache.delete(keys[0])
                            .then(limpiarCache(nombreCache, numeroItems));
                    }
                });
        });
}