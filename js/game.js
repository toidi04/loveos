/*=========================================
  GAME — «قلب‌های کهکشانی ✨»
  تو یه شب پرستاره، قلبت (💜) بین ستاره‌ها
  شناوره. باید ۷ تا «قلب کهکشانی» (💫) رو قبل
  از تموم شدن زمان بگیری. ستاره‌های کوچیک (⭐)
  امتیاز مثبت کم می‌دن، اما شهاب‌سنگ (☄️) و
  حفره‌های سیاه (🌀) یه جون ازت می‌گیرن. هرچی
  امتیازت بیشتر بشه، بازی سریع‌تر و هیجانی‌تر
  می‌شه.
=========================================*/

const GAME_CONFIG = {
    goldenTarget: 7,
    maxLives: 3,
    duration: 45,          // ثانیه

    spawnIntervalStart: 900,   // میلی‌ثانیه بین اسپان‌ها
    spawnIntervalMin: 420,

    fallSpeedStart: 90,    // پیکسل بر ثانیه
    fallSpeedMax: 200,

    goldenScore: 15,
    flowerScore: 2,

    // امتیازی که در اون سرعت/تعداد اسپان به حداکثر سختی می‌رسه
    scoreForMaxDifficulty: 90,

    // احتمال ظاهر شدن هر نوع (مجموع باید ۱ باشه)
    typeWeights: [
        ["golden", 0.20],
        ["thorn",  0.11],
        ["broken", 0.11],
        ["flower", 0.58]
    ]
};

let gameState = null;
let gameRAF = null;
let gameSpawnTimer = null;
let gameCountdownTimer = null;
let gameHintTimer = null;

// ---------- توابع مشترک ----------

function rollEntityType(){

    const roll = Math.random();

    let acc = 0;

    for(const [type, weight] of GAME_CONFIG.typeWeights){

        acc += weight;

        if(roll < acc) return type;

    }

    return "flower";

}

function difficultyFactor(score){

    return Math.max(0, Math.min(1, score / GAME_CONFIG.scoreForMaxDifficulty));

}

function applyDifficulty(){

    if(!gameState) return;

    const f = difficultyFactor(gameState.score);

    gameState.spawnInterval = GAME_CONFIG.spawnIntervalStart -
        (GAME_CONFIG.spawnIntervalStart - GAME_CONFIG.spawnIntervalMin) * f;

    gameState.fallSpeed = GAME_CONFIG.fallSpeedStart +
        (GAME_CONFIG.fallSpeedMax - GAME_CONFIG.fallSpeedStart) * f;

}

// نوع موجودیت‌ها: golden = قلب کهکشانی (هدف اصلی) | flower = ستاره‌ی
// کوچیک (امتیاز جزئی) | broken = شهاب‌سنگ (خطر) | thorn = حفره‌ی
// سیاه (خطر، تاب می‌خوره). گلیف/ظاهرشون الان با عکس واقعی (پس‌زمینه‌ی
// CSS هر کلاس) مشخص می‌شه، نه ایموجی.

function startGame(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen game-screen space-game-screen fade-in";

    app.appendChild(screen);

    SFX.play("whoosh", 0.35);

    buildGameIntro(screen);

}

function buildGameIntro(screen){

    screen.innerHTML = "";

    buildStarfield(screen);

    const title = document.createElement("h1");

    title.className = "game-title";

    title.textContent = "قلب‌های کهکشانی ✨";

    const desc = document.createElement("p");

    desc.className = "game-desc";

    desc.textContent =
        GAME_CONFIG.goldenTarget +
        " تا قلب کهکشانی 💫 رو قبل از تموم شدن زمان بگیر. ستاره‌های کوچیک ⭐ امتیاز اضافه می‌دن، ولی از شهاب‌سنگ ☄️ و حفره‌ی سیاه 🌀 دوری کن — هرچی امتیازت بره بالا، بازی سریع‌تر می‌شه!";

    const startBtn = document.createElement("button");

    startBtn.textContent = "شروع بازی 🎮";

    startBtn.className = "game-start-btn";

    startBtn.onclick = ()=> launchGame(screen);

    const skipBtn = document.createElement("button");

    skipBtn.textContent = "بازگشت";

    skipBtn.className = "game-skip-btn";

    skipBtn.onclick = ()=> showGamesScreen();

    screen.appendChild(title);

    screen.appendChild(desc);

    screen.appendChild(startBtn);

    screen.appendChild(skipBtn);

}

