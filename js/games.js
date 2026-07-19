/*=========================================
  GAMES HUB
  صفحه‌ی انتخاب بازی — با ورود به Adventure
  از صفحه‌ی اصلی، کاربر وارد اینجا می‌شه و
  از بین بازی‌های موجود یکی رو انتخاب می‌کنه.
  هر بازی داخل یک Card طراحی شده، هماهنگ با
  تم رنگی کاربر فعلی (THEMES[currentUser]).
=========================================*/

const GAMES_LIST = [
    {
        id: "heart",
        emoji: "💛",
        title: "۷ قلب طلایی",
        subtitle: "Heart Game",
        desc: "قلب‌های طلایی رو جمع کن، از خارها دوری کن.",
        locked: false,
        launch: function(){ startGame(); }
    },
    {
        id: "runner",
        emoji: "🏃‍♂️",
        title: "فرار بی‌پایان",
        subtitle: "Endless Runner",
        desc: "از موانع بپر و رد شو؛ روز و شب و آب‌وهوا هم عوض می‌شن.",
        locked: false,
        launch: function(){ startRunner(); }
    }
];

function showGamesScreen(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen games-screen fade-in";

    app.appendChild(screen);

    buildGamesScreen(screen);

    SFX.play("whoosh", 0.35);

}

function buildGamesScreen(screen){

    // ---------- topbar ----------
    const topbar = document.createElement("div");

    topbar.className = "main-topbar games-topbar";

    const backBtn = document.createElement("button");

    backBtn.className = "icon-btn games-back-btn";

    backBtn.innerHTML = "🔙";

    backBtn.setAttribute("aria-label", "بازگشت");

    backBtn.onclick = ()=> exitGamesScreen(screen, ()=> showMainScreen(currentUser));

    const title = document.createElement("div");

    title.className = "main-logo";

    title.textContent = "بازی‌ها 🎮";

    const spacer = document.createElement("div");

    spacer.className = "games-topbar-spacer";

    topbar.appendChild(backBtn);

    topbar.appendChild(title);

    topbar.appendChild(spacer);

    // ---------- grid ----------
    const grid = document.createElement("div");

    grid.className = "games-grid";

    GAMES_LIST.forEach(function(game, index){

        const card = buildGameCard(game);

        card.style.setProperty("--card-delay", (index * 90) + "ms");

        grid.appendChild(card);

    });

    screen.appendChild(topbar);

    screen.appendChild(grid);

}

function buildGameCard(game){

    const card = document.createElement("button");

    card.className = "game-card" + (game.locked ? " game-card-locked" : "");

    card.style.animationDelay = "var(--card-delay, 0ms)";

    const iconWrap = document.createElement("div");

    iconWrap.className = "game-card-icon";

    iconWrap.textContent = game.emoji;

    const textWrap = document.createElement("div");

    textWrap.className = "game-card-text";

    const cardTitle = document.createElement("h3");

    cardTitle.className = "game-card-title";

    cardTitle.textContent = game.title;

    const cardSubtitle = document.createElement("span");

    cardSubtitle.className = "game-card-subtitle";

    cardSubtitle.textContent = game.subtitle;

    const cardDesc = document.createElement("p");

    cardDesc.className = "game-card-desc";

    cardDesc.textContent = game.desc;

    textWrap.appendChild(cardTitle);

    textWrap.appendChild(cardSubtitle);

    textWrap.appendChild(cardDesc);

    const cta = document.createElement("span");

    cta.className = "game-card-cta";

    cta.textContent = game.locked ? "🔒 به‌زودی" : "بازی ▶";

    card.appendChild(iconWrap);

    card.appendChild(textWrap);

    card.appendChild(cta);

    if(game.locked){

        card.addEventListener("click", function(){

            SFX.play("click", 0.3);

            card.classList.remove("shake");

            void card.offsetWidth;

            card.classList.add("shake");

            showGameComingSoon(card);

        });

    } else {

        card.addEventListener("click", function(e){

            rippleEffect(card, e);

            SFX.play("whoosh", 0.4);

            exitGamesScreen(card.closest(".games-screen"), game.launch);

        });

    }

    return card;

}

function showGameComingSoon(card){

    if(card.querySelector(".coming-soon-tip")) return;

    const tip = document.createElement("div");

    tip.className = "coming-soon-tip games-coming-soon-tip";

    tip.textContent = "این بازی به‌زودی اضافه می‌شه 💜";

    card.appendChild(tip);

    setTimeout(()=> tip.remove(), 1500);

}

function exitGamesScreen(screen, next){

    if(!screen){
        if(next) next();
        return;
    }

    screen.classList.remove("fade-in");

    screen.classList.add("fade-out");

    setTimeout(function(){

        if(next) next();

    }, 420);

}
