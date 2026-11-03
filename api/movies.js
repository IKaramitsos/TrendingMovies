const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const MOVIES_PER_RESPONSE = 50;

const TMDB_PAGES_TO_FETCH = 3;

const fetchTmdbPage = async (query, page, accessToken) => {
  const endpoint = query
    ? `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(
        query,
      )}&include_adult=false&language=en-US&page=${page}`
    : `${TMDB_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`;

  const response = await fetch(endpoint, {
    method: "GET",

    headers: {
      accept: "application/json",

      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error(`TMDB movies request failed: ${response.status}`);

    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  return response.json();
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const accessToken = process.env.TMDB_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("TMDB_ACCESS_TOKEN is not configured.");

    return res.status(500).json({
      error: "Server configuration error",
    });
  }

  try {
    const url = new URL(req.url, "http://localhost");

    const query = url.searchParams.get("query")?.trim() || "";

    if (query.length > 100) {
      return res.status(400).json({
        error: "Search query is too long.",
      });
    }

    const firstPage = await fetchTmdbPage(query, 1, accessToken);

    const totalPages = Math.max(1, firstPage.total_pages || 1);

    const lastPageToFetch = Math.min(TMDB_PAGES_TO_FETCH, totalPages);

    const remainingPageNumbers = [];

    for (let page = 2; page <= lastPageToFetch; page += 1) {
      remainingPageNumbers.push(page);
    }

    const remainingPages = await Promise.all(
      remainingPageNumbers.map((page) =>
        fetchTmdbPage(query, page, accessToken),
      ),
    );

    const allPages = [firstPage, ...remainingPages];

    const combinedMovies = allPages.flatMap((page) => page.results || []);

    const uniqueMovies = Array.from(
      new Map(combinedMovies.map((movie) => [movie.id, movie])).values(),
    );

    const movies = uniqueMovies.slice(0, MOVIES_PER_RESPONSE);

    res.setHeader(
      "Cache-Control",
      query
        ? "s-maxage=300, stale-while-revalidate=600"
        : "s-maxage=900, stale-while-revalidate=1800",
    );

    return res.status(200).json({
      page: 1,
      results: movies,

      total_results: firstPage.total_results || movies.length,

      total_pages: firstPage.total_pages || 1,
    });
  } catch (error) {
    console.error("Error fetching movies:", error);

    return res.status(502).json({
      error: "Unable to fetch movies.",
    });
  }
}
