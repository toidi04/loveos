/*=========================================
  ENDLESS RUNNER
  یک بازی Endless Runner حرفه‌ای با PixiJS.
  شخصیت Runner همون شخصیت اصلی کاربره (همون
  لایه‌های PNG بدنه/مو/آیتم/چشم که تو صفحه‌ی
  اصلی هم استفاده می‌شن)، پس کاربر احساس می‌کنه
  خودش وارد بازی شده، نه یه کاراکتر جدا.

  ویژگی‌ها: پس‌زمینه‌ی چندلایه (Parallax)،
  چرخه‌ی روز/غروب/شب، آب‌وهوای متغیر (باران/
  برف/مه)، موانع متنوع، افزایش تدریجی سختی،
  ذرات فرود، لرزش دوربین موقع برخورد.

  اگه PixiJS در دسترس نباشه، کاربر مستقیم به
  صفحه‌ی بازی‌ها برمی‌گرده (به‌جای فریز کردن
  برنامه).
=========================================*/

const RUNNER_CONFIG = {

    groundYRatio: 0.80,

    gravity: 2600,
    jumpVelocity: -980,

    speedStart: 260,
    speedMax: 560,
    speedRampDistance: 3200,

    spawnGapStart: 1350,
    spawnGapMin: 720,

    dayCycleDistance: 2200,

    charX: 96,

    // جهت رو به جلوی شخصیت: موانع از راست صفحه میان و به چپ
    // می‌رن (یعنی شخصیت داره به سمت راست می‌دوئه)، پس باید
    // آینه بشه تا رو به همون سمت باشه، نه برعکس
    faceDir: -1,

    obstacleTypes: ["rock", "bush", "heart"]

};

let runnerState = null;
let runnerApp = null;

function startRunner(){

    if (typeof PIXI === "undefined"){

        showGamesScreen();

        return;

    }

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen game-screen runner-screen fade-in";

    app.appendChild(screen);

    SFX.play("whoosh", 0.35);

    buildRunnerIntro(screen);

}

function buildRunnerIntro(screen){

    screen.innerHTML = "";

    const title = document.createElement("h1");

    title.className = "game-title";

    title.textContent = "فرار بی‌پایان 🏃‍♂️";

    const desc = document.createElement("p");

    desc.className = "game-desc";

    desc.textContent =
        "با یه ضربه بپر و از موانع رد شو. هرچی بیشتر دووم بیاری، دنیا سریع‌تر و سخت‌تر می‌شه — و شب و روز و آب‌وهوا هم عوض می‌شن.";

    const startBtn = document.createElement("button");

    startBtn.textContent = "شروع دو 🎮";

    startBtn.className = "game-start-btn";

    startBtn.onclick = ()=> launchRunner(screen);

    const skipBtn = document.createElement("button");

    skipBtn.textContent = "بازگشت";

    skipBtn.className = "game-skip-btn";

    skipBtn.onclick = ()=> showGamesScreen();

    screen.appendChild(title);

    screen.appendChild(desc);

    screen.appendChild(startBtn);

    screen.appendChild(skipBtn);

}

/* ---------------------------------------------------------
   Leaderboard محلی — فقط ۵ رکورد برتر هر کاربر نگه داشته
   می‌شه (بر اساس شخصیت انتخاب‌شده، جدا از کاربر دیگه).
   loveos_runner_scores_<userKey> -> آرایه‌ی { score, date }
   حداکثر ۵ تایی، مرتب‌شده نزولی بر اساس امتیاز.
--------------------------------------------------------- */
function getRunnerScoresKey(userKey){

    return "loveos_runner_scores_" + userKey;

}

function getRunnerLeaderboard(userKey){

    try {

        const raw = localStorage.getItem(getRunnerScoresKey(userKey));

        if(!raw) return [];

        const list = JSON.parse(raw);

        if(!Array.isArray(list)) return [];

        return list
            .filter(e=> e && typeof e.score === "number")
            .sort((a,b)=> b.score - a.score)
            .slice(0,5);

    } catch(e){

        return [];

    }

}

function getRunnerBest(userKey){

    const list = getRunnerLeaderboard(userKey);

    return list.length ? list[0].score : 0;

}

