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

    SFX.play("success", 0.5);

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



    typeEnding(LOVE_OS_CONFIG.endingText, text);

}

function typeEnding(message,target){

    let i=0;

    let done=false;

    target.textContent="";



    const timer=setInterval(function(){

        target.textContent+=message[i];

        i++;



        if(i>=message.length){

            finish();

        }

    },35);

    function finish(){

        if(done) return;

        done=true;

        clearInterval(timer);

        target.textContent = message;

        showRestart(target.parentElement);

    }

    // با کلیک روی متن، تایپ فوری کامل میشه
    target.addEventListener("click", finish, {once:true});

}

function showRestart(screen){

    const button=document.createElement("button");

    button.textContent="Restart 💜";



    button.onclick=function(){

        startIntro();

    };



    screen.appendChild(button);

}