/*=========================================
  THEME
  سیستم رنگ پویا بر اساس کاربر انتخاب‌شده.
  همه‌جای برنامه از متغیرهای CSS زیر پیروی
  می‌کنه، پس با عوض کردنشون کل ظاهر برنامه
  رنگ عوض می‌کنه.
=========================================*/

const THEMES = {

    // عسل 🔮 - دوتایی رنگ بنفش-صورتیِ رازآلود
    asal: {
        name: "عسل",
        primary: "#9333EA",
        secondary: "#F472B6"
    },

    // یاسین ⭐ - دوتایی رنگ طلایی-نیلیِ گرم
    yasin: {
        name: "یاسین",
        primary: "#6366F1",
        secondary: "#F59E0B"
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
