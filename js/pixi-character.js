/*=========================================
  PIXI CHARACTER — رندر شخصیت با PixiJS
  چهار لایه (بدنه/مو/آیتم/چشم) به‌عنوان
  Sprite روی هم سوار می‌شن و هرکدوم مستقل
  انیمیشن می‌گیرن (نفس‌کشیدن، پلک، نگاه
  به‌اطراف، نوسان مو و آیتم).
  اگه PixiJS در دسترس نباشه، این آبجکت اصلا
  ساخته نمی‌شه و userselect.js به‌جاش از
  لایه‌های <img> با CSS استفاده می‌کنه.
=========================================*/

const PixiCharacter = (function(){

    if (typeof PIXI === "undefined") return null;

    // یه لیست کی‌فریم رو در فاز ۰ تا ۱ درون‌یابی می‌کنه
    // keyframes: [[phase0to1, value], ...] مرتب‌شده بر اساس فاز
    function sampleKeyframes(keyframes, phase){

        for (let i=0; i<keyframes.length-1; i++){

            const [p0, v0] = keyframes[i];
            const [p1, v1] = keyframes[i+1];

            if (phase >= p0 && phase <= p1){

                const t = p1===p0 ? 0 : (phase-p0)/(p1-p0);
                return v0 + (v1-v0)*t;

            }

        }

        return keyframes[keyframes.length-1][1];

    }

    // چرخه‌ی پلک‌زدن + نگاه به اطراف (هم‌ارز @keyframes eyeLife)
    const EYE_SCALE_KF = [
        [0.00,1],[0.04,1],[0.06,0.08],[0.08,1],[0.34,1],
        [0.40,1],[0.54,1],[0.57,0.08],[0.59,1],[0.68,1],
        [0.74,1],[0.88,1],[0.92,1],[0.95,0.08],[0.97,1],[1.00,1]
    ];
    const EYE_X_KF = [
        [0.00,0],[0.34,0],[0.40,1],[0.54,1],[0.68,1],
        [0.74,-1],[0.88,-1],[0.92,0],[1.00,0]
    ];

    function mount(containerEl, userKey){

        let destroyed = false;

        const app = new PIXI.Application({
            backgroundAlpha: 0,
            antialias: true,
            resolution: Math.min(window.devicePixelRatio || 1, 2),
            autoDensity: true
        });

        containerEl.appendChild(app.view);

        const stage = new PIXI.Container();
        app.stage.addChild(stage);

        const bodySprite = new PIXI.Sprite();
        const itemSprite = new PIXI.Sprite();
        const hairSprite = new PIXI.Sprite();
        const eyesSprite = new PIXI.Sprite();

        stage.addChild(bodySprite);
        stage.addChild(itemSprite);
        stage.addChild(hairSprite);
        stage.addChild(eyesSprite);

        let elapsed = Math.random()*10; // فاز تصادفی اولیه تا چند تا کاراکتر همزمان یکسان نباشن
        let baseScaleSet = false;

        async function loadLayers(key){

            const urls = {
                body: `assets/characters/${key}.png`,
                item: `assets/characters/${key}-item.png`,
                hair: `assets/characters/${key}-hair.png`,
                eyes: `assets/characters/${key}-eyes.png`
            };

            const [bodyTex, itemTex, hairTex, eyesTex] = await Promise.all([
                PIXI.Assets.load(urls.body),
                PIXI.Assets.load(urls.item),
                PIXI.Assets.load(urls.hair),
                PIXI.Assets.load(urls.eyes)
            ]);

            if (destroyed) return;

            // اگه هرکدوم از تکسچرها درست لود نشده باشن (عرض نامعتبر)،
            // یعنی مسیر فایل قابل‌دسترس نبوده - به‌جای ادامه دادن با
            // مقادیر NaN، خطا می‌دیم تا caller بره سراغ نسخه‌ی DOM
            [bodyTex, itemTex, hairTex, eyesTex].forEach(tex=>{
                if (!tex || !tex.width || !Number.isFinite(tex.width)){
                    throw new Error("Invalid texture (width=" + (tex && tex.width) + ") - asset probably failed to load");
                }
            });

            bodySprite.texture = bodyTex;
            itemSprite.texture = itemTex;
            hairSprite.texture = hairTex;
            eyesSprite.texture = eyesTex;

            const w = bodyTex.width, h = bodyTex.height;

            app.renderer.resize(w, h);

            // پیوت‌ها برای چرخش طبیعی (مو از بالای سر، آیتم از نقطه‌ای که دست نگهش داشته)
            hairSprite.pivot.set(w*0.5, h*0.08);
            hairSprite.position.set(w*0.5, h*0.08);

            const itemPivot = key === "yasin" ? {x:0.70,y:0.57} : {x:0.52,y:0.45};
            itemSprite.pivot.set(w*itemPivot.x, h*itemPivot.y);
            itemSprite.position.set(w*itemPivot.x, h*itemPivot.y);

            // پیوت چشم‌ها: مرکز تقریبی محل چشم روی صورت، تا
            // پلک‌زدن (scaleY) از همون‌جا جمع بشه، نه از بالای عکس
            eyesSprite.pivot.set(w*0.5, h*0.30);
            eyesSprite.position.set(w*0.5, h*0.30);

            fitToContainer();

        }

        function fitToContainer(){

            if (!bodySprite.texture || !bodySprite.texture.width) return;

            const hostWidth = containerEl.clientWidth || 220;

            if (!hostWidth || !Number.isFinite(hostWidth)) return;

            const scale = hostWidth / bodySprite.texture.width;

            if (!Number.isFinite(scale) || scale <= 0) return;

            stage.scale.set(scale);

            app.renderer.resize(
                bodySprite.texture.width * scale,
                bodySprite.texture.height * scale
            );

            baseScaleSet = true;

        }

        app.ticker.add((delta)=>{

            if (destroyed || !baseScaleSet) return;

            if (!bodySprite.texture || !bodySprite.texture.width) return;

            const dt = delta/60;
            elapsed += dt;

            const baseScale = (containerEl.clientWidth || 220) / bodySprite.texture.width;

            if (!Number.isFinite(baseScale) || baseScale <= 0) return;

            // نفس کشیدن: کل استیج کمی بالا/پایین و مقیاس می‌شه
            const breathePhase = (elapsed % 3.2)/3.2;
            const breatheY = Math.sin(breathePhase*Math.PI*2) * 4;
            const breatheScale = 1 + Math.sin(breathePhase*Math.PI*2)*0.015;
            stage.y = breatheY;
            stage.scale.set(baseScale * breatheScale);

            // نوسان مو
            const hairPhase = (elapsed % 5.5)/5.5;
            hairSprite.rotation = Math.sin(hairPhase*Math.PI*2) * (-1.2*Math.PI/180);

            // نوسان آیتم (گل/گیتار)
            const itemPhase = (elapsed % 4.5)/4.5;
            itemSprite.rotation = Math.sin(itemPhase*Math.PI*2) * (3*Math.PI/180);

            // پلک زدن + نگاه به اطراف
            const eyePhase = (elapsed % 7)/7;
            const eyeScaleY = sampleKeyframes(EYE_SCALE_KF, eyePhase);
            const eyeXPct = sampleKeyframes(EYE_X_KF, eyePhase);
            eyesSprite.scale.y = eyeScaleY;
            eyesSprite.x = (bodySprite.texture.width*0.5) + (bodySprite.texture.width*0.03) * eyeXPct;

        });

        const readyPromise = loadLayers(userKey).catch(err=>{
            console.warn("PixiCharacter loadLayers failed:", err);
            throw err;
        });

        const resizeObserver = new ResizeObserver(()=> fitToContainer());
        resizeObserver.observe(containerEl);

        return {

            ready: readyPromise,

            switchTo(key){
                loadLayers(key).catch(err=>{
                    console.warn("PixiCharacter switchTo failed:", err);
                });
            },

            destroy(){
                destroyed = true;
                resizeObserver.disconnect();
                try { app.destroy(true, {children:true, texture:false}); } catch(e){}
            }

        };

    }

    return { mount };

})();
