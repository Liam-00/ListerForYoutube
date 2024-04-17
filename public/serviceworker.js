const app_cache_static = "app_cache_static"
const app_cache_images = "app_cache_images"

const asset_static_paths = [
    '/',
    '/index.css',
    '/bundle.js',
    "/icon.png",
    "/manifest.json",
    "/serviceworker.js"
]


self.addEventListener('install', (event) => {

    const cacheStaticAssets = async () => {
        //open cache for static assets
        let cache = await caches.open(app_cache_static)
        //add all paths - addAll() will fetch and store every path in its list
        await cache.addAll(asset_static_paths)
    }

    //make serviceworker wait for caching to finish resolving promises
    event.waitUntil(cacheStaticAssets())
})

// self.addEventListener('activate', (event) => {
//     console.log("Service Worker: active")
// })

self.addEventListener('fetch', (event) => {
    //console.log(event)
    event.respondWith(
        (async () => {
            //open cache
            let cache = await caches.open(app_cache_static)
            
            //return cached asset if it exists otherwise fetch it
            return await cache.match(event.request) ?? await fetch(event.request)
        })()
    )
})