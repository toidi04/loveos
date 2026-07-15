/*=========================================
  PIXI BACKGROUND — قلب‌های شناور با PixiJS
  اگه PixiJS لود شده باشه، این نسخه جایگزین
  نسخه‌ی DOM/CSS قبلی (در app.js) می‌شه.
  اگه PIXI موجود نباشه (مثلا بار اول آفلاین)،
  همون تابع قبلی دست‌نخورده باقی می‌مونه.
=========================================*/

if (typeof PIXI !== "undefined") {

    window.createFloatingHearts = function(){

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

            const symbols = ["💜", "✨", "💫"];
            const particles = [];
            const count = 22;

            for (let i = 0; i < count; i++){

                const text = new PIXI.Text(
                    symbols[i % symbols.length],
                    { fontSize: 14 + Math.random() * 18 }
                );

                text.alpha = 0.12 + Math.random() * 0.28;
                text.x = Math.random() * app.screen.width;
                text.y = app.screen.height + Math.random() * app.screen.height;
                text.anchor.set(0.5);

                const speed = 10 + Math.random() * 14; // px/sec
                const drift = (Math.random() - 0.5) * 8;

                particles.push({ sprite: text, speed, drift, driftPhase: Math.random()*Math.PI*2 });
                app.stage.addChild(text);

            }

            app.ticker.add((delta)=>{

                if (!app.screen || !app.screen.height || !app.screen.width) return;

                const dt = delta / 60; // approx seconds per tick at 60fps baseline

                particles.forEach(p=>{

                    p.sprite.y -= p.speed * dt;
                    p.driftPhase += dt * 0.8;
                    p.sprite.x += Math.sin(p.driftPhase) * p.drift * dt;

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
