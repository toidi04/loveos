/*=========================================
  USER SELECT + MAIN SCREEN
  پنجره‌ی انتخاب کاربر (عسل/یاسین) با طراحی
  Glassmorphism، و صفحه‌ی اصلی (Main/Hub) به
  سبک بازی‌های موبایل مدرن با شخصیت پیکسل‌آرت،
  دکمه‌ی ورود به برنامه، آیتم‌های قفل برای
  آینده، و پنل تنظیمات (موزیک/افکت/تعویض کاربر).
  انتخاب کاربر هیچ‌جا ذخیره نمی‌شه؛ هر بار
  اجرای برنامه دوباره پرسیده می‌شه.
=========================================*/

let currentUser = null;


function showUserSelect(){

    stopMainCharacterAnimation();

    const app = document.getElementById("app");

    app.innerHTML = "";

    const overlay = document.createElement("div");

    overlay.className = "user-select-overlay fade-in";

    const modal = document.createElement("div");

    modal.className = "user-select-modal";

    const title = document.createElement("h2");

    title.className = "user-select-title";

    title.textContent = "برای شروع، بگو تو کی هستی؟ 💜";

    const cards = document.createElement("div");

    cards.className = "user-select-cards";

    const options = [
        { key:"asal",  label:"عسل",   emoji:"🔮" },
        { key:"yasin", label:"یاسین", emoji:"⭐" }
    ];

    options.forEach(opt=>{

        const card = document.createElement("button");

        card.className = "user-card";

        card.innerHTML = `
            <span class="user-card-emoji">${opt.emoji}</span>
            <span class="user-card-label">${opt.label}</span>
        `;

        card.onclick = ()=> selectUser(opt.key, card, overlay);

        cards.appendChild(card);

    });

    modal.appendChild(title);

    modal.appendChild(cards);

    overlay.appendChild(modal);

    app.appendChild(overlay);

}

function selectUser(userKey, card, overlay){

    // جلوگیری از انتخاب دوباره در حین انیمیشن
    overlay.querySelectorAll(".user-card").forEach(c=>c.disabled=true);

    card.classList.add("user-card-selected");

    SFX.play("chime", 0.45);

    applyTheme(userKey);

    currentUser = userKey;

    setTimeout(()=>{

        overlay.classList.add("fade-out");

        setTimeout(()=>{

            showMainScreen(userKey);

        },500);

    },550);

}

/*=========================================
  MAIN SCREEN (Hub)
=========================================*/

// ---------- کاراکتر صفحه‌ی اصلی: انیمیشن با فریم واقعی ----------
// هر کاراکتر ۴ فریم عکسِ کامل داره (نه لایه‌ی جدا‌شده): حالت
// استراحت، دو فریم نفس‌کشیدن، و یک فریم پلک‌زدن. به‌جای بریدن
// عکس و چرخوندن تیکه‌هاش با کد (روشی که قبلا استفاده شده بود و
// نتیجه‌ش بد بود)، این‌جا فقط src عکس رو عوض می‌کنیم - دقیقا مثل
// یه انیمیشن گیف ساده و تمیز.
const CHARACTER_FRAMES = {
    rest:   "1-rest",
    mid:    "2-breathe-mid",
    peak:   "3-breathe-peak",
    blink:  "4-blink"
};

// ترتیب پخش فریم‌ها برای یک چرخه‌ی نفس‌کشیدنِ نرمِ رفت‌وبرگشتی
const BREATHE_SEQUENCE = ["rest","mid","peak","mid"];
const BREATHE_FRAME_MS = 340;   // سرعت هر فریم نفس (آروم و آرامش‌بخش)
const BLINK_EVERY_MIN_MS = 2600;
const BLINK_EVERY_MAX_MS = 5200;
const BLINK_DURATION_MS = 120;

let mainCharAnimTimer = null;
let mainCharBlinkTimer = null;

function stopMainCharacterAnimation(){

    if (mainCharAnimTimer){ clearInterval(mainCharAnimTimer); mainCharAnimTimer = null; }
    if (mainCharBlinkTimer){ clearTimeout(mainCharBlinkTimer); mainCharBlinkTimer = null; }

}

