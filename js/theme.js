/*=========================================
  THEME
  سیستم رنگ پویا بر اساس کاربر انتخاب‌شده.
  همه‌جای برنامه از متغیرهای CSS زیر پیروی
  می‌کنه، پس با عوض کردنشون کل ظاهر برنامه
  رنگ عوض می‌کنه.
=========================================*/

const THEMES = {

    asal: {
        name: "عسل",
        primary: "#7C3AED",
        secondary: "#22C55E"
    },

    yasin: {
        name: "یاسین",
        primary: "#16A34A",
        secondary: "#8B5CF6"
    }

};

function applyTheme(userKey){

    const theme = THEMES[userKey];

    if(!theme) return;

    const root = document.documentElement;

    root.style.setProperty("--purple", theme.primary);

    root.style.setProperty("--purple-light", theme.secondary);

    root.style.setProperty("--accent-secondary", theme.secondary);

    root.dataset.user = userKey;

}
