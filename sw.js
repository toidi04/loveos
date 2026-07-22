// نسخه رو عوض کردیم (M9 -> M10): بازطراحی کامل صفحه‌ی اصلی -
// کاراکترهای جدید (sprite frame به‌جای لایه‌ی جدا‌شده)، بک‌گراند
// جدید، دکمه/آیکون‌های جدید، و حذف pixi-character.js. بدون این
// تغییر نسخه، کسایی که قبلا PWA رو نصب کرده بودن همچنان نسخه‌ی
// قدیمی/کش‌شده رو می‌دیدن.
// M10 -> M11: همون فایل‌ها بازپردازش شدن (رد رنگ بنفش پاک شد،
// برش‌ها تمیزتر شدن) - اسم فایل‌ها عوض نشده پس بدون بالا بردن
// نسخه، کش قدیمی همون نسخه‌ی با رد بنفش رو سرو می‌کرد
// M11 -> M12: بازی «۷ قلب طلایی» به «قلب‌های کهکشانی» بازطراحی
// شد (تمام‌صفحه + سبک فضایی)، pixi-game.js حذف شد
// M12 -> M13: عکس‌های واقعی برای بازی «قلب‌های کهکشانی» جایگزین
// ایموجی/CSS شدن + آیکون‌های کنار دکمه‌ی ماجراجویی بزرگ‌تر شدن
// v1.45: اندازه‌ی قلب‌ها/شهاب‌سنگ‌ها/سبد تو بازی «قلب‌های
// کهکشانی» بزرگ‌تر شد (فیزیک برخورد هم متناسب تنظیم شد)
const CACHE_NAME = "love-os-v1-45-0-visuals";

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
    "js/games.js",
    "js/intro.js",
    "js/gift.js",
    "js/gallery.js",
    "js/anniversary.js",
    "js/game.js",
    "js/runner.js",
    "js/ending.js",
    "manifest.json",
    "assets/characters-v2/asal-1-rest.png",
    "assets/characters-v2/asal-2-breathe-mid.png",
    "assets/characters-v2/asal-3-breathe-peak.png",
    "assets/characters-v2/asal-4-blink.png",
    "assets/characters-v2/yasin-1-rest.png",
    "assets/characters-v2/yasin-2-breathe-mid.png",
    "assets/characters-v2/yasin-3-breathe-peak.png",
    "assets/characters-v2/yasin-4-blink.png",
    "assets/ui/adventure-btn-normal.png",
    "assets/ui/adventure-btn-pressed.png",
    "assets/images/main-bg.png",
    "assets/icons/icon-192.png",
    "assets/icons/icon-512.png",
    "assets/images/splash-heart.png",
    "assets/images/particles/heart.png",
    "assets/images/particles/sparkle.png",
    "assets/images/particles/orb.png",
    "assets/icons/ui/cake.png",
    "assets/icons/ui/gift.png",
    "assets/icons/ui/tree.png",
    "assets/icons/ui/lock.png",
    "assets/icons/ui/heart.png",
    "assets/icons/ui/star.png",
    "assets/images/space-bg.png",
    "assets/icons/game/entity-heart.png",
    "assets/icons/game/entity-star.png",
    "assets/icons/game/entity-comet.png",
    "assets/icons/game/entity-blackhole.png",
    "assets/icons/game/player-collector.png",
    "assets/icons/game/hud-heart.png",
    "assets/icons/game/hud-star.png",
    "assets/icons/game/hud-life.png",
    "assets/icons/game/hud-timer.png",
    "assets/icons/ui/chat.png",
    "assets/icons/ui/slot-frame.png",
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
//
// نکته‌ی مهم (رفع باگ کوچیک): قبلا وقتی یه فایل از شبکه با
// موفقیت می‌اومد، توی کش ذخیره نمی‌شد - یعنی مثلا اسکریپت
// PixiJS که از CDN میاد (و اصلا جزو APP_SHELL نیست) هیچ‌وقت
// برای استفاده‌ی آفلاین بعدی کش نمی‌شد. الان هر پاسخ موفق GET
// (هم‌مبدا یا cross-origin) رو هم توی کش می‌ذاریم تا دفعه‌ی بعد
// حتی بدون اینترنت هم در دسترس باشه.
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    event.respondWith(

        caches.match(event.request).then(cached => {

            const network = fetch(event.request).then(response => {

                if (response && (response.ok || response.type === "opaque")){

                    const clone = response.clone();

                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(()=>{});

                }

                return response;

            }).catch(() => cached);

            return cached || network;

        })

    );

});