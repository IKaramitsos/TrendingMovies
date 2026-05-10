const API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_READ_ACCESS_TOKEN = import.meta.env.VITE_TMDB_API_KEY;

export const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
    },
};

export default API_BASE_URL;