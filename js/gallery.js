/*=========================================
GALLERY
=========================================*/

const galleryItems = [

    {
        image:"assets/images/1.jpg",
        text:"اینجا متن خاطره اولین عکس قرار می‌گیرد. 💜"
    },

    {
        image:"assets/images/2.jpg",
        text:"اینجا متن خاطره دوم قرار می‌گیرد."
    },

    {
        image:"assets/images/3.jpg",
        text:"اینجا متن خاطره سوم قرار می‌گیرد."
    },

    {
        image:"assets/images/4.jpg",
        text:"اینجا متن خاطره چهارم قرار می‌گیرد."
    }

];

function startGallery(){

    const app = document.getElementById("app");

    app.innerHTML = "";

    const screen = document.createElement("section");

    screen.className = "screen gallery-screen fade-in";

    app.appendChild(screen);

    buildGallery(screen);

}
function buildGallery(screen){

    const title = document.createElement("h2");

    title.textContent = "Our Memories 💜";

    title.style.direction = "ltr";

    screen.appendChild(title);
    
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

    card.appendChild(image);

    card.addEventListener("click",function(){

        openMemory(item);

    });

    grid.appendChild(card);

    });
}

function openMemory(item){

    const overlay = document.createElement("div");

    overlay.className = "memory-overlay fade-in";



    const card = document.createElement("div");

    card.className = "memory-card scale-in";



    const img = document.createElement("img");

    img.src = item.image;



    const text = document.createElement("p");

    text.className = "memory-text";



    card.appendChild(img);

    card.appendChild(text);

    overlay.appendChild(card);

    document.body.appendChild(overlay);



    typeMemory(item.text,text);



    overlay.addEventListener("click",function(e){

        if(e.target===overlay){

            overlay.remove();

        }

    });

}

function typeMemory(message,target){

    let i = 0;

    target.textContent = "";



    const timer = setInterval(function(){

        target.textContent += message[i];

        i++;



        if(i>=message.length){

            clearInterval(timer);

        }
        const next = document.createElement("button");

        next.textContent = "Continue 💜";

        next.style.margin = "20px";

        next.onclick = function(){

            document.querySelector(".memory-overlay").remove();

            startAnniversary();

        };

        target.parentElement.appendChild(next);
        
    },30);

}