import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import { useTranslation } from 'react-i18next';

import API_BASE_URL from './tmdb.js';
import hero from './assets/hero.png';

import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import MovieModal from './components/MovieModal.jsx';

import {
    getTrendingMovies,
    updateSearchCount,
} from './appwrite.js';


const App = () => {
    const { t, i18n } = useTranslation();

    const [
        trendingError,
        setTrendingError,
    ] = useState(false);

    const [
        selectedMovie,
        setSelectedMovie,
    ] = useState(null);

    const [
        searchTerm,
        setSearchTerm,
    ] = useState('');

    const [
        errorMessage,
        setErrorMessage,
    ] = useState(null);

    const [
        movieList,
        setMovieList,
    ] = useState([]);

    const [
        trendingMovies,
        setTrendingMovies,
    ] = useState([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const lastTriggerRef =
        useRef(null);


    /* =====================================================
       MOVIES
    ===================================================== */

    const fetchMovies = async (
        query = ''
    ) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const endpoint =
                query
                    ? `${API_BASE_URL}/movies?query=${encodeURIComponent(query)}`
                    : `${API_BASE_URL}/movies`;

            const response =
                await fetch(endpoint);

            if (!response.ok) {
                throw new Error(
                    'Failed to fetch movies.'
                );
            }

            const data =
                await response.json();

            const results =
                data.results || [];

            const sortedResults =
                query
                    ? [...results].sort(
                        (a, b) =>
                            b.popularity -
                            a.popularity
                    )
                    : results;

            setMovieList(
                sortedResults
            );


            /*
             * Appwrite trending search tracking.
             */
            if (
                query &&
                results.length > 0
            ) {
                try {
                    await updateSearchCount(
                        query,
                        sortedResults[0]
                    );

                    setTrendingError(
                        false
                    );
                } catch (error) {
                    console.error(
                        'Trending feature unavailable:',
                        error
                    );

                    setTrendingError(
                        true
                    );
                }
            }
        } catch (error) {
            console.error(
                'Error fetching movies:',
                error
            );

            setErrorMessage(
                'Error fetching movies. Please try again later.'
            );
        } finally {
            setIsLoading(false);
        }
    };


    /*
     * Search requests:
     *
     * - initial empty query loads immediately
     * - empty search after clearing loads immediately
     * - actual text searches wait 1 second
     *
     * This removes the previous effect that triggered
     * the React lint warning.
     */
    useDebounce(
        () => {
            fetchMovies(
                searchTerm.trim()
            );
        },

        searchTerm.trim()
            ? 1000
            : 0,

        [
            searchTerm,
        ]
    );


    /* =====================================================
       TRENDING
    ===================================================== */

    /*
     * Appwrite loading remains asynchronous.
     *
     * State updates occur inside the Promise callbacks,
     * rather than synchronously inside the effect body.
     */
    useEffect(() => {
        let isActive = true;

        getTrendingMovies()
            .then((movies) => {
                if (!isActive) {
                    return;
                }

                if (
                    !Array.isArray(movies) ||
                    movies.length === 0
                ) {
                    setTrendingMovies(
                        []
                    );

                    setTrendingError(
                        true
                    );

                    return;
                }

                setTrendingMovies(
                    movies
                );

                setTrendingError(
                    false
                );
            })

            .catch((error) => {
                if (!isActive) {
                    return;
                }

                console.error(
                    'Error fetching trending movies:',
                    error
                );

                setTrendingMovies(
                    []
                );

                setTrendingError(
                    true
                );
            });

        return () => {
            isActive = false;
        };
    }, []);


    /* =====================================================
       SEARCH
    ===================================================== */

    const handleClearSearch = () => {
        setSearchTerm('');
    };


    /* =====================================================
       LANGUAGE
    ===================================================== */

    const changeLanguage = (
        lang
    ) => {
        i18n.changeLanguage(
            lang
        );

        try {
            localStorage.setItem(
                'language',
                lang
            );
        } catch (error) {
            console.warn(
                'Could not persist language preference:',
                error
            );
        }
    };


    /* =====================================================
       MODAL
    ===================================================== */

    const handleSelectMovie = (
        movie,
        event
    ) => {
        lastTriggerRef.current =
            event.currentTarget;

        setSelectedMovie(
            movie
        );
    };


    const handleCloseModal = () => {
        setSelectedMovie(
            null
        );

        setTimeout(() => {
            lastTriggerRef.current?.focus();
        }, 0);
    };


    /* =====================================================
       TRENDING FALLBACK
    ===================================================== */

    const fallbackTrendingMovies =
        Array.from(
            {
                length: 5,
            },

            (
                _,
                index
            ) => ({
                $id:
                    `fallback-${index}`,

                poster_url:
                hero,

                searchTerm:
                    'Trending unavailable',
            })
        );


    const displayedTrendingMovies =
        trendingError &&
        trendingMovies.length === 0
            ? fallbackTrendingMovies
            : trendingMovies;


    /* =====================================================
       UI
    ===================================================== */

    return (
        <main>
            <div className="page-background" />

            <div className="page-container">

                {/* ===============================
                    HEADER
                =============================== */}

                <header>
                    <div className="mb-5 flex items-center justify-between gap-3">

                        <div className="min-w-0 flex-1">
                            <span className="truncate text-[11px] font-medium uppercase tracking-[0.22em] text-light-200 xs:text-sm">
                                {t(
                                    'header.brand'
                                )}
                            </span>
                        </div>


                        {/* Language selector */}

                        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-light-200 xs:px-4 xs:text-sm">

                            <button
                                type="button"

                                onClick={() =>
                                    changeLanguage(
                                        'en'
                                    )
                                }

                                className={`transition-colors duration-200 hover:text-white ${
                                    i18n.language ===
                                    'en'
                                        ? 'font-semibold text-white'
                                        : ''
                                }`}
                            >
                                English
                            </button>


                            <span className="text-white/20">
                                |
                            </span>


                            <button
                                type="button"

                                onClick={() =>
                                    changeLanguage(
                                        'el'
                                    )
                                }

                                className={`transition-colors duration-200 hover:text-white ${
                                    i18n.language ===
                                    'el'
                                        ? 'font-semibold text-white'
                                        : ''
                                }`}
                            >
                                Ελληνικά
                            </button>

                        </div>
                    </div>


                    <img
                        src={hero}
                        alt="Hero Banner"
                    />


                    <h1>
                        {t(
                            'hero.titleStart'
                        )}{' '}

                        <span className="text-gradient">
                            {t(
                                'hero.titleHighlight1'
                            )}
                        </span>{' '}

                        {t(
                            'hero.titleMiddle'
                        )}{' '}

                        <span className="text-gradient">
                            {t(
                                'hero.titleHighlight2'
                            )}
                        </span>
                    </h1>
                </header>


                {/* ===============================
                    TRENDING
                =============================== */}

                {(
                    displayedTrendingMovies.length >
                    0 ||
                    trendingError
                ) && (

                    <section className="mb-2 mt-10">

                        <div className="flex items-center gap-2">
                            <h2>
                                {t(
                                    'trending.title'
                                )}
                            </h2>
                        </div>


                        <p className="mt-2 text-sm text-light-200">
                            {t(
                                'trending.note'
                            )}
                        </p>


                        <div className="relative mt-4 overflow-hidden rounded-2xl">

                            <ul
                                className={`hide-scrollbar -mt-10 flex w-full flex-row flex-nowrap gap-5 overflow-x-auto pt-3 ${
                                    trendingError
                                        ? 'pointer-events-none select-none blur-sm opacity-25'
                                        : ''
                                }`}
                            >

                                {displayedTrendingMovies.map(
                                    (
                                        movie,
                                        index
                                    ) => (

                                        <li
                                            key={
                                                movie.$id
                                            }

                                            className="flex min-w-[230px] flex-row items-center"
                                        >

                                            <p className="fancy-text mt-[22px] text-nowrap">
                                                {index + 1}
                                            </p>


                                            <img
                                                src={
                                                    movie.poster_url
                                                }

                                                alt={
                                                    movie.searchTerm ||
                                                    'Trending movie'
                                                }

                                                className="-ml-3 h-[150px] w-[110px] rounded-lg object-cover"
                                            />

                                        </li>
                                    )
                                )}

                            </ul>


                            {trendingError && (

                                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/30">

                                    <p>
                                        {t(
                                            'trending.unavailable'
                                        )}
                                    </p>

                                </div>

                            )}

                        </div>
                    </section>
                )}


                {/* ===============================
                    MOVIES
                =============================== */}

                <section className="space-y-6">

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                        <h2 className="shrink-0">
                            {t(
                                'movies.title'
                            )}
                        </h2>


                        <div className="w-full md:max-w-lg">

                            <Search
                                searchTerm={
                                    searchTerm
                                }

                                setSearchTerm={
                                    setSearchTerm
                                }

                                onClear={
                                    handleClearSearch
                                }
                            />

                        </div>
                    </div>


                    {isLoading ? (

                        <Spinner />

                    ) : errorMessage ? (

                        <p className="text-red-500">
                            {errorMessage}
                        </p>

                    ) : (

                        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">

                            {movieList.map(
                                (movie) => (

                                    <MovieCard
                                        key={
                                            movie.id
                                        }

                                        movie={
                                            movie
                                        }

                                        onSelect={(
                                            event
                                        ) =>
                                            handleSelectMovie(
                                                movie,
                                                event
                                            )
                                        }
                                    />

                                )
                            )}

                        </ul>
                    )}

                </section>
            </div>


            {/* ===============================
                MOVIE MODAL
            =============================== */}

            {selectedMovie && (

                <MovieModal
                    movie={
                        selectedMovie
                    }

                    onClose={
                        handleCloseModal
                    }
                />

            )}

        </main>
    );
};

export default App;