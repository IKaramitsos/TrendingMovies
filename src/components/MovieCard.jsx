import React from 'react';
import noMovieImage from '../assets/no-movie.png';
import starIcon from '../assets/star.svg';

const MovieCard = ({ movie, onSelect }) => {
    const {
        title,
        vote_average,
        poster_path,
        release_date,
    } = movie;

    const posterUrl = poster_path
        ? `https://image.tmdb.org/t/p/w500${poster_path}`
        : noMovieImage;

    const releaseYear = release_date ? release_date.split('-')[0] : 'N/A';
    const rating = vote_average ? vote_average.toFixed(1) : 'N/A';

    return (
        <li className="movie-card">
            <button
                type="button"
                className="movie-card-button"
                onClick={onSelect}
                aria-label={`Open details for ${title}`}
            >
                <img src={posterUrl} alt={title} />

                <div className="movie-card-body">
                    <h3>{title}</h3>

                    <div className="content">
                        <div className="rating">
                            <img src={starIcon} alt="Star icon" />
                            <p>{rating}</p>
                        </div>
                        <span>•</span>
                        <p className="year">{releaseYear}</p>
                    </div>
                </div>
            </button>
        </li>
    );
};

export default MovieCard;