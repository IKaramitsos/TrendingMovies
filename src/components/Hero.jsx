import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import hero from "../assets/hero.png";

// Fluent Emoji (3D style, MIT license) via Iconify.
// Browse / swap icons at https://icon-sets.iconify.design/fluent-emoji/
const floatingIcons = [
  {
    name: "streamline-kameleon-color:popcorn-pop",
    className: "hero-icon hero-icon--1",
  },
  { name: "fluent-emoji:clapper-board", className: "hero-icon hero-icon--2" },
  { name: "openmoji:ticket", className: "hero-icon hero-icon--3" },
  { name: "selfhst:cardinal-cinema", className: "hero-icon hero-icon--4" },
];

const Hero = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);

    try {
      localStorage.setItem("language", lang);
    } catch (error) {
      console.warn("Could not persist language preference:", error);
    }
  };

  return (
    <header className="hero-section">
      <div className="hero-inner">
        <nav className="hero-navbar">
          <div className="hero-brand">
            <img src={hero} alt="Trending Movies" className="hero-brand-logo" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-1.5 text-xs text-light-200 backdrop-blur-sm">
            <button
              type="button"

              onClick={() => changeLanguage("en")}

              className={`px-1 py-1 transition-colors duration-200 hover:text-white ${
                i18n.language === "en" ? "font-semibold text-white" : ""
              }`}
            >
              English
            </button>

            <span className="text-white/25">|</span>

            <button
              type="button"

              onClick={() => changeLanguage("el")}

              className={`px-1 py-1 transition-colors duration-200 hover:text-white ${
                i18n.language === "el" ? "font-semibold text-white" : ""
              }`}
            >
              Ελληνικά
            </button>
          </div>
        </nav>

        <div className="hero-showcase">
          {floatingIcons.map((item) => (
            <span key={item.name} className={item.className} aria-hidden="true">
              <Icon icon={item.name} width="100%" height="100%" />
            </span>
          ))}

          <div className="hero-wordmark" aria-hidden="true">
            Trending Movies
          </div>
        </div>

        <h1 className="hero-heading">{t("hero.tagline")}</h1>
      </div>
    </header>
  );
};

export default Hero;
