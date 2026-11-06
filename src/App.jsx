import { useEffect, useRef, useState } from "react";

import { useDebounce } from "react-use";
import { useTranslation } from "react-i18next";

import API_BASE_URL from "./tmdb.js";

import hero from "./assets/hero.png";

import Hero from "./components/Hero.jsx";
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import MovieModal from "./components/MovieModal.jsx";
import Footer from "./components/Footer.jsx";
import MovieFilters, {
  DEFAULT_MOVIE_FILTERS,
} from "./components/MovieFilters.jsx";

import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const filtersAreEqual = (a, b) =>
  a.genre === b.genre &&
  a.year === b.year &&
  a.rating === b.rating &&
  a.sort === b.sort;

const App = () => {
  const { t } = useTranslation();

  const [trendingError, setTrendingError] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [errorMessage, setErrorMessage] = useState(null);

  const [movieList, setMovieList] = useState([]);

  const [trendingMovies, setTrendingMovies] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [draftFilters, setDraftFilters] = useState({
    ...DEFAULT_MOVIE_FILTERS,
  });

  const [appliedFilters, setAppliedFilters] = useState({
    ...DEFAULT_MOVIE_FILTERS,
  });

  const lastTriggerRef = useRef(null);

  const requestControllerRef = useRef(null);

  const fetchMovies = async (query = "", filters = DEFAULT_MOVIE_FILTERS) => {
    requestControllerRef.current?.abort();

    const controller = new AbortController();

    requestControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();

      if (query) {
        params.set("query", query);
      } else {
        if (filters.genre) {
          params.set("genre", filters.genre);
        }

        if (filters.year) {
          params.set("year", filters.year);
        }

        if (filters.rating) {
          params.set("rating", filters.rating);
        }

        if (filters.sort) {
          params.set("sort", filters.sort);
        }
      }

      const queryString = params.toString();

      const endpoint = queryString
        ? `${API_BASE_URL}/movies?${queryString}`
        : `${API_BASE_URL}/movies`;

      const response = await fetch(endpoint, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch movies.");
      }

      const data = await response.json();

      if (controller.signal.aborted) {
        return;
      }

      const results = data.results || [];

      setMovieList(results);

      if (query && results.length > 0) {
        try {
          await updateSearchCount(query, results[0]);

          setTrendingError(false);
        } catch (error) {
          console.error("Trending feature unavailable:", error);

          setTrendingError(true);
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      console.error("Error fetching movies:", error);

      setErrorMessage(t("errors.fetchMovies"));
    } finally {
      if (requestControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  useDebounce(
    () => {
      fetchMovies(searchTerm.trim(), appliedFilters);
    },
    searchTerm.trim() ? 1000 : 0,
    [searchTerm, appliedFilters],
  );

  useEffect(() => {
    let isActive = true;

    getTrendingMovies()
      .then((movies) => {
        if (!isActive) {
          return;
        }

        if (!Array.isArray(movies) || movies.length === 0) {
          setTrendingMovies([]);
          setTrendingError(true);

          return;
        }

        setTrendingMovies(movies);
        setTrendingError(false);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        console.error("Error fetching trending movies:", error);

        setTrendingMovies([]);
        setTrendingError(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
    };
  }, []);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleFilterChange = (filters) => {
    setDraftFilters(filters);
  };

  const handleApplyFilters = () => {
    if (filtersAreEqual(draftFilters, appliedFilters)) {
      return;
    }

    setAppliedFilters({
      ...draftFilters,
    });
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      ...DEFAULT_MOVIE_FILTERS,
    };

    if (filtersAreEqual(draftFilters, defaultFilters)) {
      return;
    }

    setDraftFilters(defaultFilters);
  };

  const handleSelectMovie = (movie, event) => {
    lastTriggerRef.current = event.currentTarget;

    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);

    setTimeout(() => {
      lastTriggerRef.current?.focus();
    }, 0);
  };

  const fallbackTrendingMovies = Array.from(
    {
      length: 5,
    },
    (_, index) => ({
      $id: `fallback-${index}`,
      poster_url: hero,
      searchTerm: "Trending unavailable",
    }),
  );

  const displayedTrendingMovies =
    trendingError && trendingMovies.length === 0
      ? fallbackTrendingMovies
      : trendingMovies;

  const isSearchActive = Boolean(searchTerm.trim());

  return (
    <main>
      <div className="page-background" />

      <Hero />

      <div className="page-container">
        {(displayedTrendingMovies.length > 0 || trendingError) && (
          <section className="mt-8">
            <h2 className="sr-only">{t("trending.title")}</h2>

            <p className="text-base font-medium text-light-100 sm:text-lg">
              {t("trending.note")}
            </p>

            <div className="relative mt-6 overflow-hidden rounded-2xl">
              <ul
                className={`hide-scrollbar flex w-full flex-row flex-nowrap gap-5 overflow-x-auto py-3 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible ${
                  trendingError
                    ? "pointer-events-none select-none blur-sm opacity-25"
                    : ""
                }`}
              >
                {displayedTrendingMovies.map((movie, index) => (
                  <li
                    key={movie.$id}
                    className="flex min-w-55 items-center lg:min-w-0 lg:justify-center"
                  >
                    <p className="fancy-text pointer-events-none shrink-0 leading-none">
                      {index + 1}
                    </p>

                    <img
                      src={movie.poster_url}
                      alt={movie.searchTerm || "Trending movie"}
                      className="-ml-5 h-43.75 w-31.25 shrink-0 rounded-lg object-cover lg:-ml-7"
                    />
                  </li>
                ))}
              </ul>

              {trendingError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/30">
                  <p className="text-light-100">{t("trending.unavailable")}</p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="mt-24 space-y-6 md:mt-36">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <h2 className="shrink-0">{t("movies.title")}</h2>

            <div className="w-full md:max-w-lg">
              <Search
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onClear={handleClearSearch}
              />
            </div>
          </div>

          <MovieFilters
            filters={draftFilters}
            onChange={handleFilterChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            disabled={isSearchActive}
          />

          {isLoading && movieList.length === 0 ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <div className="relative" aria-busy={isLoading}>
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                {movieList.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={(event) => handleSelectMovie(movie, event)}
                  />
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <Footer />

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </main>
  );
};

export default App;
