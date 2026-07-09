/*=========================================
GIFT
=========================================*/

function startGift(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");
    screen.className = "screen gift-screen fade-in";

    app.appendChild(screen);

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

    setTimeout(function(){

        startLetter();

    },800);

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

    buildLetter(card);

}

function buildLetter(card){

    const title = document.createElement("h2");

    title.textContent = "For You 💜";

    card.appendChild(title);

    const text = document.createElement("p");

    text.className = "letter-text";

    card.appendChild(text);

    typeLetter(

`سلام عشق من...

اگر الان این صفحه رو می‌بینی،

یعنی این هدیه بالاخره به دستت رسیده...

امیدوارم با دیدنش لبخند بزنی. 💜`

    ,text);

}

function typeLetter(message,target){

    let i = 0;

    target.textContent = "";

    const timer = setInterval(()=>{

        target.textContent += message[i];

        i++;

        if(i >= message.length){

            clearInterval(timer);

            showLetterButton(target.parentElement);

        }

    },35);

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