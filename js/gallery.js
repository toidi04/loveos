/*=========================================
GALLERY
=========================================*/

const galleryItems = LOVE_OS_CONFIG.galleryItems;

function startGallery(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen gallery-screen fade-in";

    app.appendChild(screen);

    buildGallery(screen);

    SFX.play("whoosh", 0.35);

}
function buildGallery(screen){

    const title = document.createElement("h2");

    title.textContent = "Our Memories 💜";

    title.style.direction = "ltr";

    screen.appendChild(title);

    const sub = document.createElement("p");

    sub.className = "gallery-hint";

    sub.textContent = "روی هر عکس بزن تا خاطره‌ش رو بخونی 💜";

    screen.appendChild(sub);

    const grid = document.createElement("div");

    grid.className = "gallery-grid";

    screen.appendChild(grid);

    galleryItems.forEach(function(item,index){

    const card = document.createElement("div");

    card.className = "gallery-item";

    const image = document.createElement("img");

    image.src = item.image;

    image.alt = "memory";

    image.loading = "lazy";

    // تا وقتی عکس واقعی جایگزین نشده، یه placeholder نشون بده
    image.onerror = function(){
        image.onerror = null;
        image.src = LOVE_OS_CONFIG.placeholderImage;
    };

    card.appendChild(image);

    card.addEventListener("click",function(){

        openMemory(item);

    });

    grid.appendChild(card);

    });

    // دکمه‌ی ادامه‌ی مستقل از گالری - قبلا این دکمه داخل هر
    // پاپ‌آپ خاطره بود، یعنی با دیدن فقط یکی از عکس‌ها کاربر
    // مستقیم به صفحه‌ی بعد پرتاب می‌شد و بقیه‌ی عکس‌ها رو
    // اصلا نمی‌دید. الان کاربر می‌تونه همه‌ی عکس‌ها رو ببینه
    // و خودش با این دکمه ادامه بده.
    const continueBtn = document.createElement("button");

    continueBtn.className = "adventure-btn gallery-continue-btn";

    continueBtn.textContent = "ادامه 💜";

    continueBtn.onclick = function(){

        startAnniversary();

    };

    screen.appendChild(continueBtn);
}

function openMemory(item){

    SFX.play("open", 0.4);

    const overlay = document.createElement("div");

    overlay.className = "memory-overlay fade-in";



    const card = document.createElement("div");

    card.className = "memory-card scale-in";



    const img = document.createElement("img");

    img.src = item.image;

    img.onerror = function(){
        img.onerror = null;
        img.src = LOVE_OS_CONFIG.placeholderImage;
    };



    const text = document.createElement("p");

    text.className = "memory-text";



    card.appendChild(img);

    card.appendChild(text);

    overlay.appendChild(card);

    document.body.appendChild(overlay);



    typeMemory(item.text, text, overlay);

    SFX.play("chime", 0.35);



    overlay.addEventListener("click",function(e){

        if(e.target===overlay){

            overlay.remove();

        }

    });

}

function typeMemory(message, target, overlay){

    // با Array.from تجزیه می‌کنیم نه با ایندکس مستقیم روی رشته،
    // چون ایموجی‌هایی مثل 💜 از دو واحد UTF-16 (surrogate pair)
    // ساخته شدن؛ ایندکس مستقیم وسط ایموجی رو می‌شکافت و یه
    // کاراکتر نامعتبر لحظه‌ای نشون می‌داد.
    const chars = Array.from(message);

    let i = 0;

    let done = false;

    target.textContent = "";

    function addCloseButton(){

        const next = document.createElement("button");

        next.textContent = "بستن";

        next.style.margin = "20px";

        next.onclick = function(){

            overlay.remove();

        };

        target.parentElement.appendChild(next);

    }

    const timer = setInterval(function(){

        target.textContent += chars[i];

        i++;

        if(i>=chars.length){

            finish();

        }

    },30);

    function finish(){

        if(done) return;

        done = true;

        clearInterval(timer);

        target.textContent = message;

        // دکمه فقط یک بار، بعد از تموم شدن تایپ ساخته میشه
        addCloseButton();

    }

    // با کلیک روی متن، تایپ فوری کامل میشه
    target.addEventListener("click", finish, {once:true});

}