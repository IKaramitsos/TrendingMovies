import React, {
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    useTranslation,
} from 'react-i18next';

import noMovieImage from '../assets/no-movie.png';
import starIcon from '../assets/star.svg';
import API_BASE_URL from '../tmdb.js';


const formatDate = (
    dateString
) => {
    if (!dateString) {
        return 'N/A';
    }

    return dateString
        .split('T')[0]
        .split('-')
        .reverse()
        .join('/');
};


const getCountryRelease = (
    releaseData,
    countryCode
) => {
    const countryEntry =
        releaseData.results?.find(
            (entry) =>
                entry.iso_3166_1 ===
                countryCode
        );

    const matchedRelease =
        countryEntry?.release_dates?.find(
            (item) =>
                item.release_date
        );

    return {
        date:
            matchedRelease?.release_date ||
            'N/A',

        certification:
            matchedRelease?.certification ||
            'N/A',
    };
};


const MovieModal = ({
                        movie,
                        onClose,
                    }) => {
    const { t } =
        useTranslation();


    const [
        movieDetails,
        setMovieDetails,
    ] = useState(null);


    const [
        releaseInfo,
        setReleaseInfo,
    ] = useState({
        usDate: 'N/A',
        grDate: 'N/A',
        certification: 'N/A',
    });


    const [
        watchProviders,
        setWatchProviders,
    ] = useState([]);


    const [
        isLoading,
        setIsLoading,
    ] = useState(true);


    const [
        errorMessage,
        setErrorMessage,
    ] = useState('');


    const [
        isCopied,
        setIsCopied,
    ] = useState(false);


    const modalRef =
        useRef(null);


    const closeButtonRef =
        useRef(null);


    const copyTimeoutRef =
        useRef(null);


    /* =====================================================
       MOVIE DATA
    ===================================================== */

    useEffect(() => {
        const controller =
            new AbortController();


        const fetchMovieData =
            async () => {
                setIsLoading(
                    true
                );

                setErrorMessage(
                    ''
                );

                setMovieDetails(
                    null
                );

                setWatchProviders(
                    []
                );


                try {
                    const response =
                        await fetch(
                            `${API_BASE_URL}/movie?id=${encodeURIComponent(
                                movie.id
                            )}`,
                            {
                                signal:
                                controller.signal,
                            }
                        );


                    if (!response.ok) {
                        throw new Error(
                            'Failed to fetch movie data'
                        );
                    }


                    const data =
                        await response.json();


                    const detailsData =
                        data.details;


                    const releaseData =
                        data.releaseDates;


                    const providersData =
                        data.providers;


                    const usRelease =
                        getCountryRelease(
                            releaseData,
                            'US'
                        );


                    const grRelease =
                        getCountryRelease(
                            releaseData,
                            'GR'
                        );


                    const regionProviders =
                        providersData
                            ?.results
                            ?.US;


                    const allProviders = [
                        ...(
                            regionProviders
                                ?.flatrate ||
                            []
                        ),

                        ...(
                            regionProviders
                                ?.rent ||
                            []
                        ),

                        ...(
                            regionProviders
                                ?.buy ||
                            []
                        ),
                    ];


                    const uniqueProviders =
                        Array.from(
                            new Map(
                                allProviders.map(
                                    (
                                        provider
                                    ) => [
                                        provider.provider_id,
                                        provider,
                                    ]
                                )
                            ).values()
                        );


                    setMovieDetails(
                        detailsData
                    );


                    setReleaseInfo({
                        usDate:
                        usRelease.date,

                        grDate:
                        grRelease.date,

                        certification:
                        usRelease.certification,
                    });


                    setWatchProviders(
                        uniqueProviders
                    );

                } catch (error) {

                    if (
                        error.name !==
                        'AbortError'
                    ) {
                        console.error(
                            error
                        );

                        setErrorMessage(
                            t(
                                'modal.errorMessage'
                            )
                        );
                    }

                } finally {

                    if (
                        !controller.signal
                            .aborted
                    ) {
                        setIsLoading(
                            false
                        );
                    }

                }
            };


        fetchMovieData();


        return () =>
            controller.abort();

    }, [
        movie.id,
        t,
    ]);


    /* =====================================================
       FOCUS
    ===================================================== */

    useEffect(() => {
        closeButtonRef
            .current
            ?.focus();
    }, []);


    useEffect(() => {
        const handleKeyDown =
            (
                event
            ) => {

                if (
                    event.key ===
                    'Escape'
                ) {
                    onClose();

                    return;
                }


                if (
                    event.key !==
                    'Tab' ||
                    !modalRef.current
                ) {
                    return;
                }


                const focusableElements =
                    modalRef
                        .current
                        .querySelectorAll(
                            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
                        );


                if (
                    !focusableElements
                        .length
                ) {
                    return;
                }


                const firstElement =
                    focusableElements[0];


                const lastElement =
                    focusableElements[
                    focusableElements
                        .length -
                    1
                        ];


                if (
                    event.shiftKey
                ) {

                    if (
                        document.activeElement ===
                        firstElement
                    ) {
                        event.preventDefault();

                        lastElement
                            .focus();
                    }

                } else if (
                    document.activeElement ===
                    lastElement
                ) {
                    event.preventDefault();

                    firstElement
                        .focus();
                }
            };


        document.addEventListener(
            'keydown',
            handleKeyDown
        );


        return () =>
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );

    }, [
        onClose,
    ]);


    /* =====================================================
       BODY SCROLL
    ===================================================== */

    useEffect(() => {
        const previousOverflow =
            document.body.style
                .overflow;


        document.body.style.overflow =
            'hidden';


        return () => {
            document.body.style.overflow =
                previousOverflow;
        };
    }, []);


    /* =====================================================
       COPY TIMEOUT CLEANUP
    ===================================================== */

    useEffect(() => {
        return () => {

            if (
                copyTimeoutRef.current
            ) {
                clearTimeout(
                    copyTimeoutRef.current
                );
            }

        };
    }, []);


    /* =====================================================
       DERIVED DATA
    ===================================================== */

    const posterUrl =
        movieDetails?.poster_path

            ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`

            : movie.poster_path

                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`

                : noMovieImage;


    const title =
        movieDetails?.title ||
        movie.title ||
        'Movie';


    const duration =
        movieDetails?.runtime

            ? `${movieDetails.runtime} min`

            : 'N/A';


    const genres =
        movieDetails
            ?.genres
            ?.length

            ? movieDetails
                .genres
                .map(
                    (
                        genre
                    ) =>
                        genre.name
                )
                .join(
                    ' - '
                )

            : 'N/A';


    const rating =
        movieDetails
            ?.vote_count >
        0 &&
        movieDetails
            ?.vote_average >
        0

            ? movieDetails
                .vote_average
                .toFixed(
                    1
                )

            : movie.vote_average

                ? movie.vote_average
                    .toFixed(
                        1
                    )

                : 'N/A';


    const overview =
        movieDetails?.overview ||
        t(
            'modal.noOverview'
        );


    const spokenLanguages =
        movieDetails
            ?.spoken_languages
            ?.length

            ? movieDetails
                .spoken_languages
                .map(
                    (
                        language
                    ) =>
                        language
                            .english_name
                )
                .join(
                    ', '
                )

            : 'N/A';


    const trailer =
        movieDetails
            ?.videos
            ?.results
            ?.find(
                (
                    video
                ) =>
                    video.site ===
                    'YouTube' &&
                    video.type ===
                    'Trailer'
            );


    const trailerUrl =
        trailer

            ? `https://www.youtube.com/watch?v=${trailer.key}`

            : null;


    /* =====================================================
       COPY TITLE
    ===================================================== */

    const handleCopyTitle =
        async () => {

            try {
                await navigator
                    .clipboard
                    .writeText(
                        title
                    );


                setIsCopied(
                    true
                );


                if (
                    copyTimeoutRef.current
                ) {
                    clearTimeout(
                        copyTimeoutRef.current
                    );
                }


                copyTimeoutRef.current =
                    setTimeout(
                        () => {
                            setIsCopied(
                                false
                            );
                        },
                        1500
                    );

            } catch (error) {
                console.error(
                    'Failed to copy movie title:',
                    error
                );
            }

        };


    /* =====================================================
       UI
    ===================================================== */

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4"

            onClick={
                onClose
            }
        >

            <div
                ref={
                    modalRef
                }

                role="dialog"

                aria-modal="true"

                aria-labelledby="movie-modal-title"

                tabIndex={
                    -1
                }

                className="relative max-h-[88dvh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-dark-100 p-4 shadow-2xl hide-scrollbar sm:max-h-[90dvh] sm:p-6"

                onClick={(
                    event
                ) =>
                    event.stopPropagation()
                }
            >

                {/* =========================
                    CLOSE
                ========================== */}

                <button
                    ref={
                        closeButtonRef
                    }

                    type="button"

                    className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-white/10 text-lg text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:right-4 sm:top-4 sm:size-10"

                    onClick={
                        onClose
                    }

                    aria-label={`${t(
                        'modal.close'
                    )} ${title}`}
                >
                    ✕
                </button>


                {/* =========================
                    LOADING
                ========================== */}

                {isLoading ? (

                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 text-center text-white">

                        <h3 className="text-2xl font-bold">
                            {t(
                                'modal.loading'
                            )}
                        </h3>


                        <p className="text-light-200">
                            {t(
                                'modal.loadingText'
                            )}
                        </p>

                    </div>

                ) : errorMessage ? (

                    /* =========================
                       ERROR
                    ========================== */

                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 text-center text-white">

                        <h3 className="text-2xl font-bold">
                            {t(
                                'modal.errorTitle'
                            )}
                        </h3>


                        <p className="text-light-200">
                            {errorMessage}
                        </p>

                    </div>

                ) : (

                    /* =========================
                       MOVIE DETAILS
                    ========================== */

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">


                        {/* POSTER */}

                        <div>

                            <img
                                src={
                                    posterUrl
                                }

                                alt={
                                    title
                                }

                                className="mx-auto w-full max-w-[210px] rounded-xl object-cover sm:max-w-[260px]"
                            />

                        </div>


                        {/* CONTENT */}

                        <div className="flex min-w-0 flex-col">


                            {/* TITLE + COPY */}

                            <div className="flex items-center gap-3 pr-10 sm:pr-12">

                                <h3
                                    id="movie-modal-title"

                                    className="min-w-0 text-xl font-bold leading-tight text-white sm:text-3xl"
                                >
                                    {title}
                                </h3>


                                <button
                                    type="button"

                                    onClick={
                                        handleCopyTitle
                                    }

                                    className="mt-0.5 shrink-0 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-light-200 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"

                                    aria-label={
                                        t(
                                            'modal.copyTitle'
                                        )
                                    }

                                    aria-live="polite"
                                >
                                    {isCopied

                                        ? t(
                                            'modal.copied'
                                        )

                                        : t(
                                            'modal.copy'
                                        )}
                                </button>

                            </div>


                            {/* DURATION / CERTIFICATION */}

                            <p className="mt-2 text-sm leading-6 text-light-200">

                                <span className="font-bold text-white">
                                    {t(
                                        'modal.duration'
                                    )}:
                                </span>{' '}

                                {duration}


                                <span>
                                    {' '}•{' '}
                                </span>


                                <span className="font-bold text-white">
                                    {t(
                                        'modal.certification'
                                    )}:
                                </span>{' '}

                                {
                                    releaseInfo
                                        .certification
                                }

                            </p>


                            {/* RELEASE DATES */}

                            <p className="mt-2 text-sm leading-6 text-light-200">

                                <span className="font-bold text-white">
                                    {t(
                                        'modal.usReleaseDate'
                                    )}:
                                </span>{' '}

                                {formatDate(
                                    releaseInfo
                                        .usDate
                                )}


                                <span>
                                    {' '}•{' '}
                                </span>


                                <span className="font-bold text-white">
                                    {t(
                                        'modal.grReleaseDate'
                                    )}:
                                </span>{' '}

                                {formatDate(
                                    releaseInfo
                                        .grDate
                                )}

                            </p>


                            {/* GENRES */}

                            <p className="mt-2 text-sm leading-6 text-light-200">

                                <span className="font-bold text-white">
                                    {t(
                                        'modal.genres'
                                    )}:
                                </span>{' '}

                                {genres}

                            </p>


                            {/* RATING */}

                            <div className="mt-4 flex items-center gap-2">

                                <img
                                    src={
                                        starIcon
                                    }

                                    alt=""

                                    className="size-5 object-contain"
                                />


                                <p className="text-base font-bold text-white">
                                    {rating}
                                </p>

                            </div>


                            {/* OVERVIEW */}

                            <p className="mt-4 text-sm leading-6 text-light-200">

                                <span className="font-bold text-white">
                                    {t(
                                        'modal.overview'
                                    )}:
                                    <br />
                                </span>

                                {overview}

                            </p>


                            {/* LANGUAGE + PROVIDERS */}

                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">


                                {/* LANGUAGES */}

                                <div className="min-w-0">

                                    <h4 className="mb-1 text-sm font-semibold text-white">
                                        {t(
                                            'modal.languageSpoken'
                                        )}
                                    </h4>


                                    <p className="break-words text-sm leading-6 text-light-200">
                                        {
                                            spokenLanguages
                                        }
                                    </p>

                                </div>


                                {/* WATCH PROVIDERS */}

                                <div className="min-w-0">

                                    <h4 className="mb-1 text-sm font-semibold text-white">
                                        {t(
                                            'modal.whereToWatch'
                                        )}
                                    </h4>


                                    <p className="break-words text-sm leading-6 text-light-200">

                                        {watchProviders.length >
                                        0

                                            ? watchProviders
                                                .map(
                                                    (
                                                        provider
                                                    ) =>
                                                        provider
                                                            .provider_name
                                                )
                                                .join(
                                                    ', '
                                                )

                                            : t(
                                                'modal.notAvailable'
                                            )}

                                    </p>

                                </div>

                            </div>


                            {/* TRAILER */}

                            {trailerUrl ? (

                                <div className="mt-6 flex justify-start">

                                    <a
                                        href={
                                            trailerUrl
                                        }

                                        target="_blank"

                                        rel="noopener noreferrer"

                                        className="inline-flex w-fit items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                    >
                                        ▶{' '}

                                        {t(
                                            'modal.watchTrailer'
                                        )}
                                    </a>

                                </div>

                            ) : (

                                <div className="mt-6 flex justify-start">

                                    <button
                                        type="button"

                                        className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-light-200"

                                        disabled
                                    >
                                        {t(
                                            'modal.noTrailer'
                                        )}
                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
};


export default MovieModal;