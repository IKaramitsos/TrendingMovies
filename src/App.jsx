import { useEffect, useState } from 'react'
import { useDebounce } from "react-use";
import API_BASE_URL, { API_OPTIONS } from './tmdb.js';

import hero from './assets/hero.png';
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import MovieModal from "./components/MovieModal.jsx";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const App = () => {
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [searchTerm,setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [movieList, setMovieList] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useDebounce(() => setDebouncedSearchTerm(searchTerm.trim()), 500, [searchTerm]);

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
            setMovieList(data.results || []);

            if(query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.log(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        }finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async (query = '') => {
        try{
        const movies = await getTrendingMovies();
        setTrendingMovies(movies);
        }catch(error){
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

    useEffect(() => {
    fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>

            <div className="pattern"></div>

                <div className="wrapper">
                <header>
                    <img src={hero} alt="Hero Banner" />
                    <h1>Find <span className="text-gradient">Movies</span> You&apos;ll Enjoy without the <span className="text-gradient">Hassle</span>
                    </h1>
                </header>

                    {trendingMovies.length > 0 && (
                        <section className="trending">
                            <div className="trending-header">
                                <h2>Trending Movies</h2>
                            </div>
                            <p className="trending-note">
                                Top 5 movies ranked by the most searched titles on this site.
                            </p>
                            <ul>
                                {trendingMovies.map((movie, index) => (
                                    <li key={movie.$id}>
                                        <p>{index + 1}</p>
                                        <img src={movie.poster_url} alt={movie.title} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                <section className="all-movies">
                    <div>
                    <h2>Most popular movies right now</h2>
                        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
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
