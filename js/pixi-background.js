/*=========================================
  PIXI BACKGROUND — قلب‌های شناور با PixiJS
  اگه PixiJS لود شده باشه، این نسخه جایگزین
  نسخه‌ی DOM/CSS قبلی (در app.js) می‌شه.
  اگه PIXI موجود نباشه (مثلا بار اول آفلاین)،
  همون تابع قبلی دست‌نخورده باقی می‌مونه.
=========================================*/

if (typeof PIXI !== "undefined") {

    window.createFloatingHearts = async function(){

        try {

            const canvasHost = document.createElement("div");
            canvasHost.className = "hearts-bg pixi-hearts-bg";
            document.body.appendChild(canvasHost);

            const app = new PIXI.Application({
                resizeTo: window,
                backgroundAlpha: 0,
                antialias: true,
                resolution: Math.min(window.devicePixelRatio || 1, 2),
                autoDensity: true
            });

            canvasHost.appendChild(app.view);

            // اسپرایت‌های طراحی‌شده (به‌جای ایموجی سیستم) —
            // هر سه با گلوی هماهنگ با پالت رنگی پروژه
            const spriteSheets = [
                "assets/images/particles/heart.png",
                "assets/images/particles/sparkle.png",
                "assets/images/particles/orb.png"
            ];

            const textures = await Promise.all(
                spriteSheets.map(url => PIXI.Assets.load(url))
            );

            const particles = [];
            const count = 22;

            for (let i = 0; i < count; i++){

                const tex = textures[i % textures.length];
                const sprite = new PIXI.Sprite(tex);

                const size = 14 + Math.random() * 20;
                sprite.width = size;
                sprite.height = size;

                sprite.alpha = 0.14 + Math.random() * 0.30;
                sprite.x = Math.random() * app.screen.width;
                sprite.y = app.screen.height + Math.random() * app.screen.height;
                sprite.anchor.set(0.5);

                const speed = 10 + Math.random() * 14; // px/sec
                const drift = (Math.random() - 0.5) * 8;
                const rotSpeed = (Math.random() - 0.5) * 0.4;

                particles.push({ sprite, speed, drift, rotSpeed, driftPhase: Math.random()*Math.PI*2 });
                app.stage.addChild(sprite);

            }

            app.ticker.add((delta)=>{

                if (!app.screen || !app.screen.height || !app.screen.width) return;

                const dt = delta / 60; // approx seconds per tick at 60fps baseline

                particles.forEach(p=>{

                    p.sprite.y -= p.speed * dt;
                    p.driftPhase += dt * 0.8;
                    p.sprite.x += Math.sin(p.driftPhase) * p.drift * dt;
                    p.sprite.rotation += p.rotSpeed * dt;

                    if (p.sprite.y < -30){
                        p.sprite.y = app.screen.height + 30;
                        p.sprite.x = Math.random() * app.screen.width;
                    }

                });

            });

            window.__loveOSPixiBackground = app;

        } catch (err){

            // اگه به هر دلیلی PixiJS در حین اجرا خطا داد،
            // بی‌سروصدا برمی‌گردیم به پس‌زمینه‌ی ساده‌ی CSS
            console.warn("Pixi background failed, falling back:", err);

            const layer = document.createElement("div");
            layer.className = "hearts-bg";
            const symbols = ["💜","✨","💫"];
            for(let i=0;i<16;i++){
                const h = document.createElement("span");
                h.className = "floating-heart";
                h.textContent = symbols[i % symbols.length];
                h.style.left = Math.random()*100 + "vw";
                h.style.animationDuration = (10 + Math.random()*12) + "s";
                h.style.animationDelay = (Math.random()*14) + "s";
                h.style.fontSize = (12 + Math.random()*16) + "px";
                h.style.opacity = 0.15 + Math.random()*0.25;
                layer.appendChild(h);
            }
            document.body.appendChild(layer);

        }

    };

}
