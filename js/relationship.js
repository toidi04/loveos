/*=========================================
  RELATIONSHIP WIDGET
  سمت چپ صفحه‌ی اصلی. یک اسلات فشرده که تعداد
  روزهای رابطه رو نشون می‌ده؛ با تپ روش، یک
  اورلی کامل با نوار پیشرفت (شبیه XP بار
  Clash Royale) تا روز ۳۶۵ باز می‌شه.
=========================================*/

const RELATIONSHIP_GOAL_DAYS = 365;

function getRelationshipElapsed(){

    const start = new Date(LOVE_OS_CONFIG.startDate);

    const now = new Date();

    const diffMs = Math.max(0, now - start);

    const days = Math.floor(diffMs / (1000*60*60*24));

    const hours = Math.floor(diffMs % (1000*60*60*24) / (1000*60*60));

    const minutes = Math.floor(diffMs % (1000*60*60) / (1000*60));

    const seconds = Math.floor(diffMs % (1000*60) / 1000);

    return { days, hours, minutes, seconds };

}

function getRelationshipDays(){

    return getRelationshipElapsed().days;

}

function buildRelationshipSlot(){

    const slot = document.createElement("button");

    slot.className = "hub-slot relationship-slot";

    slot.setAttribute("aria-label", "رابطه");

    const days = getRelationshipDays();

    slot.innerHTML = `
        <span class="hub-slot-emoji relationship-slot-emoji">❤️</span>
        <span class="relationship-slot-days">${days}</span>
    `;

    slot.addEventListener("click", function(e){

        SFX.play("click", 0.3);

        openRelationshipOverlay();

    });

    return slot;

}

function openRelationshipOverlay(){

    if(document.querySelector(".relationship-overlay")) return;

    const overlay = document.createElement("div");

    overlay.className = "settings-overlay relationship-overlay fade-in";

    const panel = document.createElement("div");

    panel.className = "settings-panel relationship-panel";

    buildRelationshipPanel(panel);

    overlay.appendChild(panel);

    overlay.addEventListener("click", function(e){

        if(e.target === overlay){

            closeRelationshipOverlay(overlay);

        }

    });

    document.body.appendChild(overlay);

    SFX.play("open", 0.4);

}

function closeRelationshipOverlay(overlay){

    if(relationshipOverlayTimer){

        clearInterval(relationshipOverlayTimer);

        relationshipOverlayTimer = null;

    }

    overlay.classList.add("fade-out");

    setTimeout(()=> overlay.remove(), 400);

}

let relationshipOverlayTimer = null;

function buildRelationshipPanel(panel){

    const title = document.createElement("h2");

    title.className = "user-select-title";

    title.textContent = "زمانی که زندگی سبز شد 💚";

    const bigDays = document.createElement("div");

    bigDays.className = "relationship-big-days";

    const timeRow = document.createElement("div");

    timeRow.className = "relationship-time-row";

    const journeyLabel = document.createElement("p");

    journeyLabel.className = "settings-subtitle relationship-journey-label";

    journeyLabel.textContent = "Relationship Journey";

    const barTrack = document.createElement("div");

    barTrack.className = "relationship-bar-track";

    const barFill = document.createElement("div");

    barFill.className = "relationship-bar-fill";

    barTrack.appendChild(barFill);

    const barMeta = document.createElement("div");

    barMeta.className = "relationship-bar-meta";

    const barCount = document.createElement("span");

    barCount.className = "relationship-bar-count";

    const barRemaining = document.createElement("span");

    barRemaining.className = "relationship-bar-remaining";

    barMeta.appendChild(barCount);

    barMeta.appendChild(barRemaining);

    const closeBtn = document.createElement("button");

    closeBtn.className = "settings-close-btn";

    closeBtn.textContent = "بستن";

    closeBtn.onclick = ()=> closeRelationshipOverlay(panel.closest(".relationship-overlay"));

    panel.appendChild(title);

    panel.appendChild(bigDays);

    panel.appendChild(timeRow);

    panel.appendChild(journeyLabel);

    panel.appendChild(barTrack);

    panel.appendChild(barMeta);

    panel.appendChild(closeBtn);

    function refresh(){

        const elapsed = getRelationshipElapsed();

        const days = elapsed.days;

        const clampedDays = Math.min(days, RELATIONSHIP_GOAL_DAYS);

        const percent = (clampedDays / RELATIONSHIP_GOAL_DAYS) * 100;

        bigDays.innerHTML = `❤️ <span class="relationship-big-days-num">${days}</span> Days`;

        timeRow.innerHTML = `
            <div class="relationship-time-unit">
                <span class="relationship-time-num">${String(elapsed.hours).padStart(2,"0")}</span>
                <span class="relationship-time-label">ساعت</span>
            </div>
            <div class="relationship-time-unit">
                <span class="relationship-time-num">${String(elapsed.minutes).padStart(2,"0")}</span>
                <span class="relationship-time-label">دقیقه</span>
            </div>
            <div class="relationship-time-unit">
                <span class="relationship-time-num">${String(elapsed.seconds).padStart(2,"0")}</span>
                <span class="relationship-time-label">ثانیه</span>
            </div>
        `;

        barFill.style.width = percent + "%";

        barCount.textContent = `${days} / ${RELATIONSHIP_GOAL_DAYS}`;

        if(days >= RELATIONSHIP_GOAL_DAYS){

            barRemaining.textContent = "🎉 به روز ۳۶۵ رسیدیم";

        } else {

            const remaining = RELATIONSHIP_GOAL_DAYS - days;

            barRemaining.textContent = `\u2066${remaining}\u2069 روز مونده`;

        }

    }

    refresh();

    relationshipOverlayTimer = setInterval(refresh, 1000);

}
