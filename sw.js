const CACHE_NAME = "love-os-v1-40-0";

const APP_SHELL = [
    "./",
    "index.html",
    "css/main.css",
    "css/animation.css",
    "js/config.js",
    "js/sfx.js",
    "js/theme.js",
    "js/app.js",
    "js/userselect.js",
    "js/relationship.js",
    "js/events.js",
    "js/pixi-background.js",
    "js/pixi-character.js",
    "js/games.js",
    "js/intro.js",
    "js/gift.js",
    "js/gallery.js",
    "js/anniversary.js",
    "js/game.js",
    "js/pixi-game.js",
    "js/ending.js",
    "manifest.json",
    "assets/characters/asal.png",
    "assets/characters/asal-eyes.png",
    "assets/characters/asal-hair.png",
    "assets/characters/asal-item.png",
    "assets/characters/yasin.png",
    "assets/characters/yasin-eyes.png",
    "assets/characters/yasin-hair.png",
    "assets/characters/yasin-item.png",
    "assets/icons/icon-192.jpg",
    "assets/icons/icon-512.jpg",
    "assets/sfx/click.wav",
    "assets/sfx/open.wav",
    "assets/sfx/chime.wav",
    "assets/sfx/whoosh.wav",
    "assets/sfx/success.wav",
    "assets/sfx/heartbeat.wav",
    "assets/sfx/golden.wav",
    "assets/sfx/bad.wav",
    "assets/images/placeholder.svg"
];

// فایل‌هایی که ممکنه هنوز اضافه نشده باشن (مثل آیکون‌ها،
// موزیک، عکس‌های گالری) - اختیاری، نبودشون نباید کل
// نصب سرویس‌ورکر رو خراب کنه
const OPTIONAL_SHELL = [
    "assets/music/love.mp3"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(async cache => {

            await cache.addAll(APP_SHELL);

            // هر فایل اختیاری رو جدا امتحان می‌کنیم؛ اگه یکی
            // نبود، بقیه‌ی نصب رو خراب نمی‌کنه
            await Promise.allSettled(
                OPTIONAL_SHELL.map(url =>
                    cache.add(url).catch(()=>{})
                )
            );

        })

    );

    self.skipWaiting();

});

self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );

});

// اول از کش بخون، اگه نبود از شبکه بگیر
// (برای عکس‌هایی که بعدا اضافه می‌کنی هم کار می‌کنه)
self.addEventListener("fetch", event => {

    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).catch(() => cached);
        })
    );

});