
const CACHE_STATIC = "CACHE_STATIC"
const CACHE_IMAGES = "CACHE_IMAGES"
const CACHE_IMAGES_MAX = 200

const static_paths = [
    '/',
    '/index.html',
    '/main.css',
    '/main.js',
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/app_icons_map.svg',
    '/fonts/VarelaRound-Regular.ttf'
]


self.addEventListener('install', (event) => {

    const cacheStaticAssets = async () => {
        let cache = await caches.open(CACHE_STATIC)
        
        //add all paths - addAll() will fetch and store every string path in provided list
        await cache.addAll(static_paths)
    }

    event.waitUntil(cacheStaticAssets())
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

                    let cache = await caches.open(CACHE_IMAGES) 
                    cache.put(request, response)
                }
                
                response = await fetch(request)
                
                return response
            })()
    }

    event.respondWith( getUrlResource(event.request) )
}

self.addEventListener('fetch', handleFetch)