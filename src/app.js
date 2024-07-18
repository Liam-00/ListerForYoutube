import sw from "./serviceworker.js"

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(sw).catch(() => {
    console.log("failed to: register service worker")
  })
}
