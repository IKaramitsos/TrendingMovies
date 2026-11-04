import { useTranslation } from "react-i18next";

const TMDB_LOGO_URL =
  "https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer
      className="relative z-10 mt-16 border-t border-white/10 bg-black/10"
      aria-label={t("footer.credits")}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-light-200 xs:px-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <p className="font-semibold text-white">{t("footer.credits")}</p>

          <p className="mt-1 leading-5">{t("footer.tmdbNotice")}</p>
        </div>

        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="Visit The Movie Database (TMDB)"
        >
          <img
            src={TMDB_LOGO_URL}
            alt="The Movie Database (TMDB)"
            className="h-4 w-auto sm:h-5"
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
