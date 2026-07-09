/*=========================================
ANNIVERSARY
=========================================*/

function startAnniversary(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen anniversary-screen fade-in";

    app.appendChild(screen);

    buildAnniversary(screen);

}
function buildAnniversary(screen){

    const title = document.createElement("h1");

    title.textContent = "Our Journey 💜";

    title.style.direction = "ltr";



    const timer = document.createElement("div");

    timer.className = "love-counter";



    screen.appendChild(title);

    screen.appendChild(timer);



    updateCounter(timer);

    setInterval(function(){

        updateCounter(timer);

    },1000);



    const button = document.createElement("button");

    button.textContent = "Last Surprise 💜";



    button.style.marginTop = "40px";



    button.onclick = function(){

        startEnding();

    };



    screen.appendChild(button);

}
function updateCounter(target){

    const start = new Date("2025-12-20T00:00:00");

    const now = new Date();



    const diff = now - start;



    const days = Math.floor(diff/(1000*60*60*24));



    const hours = Math.floor(

        diff%(1000*60*60*24)/(1000*60*60)

    );



    const minutes = Math.floor(

        diff%(1000*60*60)/(1000*60)

    );



    const seconds = Math.floor(

        diff%(1000*60)/1000

    );



    target.innerHTML =

`

<div>${days}</div>

<span>Days</span>

<div>${hours}</div>

<span>Hours</span>

<div>${minutes}</div>

<span>Minutes</span>

<div>${seconds}</div>

<span>Seconds</span>

`;

}