// امتیاز جدید رو ثبت می‌کنه، فقط ۵ رکورد برتر رو نگه می‌داره،
// و رتبه‌ی دقیق همین امتیاز جدید رو (بین رکورد قبلی‌ها) برمی‌گردونه
function submitRunnerScore(userKey, score){

    const key = getRunnerScoresKey(userKey);

    const list = getRunnerLeaderboard(userKey);

    const entry = { score, date: Date.now() };

    list.push(entry);

    list.sort((a,b)=> b.score - a.score);

    const rankIndex = list.indexOf(entry);

    const trimmed = list.slice(0,5);

    try { localStorage.setItem(key, JSON.stringify(trimmed)); } catch(e){ /* بی‌اهمیت */ }

    return {
        list: trimmed,
        entry: entry,
        rank: rankIndex + 1,
        madeTop5: rankIndex < 5,
        isNewBest: rankIndex === 0
    };

}

/* ---------------------------------------------------------
   ساخت صحنه‌ی اصلی بازی
--------------------------------------------------------- */
function launchRunner(screen){

    screen.innerHTML = "";

    screen.classList.add("game-active");

    const sky = document.createElement("div");

    sky.className = "runner-sky";

    const hud = document.createElement("div");

    hud.className = "game-hud runner-hud";

    const scoreEl = document.createElement("div");

    scoreEl.className = "hud-score";

    scoreEl.innerHTML = `📏 <span id="runnerScoreVal">0</span>`;

    const bestEl = document.createElement("div");

    bestEl.className = "hud-time runner-hud-best";

    const best = getRunnerBest(currentUser);

    bestEl.innerHTML = `🏆 <span id="runnerBestVal">${best}</span>`;

    hud.appendChild(scoreEl);

    hud.appendChild(bestEl);

    const area = document.createElement("div");

    area.className = "game-area runner-area";

    area.id = "runnerArea";

    screen.appendChild(sky);

    screen.appendChild(hud);

    screen.appendChild(area);

    const tapHint = document.createElement("div");

    tapHint.className = "runner-tap-hint";

    tapHint.textContent = "برای پریدن ضربه بزن 👆";

    area.appendChild(tapHint);

    setTimeout(()=> tapHint.classList.add("runner-tap-hint-hide"), 2600);

    runnerState = {

        running: true,
        distance: 0,
        speed: RUNNER_CONFIG.speedStart,
        lastSpawnAt: 0,
        obstacles: [],
        weather: "clear",
        weatherChangeAt: 3.5,
        best

    };

    buildRunnerPixi(area, screen, sky);

}

