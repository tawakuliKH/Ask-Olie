import { useEffect, useState } from "react";
import OllieAvatar from "./OllieAvatar.jsx";

const CONTENT = {
  en: {
    dir: "ltr",
    pageTitle: "Ask Ollie — A Friendly Owl Chatbot for Curious Kids",
    title: "Ask Ollie! 🦉",
    subtitle:
      "A wise, friendly owl who loves answering your \"why\" and \"how\" questions!",
    features: [
      { icon: "💬", title: "Simple Chat", desc: "Kids can type their question, or ask by voice." },
      { icon: "🛡️", title: "Safe for Kids", desc: "Answers are simple, friendly, and age-appropriate." },
      { icon: "🎤", title: "Voice Input", desc: "No typing needed — just ask out loud." },
    ],
    cta: "Start Chatting 🦉",
    ctaNote: "A grown-up should be nearby, especially the first time.",
  },
  fa: {
    dir: "rtl",
    pageTitle: "اسک الی — ربات گفتگوی جغد برای کودکان کنجکاو",
    title: "اسک الی 🦉",
    subtitle:
      "یک جغد دوست‌داشتنی و مهربان که با شادی به سوالات «چرا» و «چگونه»ی کودکان پاسخ می‌دهد!",
    features: [
      { icon: "💬", title: "گفتگوی ساده", desc: "کودکان می‌توانند سوال خود را تایپ کنند یا با صدا بپرسند." },
      { icon: "🛡️", title: "ایمن برای کودکان", desc: "پاسخ‌ها ساده، دوستانه و متناسب با سن کودک هستند." },
      { icon: "🎤", title: "ورودی صوتی", desc: "نیازی به تایپ نیست — فقط با صدای بلند بپرسید." },
    ],
    cta: "شروع گفتگو با الی 🦉",
    ctaNote: "توصیه می‌شود در کنار کودک خود باشید، به‌خصوص بار اول.",
  },
};

export default function Landing({ initialLang = "en", onStart }) {
  const [lang, setLang] = useState(initialLang);
  const t = CONTENT[lang];

  useEffect(() => {
    document.title = t.pageTitle;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", t.dir);
    return () => {
      document.documentElement.setAttribute("lang", "en");
      document.documentElement.setAttribute("dir", "ltr");
    };
  }, [lang, t]);

  return (
    <div className={`landing landing-${t.dir}`} dir={t.dir} lang={lang}>
      <div className="landing-lang-switch">
        <label htmlFor="lang-select" className="sr-only">
          Language
        </label>
        <select
          id="lang-select"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">🇬🇧 English</option>
          <option value="fa">🇮🇷 فارسی</option>
        </select>
      </div>

      <div className="landing-hero">
        <OllieAvatar thinking={false} />
        <h1 className="landing-title">{t.title}</h1>
        <p className="landing-subtitle">{t.subtitle}</p>
      </div>

      <div className="landing-features">
        {t.features.map((f) => (
          <div className="landing-feature-card" key={f.title}>
            <span className="landing-feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="landing-cta">
        <button className="landing-cta-btn" onClick={onStart}>
          {t.cta}
        </button>
        <p className="landing-cta-note">{t.ctaNote}</p>
      </div>
    </div>
  );
}