// یه لایه‌ی نازک چشمک‌زن روی عکس پس‌زمینه‌ی واقعی (space-bg.png)
// برای یه‌ذره جون بیشتر - خودِ صحنه‌ی اصلی رو دیگه عکس واقعی می‌سازه
function buildStarfield(container){

    const sky = document.createElement("div");

    sky.className = "space-starfield";

    const layerEl = document.createElement("div");

    layerEl.className = "space-star-layer space-star-layer-1";

    const count = 22;

    let boxShadow = [];

    for(let i=0;i<count;i++){

        const x = Math.round(Math.random()*100);
        const y = Math.round(Math.random()*100);

        boxShadow.push(`${x}vw ${y}vh 0 rgba(255,255,255,${(0.4+Math.random()*0.5).toFixed(2)})`);

    }

    layerEl.style.boxShadow = boxShadow.join(",");

    sky.appendChild(layerEl);

    container.appendChild(sky);

}

function launchGame(screen){

    screen.innerHTML = "";

    screen.classList.add("game-active");

    buildStarfield(screen);

    const hud = document.createElement("div");

    hud.className = "game-hud";

    const golden = document.createElement("div");

    golden.className = "hud-golden";

    golden.innerHTML = `<img class="hud-icon" src="assets/icons/game/hud-heart.png" alt=""> <span id="goldenCount">0</span>/${GAME_CONFIG.goldenTarget}`;

    const score = document.createElement("div");

    score.className = "hud-score";

    score.innerHTML = `<img class="hud-icon" src="assets/icons/game/hud-star.png" alt=""> <span id="hudScoreVal">0</span>`;

    const lives = document.createElement("div");

    lives.className = "hud-lives";

    lives.id = "hudLives";

    const timeEl = document.createElement("div");

    timeEl.className = "hud-time";

    timeEl.id = "hudTime";

    timeEl.innerHTML = `<img class="hud-icon" src="assets/icons/game/hud-timer.png" alt=""> <span id="hudTimeVal">${GAME_CONFIG.duration}</span>`;

    hud.appendChild(golden);

    hud.appendChild(score);

    hud.appendChild(lives);

    hud.appendChild(timeEl);

    const area = document.createElement("div");

    area.className = "game-area";

    area.id = "gameArea";

    const basket = document.createElement("div");

    basket.className = "game-basket";

    basket.id = "gameBasket";

    basket.setAttribute("aria-label", "قلب تو");

    area.appendChild(basket);

    // راهنمای کوتاه داخل بازی - خودکار محو می‌شه، ثابت نمی‌مونه
    const hint = document.createElement("div");

    hint.className = "in-game-hint";

    hint.textContent = "با انگشتت قلب رو این‌ور اون‌ور کن ✨";

    area.appendChild(hint);

    screen.appendChild(hud);

    screen.appendChild(area);

    if(gameHintTimer) clearTimeout(gameHintTimer);

    gameHintTimer = setTimeout(function(){

        hint.classList.add("in-game-hint-hide");

        setTimeout(function(){ hint.remove(); }, 500);

    }, 2600);

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

    const updateBasketX = function(clientX){

        const rect = area.getBoundingClientRect();

        gameState.areaWidth = rect.width;

        let x = clientX - rect.left;

        x = Math.max(34, Math.min(rect.width-34, x));

        gameState.basketX = x;

        basket.style.left = x + "px";

    };

    area.addEventListener("pointerdown", function(e){

        updateBasketX(e.clientX);

    });

    area.addEventListener("pointermove", function(e){

        if(e.buttons===1 || e.pointerType==="touch"){

            updateBasketX(e.clientX);

        }

    });

    requestAnimationFrame(function(){

        const rect = area.getBoundingClientRect();

        gameState.areaWidth = rect.width;

        gameState.areaHeight = rect.height;

        gameState.basketX = rect.width/2;

        basket.style.left = gameState.basketX + "px";

    });

    function spawnLoop(){

        if(!gameState || !gameState.running) return;

        spawnHeart(area);

        applyDifficulty();

        gameSpawnTimer = setTimeout(spawnLoop, gameState.spawnInterval);

    }

    spawnLoop();

    gameCountdownTimer = setInterval(function(){

        if(!gameState || !gameState.running) return;

        gameState.timeLeft--;

        const timeVal = document.getElementById("hudTimeVal");

        if(timeVal) timeVal.textContent = gameState.timeLeft;

        if(gameState.timeLeft <= 0){

            endGame(screen, false);

        }

    },1000);

    gameRAF = requestAnimationFrame(gameLoop);

}

