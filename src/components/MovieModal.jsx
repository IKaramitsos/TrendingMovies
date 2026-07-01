import React, { useEffect, useRef, useState } from 'react';
import noMovieImage from '../assets/no-movie.png';
import starIcon from '../assets/star.svg';
import API_BASE_URL, { API_OPTIONS } from '../tmdb.js';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString.split('T')[0].split('-').reverse().join('/');
};

const getCountryRelease = (releaseData, countryCode) => {
    const countryEntry = releaseData.results?.find(
        (entry) => entry.iso_3166_1 === countryCode
    );

    const matchedRelease = countryEntry?.release_dates?.find(
        (item) => item.release_date
    );

    return {
        date: matchedRelease?.release_date || 'N/A',
        certification: matchedRelease?.certification || 'N/A',
    };
};

const MovieModal = ({ movie, onClose }) => {
    const [movieDetails, setMovieDetails] = useState(null);
    const [releaseInfo, setReleaseInfo] = useState({
        usDate: 'N/A',
        grDate: 'N/A',
        certification: 'N/A',
    });
    const [watchProviders, setWatchProviders] = useState('Not available');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        const fetchMovieData = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const [detailsResponse, releaseResponse, providersResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/movie/${movie.id}?append_to_response=videos`, API_OPTIONS),
                    fetch(`${API_BASE_URL}/movie/${movie.id}/release_dates`, API_OPTIONS),
                    fetch(`${API_BASE_URL}/movie/${movie.id}/watch/providers`, API_OPTIONS),
                ]);

                if (!detailsResponse.ok || !releaseResponse.ok || !providersResponse.ok) {
                    throw new Error('Failed to fetch movie data');
                }

                const detailsData = await detailsResponse.json();
                const releaseData = await releaseResponse.json();
                const providersData = await providersResponse.json();

                const usRelease = getCountryRelease(releaseData, 'US');
                const grRelease = getCountryRelease(releaseData, 'GR');

                const regionProviders = providersData.results?.US;
                const allProviders = [
                    ...(regionProviders?.flatrate || []),
                    ...(regionProviders?.rent || []),
                    ...(regionProviders?.buy || []),
                ];

                const uniqueProviders = Array.from(
                    new Map(allProviders.map((provider) => [provider.provider_id, provider])).values()
                ).map((provider) => provider.provider_name);

                setMovieDetails(detailsData);
                setReleaseInfo({
                    usDate: usRelease.date,
                    grDate: grRelease.date,
                    certification: usRelease.certification,
                });
                setWatchProviders(
                    uniqueProviders.length > 0 ? uniqueProviders.join(', ') : 'Not available'
                );
            } catch (error) {
                console.error(error);
                setErrorMessage('Failed to load movie details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovieData();
    }, [movie.id]);

    useEffect(() => {
        closeButtonRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }

            if (event.key !== 'Tab' || !modalRef.current) return;

            const focusableElements = modalRef.current.querySelectorAll(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            );

            if (!focusableElements.length) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const posterUrl = movieDetails?.poster_path
        ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
        : movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : noMovieImage;

    const title = movieDetails?.title || movie.title;
    const duration = movieDetails?.runtime ? `${movieDetails.runtime} min` : 'N/A';

    const genres = movieDetails?.genres?.length
        ? movieDetails.genres.map((genre) => genre.name).join(' - ')
        : 'N/A';

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const overview = movieDetails?.overview || 'No overview available.';

    const spokenLanguages = movieDetails?.spoken_languages?.length
        ? movieDetails.spoken_languages.map((language) => language.english_name).join(', ')
        : 'N/A';

    const trailer = movieDetails?.videos?.results?.find(
        (video) => video.site === 'YouTube' && video.type === 'Trailer'
    );

    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="movie-modal-title"
                tabIndex={-1}
                className="relative max-h-[88dvh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-dark-100 p-4 shadow-2xl hide-scrollbar sm:max-h-[90dvh] sm:p-6"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    ref={closeButtonRef}
                    type="button"
                    className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/10 text-lg text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:right-4 sm:top-4 sm:size-10"
                    onClick={onClose}
                    aria-label={`Close details for ${title}`}
                >
                    ✕
                </button>

                {isLoading ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 text-center text-white">
                        <h3 className="text-2xl font-bold">Loading...</h3>
                        <p>Please wait while movie details are loading.</p>
                    </div>
                ) : errorMessage ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 text-center text-white">
                        <h3 className="text-2xl font-bold">Something went wrong</h3>
                        <p>{errorMessage}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
                        <div>
                            <img
                                src={posterUrl}
                                alt={title}
                                className="mx-auto w-full max-w-[210px] rounded-xl object-cover sm:max-w-[260px]"
                            />
                        </div>

                        <div className="flex min-w-0 flex-col">
                            <h3
                                id="movie-modal-title"
                                className="pr-10 text-xl font-bold text-white sm:pr-12 sm:text-3xl"
                            >
                                {title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-light-200">
                                <span className="font-bold text-white">Duration:</span> {duration}
                                <span> • </span>
                                <span className="font-bold text-white">Certification:</span>{' '}
                                {releaseInfo.certification}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-light-200">
                                <span className="font-bold text-white">US Release Date:</span>{' '}
                                {formatDate(releaseInfo.usDate)}
                                <span> • </span>
                                <span className="font-bold text-white">GR Release Date:</span>{' '}
                                {formatDate(releaseInfo.grDate)}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-light-200">
                                <span className="font-bold text-white">Genres:</span> {genres}
                            </p>

                            <div className="mt-4 flex items-center gap-2">
                                <img
                                    src={starIcon}
                                    alt=""
                                    className="size-5 object-contain"
                                />
                                <p className="text-base font-bold text-white">{rating}</p>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-light-200">
                                <span className="font-bold text-white">
                                    Overview: <br />
                                </span>
                                {overview}
                            </p>

                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="min-w-0">
                                    <h4 className="mb-1 text-sm font-semibold text-white">
                                        Language Spoken
                                    </h4>
                                    <p className="break-words text-sm leading-6 text-light-200">
                                        {spokenLanguages}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <h4 className="mb-1 text-sm font-semibold text-white">
                                        Where to watch
                                    </h4>
                                    <p className="break-words text-sm leading-6 text-light-200">
                                        {watchProviders}
                                    </p>
                                </div>
                            </div>

                            {trailerUrl ? (
                                <div className="mt-6 flex justify-start">
                                    <a
                                        href={trailerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-fit items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                    >
                                        ▶ Watch Trailer
                                    </a>
                                </div>
                            ) : (
                                <div className="mt-6 flex justify-start">
                                    <button
                                        type="button"
                                        className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-light-200 transition-colors duration-200 hover:bg-white/5"
                                        disabled
                                    >
                                        No Trailer Available
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