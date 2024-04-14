if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./serviceworker.js')
    .then((reg) => {
        console.log("registered service worker", reg)
    })
    .catch(() => {
        console.log("failed to: register service worker")
    })
}