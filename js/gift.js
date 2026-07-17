/*=========================================
GIFT
=========================================*/

function startGift(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");
    screen.className = "screen gift-screen fade-in";

    app.appendChild(screen);

    buildEventExitButton(screen);

    buildGift(screen);

}
function buildGift(screen){

    const title = document.createElement("h1");
    title.textContent = "A Little Gift For You 💜";

    const subtitle = document.createElement("p");
    subtitle.textContent = "Touch the gift to open it.";

    const gift = document.createElement("button");
    gift.className = "gift-box glow";
    const lid = document.createElement("div");
    lid.className = "gift-lid";

    const ribbonV = document.createElement("div");
    ribbonV.className = "gift-ribbon-v";

    const ribbonH = document.createElement("div");
    ribbonH.className = "gift-ribbon-h";

    const bow = document.createElement("div");
    bow.className = "gift-bow";

    gift.appendChild(lid);
    gift.appendChild(ribbonV);
    gift.appendChild(ribbonH);
    gift.appendChild(bow);

    screen.appendChild(title);
    screen.appendChild(subtitle);
    screen.appendChild(gift);

    gift.addEventListener("click", function () {

    openGift(gift);

    });

}

function openGift(gift){

    gift.classList.add("gift-open");

    gift.style.pointerEvents = "none";

    SFX.play("open", 0.55);

    spawnSparkles(gift);

    setTimeout(function(){

        startLetter();

    },800);

}

function spawnSparkles(gift){

    const count = 14;

    for(let i=0;i<count;i++){

        const p = document.createElement("div");

        p.className = "sparkle-particle";

        const angle = (Math.PI*2/count)*i;

        const distance = 70 + Math.random()*40;

        p.style.setProperty("--sx", Math.cos(angle)*distance + "px");

        p.style.setProperty("--sy", Math.sin(angle)*distance + "px");

        const themeAccent = getComputedStyle(document.documentElement)
            .getPropertyValue("--purple-light").trim() || "#C9A9FF";

        p.style.background = i%2===0 ? "#FFD166" : themeAccent;

        gift.appendChild(p);

        setTimeout(()=>p.remove(), 750);

    }

}

function startLetter(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen fade-in";

    const card = document.createElement("div");

    card.className = "letter-card card";

    screen.appendChild(card);

    app.appendChild(screen);

    buildEventExitButton(screen);

    buildLetter(card);

    SFX.play("chime", 0.45);

}

function buildLetter(card){

    const title = document.createElement("h2");

    title.textContent = "For You 💜";

    card.appendChild(title);

    const text = document.createElement("p");

    text.className = "letter-text";

    card.appendChild(text);

    typeLetter(LOVE_OS_CONFIG.letterText, text);

}

function typeLetter(message,target){

    // Array.from تا ایموجی‌هایی مثل 💜 که از دو واحد UTF-16
    // ساخته شدن وسط تایپ نشکنن
    const chars = Array.from(message);

    let i = 0;

    let done = false;

    target.textContent = "";

    const timer = setInterval(()=>{

        target.textContent += chars[i];

        i++;

        if(i >= chars.length){

            finish();

        }

    },35);

    function finish(){

        if(done) return;

        done = true;

        clearInterval(timer);

        target.textContent = message;

        showLetterButton(target.parentElement);

    }

    // با کلیک روی متن، تایپ فوری کامل میشه
    target.addEventListener("click", finish, {once:true});

}

function showLetterButton(card){

    const button = document.createElement("button");

    button.textContent = "Continue 💜";

    button.style.marginTop = "30px";

    button.onclick = function(){

        startGallery();

    };

    card.appendChild(button);

}