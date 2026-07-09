/*=========================================
ENDING
=========================================*/

function startEnding(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen ending-screen fade-in";

    app.appendChild(screen);

    buildEnding(screen);

}

function buildEnding(screen){

    const heart=document.createElement("div");

    heart.className="ending-heart heartbeat";

    heart.textContent="💜";



    const title=document.createElement("h1");

    title.className="ending-title";

    title.textContent="The End...";



    const text=document.createElement("p");

    text.className="ending-text";



    screen.appendChild(heart);

    screen.appendChild(title);

    screen.appendChild(text);



    typeEnding(

`ممنونم که تا آخر این هدیه با من بودی...

امیدوارم هر بار که این برنامه رو باز می‌کنی،
یاد لبخندهایی بیفتی که کنار هم ساختیم.

I Love You 💜`

    ,text);

}

function typeEnding(message,target){

    let i=0;

    target.textContent="";



    const timer=setInterval(function(){

        target.textContent+=message[i];

        i++;



        if(i>=message.length){

            clearInterval(timer);

            showRestart(target.parentElement);

        }

    },35);

}

function showRestart(screen){

    const button=document.createElement("button");

    button.textContent="Restart 💜";



    button.onclick=function(){

        startIntro();

    };



    screen.appendChild(button);

}