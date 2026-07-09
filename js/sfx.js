/*=========================================
  SFX MANAGER
  مدیریت متمرکز افکت‌های صوتی برنامه.
  همه‌ی صداها اینجا preload میشن و با
  SFX.play("name") در هرجای برنامه صدا زده میشن.
=========================================*/

const SFX = (function(){

    const files = {
        click:     "assets/sfx/click.wav",
        open:      "assets/sfx/open.wav",
        chime:     "assets/sfx/chime.wav",
        whoosh:    "assets/sfx/whoosh.wav",
        success:   "assets/sfx/success.wav",
        heartbeat: "assets/sfx/heartbeat.wav",
        golden:    "assets/sfx/golden.wav",
        bad:       "assets/sfx/bad.wav"
    };

    const cache = {};
    let enabled = true;

    function preload(){
        Object.keys(files).forEach(name=>{
            const audio = new Audio(files[name]);
            audio.preload = "auto";
            cache[name] = audio;
        });
    }

    function play(name, volume){
        if(!enabled || !cache[name]) return;

        // با clone پخش می‌کنیم تا اگه صدا سریع پشت‌سرهم صدا زده بشه
        // (مثلا کلیک‌های پشت‌سرهم روی دکمه) روی هم قطع نشن
        const node = cache[name].cloneNode();
        node.volume = volume !== undefined ? volume : 0.5;
        node.play().catch(()=>{});
    }

    function setEnabled(value){
        enabled = value;
    }

    function isEnabled(){
        return enabled;
    }

    // به همه‌ی دکمه‌های صفحه، صدای کلیک اضافه می‌کنه
    // (delegated listener، پس برای دکمه‌های آینده هم کار می‌کنه)
    function bindGlobalClicks(){
        document.addEventListener("click", (e)=>{
            const btn = e.target.closest("button, .clickable");
            if(btn){
                play("click", 0.35);
            }
        });
    }

    return { preload, play, setEnabled, isEnabled, bindGlobalClicks };

})();

document.addEventListener("DOMContentLoaded", ()=>{
    SFX.preload();
    SFX.bindGlobalClicks();
});
