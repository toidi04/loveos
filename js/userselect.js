/*=========================================
  USER SELECT + HOME
  پنجره‌ی انتخاب کاربر (عسل/یاسین) با طراحی
  Glassmorphism، و صفحه‌ی خانه با شخصیت
  پیکسل‌آرت و دکمه‌ی ورود به برنامه.
  انتخاب کاربر هیچ‌جا ذخیره نمی‌شه؛ هر بار
  اجرای برنامه دوباره پرسیده می‌شه.
=========================================*/

function showUserSelect(){

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

    setTimeout(()=>{

        overlay.classList.add("fade-out");

        setTimeout(()=>{

            showHome(userKey);

        },500);

    },550);

}

function showHome(userKey){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const theme = THEMES[userKey];

    const screen = document.createElement("section");

    screen.className = "screen home-screen fade-in";

    const charImg = document.createElement("img");

    charImg.className = "home-character breathing";

    charImg.src = `assets/characters/${userKey}.png`;

    charImg.alt = theme.name;

    const greeting = document.createElement("p");

    greeting.className = "home-greeting";

    greeting.textContent = `سلام ${theme.name} 💜`;

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

                startGift();

            },550);

        },260);

    });

    screen.appendChild(charImg);

    screen.appendChild(greeting);

    screen.appendChild(startBtn);

    app.appendChild(screen);

    createMusicButton();

    playMusic();

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
