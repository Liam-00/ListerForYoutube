
const app_cache_static = "app_cache_static"
const app_cache_images = "app_cache_images"
const CACHE_MAX = 200

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
        //await cache.addAll(asset_static_paths)
    }

    //make serviceworker wait for caching to finish resolving promises
    //event.waitUntil(cacheStaticAssets())
})

// self.addEventListener('activate', async (event) => {
//     let cache = await caches.open(app_cache_images)

//     let keys = await cache.keys()

//     console.log(keys.map( key => {
//         return key.headers
//     }))
// })

const handleFetch = (event) => {
    const getUrlResource = async (request) => {
            return await caches.match(request) ?? (async () => {
                let response
                if (request.url.match(/^https:\/\/i.ytimg.com/)) {
                    response = await fetch(request.url, {mode: "no-cors"})

                    let cache = await caches.open(app_cache_images) 
                    cache.put(request, response)
                }
                
                response = await fetch(request)
                
                return response
            })()
    }

    event.respondWith( getUrlResource(event.request) )
}

self.addEventListener('fetch', handleFetch)