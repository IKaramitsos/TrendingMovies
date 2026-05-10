import React, { useEffect, useState } from 'react';
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
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
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
        <div className="movie-modal" onClick={onClose}>
            <div className="movie-modal-panel" onClick={(event) => event.stopPropagation()}>
                <button
                    type="button"
                    className="movie-modal-close-btn"
                    onClick={onClose}
                    aria-label={`Close details for ${title}`}
                >
                    ✕
                </button>

                {isLoading ? (
                    <div className="movie-modal-empty">
                        <h3>Loading...</h3>
                        <p>Please wait while movie details are loading.</p>
                    </div>
                ) : errorMessage ? (
                    <div className="movie-modal-empty">
                        <h3>Something went wrong</h3>
                        <p>{errorMessage}</p>
                    </div>
                ) : (
                    <div className="movie-modal-layout">
                        <div className="movie-modal-poster">
                            <img src={posterUrl} alt={title} />
                        </div>

                        <div className="movie-modal-details">
                            <h3 className="movie-modal-title">{title}</h3>

                            <p className="movie-modal-info-line">
                                <span className="movie-modal-label">Duration:</span> {duration}
                                <span> • </span>
                                <span className="movie-modal-label">Certification:</span>{' '}
                                {releaseInfo.certification}
                            </p>

                            <p className="movie-modal-info-line">
                                <span className="movie-modal-label">US Release Date:</span>{' '}
                                {formatDate(releaseInfo.usDate)}
                                <span> • </span>
                                <span className="movie-modal-label">GR Release Date:</span>{' '}
                                {formatDate(releaseInfo.grDate)}
                            </p>

                            <p className="movie-modal-info-line">
                                <span className="movie-modal-label">Genres: </span> {genres}
                            </p>

                            <div className="movie-modal-rating">
                                <img src={starIcon} alt="Star icon" />
                                <p>{rating}</p>
                            </div>

                            <p className="movie-modal-overview">
                                <span className="movie-modal-label">Overview: <br/> </span>
                                {overview}</p>

                            <div className="movie-modal-details-grid">
                                <div>
                                    <h4>Language Spoken</h4>
                                    <p>{spokenLanguages}</p>
                                </div>

                                <div>
                                    <h4>Where to watch</h4>
                                    <p>{watchProviders}</p>
                                </div>
                            </div>

                            {trailerUrl ? (
                                <div className="movie-modal-actions">
                                    <a
                                        href={trailerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="movie-modal-trailer-link"
                                    >
                                        ▶ Watch Trailer
                                    </a>
                                </div>
                            ) : (
                                <div className="movie-modal-actions">
                                    <button
                                        type="button"
                                        className="movie-modal-trailer-link movie-modal-trailer-link-disabled"
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