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
        <li className="overflow-hidden rounded-xl border border-white/10 bg-dark-100 shadow-inner shadow-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg">
            <button
                type="button"
                className="flex w-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                onClick={onSelect}
                aria-label={`Open details for ${title}`}
            >
                <img src={posterUrl} alt={title} />

                <div className="mt-4">
                    <h3 className="line-clamp-2 px-3 pt-2 text-sm font-bold text-white sm:text-base">
                        {title}
                    </h3>

                    <div className="mt-0 flex flex-row flex-wrap items-center gap-1.5 px-3 pb-3">
                        <div className="flex flex-row items-center gap-1">
                            <img
                                src={starIcon}
                                alt="Star icon"
                                className="size-4 object-contain"
                            />
                            <p className="text-sm font-bold text-white sm:text-base">{rating}</p>
                        </div>

                        <span className="text-2xl text-gray-100">•</span>

                        <p className="text-sm font-medium text-gray-100 sm:text-base">
                            {releaseYear}
                        </p>
                    </div>
                </div>
            </button>
        </li>
    );
};

export default MovieCard;