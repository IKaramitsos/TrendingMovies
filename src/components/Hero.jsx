import { useTranslation } from "react-i18next";
import hero from "../assets/hero.png";

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
          <div className="hero-wordmark" aria-hidden="true">
            Trending Movies
          </div>
        </div>

        <h1 className="hero-heading">
          {t("hero.titleStart")}{" "}
          <span className="text-gradient">{t("hero.titleHighlight1")}</span>{" "}
          {t("hero.titleMiddle")}{" "}
          <span className="text-gradient">{t("hero.titleHighlight2")}</span>
        </h1>
      </div>
    </header>
  );
};

export default Hero;
