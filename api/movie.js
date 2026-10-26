const TMDB_API_BASE_URL =
    'https://api.themoviedb.org/3';

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

const fetchFromTmdb = async (
    url,
    token
) => {
    return fetch(
        url,
        {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );
};

export default async function handler(
    request,
    response
) {
    if (request.method !== 'GET') {
        response.setHeader(
            'Allow',
            'GET'
        );

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

    const movieId =
        requestUrl.searchParams.get('id');

    /*
     * Only positive numeric TMDB movie IDs
     * are accepted.
     */
    if (
        !movieId ||
        !/^\d+$/.test(movieId) ||
        Number(movieId) <= 0
    ) {
        return response.status(400).json({
            error: 'Invalid movie ID',
        });
    }

    try {
        const detailsUrl =
            new URL(
                `${TMDB_API_BASE_URL}/movie/${movieId}`
            );

        detailsUrl.searchParams.set(
            'append_to_response',
            'videos'
        );

        const releaseDatesUrl =
            `${TMDB_API_BASE_URL}/movie/${movieId}/release_dates`;

        const providersUrl =
            `${TMDB_API_BASE_URL}/movie/${movieId}/watch/providers`;

        const [
            detailsResponse,
            releaseDatesResponse,
            providersResponse,
        ] = await Promise.all([
            fetchFromTmdb(
                detailsUrl,
                token
            ),

            fetchFromTmdb(
                releaseDatesUrl,
                token
            ),

            fetchFromTmdb(
                providersUrl,
                token
            ),
        ]);

        if (
            !detailsResponse.ok ||
            !releaseDatesResponse.ok ||
            !providersResponse.ok
        ) {
            console.error(
                'TMDB movie-details request failed:',
                {
                    details:
                    detailsResponse.status,

                    releaseDates:
                    releaseDatesResponse.status,

                    providers:
                    providersResponse.status,
                }
            );

            return response.status(502).json({
                error:
                    'Unable to fetch movie details',
            });
        }

        const [
            details,
            releaseDates,
            providers,
        ] = await Promise.all([
            detailsResponse.json(),
            releaseDatesResponse.json(),
            providersResponse.json(),
        ]);

        /*
         * Movie metadata changes much less often
         * than search results.
         */
        response.setHeader(
            'Cache-Control',
            's-maxage=3600, stale-while-revalidate=86400'
        );

        return response.status(200).json({
            details,
            releaseDates,
            providers,
        });
    } catch (error) {
        console.error(
            'Movie details API error:',
            error
        );

        return response.status(500).json({
            error:
                'Unable to fetch movie details',
        });
    }
}