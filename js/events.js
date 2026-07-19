/*=========================================
  EVENTS SYSTEM
  سمت راست صفحه‌ی اصلی. با تپ روی اسلات،
  لیست کارت‌های Event باز می‌شه (شبیه Event
  های Clash Royale). فعلاً فقط «هفتمین
  ماهگرد» محتوای واقعی داره؛ بقیه به‌زودی
  اضافه می‌شن.
=========================================*/

const EVENTS_LIST = [
    {
        id: "seventh-month",
        icon: "assets/icons/ui/heart.png",
        title: "هفتمین ماهگرد",
        subtitle: "Seventh Month Anniversary",
        desc: "هدیه، نامه، خاطرات و یه سفر کوچیک مرور هفت ماه.",
        locked: false,
        launch: function(){ startGift(); }
    },
    {
        id: "birthday",
        icon: "assets/icons/ui/cake.png",
        title: "تولد",
        subtitle: "Birthday",
        desc: "یه رویداد ویژه برای روز تولد.",
        locked: true
    },
    {
        id: "christmas",
        icon: "assets/icons/ui/tree.png",
        title: "کریسمس",
        subtitle: "Christmas",
        desc: "جشن کریسمس، به‌زودی.",
        locked: true
    },
    {
        id: "valentine",
        icon: "assets/icons/ui/star.png",
        title: "ولنتاین",
        subtitle: "Valentine",
        desc: "یه سورپرایز عاشقانه، به‌زودی.",
        locked: true
    },
    {
        id: "new-event",
        icon: "assets/icons/ui/chat.png",
        title: "رویداد جدید",
        subtitle: "New Event",
        desc: "همیشه یه چیز جدید در راهه.",
        locked: true
    }
];

function buildEventsSlot(){

    const slot = document.createElement("button");

    slot.className = "hub-slot events-slot";

    slot.setAttribute("aria-label", "رویدادها");

    slot.innerHTML = `<img class="hub-slot-icon-img" src="assets/icons/ui/gift.png" alt="" aria-hidden="true">`;

    slot.addEventListener("click", function(){

        SFX.play("click", 0.3);

        openEventsOverlay();

    });

    return slot;

}

function openEventsOverlay(){

    if(document.querySelector(".events-overlay")) return;

    const overlay = document.createElement("div");

    overlay.className = "settings-overlay events-overlay fade-in";

    const panel = document.createElement("div");

    panel.className = "settings-panel events-panel";

    const title = document.createElement("h2");

    title.className = "user-select-title";

    title.textContent = "رویدادها";

    const list = document.createElement("div");

    list.className = "events-list";

    EVENTS_LIST.forEach(function(ev, index){

        const card = buildEventCard(ev, overlay);

        card.style.animationDelay = (index * 80) + "ms";

        list.appendChild(card);

    });

    const closeBtn = document.createElement("button");

    closeBtn.className = "settings-close-btn";

    closeBtn.textContent = "بستن";

    closeBtn.onclick = ()=> closeEventsOverlay(overlay);

    panel.appendChild(title);

    panel.appendChild(list);

    panel.appendChild(closeBtn);

    overlay.appendChild(panel);

    overlay.addEventListener("click", function(e){

        if(e.target === overlay){

            closeEventsOverlay(overlay);

        }

    });

    document.body.appendChild(overlay);

    SFX.play("open", 0.4);

}

function closeEventsOverlay(overlay){

    overlay.classList.add("fade-out");

    setTimeout(()=> overlay.remove(), 400);

}

function buildEventCard(ev, overlay){

    const card = document.createElement("button");

    card.className = "event-card" + (ev.locked ? " event-card-locked" : "");

    const iconWrap = document.createElement("div");

    iconWrap.className = "event-card-icon";

    const iconImg = document.createElement("img");
    iconImg.src = ev.icon;
    iconImg.alt = "";
    iconImg.setAttribute("aria-hidden", "true");
    iconWrap.appendChild(iconImg);

    const textWrap = document.createElement("div");

    textWrap.className = "event-card-text";

    const cardTitle = document.createElement("h3");

    cardTitle.className = "event-card-title";

    cardTitle.textContent = ev.title;

    const cardSubtitle = document.createElement("span");

    cardSubtitle.className = "event-card-subtitle";

    cardSubtitle.textContent = ev.subtitle;

    const cardDesc = document.createElement("p");

    cardDesc.className = "event-card-desc";

    cardDesc.textContent = ev.desc;

    textWrap.appendChild(cardTitle);

    textWrap.appendChild(cardSubtitle);

    textWrap.appendChild(cardDesc);

    const cta = document.createElement("span");

    cta.className = "event-card-cta";

    cta.textContent = "›";

    cta.setAttribute("aria-hidden", "true");

    card.appendChild(iconWrap);

    card.appendChild(textWrap);

    if(ev.locked){

        const lockBadge = document.createElement("span");

        lockBadge.className = "event-card-lock-badge";

        const lockImg = document.createElement("img");
        lockImg.src = "assets/icons/ui/lock.png";
        lockImg.alt = "";
        lockImg.setAttribute("aria-hidden", "true");
        lockBadge.appendChild(lockImg);

        lockBadge.setAttribute("aria-hidden", "true");

        card.appendChild(lockBadge);

    } else {

        card.appendChild(cta);

    }

    if(ev.locked){

        card.addEventListener("click", function(){

            SFX.play("click", 0.3);

            card.classList.remove("shake");

            void card.offsetWidth;

            card.classList.add("shake");

            showEventComingSoon(card);

        });

    } else {

        card.addEventListener("click", function(e){

            rippleEffect(card, e);

            SFX.play("whoosh", 0.4);

            closeEventsOverlay(overlay);

            setTimeout(()=> ev.launch(), 300);

        });

    }

    return card;

}

function showEventComingSoon(card){

    if(card.querySelector(".event-card-tip")) return;

    const tip = document.createElement("div");

    tip.className = "event-card-tip fade-in";

    tip.textContent = "این رویداد به‌زودی اضافه می‌شه 💜";

    card.appendChild(tip);

    setTimeout(()=> tip.remove(), 1500);

}

/*=========================================
  دکمه‌ی بازگشت مشترک برای صفحات داخل یک
  Event (هدیه، نامه، گالری، ماهگرد، پایان).
  همیشه کاربر رو مستقیم به صفحه‌ی اصلی
  برمی‌گردونه تا هیچ‌جا گیر نکنه.
=========================================*/
function buildEventExitButton(screen){

    const btn = document.createElement("button");

    btn.className = "icon-btn event-exit-btn";

    btn.innerHTML = "✕";

    btn.setAttribute("aria-label", "بازگشت به صفحه‌ی اصلی");

    btn.addEventListener("click", function(){

        SFX.play("click", 0.3);

        exitToMainScreen(screen);

    });

    screen.appendChild(btn);

    return btn;

}

function exitToMainScreen(screen){

    if(!screen){
        showMainScreen(currentUser);
        return;
    }

    screen.classList.remove("fade-in");

    screen.classList.add("fade-out");

    setTimeout(function(){

        showMainScreen(currentUser);

    }, 420);

}
