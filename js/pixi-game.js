/*=========================================
  PIXI GAME — نسخه‌ی PixiJS بازی «۷ قلب طلایی»
  همون قوانین و HUD قبلی (از game.js) رو نگه
  می‌داره، فقط ناحیه‌ی بازی (قلب‌های سقوط‌کننده
  و سبد) با PixiJS رندر می‌شه؛ نرم‌تر و با
  پارتیکل واقعی موقع گرفتن قلب طلایی.
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

        const lives = document.createElement("div");
        lives.className = "hud-lives";
        lives.id = "hudLives";

        const timeEl = document.createElement("div");
        timeEl.className = "hud-time";
        timeEl.id = "hudTime";
        timeEl.textContent = "⏱ " + GAME_CONFIG.duration;

        hud.appendChild(golden);
        hud.appendChild(lives);
        hud.appendChild(timeEl);

        const area = document.createElement("div");
        area.className = "game-area";
        area.id = "gameArea";

        screen.appendChild(hud);
        screen.appendChild(area);

        gameState = {
            golden: 0,
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

        const basketText = new PIXI.Text("💜", { fontSize: 40 });
        basketText.anchor.set(0.5, 1);
        app.stage.addChild(basketText);

        const particleLayer = new PIXI.Container();
        app.stage.addChild(particleLayer);

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

            const roll = Math.random();
            let type;
            if (roll < 0.22) type = "golden";
            else if (roll < 0.40) type = "bad";
            else type = "neutral";

            const glyph = type==="golden" ? "💛" : type==="bad" ? "💔" : "💜";
            const text = new PIXI.Text(glyph, { fontSize: type==="golden" ? 34 : 28 });
            text.anchor.set(0.5);

            const x = 24 + Math.random()*(rect.width-48);
            text.x = x;
            text.y = -30;

            app.stage.addChild(text);

            gameState.entities.push({ el: text, type, x, y: -30, caught:false, pulsePhase: Math.random()*10 });

        }

        function spawnLoop(){

            if (!gameState || !gameState.running) return;

            spawnHeartPixi();

            gameState.spawnInterval = Math.max(GAME_CONFIG.spawnIntervalMin, gameState.spawnInterval - 12);
            gameState.fallSpeed = Math.min(GAME_CONFIG.fallSpeedMax, gameState.fallSpeed + 2);

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

        function burstParticles(x, y, color){

            for (let i=0;i<10;i++){

                const g = new PIXI.Graphics();
                g.beginFill(color);
                g.drawCircle(0,0,3+Math.random()*2);
                g.endFill();
                g.x = x; g.y = y;

                const angle = (Math.PI*2/10)*i;
                const speed = 2+Math.random()*2;
                g.vx = Math.cos(angle)*speed;
                g.vy = Math.sin(angle)*speed;
                g.life = 1;

                particleLayer.addChild(g);

                const tick = ()=>{
                    g.x += g.vx; g.y += g.vy; g.vy += 0.12;
                    g.life -= 0.04; g.alpha = Math.max(0, g.life);
                    if (g.life <= 0){
                        particleLayer.removeChild(g);
                        app.ticker.remove(tick);
                    }
                };
                app.ticker.add(tick);

            }

        }

        function catchHeartPixi(entity){

            entity.caught = true;

            if (entity.type === "golden"){

                gameState.golden++;
                SFX.play("golden", 0.6);
                burstParticles(entity.el.x, entity.el.y, 0xFFD166);

                const counter = document.getElementById("goldenCount");
                if (counter) counter.textContent = gameState.golden;

                app.stage.removeChild(entity.el);

                if (gameState.golden >= GAME_CONFIG.goldenTarget){
                    endGamePixi(true);
                    return;
                }

            } else if (entity.type === "bad"){

                gameState.lives--;
                SFX.play("bad", 0.55);
                burstParticles(entity.el.x, entity.el.y, 0xff5b5b);

                renderLives();

                basketText.scale.set(1);
                let shakeT = 0;
                const shakeTick = ()=>{
                    shakeT += 0.3;
                    basketText.rotation = Math.sin(shakeT*8)*0.25*Math.max(0,1-shakeT);
                    if (shakeT>=1){ basketText.rotation=0; app.ticker.remove(shakeTick); }
                };
                app.ticker.add(shakeTick);

                app.stage.removeChild(entity.el);

                if (gameState.lives <= 0){
                    endGamePixi(false);
                    return;
                }

            } else {

                SFX.play("click", 0.3);
                app.stage.removeChild(entity.el);

            }

        }

        app.ticker.add((delta)=>{

            if (!gameState || !gameState.running) return;

            if (!app.screen || !Number.isFinite(app.screen.height) || app.screen.height<=0) return;

            const dt = delta/60;
            const basketY = (app.screen.height||0) - 30;

            gameState.entities.forEach(entity=>{

                if (entity.caught) return;

                entity.y += gameState.fallSpeed * dt;

                if (!Number.isFinite(entity.y)) { entity.caught = true; return; }

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
                    app.stage.removeChild(entity.el);
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
