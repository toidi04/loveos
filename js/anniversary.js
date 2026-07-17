/*=========================================
ANNIVERSARY
بخشی از رویداد «هفتمین ماهگرد». روزشمار
رابطه دیگه اینجا نیست (تو ویجت Relationship
صفحه‌ی اصلیه)، این صفحه فقط پیام و مرور
سفر هفت‌ماهه رو نشون می‌ده.
=========================================*/

function startAnniversary(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen anniversary-screen fade-in";

    app.appendChild(screen);

    buildEventExitButton(screen);

    buildAnniversary(screen);

    SFX.play("whoosh", 0.35);

}

function buildAnniversary(screen){

    const heart = document.createElement("div");

    heart.className = "anniversary-heart heartbeat";

    heart.textContent = "💜";

    const title = document.createElement("h1");

    title.textContent = "Our Journey";

    title.style.direction = "ltr";

    const message = document.createElement("p");

    message.className = "anniversary-message";

    message.textContent = "هفت ماه پر از خاطره، خنده و عشق. این فقط شروعشه.";

    const button = document.createElement("button");

    button.className = "adventure-btn";

    button.textContent = "ادامه 💜";

    button.onclick = function(){

        startEnding();

    };

    screen.appendChild(heart);

    screen.appendChild(title);

    screen.appendChild(message);

    screen.appendChild(button);

}