/* ---------------------------------------------------------
   موتور PixiJS: پس‌زمینه‌ی چندلایه، کاراکتر، موانع، آب‌وهوا
--------------------------------------------------------- */
function buildRunnerPixi(area, screen, sky){

    const app = new PIXI.Application({
        resizeTo: area,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true
    });

    runnerApp = app;

    area.appendChild(app.view);
    app.view.style.touchAction = "none";

    const cameraLayer = new PIXI.Container();
    app.stage.addChild(cameraLayer);

    const farLayer  = new PIXI.Container();
    const midLayer  = new PIXI.Container();
    const nearLayer = new PIXI.Container();
    const groundLayer = new PIXI.Container();
    const weatherLayer = new PIXI.Container();
    const obstacleLayer = new PIXI.Container();
    const charLayer = new PIXI.Container();
    const dustLayer = new PIXI.Container();

    cameraLayer.addChild(farLayer);
    cameraLayer.addChild(midLayer);
    cameraLayer.addChild(nearLayer);
    cameraLayer.addChild(groundLayer);
    cameraLayer.addChild(weatherLayer);
    cameraLayer.addChild(obstacleLayer);
    cameraLayer.addChild(dustLayer);
    cameraLayer.addChild(charLayer);

    // تینت اتمسفری برای غروب/شب (یه مستطیل کدر روی همه‌چیز)
    const atmosphereTint = new PIXI.Graphics();
    app.stage.addChild(atmosphereTint);

    function getSize(){
        return { w: app.screen.width||area.clientWidth||320, h: app.screen.height||area.clientHeight||400 };
    }

    // ---------- پارالاکس (تپه‌های تکرارشونده) ----------
    function makeHillChunk(color, heightRatio, jag){

        const g = new PIXI.Graphics();
        const { w, h } = getSize();
        const chunkW = Math.max(260, w*0.9);
        const baseY = h * RUNNER_CONFIG.groundYRatio;
        const peakY = baseY - h*heightRatio;

        g.beginFill(color);
        g.moveTo(0, baseY+40);
        g.lineTo(0, baseY - h*heightRatio*0.4);

        const segments = 5;
        for(let i=0;i<=segments;i++){
            const x = (chunkW/segments)*i;
            const y = peakY + Math.sin(i*1.7+jag)*h*heightRatio*0.35;
            g.lineTo(x, y);
        }

        g.lineTo(chunkW, baseY+40);
        g.closePath();
        g.endFill();

        g.__chunkW = chunkW;

        return g;

    }

    function buildParallaxLayer(container, color, heightRatio, count){

        container.removeChildren();

        const chunks = [];

        let x = 0;

        for(let i=0;i<count;i++){

            const chunk = makeHillChunk(color, heightRatio, i*1.3);
            chunk.x = x;
            container.addChild(chunk);
            chunks.push(chunk);
            x += chunk.__chunkW - 2;

        }

        container.__chunks = chunks;
        container.__totalW = x;

    }

    function scrollParallax(container, dx){

        if(!container.__chunks || !container.__totalW) return;

        container.__chunks.forEach(chunk=>{

            chunk.x -= dx;

            if(chunk.x + chunk.__chunkW < 0){
                chunk.x += container.__totalW;
            }

        });

    }

    buildParallaxLayer(farLayer,  0x2a1a4a, 0.30, 4);
    buildParallaxLayer(midLayer,  0x3a2160, 0.20, 5);
    buildParallaxLayer(nearLayer, 0x4c2a86, 0.12, 6);

    // ---------- زمین ----------
    function drawGround(){

        groundLayer.removeChildren();

        const { w, h } = getSize();
        const groundY = h * RUNNER_CONFIG.groundYRatio;

        const g = new PIXI.Graphics();
        g.beginFill(0x1c1030);
        g.drawRect(0, groundY, w, h-groundY);
        g.endFill();

        g.beginFill(0xC9A9FF, 0.5);
        g.drawRect(0, groundY, w, 3);
        g.endFill();

        groundLayer.addChild(g);

    }

    drawGround();

    // ---------- خورشید/ماه ----------
    const orb = new PIXI.Graphics();
    cameraLayer.addChildAt(orb, 1);

    function drawOrb(isSun){

        orb.clear();
        orb.beginFill(isSun ? 0xFFD166 : 0xE9E4FF, 1);
        orb.drawCircle(0,0, isSun?22:18);
        orb.endFill();

        if(!isSun){
            orb.beginFill(0x2a1a4a, 1);
            orb.drawCircle(7,-4,14);
            orb.endFill();
        }

    }

    drawOrb(true);

    // ---------- آب‌وهوا: باران/برف/مه ----------
    function spawnWeatherParticles(kind){

        weatherLayer.removeChildren();

        const { w, h } = getSize();

        if(kind === "rain"){

            for(let i=0;i<40;i++){
                const l = new PIXI.Graphics();
                l.lineStyle(2, 0x9fd8ff, 0.5);
                l.moveTo(0,0); l.lineTo(3,14);
                l.x = Math.random()*w;
                l.y = Math.random()*h;
                l.__vy = 480+Math.random()*160;
                l.__vx = -40;
                weatherLayer.addChild(l);
            }

        } else if(kind === "snow"){

            for(let i=0;i<34;i++){
                const c = new PIXI.Graphics();
                c.beginFill(0xffffff, 0.85);
                c.drawCircle(0,0, 1.5+Math.random()*2.2);
                c.endFill();
                c.x = Math.random()*w;
                c.y = Math.random()*h;
                c.__vy = 60+Math.random()*50;
                c.__vx = -10;
                c.__phase = Math.random()*10;
                weatherLayer.addChild(c);
            }

        } else if(kind === "fog"){

            for(let i=0;i<4;i++){
                const f = new PIXI.Graphics();
                f.beginFill(0xffffff, 0.06);
                f.drawEllipse(0,0, w*0.5, h*0.14);
                f.endFill();
                f.x = (w/4)*i;
                f.y = h*0.5 + (Math.random()-0.5)*h*0.3;
                f.__vy = 0;
                f.__vx = -18;
                weatherLayer.addChild(f);
            }

        }

    }

    function updateWeather(dt){

        const { w, h } = getSize();

        weatherLayer.children.forEach(p=>{

            p.y += (p.__vy||0)*dt;
            p.x += (p.__vx||0)*dt;

            if(p.__phase !== undefined){
                p.__phase += dt*2;
                p.x += Math.sin(p.__phase)*8*dt;
            }

            if(p.y > h+20) p.y = -20;
            if(p.x < -w*0.6) p.x = w+w*0.6;

        });

    }

    // ---------- فیزیک پرش ----------
    const runnerPhysics = {
        y: 0,
        vy: 0,
        onGround: true,
        squash: 1
    };

    function positionCharacterGround(){

        const { h } = getSize();
        const groundY = h * RUNNER_CONFIG.groundYRatio;

        charLayer.x = RUNNER_CONFIG.charX;
        charLayer.y = groundY - runnerPhysics.y;

    }

    // ---------- کاراکتر پیکسل‌آرت مخصوص رانر ----------
    // به‌جای ایموجی یا لود کردن مستقیم PNG صفحه‌ی اصلی، یه
    // شخصیت کوچیک پیکسلی مخصوص همین بازی با PIXI.Graphics
    // ساخته می‌شه؛ چون کاملاً برداریه، هیچ‌وقت لودش fail
    // نمی‌شه، و چون اعضای بدنش (دست/پا/سر) جدا از هم هستن
    // می‌تونیم واقعاً انیمیشن دو/پرش بهش بدیم. رنگ لباس و
    // موهاش هم از تم همون کاربر (یاسین/عسل) میاد تا هویتش
    // با کاراکتر اصلی هماهنگ باشه.

    function shadeHex(hex, amt){
        const r = Math.max(0, Math.min(255, ((hex>>16)&0xff) + amt));
        const g = Math.max(0, Math.min(255, ((hex>>8)&0xff) + amt));
        const b = Math.max(0, Math.min(255, (hex&0xff) + amt));
        return (r<<16) + (g<<8) + b;
    }

    function hexStrToInt(str, fallback){
        if(typeof str !== "string") return fallback;
        const n = parseInt(str.replace("#", "0x"));
        return isNaN(n) ? fallback : n;
    }

    const runnerTheme = (typeof THEMES !== "undefined" && THEMES[currentUser]) ? THEMES[currentUser] : null;

    const themeOutfit = hexStrToInt(runnerTheme && runnerTheme.primary,   0x6366F1);
    const themeHair   = hexStrToInt(runnerTheme && runnerTheme.secondary, 0xF59E0B);

    let charReady = false;
    let charBaseScale = 1.7;

    const charParts = {};

    function drawLimb(w, h, color){

        const g = new PIXI.Graphics();
        g.beginFill(color);
        g.drawRoundedRect(-w/2, 0, w, h, w*0.42);
        g.endFill();
        return g;

    }

    function buildRunnerCharacter(){

        charLayer.removeChildren();

        const skin       = 0xF3C89E;
        const outfit      = themeOutfit;
        const outfitDark  = shadeHex(themeOutfit, -55);
        const hairColor   = themeHair;

        const legW=7, legH=17, armW=6, armH=15, torsoW=19, torsoH=17, headR=9;

        const hipY = -legH;
        const shoulderY = hipY - torsoH;
        const headCenterY = shoulderY - headR - 2;

        const shadowEl = new PIXI.Graphics();
        shadowEl.beginFill(0x000000, 0.28);
        shadowEl.drawEllipse(0, 2, 13, 4);
        shadowEl.endFill();

        const backLeg = drawLimb(legW, legH, outfitDark);
        backLeg.x = -4; backLeg.y = hipY;

        const backArm = drawLimb(armW, armH, outfitDark);
        backArm.x = -9; backArm.y = shoulderY + 3;

        const torso = new PIXI.Graphics();
        torso.beginFill(outfit);
        torso.drawRoundedRect(-torsoW/2, shoulderY, torsoW, torsoH, 6);
        torso.endFill();

        const frontLeg = drawLimb(legW, legH, outfit);
        frontLeg.x = 4; frontLeg.y = hipY;

        const head = new PIXI.Graphics();
        head.beginFill(skin);
        head.drawCircle(0, headCenterY, headR);
        head.endFill();

        const hair = new PIXI.Graphics();
        hair.beginFill(hairColor);
        hair.drawEllipse(0, headCenterY - headR*0.55, headR*1.05, headR*0.75);
        hair.endFill();

        const eyeL = new PIXI.Graphics();
        eyeL.beginFill(0x2a1a3a);
        eyeL.drawCircle(-3.2, headCenterY - 1, 1.3);
        eyeL.endFill();

        const eyeR = new PIXI.Graphics();
        eyeR.beginFill(0x2a1a3a);
        eyeR.drawCircle(3.2, headCenterY - 1, 1.3);
        eyeR.endFill();

        const frontArm = drawLimb(armW, armH, outfit);
        frontArm.x = 9; frontArm.y = shoulderY + 3;

        charLayer.addChild(shadowEl);
        charLayer.addChild(backArm);
        charLayer.addChild(backLeg);
        charLayer.addChild(torso);
        charLayer.addChild(frontLeg);
        charLayer.addChild(head);
        charLayer.addChild(hair);
        charLayer.addChild(eyeL);
        charLayer.addChild(eyeR);
        charLayer.addChild(frontArm);

        charParts.backLeg  = backLeg;
        charParts.frontLeg = frontLeg;
        charParts.backArm  = backArm;
        charParts.frontArm = frontArm;

        charLayer.scale.set(charBaseScale * RUNNER_CONFIG.faceDir, charBaseScale);

        charReady = true;

        positionCharacterGround();

    }

    buildRunnerCharacter();

    function doJump(){

        if(!runnerState || !runnerState.running) return;
        if(!runnerPhysics.onGround) return;

        runnerPhysics.vy = RUNNER_CONFIG.jumpVelocity;
        runnerPhysics.onGround = false;

        SFX.play("click", 0.4);

    }

    area.addEventListener("pointerdown", function(){

        doJump();

    });

    function animateRunnerLimbs(dt, runPhase){

        if(!charParts.frontLeg) return;

        const swing = 0.85;

        if(runnerPhysics.onGround){

            charParts.frontLeg.rotation = Math.sin(runPhase) * swing;
            charParts.backLeg.rotation  = Math.sin(runPhase + Math.PI) * swing;

            charParts.frontArm.rotation = Math.sin(runPhase + Math.PI) * (swing*0.65);
            charParts.backArm.rotation  = Math.sin(runPhase) * (swing*0.65);

        } else {

            const t = Math.min(1, dt*10);

            charParts.frontLeg.rotation += (-0.55 - charParts.frontLeg.rotation) * t;
            charParts.backLeg.rotation  += ( 0.35 - charParts.backLeg.rotation ) * t;

            charParts.frontArm.rotation += (-1.3 - charParts.frontArm.rotation) * t;
            charParts.backArm.rotation  += (-0.9 - charParts.backArm.rotation ) * t;

        }

    }

    function updatePhysics(dt){

        const { h } = getSize();
        const groundY = h * RUNNER_CONFIG.groundYRatio;

        if(!runnerPhysics.onGround){

            runnerPhysics.vy += RUNNER_CONFIG.gravity*dt;
            runnerPhysics.y -= runnerPhysics.vy*dt;

            if(runnerPhysics.y <= 0){

                runnerPhysics.y = 0;
                runnerPhysics.vy = 0;

                spawnLandingDust();
                runnerPhysics.squash = 1.28;

                runnerPhysics.onGround = true;

            }

        }

        runnerPhysics.squash += (1-runnerPhysics.squash)*Math.min(1, dt*14);

        const bobPhase = (runnerState.distance*0.045) % (Math.PI*2);
        const bob = runnerPhysics.onGround ? Math.sin(bobPhase)*4 : 0;
        const lean = runnerPhysics.onGround ? Math.sin(bobPhase)*0.05 : -0.12;

        charLayer.x = RUNNER_CONFIG.charX;
        charLayer.y = groundY - runnerPhysics.y + bob;
        charLayer.rotation = lean;
        charLayer.scale.set(
            charBaseScale * RUNNER_CONFIG.faceDir * (runnerPhysics.onGround ? runnerPhysics.squash : 1),
            charBaseScale * (runnerPhysics.onGround ? (2-runnerPhysics.squash) : 1)
        );

        animateRunnerLimbs(dt, bobPhase);


    }

    function spawnLandingDust(){

        const { h } = getSize();
        const groundY = h * RUNNER_CONFIG.groundYRatio;

        for(let i=0;i<8;i++){

            const d = new PIXI.Graphics();
            d.beginFill(0xC9A9FF, 0.6);
            d.drawCircle(0,0, 2+Math.random()*2);
            d.endFill();
            d.x = RUNNER_CONFIG.charX + (Math.random()-0.5)*20;
            d.y = groundY - 2;
            d.__vx = (Math.random()-0.5)*90;
            d.__vy = -40-Math.random()*40;
            d.__life = 1;

            dustLayer.addChild(d);

        }

    }

    function updateDust(dt){

        dustLayer.children.slice().forEach(d=>{

            d.x += d.__vx*dt;
            d.y += d.__vy*dt;
            d.__vy += 260*dt;
            d.__life -= dt*1.6;
            d.alpha = Math.max(0, d.__life);

            if(d.__life <= 0) dustLayer.removeChild(d);

        });

    }

    // ---------- موانع ----------
    function drawHeartPath(g, cx, cy, s){

        g.moveTo(cx, cy+s*0.3);
        g.bezierCurveTo(cx-s, cy-s*0.6, cx-s*1.6, cy+s*0.5, cx, cy+s*1.4);
        g.bezierCurveTo(cx+s*1.6, cy+s*0.5, cx+s, cy-s*0.6, cx, cy+s*0.3);
        g.closePath();

    }

    function drawObstacle(type){

        const g = new PIXI.Graphics();

        if(type === "rock"){

            g.beginFill(0x5a4a72);
            g.moveTo(-18,0); g.lineTo(-10,-30); g.lineTo(6,-34); g.lineTo(20,-8); g.lineTo(18,0);
            g.closePath(); g.endFill();
            g.__w = 40; g.__h = 34;

        } else if(type === "bush"){

            g.beginFill(0x3fae6a);
            g.drawCircle(-14,-10,14);
            g.drawCircle(0,-18,17);
            g.drawCircle(15,-10,13);
            g.endFill();
            g.__w = 46; g.__h = 32;

        } else { // heart — مانع شناور، نیاز به پرش دقیق‌تر

            g.beginFill(0xff5b7a);
            drawHeartPath(g, 0,0, 15);
            g.endFill();
            g.y = -46;
            g.__w = 30; g.__h = 26;
            g.__floating = true;

        }

        return g;

    }

    function spawnObstacle(){

        const { w, h } = getSize();
        const groundY = h * RUNNER_CONFIG.groundYRatio;

        const type = RUNNER_CONFIG.obstacleTypes[Math.floor(Math.random()*RUNNER_CONFIG.obstacleTypes.length)];

        const g = drawObstacle(type);
        g.x = w + 40;
        g.y += groundY;

        obstacleLayer.addChild(g);

        runnerState.obstacles.push({ el:g, type });

    }

    function updateObstacles(dt, dx){

        runnerState.obstacles.forEach(ob=>{

            ob.el.x -= dx;

        });

        runnerState.obstacles = runnerState.obstacles.filter(ob=>{

            if(ob.el.x < -60){
                obstacleLayer.removeChild(ob.el);
                return false;
            }

            return true;

        });

    }

    function checkCollisions(){

        const charBox = {
            x: RUNNER_CONFIG.charX - 20,
            y: charLayer.y - 82,
            w: 40,
            h: 82
        };

        for(const ob of runnerState.obstacles){

            const ow = ob.el.__w||30, oh = ob.el.__h||30;

            const obBox = {
                x: ob.el.x - ow/2,
                y: ob.el.y - oh,
                w: ow,
                h: oh
            };

            const overlap =
                charBox.x < obBox.x+obBox.w &&
                charBox.x+charBox.w > obBox.x &&
                charBox.y < obBox.y+obBox.h &&
                charBox.y+charBox.h > obBox.y;

            if(overlap) return true;

        }

        return false;

    }

    // ---------- لرزش دوربین ----------
    let shakeTime = 0, shakeStrength = 0;

    function updateShake(dt){

        if(shakeTime > 0){

            shakeTime = Math.max(0, shakeTime - dt*4);

            const power = shakeStrength*shakeTime;

            app.stage.x = (Math.random()*2-1)*power;
            app.stage.y = (Math.random()*2-1)*power;

        } else if(app.stage.x !== 0 || app.stage.y !== 0){

            app.stage.x = 0; app.stage.y = 0;

        }

    }

    // ---------- چرخه‌ی روز/شب ----------
    const DAY_PALETTES = [
        { t:0.00, sky1:[42,20,74],  sky2:[76,42,134], tint:[0,0,0],       tintA:0.0,  sun:true  },
        { t:0.28, sky1:[90,40,60],  sky2:[220,140,80],tint:[255,140,60],  tintA:0.14, sun:true  },
        { t:0.42, sky1:[18,10,30],  sky2:[40,20,64],  tint:[20,10,40],    tintA:0.30, sun:false },
        { t:0.85, sky1:[30,16,54],  sky2:[70,38,110], tint:[60,30,90],    tintA:0.10, sun:false },
        { t:1.00, sky1:[42,20,74],  sky2:[76,42,134], tint:[0,0,0],       tintA:0.0,  sun:true  }
    ];

    function lerp(a,b,t){ return a+(b-a)*t; }

    function samplePalette(t){

        for(let i=0;i<DAY_PALETTES.length-1;i++){

            const p0 = DAY_PALETTES[i], p1 = DAY_PALETTES[i+1];

            if(t>=p0.t && t<=p1.t){

                const local = (t-p0.t)/Math.max(0.0001,(p1.t-p0.t));

                return {
                    sky1: p0.sky1.map((v,i2)=> lerp(v,p1.sky1[i2],local)),
                    sky2: p0.sky2.map((v,i2)=> lerp(v,p1.sky2[i2],local)),
                    tint: p0.tint.map((v,i2)=> lerp(v,p1.tint[i2],local)),
                    tintA: lerp(p0.tintA, p1.tintA, local),
                    sun: local < 0.5 ? p0.sun : p1.sun
                };

            }

        }

        return DAY_PALETTES[0];

    }

    function rgbCss(arr){
        return `rgb(${Math.round(arr[0])},${Math.round(arr[1])},${Math.round(arr[2])})`;
    }

    function rgbHex(arr){
        return (Math.round(arr[0])<<16) + (Math.round(arr[1])<<8) + Math.round(arr[2]);
    }

    let lastPaletteSunState = true;

    function updateDayNight(){

        const cyclePos = (runnerState.distance % RUNNER_CONFIG.dayCycleDistance) / RUNNER_CONFIG.dayCycleDistance;

        const pal = samplePalette(cyclePos);

        sky.style.background = `linear-gradient(180deg, ${rgbCss(pal.sky1)} 0%, ${rgbCss(pal.sky2)} 100%)`;

        const { w, h } = getSize();

        atmosphereTint.clear();
        atmosphereTint.beginFill(rgbHex(pal.tint), pal.tintA);
        atmosphereTint.drawRect(0,0,w,h);
        atmosphereTint.endFill();

        const cycleHalf = cyclePos % 0.5 / 0.5;

        orb.x = w*0.15 + (w*0.7)*(1-cycleHalf);
        orb.y = h*0.16 + Math.sin(Math.PI*cycleHalf)* -h*0.08 + h*0.10;

        if(pal.sun !== lastPaletteSunState){
            drawOrb(pal.sun);
            lastPaletteSunState = pal.sun;
        }

    }

    // ---------- تغییر تصادفی آب‌وهوا ----------
    function rollWeather(){

        const options = ["clear","clear","rain","snow","fog"];

        const next = options[Math.floor(Math.random()*options.length)];

        runnerState.weather = next;

        spawnWeatherParticles(next);

        runnerState.weatherChangeAt = runnerState.distance/100 + 6 + Math.random()*8;

    }

    // ---------- HUD امتیاز ----------
    function updateHud(){

        const scoreVal = document.getElementById("runnerScoreVal");

        if(scoreVal) scoreVal.textContent = Math.floor(runnerState.distance);

    }

    function triggerHitAndEnd(){

        shakeStrength = 14;
        shakeTime = 1;

        endRunner(screen, app);

    }

    // ---------- گیم‌لوپ ----------
    let lastTime = null;

    app.ticker.add(function(){

        if(!runnerState || !runnerState.running) return;

        const now = performance.now();

        if(lastTime===null) lastTime = now;

        let dt = (now-lastTime)/1000;

        dt = Math.min(dt, 0.05);

        lastTime = now;

        const speedT = Math.min(1, runnerState.distance / RUNNER_CONFIG.speedRampDistance);

        runnerState.speed = RUNNER_CONFIG.speedStart + (RUNNER_CONFIG.speedMax-RUNNER_CONFIG.speedStart)*speedT;

        const dx = runnerState.speed*dt;

        runnerState.distance += dx*0.12;

        scrollParallax(farLayer,  dx*0.15);
        scrollParallax(midLayer,  dx*0.35);
        scrollParallax(nearLayer, dx*0.60);

        updatePhysics(dt);
        updateDust(dt);
        updateObstacles(dt, dx);
        updateWeather(dt);
        updateDayNight();
        updateShake(dt);
        updateHud();

        runnerState.lastSpawnAt += dt*1000;

        const gapT = Math.min(1, runnerState.distance / RUNNER_CONFIG.speedRampDistance);

        const currentGap = RUNNER_CONFIG.spawnGapStart - (RUNNER_CONFIG.spawnGapStart-RUNNER_CONFIG.spawnGapMin)*gapT;

        if(runnerState.lastSpawnAt >= currentGap){

            runnerState.lastSpawnAt = 0;

            spawnObstacle();

        }

        if(runnerState.distance/100 >= runnerState.weatherChangeAt){

            rollWeather();

        }

        if(charReady && checkCollisions()){

            triggerHitAndEnd();

        }

    });

    rollWeather();

}

