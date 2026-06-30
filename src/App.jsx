import { useEffect, useState } from 'react'
import { useDebounce } from "react-use";
import API_BASE_URL, { API_OPTIONS } from './tmdb.js';

import hero from './assets/hero.png';
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import MovieModal from "./components/MovieModal.jsx";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";
import { useTranslation } from 'react-i18next';

const App = () => {
    const { t, i18n } = useTranslation();
    const [trendingError, setTrendingError] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [searchTerm,setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [movieList, setMovieList] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useDebounce(() => setDebouncedSearchTerm(searchTerm.trim()), 1000, [searchTerm]);

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error('Failed to fetch movies.');

            }
            const data = await response.json();
            const results = data.results || [];

            const sortedResults = query
                ? [...results].sort((a, b) => b.popularity - a.popularity)
                : results;

            setMovieList(sortedResults);

            if (query && results.length > 0) {
                try {
                    await updateSearchCount(query, sortedResults[0]);
                    setTrendingError(false);
                } catch (error) {
                    console.error("Trending feature unavailable:", error);
                    setTrendingError(true);
                }
            }
        } catch (error) {
            console.log(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies || []);
            setTrendingError(false);
        } catch (error) {
            console.error("Error fetching trending movies:", error);
            setTrendingError(true);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    useEffect(() => {
    fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className="page-background"></div>

                <div className="page-container">
                <header>
                    <div className="site-header">
                        <div className="site-header__brand">
                            <span className="site-header__label">{t('header.brand')}</span>
                        </div>

                        <div className="language-switcher" aria-label="Language switcher">
                            <button
                                type="button"
                                onClick={() => changeLanguage('en')}
                                className={i18n.language === 'en' ? 'active' : ''}
                            >
                                English
                            </button>

                            <span className="language-switcher__divider">|</span>

                            <button
                                type="button"
                                onClick={() => changeLanguage('el')}
                                className={i18n.language === 'el' ? 'active' : ''}
                            >
                                Ελληνικά
                            </button>
                        </div>
                    </div>

                    <img src={hero} alt="Hero Banner" />
                    <h1>{t('hero.titleStart')} <span className="text-gradient">{t('hero.titleHighlight1')}</span> {t('hero.titleMiddle')} <span className="text-gradient">{t('hero.titleHighlight2')}</span>
                    </h1>
                </header>

                    {(trendingMovies.length > 0 || trendingError) && (
                        <section className="trending">
                            <div className="trending-header">
                                <h2>{t('trending.title')}</h2>
                            </div>

                            <p className="trending-note">
                                {t('trending.note')}
                            </p>

                            <div className={`trending-strip ${trendingError ? "trending-strip--disabled" : ""}`}>
                                <ul>
                                    {trendingMovies.map((movie, index) => (
                                        <li key={movie.$id}>
                                            <p>{index + 1}</p>
                                            <img
                                                src={movie.poster_url}
                                                alt={movie.searchTerm || "Trending movie"}
                                            />
                                        </li>
                                    ))}
                                </ul>

                                {trendingError && (
                                    <div className="trending-strip-overlay">
                                        <p>{t('trending.unavailable')}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                <section className="movies-section">
                    <div>
                    <h2>{t('movies.title')}</h2>
                        <Search
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            onClear={handleClearSearch}
                        />
                    </div>

                    {isLoading ? (
                        <Spinner/>
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                    onSelect={() => setSelectedMovie(movie)}
                                />
                            ))}
                        </ul>
                    )}
                </section>
                </div>
            {selectedMovie && (
                <MovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)} />
            )}
        </main>
    )
}
export default App