function spawnHeart(area){

    const rect = area.getBoundingClientRect();

    gameState.areaWidth = rect.width;

    gameState.areaHeight = rect.height;

    const type = rollEntityType();

    const el = document.createElement("div");

    el.className = "falling-heart " + type;

    el.setAttribute("aria-hidden", "true");

    area.appendChild(el);

    const x = 34 + Math.random()*(rect.width-68);

    const entity = {
        el, type,
        x,
        baseX: x,
        y: -40,
        caught: false,
        swayPhase: Math.random()*Math.PI*2
    };

    el.style.left = x + "px";

    el.style.top = "-40px";

    gameState.entities.push(entity);

}

function gameLoop(timestamp){

    if(!gameState || !gameState.running) return;

    if(gameState.lastFrame === null) gameState.lastFrame = timestamp;

    const dt = (timestamp - gameState.lastFrame)/1000;

    gameState.lastFrame = timestamp;

    const basketY = gameState.areaHeight - 66;

    gameState.entities.forEach(function(entity){

        if(entity.caught) return;

        entity.y += gameState.fallSpeed * dt;

        if(entity.type === "thorn"){

            entity.swayPhase += dt*3;

            entity.x = entity.baseX + Math.sin(entity.swayPhase)*22;

            entity.el.style.left = entity.x + "px";

        }

        entity.el.style.top = entity.y + "px";

        const withinX = Math.abs(entity.x - gameState.basketX) < 46;

        const withinY = entity.y > basketY - 26 && entity.y < basketY + 26;

        if(withinX && withinY){

            catchHeart(entity);

        }else if(entity.y > gameState.areaHeight + 20){

            entity.caught = true;

            entity.el.remove();

        }

    });

    if(!gameState) return;

    gameState.entities = gameState.entities.filter(function(e){ return e.el.isConnected; });

    if(gameState.running){

        gameRAF = requestAnimationFrame(gameLoop);

    }

}

function catchHeart(entity){

    entity.caught = true;

    entity.el.classList.add("caught-pop");

    setTimeout(function(){ entity.el.remove(); }, 200);

    if(entity.type === "golden"){

        gameState.golden++;

        gameState.score += GAME_CONFIG.goldenScore;

        applyDifficulty();

        SFX.play("golden", 0.6);

        updateScoreHud();

        flashGameArea("gold");

        spawnCatchBurst(entity.x, entity.y, true);

        const counter = document.getElementById("goldenCount");

        if(counter) counter.textContent = gameState.golden;

        if(gameState.golden >= GAME_CONFIG.goldenTarget){

            endGame(document.querySelector(".game-screen"), true);

        }

    }else if(entity.type === "broken" || entity.type === "thorn"){

        gameState.lives--;

        SFX.play("bad", 0.55);

        renderLives();

        shakeGameArea();

        const basket = document.getElementById("gameBasket");

        if(basket){

            basket.classList.remove("shake");

            void basket.offsetWidth;

            basket.classList.add("shake");

        }

        if(gameState.lives <= 0){

            endGame(document.querySelector(".game-screen"), false);

        }

    }else{

        gameState.score += GAME_CONFIG.flowerScore;

        applyDifficulty();

        SFX.play("click", 0.35);

        updateScoreHud();

        spawnCatchBurst(entity.x, entity.y, false);

    }

}