/* ---------------------------------------------------------
   پایان بازی
--------------------------------------------------------- */
function endRunner(screen, app){

    if(!runnerState || !runnerState.running) return;

    runnerState.running = false;

    SFX.play("bad", 0.55);

    const finalScore = Math.floor(runnerState.distance);

    const result = submitRunnerScore(currentUser, finalScore);

    if(result.isNewBest) SFX.play("golden", 0.6);

    setTimeout(function(){

        try { app.destroy(true, {children:true, texture:false}); } catch(e){}

        runnerApp = null;

        screen.innerHTML = "";

        screen.classList.remove("game-active");

        const heading = document.createElement("h1");

        heading.className = "game-title";

        heading.textContent = result.isNewBest ? "رکورد جدید! 🎉" : "بازی تموم شد";

        const scoreLine = document.createElement("p");

        scoreLine.className = "game-desc runner-result-line";

        const rankBadge = document.createElement("span");

        rankBadge.className = "runner-rank-badge" + (result.isNewBest ? " runner-rank-badge-best" : "");

        rankBadge.textContent = result.isNewBest
            ? "New Personal Best 💜"
            : (result.madeTop5 ? `Rank #${result.rank} 🏅` : "خارج از ۵ رکورد برتر");

        scoreLine.innerHTML = `فاصله‌ی این دور: <b>${finalScore}</b>`;

        const board = buildRunnerLeaderboardList(result.list, result.entry);

        const again = document.createElement("button");

        again.className = "game-start-btn";

        again.textContent = "دوباره بدو 🔁";

        again.onclick = ()=> startRunner();

        const back = document.createElement("button");

        back.className = "game-skip-btn";

        back.textContent = "بازگشت به بازی‌ها";

        back.onclick = ()=> showGamesScreen();

        screen.appendChild(heading);

        screen.appendChild(rankBadge);

        screen.appendChild(scoreLine);

        screen.appendChild(board);

        screen.appendChild(again);

        screen.appendChild(back);

    }, 260);

}

