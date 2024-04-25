const cacheName = 'playerify-cache';
const filestoCache = [
    './',
    './index.html',
    './automobile.svg',
    './background.jpg',
    './computer.svg',
    './empty.svg',
    './game_console.svg',
    './next.svg',
    './pause.svg',
    './play.svg',
    './playbackDevice.svg',
    './prev.svg',
    './smartphone.svg',
    './speaker.svg',
    './spotify.png',
    './tablet.svg',
    './icon.svg',
    './samplesong.svg',
    './icon.png',
    './tv.svg',
    './manifest.json',
    './assets/index.css',
    './assets/index.js',
];
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(filestoCache))
    );
});
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.url.indexOf("updatecode") !== -1 || req.url.indexOf("spotify") !== -1) return fetch(req); else event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
    try {
        const networkResponse = await fetch(req);
        const cache = await caches.open('playerify-cache');
        await cache.delete(req);
        await cache.put(req, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(req);
        return cachedResponse;
    }
}