// یه انفجار کوچیک از ذره‌های نور، خالص CSS/DOM (بدون نیاز به Canvas)
function spawnCatchBurst(x, y, big){

    const area = document.getElementById("gameArea");

    if(!area) return;

    const count = big ? 10 : 5;

    for(let i=0;i<count;i++){

        const p = document.createElement("div");

        p.className = "catch-particle" + (big ? " catch-particle-gold" : "");

        const angle = (Math.PI*2*i/count) + Math.random()*0.4;

        const dist = 26 + Math.random()*(big?30:16);

        p.style.left = x + "px";

        p.style.top = y + "px";

        p.style.setProperty("--px", Math.cos(angle)*dist + "px");

        p.style.setProperty("--py", Math.sin(angle)*dist + "px");

        area.appendChild(p);

        setTimeout(function(){ p.remove(); }, 560);

    }

}

function updateScoreHud(){

    const el = document.getElementById("hudScoreVal");

    if(el && gameState) el.textContent = gameState.score;

}

function shakeGameArea(){

    const area = document.getElementById("gameArea");

    if(!area) return;

    area.classList.remove("game-area-shake");

    void area.offsetWidth;

    area.classList.add("game-area-shake");

}

function flashGameArea(kind){

    const area = document.getElementById("gameArea");

    if(!area) return;

    const cls = kind === "gold" ? "game-area-flash-gold" : "game-area-flash";

    area.classList.remove(cls);

    void area.offsetWidth;

    area.classList.add(cls);

}

function renderLives(){

    const el = document.getElementById("hudLives");

    if(!el || !gameState) return;

    let html = "";

    for(let i=0;i<GAME_CONFIG.maxLives;i++){

        const lost = i >= gameState.lives;

        html += `<img class="hud-icon hud-life-icon${lost ? " hud-life-lost" : ""}" src="assets/icons/game/hud-life.png" alt="">`;

    }

    el.innerHTML = html;

}

function stopGameTimers(){

    if(gameRAF) cancelAnimationFrame(gameRAF);

    if(gameSpawnTimer) clearTimeout(gameSpawnTimer);

    if(gameCountdownTimer) clearInterval(gameCountdownTimer);

    if(gameHintTimer) clearTimeout(gameHintTimer);

    gameRAF = null;

    gameSpawnTimer = null;

    gameCountdownTimer = null;

    gameHintTimer = null;

}

function endGame(screen, won){

    if(!gameState || !gameState.running) return;

    gameState.running = false;

    stopGameTimers();

    if(!screen) screen = document.querySelector(".game-screen");

    if(!screen) return;

    const finalScore = gameState.score;

    const finalGolden = gameState.golden;

    screen.innerHTML = "";

    screen.classList.remove("game-active");

    buildStarfield(screen);

    if(won){

        SFX.play("success", 0.55);

        const title = document.createElement("h1");

        title.className = "game-title";

        title.textContent = "بردی! 💫💜";

        const msg = document.createElement("p");

        msg.className = "game-desc";

        msg.textContent = `هر قلب کهکشانی که گرفتی، مثل یه خاطره‌ی خوب تو آسمون موند. امتیاز نهایی: ${finalScore} ⭐. ممنون که کنارمی.`;

        const next = document.createElement("button");

        next.textContent = "بازگشت 💜";

        next.onclick = ()=> showGamesScreen();

        screen.appendChild(title);

        screen.appendChild(msg);

        screen.appendChild(next);

    }else{

        SFX.play("whoosh", 0.4);

        const title = document.createElement("h1");

        title.className = "game-title";

        title.textContent = "تقریبا بود! 💭";

        const msg = document.createElement("p");

        msg.className = "game-desc";

        msg.textContent = `${finalGolden} از ${GAME_CONFIG.goldenTarget} تا قلب کهکشانی رو گرفتی، با ${finalScore} امتیاز. یه بار دیگه امتحان کن؟`;

        const retry = document.createElement("button");

        retry.textContent = "دوباره تلاش کن 🔁";

        retry.onclick = ()=> launchGame(screen);

        const skip = document.createElement("button");

        skip.className = "game-skip-btn";

        skip.textContent = "بازگشت به بازی‌ها";

        skip.onclick = ()=> showGamesScreen();

        screen.appendChild(title);

        screen.appendChild(msg);

        screen.appendChild(retry);

        screen.appendChild(skip);

    }

    gameState = null;

}
