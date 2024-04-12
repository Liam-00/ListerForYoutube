const app_cache_static = "app_cache_static"
const asset_names = [
    '/',
    '/index.css',
    '/index.js',
    '/app.js'
]


self.addEventListener('install', (event) => {
    console.log("installed")
    
    event.waitUntil(
        caches
            .open(app_cache_static)
            .then((cache) => {
                console.log("Caching base assets...")
                cache.addAll(asset_names)
            })
    )
    console.log("...Cached base assets")
})

self.addEventListener('activate', (event) => {
    console.log("Service Worker: active")
})

self.addEventListener('fetch', (event) => {
    //console.log(event)
    event.respondWith(
        // (async () => {
        //     let cache = await caches.open(app_cache_static)
        //     return await cache.match(event.request.url) ||  await fetch(event.request.url)
        // })()
        
        caches
            .open(app_cache_static)
            .then(cache => {
                return cache
                    .match(event.request)
                    .then(response => {
                        return response || fetch(event.request)
                    })
            })
    )
})