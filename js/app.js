window.addEventListener("load", () => {

    if ("serviceWorker" in navigator) {

        navigator.serviceWorker.register("sw.js");

    }

    showSplash();

});

function showSplash(){

    const app=document.getElementById("app");

    app.innerHTML="";



    const screen=document.createElement("section");

    screen.className="screen splash-screen";



    const logo=document.createElement("div");

    logo.className="splash-logo heartbeat";

    logo.textContent="💜";



    const title=document.createElement("h1");

    title.className="splash-title";

    title.textContent="Love OS";



    const loading=document.createElement("div");

    loading.className="loading";



    const bar=document.createElement("div");

    bar.className="loading-bar";



    loading.appendChild(bar);



    screen.appendChild(logo);

    screen.appendChild(title);

    screen.appendChild(loading);



    app.appendChild(screen);



    setTimeout(function(){

        screen.classList.add("fade-out");



        setTimeout(function(){

            startIntro();

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

function createMusicButton(){

    const btn=document.createElement("button");

    btn.className="music-btn";

    btn.textContent="🔊";



    btn.onclick=function(){

        if(bgMusic.paused){

            bgMusic.play();

            btn.textContent="🔊";

        }else{

            bgMusic.pause();

            btn.textContent="🔇";

        }

    };



    document.body.appendChild(btn);

}

window.addEventListener("load", () => {

    if ("serviceWorker" in navigator) {

        navigator.serviceWorker.register("sw.js");

    }

    startIntro();

});