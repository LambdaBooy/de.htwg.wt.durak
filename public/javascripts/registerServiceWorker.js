if (navigator.serviceWorker.controller) {
    console.log('[PWA Info] active service worker found, no need to register')
} else {
    navigator.serviceWorker.register('serviceWorker.js').then(function (reg) {
        console.log('Service worker has been registered for scope:' + reg.scope);
    });
}