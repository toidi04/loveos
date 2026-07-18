/*=========================================
  GAME — "۷ قلب طلایی"
  به مناسبت هفتمین ماهگرد.
  باید ۷ قلب طلایی رو قبل از تموم شدن زمان
  یا از دست دادن جون‌ها بگیری.
  گل‌ها (🌸) امتیاز مثبت کوچیک می‌دن، اما
  قلب‌های شکسته (💔) و خارها (🥀) یه جون
  ازت می‌گیرن. هرچی امتیازت بیشتر بشه،
  بازی سریع‌تر و هیجانی‌تر می‌شه.
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

// ---------- توابع مشترک بین نسخه‌ی DOM و Pixi ----------

function rollEntityType(){

    const roll = Math.random();

    let acc = 0;

    for(const [type, weight] of GAME_CONFIG.typeWeights){

        acc += weight;

        if(roll < acc) return type;

    }

    return "flower";

}

// فاکتور سختی بین ۰ (شروع بازی) تا ۱ (حداکثر سختی)، بر اساس امتیاز فعلی
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

function entityGlyph(type){

    if(type === "golden") return "💛";
    if(type === "broken") return "💔";
    if(type === "thorn")  return "🥀";

    return "🌸";

}

// -------------------------------------------------------

function startGame(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen game-screen fade-in";

    app.appendChild(screen);

    SFX.play("whoosh", 0.35);

    buildGameIntro(screen);

}

function buildGameIntro(screen){

    screen.innerHTML = "";

    const title = document.createElement("h1");

    title.className = "game-title";

    title.textContent = "۷ قلب طلایی 💛";

    const desc = document.createElement("p");

    desc.className = "game-desc";

    desc.textContent =
        "به مناسبت هفتمین ماهگردمون، " + GAME_CONFIG.goldenTarget +
        " تا قلب طلایی رو قبل از تموم شدن زمان بگیر. گل‌ها 🌸 امتیاز اضافه می‌دن، ولی از قلب‌های شکسته 💔 و خارها 🥀 دوری کن — هرچی امتیازت بره بالا، بازی سریع‌تر می‌شه!";

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

function launchGame(screen){

    screen.innerHTML = "";

    screen.classList.add("game-active");

    // HUD
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

    // Game area
    const area = document.createElement("div");

    area.className = "game-area";

    area.id = "gameArea";

    const basket = document.createElement("div");

    basket.className = "game-basket";

    basket.id = "gameBasket";

    basket.textContent = "💜";

    area.appendChild(basket);

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

    // basket follows finger/mouse
    const updateBasketX = (clientX)=>{

        const rect = area.getBoundingClientRect();

        gameState.areaWidth = rect.width;

        let x = clientX - rect.left;

        x = Math.max(28, Math.min(rect.width-28, x));

        gameState.basketX = x;

        basket.style.left = x + "px";

    };

    area.addEventListener("pointerdown", (e)=>{

        updateBasketX(e.clientX);

    });

    area.addEventListener("pointermove", (e)=>{

        if(e.buttons===1 || e.pointerType==="touch"){

            updateBasketX(e.clientX);

        }

    });

    // مقدار اولیه‌ی سبد در وسط
    requestAnimationFrame(()=>{

        const rect = area.getBoundingClientRect();

        gameState.areaWidth = rect.width;

        gameState.areaHeight = rect.height;

        gameState.basketX = rect.width/2;

        basket.style.left = gameState.basketX + "px";

    });

    // اسپان کردن قلب‌ها/گل‌ها/خارها
    function spawnLoop(){

        if(!gameState || !gameState.running) return;

        spawnHeart(area);

        applyDifficulty();

        gameSpawnTimer = setTimeout(spawnLoop, gameState.spawnInterval);

    }

    spawnLoop();

    // شمارش معکوس زمان
    gameCountdownTimer = setInterval(()=>{

        if(!gameState || !gameState.running) return;

        gameState.timeLeft--;

        timeEl.textContent = "⏱ " + gameState.timeLeft;

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

    el.textContent = entityGlyph(type);

    area.appendChild(el);

    const x = 24 + Math.random()*(rect.width-48);

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

    const basketY = gameState.areaHeight - 54;

    gameState.entities.forEach(entity=>{

        if(entity.caught) return;

        entity.y += gameState.fallSpeed * dt;

        // خارها کمی چپ‌راست تاب می‌خورن تا فرار ازشون سخت‌تر باشه
        if(entity.type === "thorn"){

            entity.swayPhase += dt*3;

            entity.x = entity.baseX + Math.sin(entity.swayPhase)*22;

            entity.el.style.left = entity.x + "px";

        }

        entity.el.style.top = entity.y + "px";

        // برخورد با سبد
        const withinX = Math.abs(entity.x - gameState.basketX) < 34;

        const withinY = entity.y > basketY - 20 && entity.y < basketY + 20;

        if(withinX && withinY){

            catchHeart(entity);

        }else if(entity.y > gameState.areaHeight + 20){

            entity.caught = true; // مصرف‌شده، فقط برای حذف

            entity.el.remove();

        }

    });

    // اگه وسط همین فریم بازی تموم شده باشه (مثلا با گرفتن آخرین
    // قلب طلایی یا از دست دادن آخرین جون)، gameState پاک شده -
    // دیگه ادامه نده، وگرنه به یه شیء null دسترسی پیدا می‌کنیم
    if(!gameState) return;

    // موجودیت‌هایی که از صفحه حذف شدن (گرفته‌شده یا رد شده) از لیست پاک می‌شن
    gameState.entities = gameState.entities.filter(e=>e.el.isConnected);

    if(gameState.running){

        gameRAF = requestAnimationFrame(gameLoop);

    }

}

function catchHeart(entity){

    entity.caught = true;

    entity.el.classList.add("caught-pop");

    setTimeout(()=>entity.el.remove(), 200);

    if(entity.type === "golden"){

        gameState.golden++;

        gameState.score += GAME_CONFIG.goldenScore;

        applyDifficulty();

        SFX.play("golden", 0.6);

        updateScoreHud();

        flashGameArea("gold");

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

        // flower — امتیاز کوچیک مثبت
        gameState.score += GAME_CONFIG.flowerScore;

        applyDifficulty();

        SFX.play("click", 0.35);

        updateScoreHud();

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

        html += i < gameState.lives ? "💜" : "🖤";

    }

    el.innerHTML = html;

}

function stopGameTimers(){

    if(gameRAF) cancelAnimationFrame(gameRAF);

    if(gameSpawnTimer) clearTimeout(gameSpawnTimer);

    if(gameCountdownTimer) clearInterval(gameCountdownTimer);

    gameRAF = null;

    gameSpawnTimer = null;

    gameCountdownTimer = null;

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

    if(won){

        SFX.play("success", 0.55);

        const title = document.createElement("h1");

        title.className = "game-title";

        title.textContent = "بردی! 💛💜";

        const msg = document.createElement("p");

        msg.className = "game-desc";

        msg.textContent = `درست مثل این هفت ماه، هر قلبی که گرفتی یه خاطره‌ی خوب بود. امتیاز نهایی: ${finalScore} ⭐. ممنون که کنارمی.`;

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

        msg.textContent = `${finalGolden} از ${GAME_CONFIG.goldenTarget} تا قلب طلایی رو گرفتی، با ${finalScore} امتیاز. یه بار دیگه امتحان کن؟`;

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