/* ---------------------------------------------------------
   ساخت لیست Leaderboard (۵ رکورد برتر) برای نمایش زیر
   نتیجه‌ی بازی؛ رکورد همین دور با رنگ/نشان جدا مشخص می‌شه
--------------------------------------------------------- */
const RUNNER_MEDALS = ["🥇","🥈","🥉"];

function buildRunnerLeaderboardList(list, currentEntry){

    const wrap = document.createElement("div");

    wrap.className = "runner-leaderboard";

    const title = document.createElement("div");

    title.className = "runner-leaderboard-title";

    title.textContent = "۵ رکورد برتر";

    wrap.appendChild(title);

    if(!list.length){

        const empty = document.createElement("div");

        empty.className = "runner-leaderboard-empty";

        empty.textContent = "هنوز رکوردی ثبت نشده";

        wrap.appendChild(empty);

        return wrap;

    }

    list.forEach(function(item, index){

        const row = document.createElement("div");

        const isCurrent = currentEntry && item.date === currentEntry.date && item.score === currentEntry.score;

        row.className = "runner-leaderboard-row" + (isCurrent ? " runner-leaderboard-row-current" : "");

        const rankEl = document.createElement("span");

        rankEl.className = "runner-leaderboard-rank";

        rankEl.textContent = RUNNER_MEDALS[index] || `#${index+1}`;

        const scoreEl = document.createElement("span");

        scoreEl.className = "runner-leaderboard-score";

        scoreEl.textContent = item.score;

        row.appendChild(rankEl);

        row.appendChild(scoreEl);

        wrap.appendChild(row);

    });

    return wrap;

}