function buildCharacterSprite(charWrap, userKey){

    stopMainCharacterAnimation();

    const img = document.createElement("img");

    img.className = "home-character-sprite";
    img.id = "mainCharacterImg";
    img.alt = THEMES[userKey] ? THEMES[userKey].name : "";
    img.src = `assets/characters-v2/${userKey}-${CHARACTER_FRAMES.rest}.png`;

    charWrap.appendChild(img);

    let seqIndex = 0;
    let blinking = false;

    mainCharAnimTimer = setInterval(function(){

        if (blinking) return;

        seqIndex = (seqIndex + 1) % BREATHE_SEQUENCE.length;
        const frameKey = CHARACTER_FRAMES[BREATHE_SEQUENCE[seqIndex]];
        img.src = `assets/characters-v2/${userKey}-${frameKey}.png`;

    }, BREATHE_FRAME_MS);

    (function scheduleBlink(){

        const delay = BLINK_EVERY_MIN_MS + Math.random()*(BLINK_EVERY_MAX_MS-BLINK_EVERY_MIN_MS);

        mainCharBlinkTimer = setTimeout(function(){

            blinking = true;
            img.src = `assets/characters-v2/${userKey}-${CHARACTER_FRAMES.blink}.png`;

            setTimeout(function(){
                blinking = false;
                img.src = `assets/characters-v2/${userKey}-${CHARACTER_FRAMES[BREATHE_SEQUENCE[seqIndex]]}.png`;
                scheduleBlink();
            }, BLINK_DURATION_MS);

        }, delay);

    })();

}

function showMainScreen(userKey){

    currentUser = userKey;

    const app = document.getElementById("app");

    app.innerHTML = "";

    const theme = THEMES[userKey];

    const screen = document.createElement("section");

    screen.className = "screen main-screen fade-in";

    // ---------- top bar ----------
    const topbar = document.createElement("div");

    topbar.className = "main-topbar";

    const settingsBtn = document.createElement("button");

    settingsBtn.className = "icon-btn settings-btn";

    settingsBtn.innerHTML = "⚙️";

    settingsBtn.onclick = ()=> openSettings(screen);

    const logo = document.createElement("div");

    logo.className = "main-logo";

    logo.textContent = "Love OS 💜";

    topbar.appendChild(settingsBtn);

    topbar.appendChild(logo);

    // ---------- character stage ----------
    const stage = document.createElement("div");

    stage.className = "main-character-stage";

    const charWrap = document.createElement("div");

    charWrap.className = "character-wrap";

    charWrap.id = "mainCharacterWrap";

    buildCharacterSprite(charWrap, userKey);

    const greeting = document.createElement("p");

    greeting.className = "home-greeting";

    greeting.id = "mainGreeting";

    greeting.textContent = `سلام ${theme.name} 💜`;

    stage.appendChild(charWrap);

    stage.appendChild(greeting);

    // ---------- bottom hub bar ----------
    const bottomBar = document.createElement("div");

    bottomBar.className = "main-bottom-bar";

    const lockedLeft = buildRelationshipSlot();

    const startBtn = document.createElement("button");

    startBtn.className = "adventure-btn";

    startBtn.textContent = "ماجراجویی";

    startBtn.addEventListener("click", function(e){

        rippleEffect(startBtn, e);

        startBtn.classList.add("adventure-btn-pressed");

        SFX.play("whoosh", 0.45);

        setTimeout(()=>{

            screen.classList.remove("fade-in");

            screen.classList.add("fade-out");

            setTimeout(()=>{

                showGamesScreen();

            },550);

        },260);

    });

    const lockedRight = buildEventsSlot();

    bottomBar.appendChild(lockedLeft);

    bottomBar.appendChild(startBtn);

    bottomBar.appendChild(lockedRight);

    screen.appendChild(topbar);

    screen.appendChild(stage);

    screen.appendChild(bottomBar);

    app.appendChild(screen);

    playMusic();

}

// یه آیتم قفل‌شده برای فضاهای آینده‌ی برنامه
// (فعلا فقط دکمه‌ی ماجراجویی بازه)
function buildLockedSlot(emoji){

    const slot = document.createElement("button");

    slot.className = "hub-slot hub-slot-locked";

    slot.innerHTML = `
        <span class="hub-slot-emoji">${emoji}</span>
        <span class="hub-slot-lock">🔒</span>
    `;

    slot.onclick = ()=> showComingSoon(slot);

    return slot;

}

function showComingSoon(slot){

    if(slot.querySelector(".coming-soon-tip")) return;

    SFX.play("click", 0.3);

    slot.classList.remove("shake");

    void slot.offsetWidth;

    slot.classList.add("shake");

    const tip = document.createElement("div");

    tip.className = "coming-soon-tip";

    tip.textContent = "به‌زودی 💜";

    slot.appendChild(tip);

    setTimeout(()=>tip.remove(), 1400);

}

/*=========================================
  SETTINGS PANEL
  موزیک، افکت صدا و تعویض کاراکتر
=========================================*/

