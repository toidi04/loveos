/* ==========================================================
   CharacterSprite — موتور جدید انیمیشن کاراکتر (v2)

   جایگزین کامل سیستم قبلی (بریدن یک عکس به لایه‌های بدن/مو/
   چشم/آیتم و چرخوندنشون با کد). اون روش برای سبک هنری جدید
   (پیکسل آرت) اصلا جواب نمی‌داد و لبه‌ها بی‌ربط به‌نظر می‌رسید.

   روش جدید: هر انیمیشن از چند فریم *کامل* و جداگانه ساخته شده
   (دقیقا مثل بازی‌های پیکسل‌آرت واقعی). فقط ۴ عکس در ازای هر
   کاراکتر لازمه:
     1-rest          حالت استراحت (پایه)
     2-breathe-mid   نفس نیمه
     3-breathe-peak  نفس کامل
     4-blink         پلک بسته

   نفس‌کشیدن = رفت‌وبرگشت روی فریم‌های ۱-۲-۳-۲-۱...
   پلک‌زدن  = هر چند ثانیه یک‌بار، برای یه لحظه‌ی کوتاه فریم
              «پلک» به‌جای فریم فعلی نشون داده می‌شه، بعد
              برمی‌گرده - بدون این‌که به تایمر نفس‌کشیدن دست بزنه.
========================================================== */

const CharacterSprite = (function(){

    const BASE_PATH = "assets/main-v2/characters/";

    function framePaths(userKey){
        return {
            rest:  `${BASE_PATH}${userKey}-1-rest.png`,
            mid:   `${BASE_PATH}${userKey}-2-breathe-mid.png`,
            peak:  `${BASE_PATH}${userKey}-3-breathe-peak.png`,
            blink: `${BASE_PATH}${userKey}-4-blink.png`
        };
    }

    function preload(frames){
        Object.values(frames).forEach(src=>{
            const p = new Image();
            p.src = src;
        });
    }

    function mount(container, userKey, opts){

        opts = opts || {};
        const breatheStep = opts.breatheStep || 480;   // ms هر فریم نفس
        const blinkMin = opts.blinkMin || 2600;         // کمترین فاصله بین پلک‌ها
        const blinkMax = opts.blinkMax || 5600;         // بیشترین فاصله
        const blinkHold = opts.blinkHold || 130;        // چقدر چشم بسته بمونه

        let frames = framePaths(userKey);
        preload(frames);

        const img = document.createElement("img");
        img.className = "main-char-sprite-v2";
        img.alt = "";
        img.draggable = false;
        img.src = frames.rest;
        container.appendChild(img);

        let destroyed = false;
        let breatheTimer = null;
        let blinkTimer = null;
        let blinkResumeTimer = null;

        // رفت‌وبرگشت نرم: rest -> mid -> peak -> mid -> rest -> ...
        const sequence = ["rest","mid","peak","mid"];
        let seqIdx = 0;
        let currentFrameKey = "rest";

        function stepBreathe(){
            if (destroyed) return;
            currentFrameKey = sequence[seqIdx];
            img.src = frames[currentFrameKey];
            seqIdx = (seqIdx+1) % sequence.length;
            breatheTimer = setTimeout(stepBreathe, breatheStep);
        }

        function scheduleBlink(){
            if (destroyed) return;
            const delay = blinkMin + Math.random()*(blinkMax-blinkMin);
            blinkTimer = setTimeout(()=>{
                if (destroyed) return;
                img.src = frames.blink;
                blinkResumeTimer = setTimeout(()=>{
                    if (destroyed) return;
                    img.src = frames[currentFrameKey];
                    scheduleBlink();
                }, blinkHold);
            }, delay);
        }

        stepBreathe();
        scheduleBlink();

        return {
            el: img,
            switchTo(newUserKey){
                frames = framePaths(newUserKey);
                preload(frames);
                seqIdx = 0;
                currentFrameKey = "rest";
                img.src = frames.rest;
            },
            destroy(){
                destroyed = true;
                clearTimeout(breatheTimer);
                clearTimeout(blinkTimer);
                clearTimeout(blinkResumeTimer);
                if (img.parentNode) img.parentNode.removeChild(img);
            }
        };

    }

    return { mount };

})();
