/*=========================================
  PIXI GAME — نسخه‌ی PixiJS بازی «۷ قلب طلایی»
  همون قوانین و HUD قبلی (از game.js) رو نگه
  می‌داره: گل‌ها امتیاز مثبت می‌دن، خارها و
  قلب‌های شکسته جون کم می‌کنن، و هرچی امتیاز
  بره بالا بازی سریع‌تر می‌شه. اینجا فقط
  ناحیه‌ی بازی با PixiJS رندر می‌شه؛ نرم‌تر،
  با پارتیکل واقعی و لرزش دوربین موقع برخورد.
  اگه PixiJS نباشه، همون نسخه‌ی DOM قبلی
  (launchGameDom) بدون تغییر اجرا می‌شه.
=========================================*/

if (typeof PIXI !== "undefined") {

    const launchGameDom = launchGame;

    launchGame = function(screen){

        try {

            launchGamePixi(screen);

        } catch (err){

            console.warn("Pixi game failed, falling back to DOM version:", err);
            launchGameDom(screen);

        }

    };

    function launchGamePixi(screen){

        screen.innerHTML = "";

        screen.classList.add("game-active");

        // ---- HUD (همون ساختار قبلی، برای سازگاری با renderLives/endGame) ----
        const hud = document.createElement("div");
        hud.className = "game-hud";

        const golden = document.createElement("div");
        golden.className = "hud-golden";
        golden.innerHTML = `💛 <span id="goldenCount">0</span>/${GAME_CONFIG.goldenTarget}`;

        const score = document.createElement("div");
        score.className = "hud-score";
        score.innerHTML = `⭐ <span id="hudScoreVal">0</span>`;

        const lives = document.createElement("div");
        lives.className = "hud-lives";
        lives.id = "hudLives";

        const timeEl = document.createElement("div");
        timeEl.className = "hud-time";
        timeEl.id = "hudTime";
        timeEl.textContent = "⏱ " + GAME_CONFIG.duration;

        hud.appendChild(golden);
        hud.appendChild(score);
        hud.appendChild(lives);
        hud.appendChild(timeEl);

        const area = document.createElement("div");
        area.className = "game-area";
        area.id = "gameArea";

        screen.appendChild(hud);
        screen.appendChild(area);

        gameState = {
            golden: 0,
            score: 0,
            lives: GAME_CONFIG.maxLives,
            timeLeft: GAME_CONFIG.duration,
            entities: [],
            basketX: 0,
            areaWidth: 0,
            areaHeight: 0,
            running: true,
            lastFrame: null,
            spawnInterval: GAME_CONFIG.spawnIntervalStart,
            fallSpeed: GAME_CONFIG.fallSpeedStart
        };

        renderLives();

        // ---- Pixi application برای ناحیه‌ی بازی ----
        const app = new PIXI.Application({
            resizeTo: area,
            backgroundAlpha: 0,
            antialias: true,
            resolution: Math.min(window.devicePixelRatio || 1, 2),
            autoDensity: true
        });

        area.appendChild(app.view);
        app.view.style.touchAction = "none";

        // لایه‌ی دوربین: همه‌چیز (سبد، موجودیت‌ها، پارتیکل‌ها) داخل این
        // Container قرار می‌گیرن تا لرزش دوربین با جابه‌جا کردن همین یک
        // لایه پیاده بشه، نه هر آبجکت به‌صورت جدا
        const cameraLayer = new PIXI.Container();
        app.stage.addChild(cameraLayer);

        const basketText = new PIXI.Text("💜", { fontSize: 40 });
        basketText.anchor.set(0.5, 1);
        cameraLayer.addChild(basketText);

        const particleLayer = new PIXI.Container();
        cameraLayer.addChild(particleLayer);

        // فلش نرم طلایی موقع گرفتن قلب اصلی
        const flashOverlay = new PIXI.Graphics();
        flashOverlay.alpha = 0;
        app.stage.addChild(flashOverlay);

        function drawFlash(color){

            flashOverlay.clear();

            if(!app.screen || !app.screen.width) return;

            flashOverlay.beginFill(color, 1);
            flashOverlay.drawRect(0, 0, app.screen.width, app.screen.height);
            flashOverlay.endFill();

        }

        function triggerFlash(color){

            drawFlash(color);

            flashOverlay.alpha = 0.28;

            let t = 0;

            const tick = ()=>{

                t += 0.08;

                flashOverlay.alpha = Math.max(0, 0.28 - t);

                if(flashOverlay.alpha <= 0){

                    app.ticker.remove(tick);

                }

            };

            app.ticker.add(tick);

        }

        // ---- لرزش دوربین واقعی: کل cameraLayer یه مدت کوتاه جابه‌جا می‌شه ----
        let shakeTime = 0;
        let shakeStrength = 0;

        function triggerCameraShake(strength){

            shakeStrength = strength;
            shakeTime = 1;

        }

        function updateCameraShake(dt){

            if(shakeTime > 0){

                shakeTime = Math.max(0, shakeTime - dt*4);

                const power = shakeStrength * shakeTime;

                cameraLayer.x = (Math.random()*2-1) * power;
                cameraLayer.y = (Math.random()*2-1) * power;

            } else if(cameraLayer.x !== 0 || cameraLayer.y !== 0){

                cameraLayer.x = 0;
                cameraLayer.y = 0;

            }

        }

        function updateBasketX(clientX){

            if (!Number.isFinite(clientX)) return;

            const rect = area.getBoundingClientRect();

            if (!rect.width) return;

            gameState.areaWidth = rect.width;

            let x = clientX - rect.left;
            x = Math.max(28, Math.min(rect.width-28, x));

            if (!Number.isFinite(x)) return;

            gameState.basketX = x;
            basketText.x = x;

        }

        area.addEventListener("pointerdown", (e)=> updateBasketX(e.clientX));
        area.addEventListener("pointermove", (e)=>{
            if (e.buttons===1 || e.pointerType==="touch") updateBasketX(e.clientX);
        });

        requestAnimationFrame(()=>{
            const rect = area.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            gameState.areaWidth = rect.width;
            gameState.areaHeight = rect.height;
            gameState.basketX = rect.width/2;
            basketText.x = gameState.basketX;
            basketText.y = rect.height - 10;
        });

        function spawnHeartPixi(){

            const rect = area.getBoundingClientRect();

            if (!rect.width || !rect.height) return;

            gameState.areaWidth = rect.width;
            gameState.areaHeight = rect.height;

            const type = rollEntityType();

            const glyph = entityGlyph(type);
            const text = new PIXI.Text(glyph, { fontSize: type==="golden" ? 34 : 28 });
            text.anchor.set(0.5);

            const x = 24 + Math.random()*(rect.width-48);
            text.x = x;
            text.y = -30;

            cameraLayer.addChild(text);

            gameState.entities.push({
                el: text, type, x, baseX: x, y: -30, caught:false,
                pulsePhase: Math.random()*10,
                swayPhase: Math.random()*Math.PI*2
            });

        }

        function spawnLoop(){

            if (!gameState || !gameState.running) return;

            spawnHeartPixi();

            applyDifficulty();

            gameSpawnTimer = setTimeout(spawnLoop, gameState.spawnInterval);

        }

        spawnLoop();

        gameCountdownTimer = setInterval(()=>{

            if (!gameState || !gameState.running) return;

            gameState.timeLeft--;
            timeEl.textContent = "⏱ " + gameState.timeLeft;

            if (gameState.timeLeft <= 0){
                endGamePixi(false);
            }

        }, 1000);

        // پارتیکل غنی‌تر: دایره + ستاره‌ی کوچیک، رنگ‌ها بر اساس نوع برخورد
        function burstParticles(x, y, colors, count){

            for (let i=0;i<count;i++){

                const g = new PIXI.Graphics();
                const color = colors[i % colors.length];
                const isStar = i % 3 === 0;

                g.beginFill(color);

                if(isStar){
                    drawStar(g, 0, 0, 4, 5, 2);
                } else {
                    g.drawCircle(0,0,2.5+Math.random()*2.5);
                }

                g.endFill();
                g.x = x; g.y = y;

                const angle = (Math.PI*2/count)*i + Math.random()*0.4;
                const speed = 2.2+Math.random()*3;
                g.vx = Math.cos(angle)*speed;
                g.vy = Math.sin(angle)*speed;
                g.life = 1;
                g.rot = (Math.random()*2-1)*0.2;

                particleLayer.addChild(g);

                const tick = ()=>{
                    g.x += g.vx; g.y += g.vy; g.vy += 0.13;
                    g.rotation += g.rot;
                    g.life -= 0.035; g.alpha = Math.max(0, g.life);
                    if (g.life <= 0){
                        particleLayer.removeChild(g);
                        app.ticker.remove(tick);
                    }
                };
                app.ticker.add(tick);

            }

        }

        function drawStar(g, cx, cy, points, outerR, innerR){

            const step = Math.PI / points;

            g.moveTo(cx + outerR, cy);

            for(let i=1;i<points*2;i++){

                const r = i % 2 === 0 ? outerR : innerR;
                const a = i * step;

                g.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);

            }

            g.closePath();

        }

        function catchHeartPixi(entity){

            entity.caught = true;

            if (entity.type === "golden"){

                gameState.golden++;
                gameState.score += GAME_CONFIG.goldenScore;
                applyDifficulty();

                SFX.play("golden", 0.6);
                burstParticles(entity.el.x, entity.el.y, [0xFFD166, 0xFFF3C4, 0xFFB703], 16);
                triggerFlash(0xFFD166);
                triggerCameraShake(4);
                updateScoreHud();

                const counter = document.getElementById("goldenCount");
                if (counter) counter.textContent = gameState.golden;

                cameraLayer.removeChild(entity.el);

                if (gameState.golden >= GAME_CONFIG.goldenTarget){
                    endGamePixi(true);
                    return;
                }

            } else if (entity.type === "broken" || entity.type === "thorn"){

                gameState.lives--;
                SFX.play("bad", 0.55);
                burstParticles(entity.el.x, entity.el.y, [0xff5b5b, 0xff9b9b, 0x8B2FD9], 12);
                triggerCameraShake(10);

                renderLives();

                basketText.scale.set(1);
                let shakeT = 0;
                const shakeTick = ()=>{
                    shakeT += 0.3;
                    basketText.rotation = Math.sin(shakeT*8)*0.25*Math.max(0,1-shakeT);
                    if (shakeT>=1){ basketText.rotation=0; app.ticker.remove(shakeTick); }
                };
                app.ticker.add(shakeTick);

                cameraLayer.removeChild(entity.el);

                if (gameState.lives <= 0){
                    endGamePixi(false);
                    return;
                }

            } else {

                // flower — امتیاز کوچیک مثبت
                gameState.score += GAME_CONFIG.flowerScore;
                applyDifficulty();

                SFX.play("click", 0.35);
                burstParticles(entity.el.x, entity.el.y, [0xF472B6, 0xC9A9FF], 8);
                updateScoreHud();

                cameraLayer.removeChild(entity.el);

            }

        }

        app.ticker.add((delta)=>{

            if (!gameState || !gameState.running) return;

            if (!app.screen || !Number.isFinite(app.screen.height) || app.screen.height<=0) return;

            const dt = delta/60;
            const basketY = (app.screen.height||0) - 30;

            updateCameraShake(dt);

            gameState.entities.forEach(entity=>{

                if (entity.caught) return;

                entity.y += gameState.fallSpeed * dt;

                if (!Number.isFinite(entity.y)) { entity.caught = true; return; }

                // خارها کمی چپ‌راست تاب می‌خورن تا فرار ازشون سخت‌تر باشه
                if(entity.type === "thorn"){

                    entity.swayPhase += dt*3;
                    entity.x = entity.baseX + Math.sin(entity.swayPhase)*22;
                    entity.el.x = entity.x;

                }

                entity.el.y = entity.y;

                if (entity.type === "golden"){
                    entity.pulsePhase += dt*4;
                    entity.el.scale.set(1+Math.sin(entity.pulsePhase)*0.12);
                }

                const withinX = Math.abs(entity.x - gameState.basketX) < 34;
                const withinY = entity.y > basketY - 20 && entity.y < basketY + 20;

                if (withinX && withinY){
                    catchHeartPixi(entity);
                } else if (entity.y > (app.screen.height||0) + 30){
                    entity.caught = true;
                    cameraLayer.removeChild(entity.el);
                }

            });

            // اگه وسط همین فریم بازی تموم شده باشه (برد یا باخت)،
            // gameState پاک شده - دیگه ادامه نده، وگرنه به یه شیء
            // null دسترسی پیدا می‌کنیم (همون محافظتی که نسخه‌ی DOM
            // بازی از قبل داشت)
            if (!gameState) return;

            gameState.entities = gameState.entities.filter(e=>!e.caught);

        });

        function endGamePixi(won){

            if (!gameState || !gameState.running) return;

            // توجه: gameState.running رو اینجا false نمی‌کنیم؛ خودِ
            // endGame() این‌کارو می‌کنه. قبلا اینجا زودتر false می‌شد و
            // چون endGame() با چک «!gameState.running» از ادامه‌کار
            // امتناع می‌کرد، صفحه‌ی برد/باخت هیچ‌وقت ساخته نمی‌شد و
            // بازی صرفا فریز می‌موند.
            stopGameTimers();

            try { app.destroy(true, {children:true, texture:false}); } catch(e){}

            endGame(screen, won);

        }

        // برای این‌که دکمه‌ی «رد کردن بازی» / بستن صفحه هم منابع Pixi رو آزاد کنه
        window.__pixiGameApp = app;

    }

}