function openSettings(mainScreen){

    if(document.querySelector(".settings-overlay")) return;

    const overlay = document.createElement("div");

    overlay.className = "settings-overlay fade-in";

    const panel = document.createElement("div");

    panel.className = "settings-panel";

    const title = document.createElement("h2");

    title.className = "user-select-title";

    title.textContent = "تنظیمات ⚙️";

    // ---------- music toggle ----------
    const musicRow = buildToggleRow(
        "موزیک پس‌زمینه 🎵",
        !bgMusic || !bgMusic.paused,
        (nextOn)=>{
            if(!bgMusic) initMusic();
            if(nextOn){ bgMusic.play(); } else { bgMusic.pause(); }
        }
    );

    // ---------- sfx toggle ----------
    const sfxRow = buildToggleRow(
        "افکت‌های صوتی 🔔",
        SFX.isEnabled(),
        (nextOn)=>{
            SFX.setEnabled(nextOn);
        }
    );

    // ---------- character switch ----------
    const switchTitle = document.createElement("p");

    switchTitle.className = "settings-subtitle";

    switchTitle.textContent = "تغییر شخصیت";

    const switchCards = document.createElement("div");

    switchCards.className = "user-select-cards settings-switch-cards";

    const options = [
        { key:"asal",  label:"عسل",   emoji:"🔮" },
        { key:"yasin", label:"یاسین", emoji:"⭐" }
    ];

    options.forEach(opt=>{

        const card = document.createElement("button");

        card.className = "user-card";

        if(opt.key === currentUser) card.classList.add("user-card-active");

        card.innerHTML = `
            <span class="user-card-emoji">${opt.emoji}</span>
            <span class="user-card-label">${opt.label}</span>
        `;

        card.onclick = ()=>{

            if(opt.key === currentUser){

                closeSettings(overlay);

                return;

            }

            SFX.play("chime", 0.45);

            applyTheme(opt.key);

            currentUser = opt.key;

            const charWrap = document.getElementById("mainCharacterWrap");

            if (charWrap){

                const oldImg = charWrap.querySelector(".home-character-sprite");

                if (oldImg) oldImg.classList.add("char-fade-out");

                setTimeout(()=>{

                    charWrap.innerHTML = "";
                    buildCharacterSprite(charWrap, opt.key);

                }, 250);

            }

            const greetingEl = document.getElementById("mainGreeting");

            if(greetingEl){

                greetingEl.textContent = `سلام ${THEMES[opt.key].name} 💜`;

            }

            closeSettings(overlay);

        };

        switchCards.appendChild(card);

    });

    const closeBtn = document.createElement("button");

    closeBtn.className = "game-skip-btn settings-close-btn";

    closeBtn.textContent = "بستن";

    closeBtn.onclick = ()=> closeSettings(overlay);

    panel.appendChild(title);

    panel.appendChild(musicRow);

    panel.appendChild(sfxRow);

    panel.appendChild(switchTitle);

    panel.appendChild(switchCards);

    panel.appendChild(closeBtn);

    overlay.appendChild(panel);

    overlay.addEventListener("click", (e)=>{

        if(e.target === overlay) closeSettings(overlay);

    });

    document.getElementById("app").appendChild(overlay);

}

function closeSettings(overlay){

    overlay.classList.add("fade-out");

    setTimeout(()=>overlay.remove(), 400);

}

// یه ردیف تنظیمات با کلید سوییچ (Toggle Switch)
function buildToggleRow(label, initialOn, onChange){

    const row = document.createElement("div");

    row.className = "settings-row";

    const labelEl = document.createElement("span");

    labelEl.textContent = label;

    const toggle = document.createElement("button");

    toggle.className = "toggle-switch" + (initialOn ? " toggle-on" : "");

    toggle.innerHTML = `<span class="toggle-knob"></span>`;

    let on = initialOn;

    toggle.onclick = ()=>{

        on = !on;

        toggle.classList.toggle("toggle-on", on);

        SFX.play("click", 0.3);

        onChange(on);

    };

    row.appendChild(labelEl);

    row.appendChild(toggle);

    return row;

}

// افکت Ripple روی دکمه‌ی ماجراجویی، از نقطه‌ی لمس شروع می‌شه
function rippleEffect(button, event){

    const rect = button.getBoundingClientRect();

    const ripple = document.createElement("span");

    ripple.className = "ripple";

    const size = Math.max(rect.width, rect.height);

    const x = (event.clientX ?? rect.left+rect.width/2) - rect.left - size/2;

    const y = (event.clientY ?? rect.top+rect.height/2) - rect.top - size/2;

    ripple.style.width = ripple.style.height = size + "px";

    ripple.style.left = x + "px";

    ripple.style.top = y + "px";

    button.appendChild(ripple);

    setTimeout(()=>ripple.remove(), 600);

}
