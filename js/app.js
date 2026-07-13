window.addEventListener("load", () => {

    if ("serviceWorker" in navigator) {

        navigator.serviceWorker.register("sw.js");

    }

    createFloatingHearts();

    showSplash();

});

function createFloatingHearts(){

    const layer = document.createElement("div");

    layer.className = "hearts-bg";

    const symbols = ["💜","✨","💫"];

    const count = 16;

    for(let i=0;i<count;i++){

        const h = document.createElement("span");

        h.className = "floating-heart";

        h.textContent = symbols[i % symbols.length];

        h.style.left = Math.random()*100 + "vw";

        h.style.animationDuration = (10 + Math.random()*12) + "s";

        h.style.animationDelay = (Math.random()*14) + "s";

        h.style.fontSize = (12 + Math.random()*16) + "px";

        h.style.opacity = 0.15 + Math.random()*0.25;

        layer.appendChild(h);

    }

    document.body.appendChild(layer);

}

function showSplash(){

    const app=document.getElementById("app");

    app.innerHTML="";



    const screen=document.createElement("section");

    screen.className="screen splash-screen";



    const logoWrap=document.createElement("div");

    logoWrap.className="splash-logo-wrap";

    const glow=document.createElement("div");

    glow.className="splash-glow";

    const logo=document.createElement("div");

    logo.className="splash-logo heartbeat";

    logo.textContent="💜";

    logoWrap.appendChild(glow);

    logoWrap.appendChild(logo);

    const title=document.createElement("h1");

    title.className="splash-title";

    title.textContent="Love OS";

    const status=document.createElement("p");

    status.className="splash-status";

    status.textContent="در حال آماده‌سازی...";

    const loading=document.createElement("div");

    loading.className="loading";

    const bar=document.createElement("div");

    bar.className="loading-bar";

    loading.appendChild(bar);

    const version=document.createElement("div");

    version.className="app-version";

    version.textContent="Love OS v"+LOVE_OS_CONFIG.version;

    screen.appendChild(logoWrap);

    screen.appendChild(title);

    screen.appendChild(loading);

    screen.appendChild(status);

    screen.appendChild(version);



    app.appendChild(screen);



    setTimeout(function(){

        screen.classList.add("fade-out");

        SFX.play("whoosh", 0.4);

        setTimeout(function(){

            showUserSelect();

        },600);



    },2200);

}

let bgMusic = null;

function initMusic(){

    if(bgMusic) return;

    bgMusic = new Audio("assets/music/love.mp3");

    bgMusic.loop = true;

    bgMusic.volume = 0.35;

}

function playMusic(){

    if(!bgMusic){

        initMusic();

    }

    bgMusic.play().catch(()=>{});

}