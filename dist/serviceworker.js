const CACHE_STATIC="CACHE_STATIC",CACHE_IMAGES="CACHE_IMAGES",CACHE_IMAGES_MAX=200,static_paths=["/","/index.html","/main.css","/main.js","/manifest.json","/icons/icon.svg","/icons/app_icons_map.svg","/fonts/VarelaRound-Regular.ttf"];self.addEventListener("install",(t=>{t.waitUntil((async()=>{let t=await caches.open(CACHE_STATIC);await t.addAll(static_paths)})())}));const handleFetch=t=>{t.respondWith((async t=>await caches.match(t)??(async()=>{let a;return t.url.match(/^https:\/\/i.ytimg.com/)&&(a=await fetch(t.url,{mode:"no-cors"}),(await caches.open(CACHE_IMAGES)).put(t,a)),a=await fetch(t),a})())(t.request))};self.addEventListener("fetch",handleFetch);