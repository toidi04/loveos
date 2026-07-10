/*=========================================
INTRO
=========================================*/

function startIntro(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen intro-screen fade-in";

    app.appendChild(screen);

    buildIntro(screen);

    // توجه: این صفحه دیگه در مسیر اصلی برنامه صدا زده نمی‌شه؛
    // صفحه‌ی اصلی (main-screen) جایگزینش شده. فایل رو برای
    // حفظ ساختار پروژه نگه داشتیم.

}
function buildIntro(screen){

    const logo = document.createElement("div");

    logo.className = "intro-logo heartbeat";

    logo.textContent = "💜";

    screen.appendChild(logo);

    const title = document.createElement("h1");

    title.className = "intro-title";

    title.textContent = "Love OS";

    screen.appendChild(title);

    const sub = document.createElement("p");

    sub.className = "intro-subtitle";

    sub.textContent = "A Gift Made With Love";

    screen.appendChild(sub);

    const button = document.createElement("button");

    button.className = "intro-button";

    button.textContent = "Start 💜";

    screen.appendChild(button);

    button.addEventListener("click",function(){

    playMusic();

    enterGift(screen,button);

    });

}

function enterGift(screen,button){

    button.disabled = true;

    screen.classList.remove("fade-in");

    screen.classList.add("fade-out");

    SFX.play("whoosh", 0.4);

    setTimeout(function(){

        startGift();

    },600);

}