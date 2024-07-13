const ROOT_PATH = "/ListerForYoutube/"
const CACHE_STATIC = "CACHE_STATIC"
const CACHE_IMAGES = "CACHE_IMAGES"
const CACHE_IMAGES_MAX = 200
const CACHE_LIMIT_COUNT = 5000


const static_paths = [
    `./`,
    `./index.html`,
    `./main.css`,
    `./main.js`,
    `./manifest.json`,
    `./icons/icon.svg`,
    `./icons/app_icons_map.svg`,
    `./fonts/VarelaRound-Regular.ttf`
]


self.addEventListener('install', (event) => {

    const cacheStaticAssets = async () => {
        let cache = await caches.open(CACHE_STATIC)
        
        //add all paths - addAll() will fetch and store every string path in provided list
        await cache.addAll(static_paths)
    }

    event.waitUntil(cacheStaticAssets())
})

self.addEventListener('activate', async (event) => {
    let cache_images = await caches.open(CACHE_IMAGES)
    let cache_images_keys = await cache_images.keys()

    if (cache_images_keys.length >= CACHE_LIMIT_COUNT) {
        let cache_excess_count = cache_images_keys.length - CACHE_LIMIT_COUNT
        let cache_excess_keys = cache_images_keys.slice(0 - cache_excess_count)


        console.table([cache_excess_count, cache_excess_keys])
        cache_excess_keys.forEach(async key => {
            await cache_images.delete(key)
        })
    }

})
  
const handleFetch = (event) => {
    
    const getUrlResource = async (request) => {
            return await caches.match(request) ?? (async () => {

                if (request.url.match(/^https:\/\/i.ytimg.com/)) {
                    let response = await fetch(request.url, {mode: "no-cors"})
                    
                    let cache = await caches.open(CACHE_IMAGES) 
                    cache.put(request, response.clone())
                    
                    return response
                }
                
                return await fetch(request)
            })()
    }
 
    event.respondWith( getUrlResource(event.request) )
}

self.addEventListener('fetch', handleFetch)