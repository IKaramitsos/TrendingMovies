import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const DEFAULT_MOVIE_FILTERS = {
  genre: "",
  year: "",
  rating: "",
  sort: "popularity.desc",
};

const GENRES = [
  { id: "28", key: "action" },
  { id: "12", key: "adventure" },
  { id: "16", key: "animation" },
  { id: "35", key: "comedy" },
  { id: "80", key: "crime" },
  { id: "99", key: "documentary" },
  { id: "18", key: "drama" },
  { id: "10751", key: "family" },
  { id: "14", key: "fantasy" },
  { id: "36", key: "history" },
  { id: "27", key: "horror" },
  { id: "10402", key: "music" },
  { id: "9648", key: "mystery" },
  { id: "10749", key: "romance" },
  { id: "878", key: "scienceFiction" },
  { id: "53", key: "thriller" },
  { id: "10752", key: "war" },
  { id: "37", key: "western" },
];

const CURRENT_YEAR = new Date().getFullYear();
const FIRST_YEAR = 1950;

const YEARS = Array.from(
  { length: CURRENT_YEAR - FIRST_YEAR + 1 },
  (_, index) => CURRENT_YEAR - index,
);

const SelectArrow = ({ isOpen }) => (
  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-light-200">
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const FilterSelect = ({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLabel = useMemo(() => {
    const selectedOption = options.find((option) => option.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  }, [options, placeholder, value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((previous) => !previous)}
        className="h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 pr-11 text-left text-sm font-semibold text-light-100 outline-none transition-all duration-200 hover:border-white/25 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/15 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {selectedLabel}
        <SelectArrow isOpen={isOpen} />
      </button>

      {isOpen && !disabled && (
        <div className="custom-scrollbar absolute left-0 top-full z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#130606] shadow-2xl shadow-black/40 backdrop-blur-xl">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`block w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-white/10 text-white"
                    : "text-light-100 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MovieFilters = ({
  filters,
  onChange,
  onApply,
  onReset,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const genreOptions = [
    { value: "", label: t("filters.allGenres") },
    ...GENRES.map((genre) => ({
      value: genre.id,
      label: t(`filters.genres.${genre.key}`),
    })),
  ];

  const yearOptions = [
    { value: "", label: t("filters.allYears") },
    ...YEARS.map((year) => ({
      value: String(year),
      label: String(year),
    })),
  ];

  const ratingOptions = [
    { value: "", label: t("filters.allRatings") },
    { value: "9", label: "9+" },
    { value: "8", label: "8+" },
    { value: "7", label: "7+" },
    { value: "6", label: "6+" },
  ];

  const sortOptions = [
    {
      value: "popularity.desc",
      label: t("filters.sortPopularity"),
    },
    {
      value: "vote_average.desc",
      label: t("filters.sortRating"),
    },
    {
      value: "primary_release_date.desc",
      label: t("filters.sortNewest"),
    },
    {
      value: "primary_release_date.asc",
      label: t("filters.sortOldest"),
    },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!disabled) {
      onApply();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3"
    >
      <FilterSelect
        value={filters.genre}
        options={genreOptions}
        placeholder={t("filters.allGenres")}
        onChange={(value) =>
          onChange({
            ...filters,
            genre: value,
          })
        }
        disabled={disabled}
      />

      <FilterSelect
        value={filters.year}
        options={yearOptions}
        placeholder={t("filters.allYears")}
        onChange={(value) =>
          onChange({
            ...filters,
            year: value,
          })
        }
        disabled={disabled}
      />

      <FilterSelect
        value={filters.rating}
        options={ratingOptions}
        placeholder={t("filters.allRatings")}
        onChange={(value) =>
          onChange({
            ...filters,
            rating: value,
          })
        }
        disabled={disabled}
      />

      <FilterSelect
        value={filters.sort}
        options={sortOptions}
        placeholder={t("filters.sortPopularity")}
        onChange={(value) =>
          onChange({
            ...filters,
            sort: value,
          })
        }
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-white/20 bg-transparent px-4 text-sm font-bold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("filters.apply")}
      </button>

      <button
        type="button"
        onClick={onReset}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 text-sm font-semibold text-light-200 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("filters.reset")}
      </button>

      {disabled && (
        <p className="col-span-full pt-1 text-xs font-medium text-light-200">
          {t("filters.searchDisabled")}
        </p>
      )}
    </form>
  );
};

export default MovieFilters;
