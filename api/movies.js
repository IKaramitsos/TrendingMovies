const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

const getRequestUrl = (request) => {
    const protocol =
        request.headers['x-forwarded-proto'] ||
        'https';

    const host =
        request.headers.host ||
        'localhost';

    return new URL(
        request.url,
        `${protocol}://${host}`
    );
};

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        response.setHeader('Allow', 'GET');

        return response.status(405).json({
            error: 'Method not allowed',
        });
    }

    const token =
        process.env.TMDB_ACCESS_TOKEN;

    if (!token) {
        console.error(
            'TMDB_ACCESS_TOKEN is not configured.'
        );

        return response.status(500).json({
            error: 'Server configuration error',
        });
    }

    const requestUrl =
        getRequestUrl(request);

    const query =
        (
            requestUrl.searchParams.get('query') ||
            ''
        ).trim();

    /*
     * Prevent excessively large search requests.
     *
     * We do not remove normal punctuation because
     * legitimate movie titles may contain it.
     */
    if (query.length > 100) {
        return response.status(400).json({
            error: 'Search query is too long',
        });
    }

    try {
        let tmdbUrl;

        if (query) {
            tmdbUrl = new URL(
                `${TMDB_API_BASE_URL}/search/movie`
            );

            tmdbUrl.searchParams.set(
                'query',
                query
            );

            tmdbUrl.searchParams.set(
                'include_adult',
                'false'
            );

            response.setHeader(
                'Cache-Control',
                's-maxage=300, stale-while-revalidate=600'
            );
        } else {
            tmdbUrl = new URL(
                `${TMDB_API_BASE_URL}/discover/movie`
            );

            tmdbUrl.searchParams.set(
                'sort_by',
                'popularity.desc'
            );

            response.setHeader(
                'Cache-Control',
                's-maxage=900, stale-while-revalidate=1800'
            );
        }

        const tmdbResponse =
            await fetch(
                tmdbUrl,
                {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

        if (!tmdbResponse.ok) {
            console.error(
                'TMDB movie request failed:',
                tmdbResponse.status
            );

            return response.status(502).json({
                error: 'Unable to fetch movies',
            });
        }

        const data =
            await tmdbResponse.json();

        return response.status(200).json(data);
    } catch (error) {
        console.error(
            'Movie API error:',
            error
        );

        return response.status(500).json({
            error: 'Unable to fetch movies',
        });
    }
}