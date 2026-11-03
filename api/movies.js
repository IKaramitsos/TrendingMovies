const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const MOVIES_PER_RESPONSE = 50;
const TMDB_PAGES_TO_FETCH = 3;
const MINIMUM_RATING_VOTES = 200;

const ALLOWED_GENRES = new Set([
  "28",
  "12",
  "16",
  "35",
  "80",
  "99",
  "18",
  "10751",
  "14",
  "36",
  "27",
  "10402",
  "9648",
  "10749",
  "878",
  "53",
  "10752",
  "37",
]);

const ALLOWED_RATINGS = new Set(["", "6", "7", "8", "9"]);

const ALLOWED_SORT_OPTIONS = new Set([
  "popularity.desc",
  "vote_average.desc",
  "primary_release_date.desc",
  "primary_release_date.asc",
]);

const fetchTmdbPage = async ({
  query,
  genre,
  year,
  rating,
  sort,
  page,
  accessToken,
}) => {
  const params = new URLSearchParams({
    language: "en-US",
    page: String(page),
    include_adult: "false",
  });

  let endpoint;

  if (query) {
    params.set("query", query);

    endpoint = `${TMDB_BASE_URL}/search/movie?${params.toString()}`;
  } else {
    params.set("include_video", "false");
    params.set("sort_by", sort);

    if (genre) {
      params.set("with_genres", genre);
    }

    if (year) {
      params.set("primary_release_year", year);
    }

    if (rating) {
      params.set("vote_average.gte", rating);
    }

    if (rating || sort === "vote_average.desc") {
      params.set("vote_count.gte", String(MINIMUM_RATING_VOTES));
    }

    endpoint = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error(
      `TMDB request failed with status ${response.status}`,
    );

    error.status = response.status;

    throw error;
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

    const genre = url.searchParams.get("genre")?.trim() || "";

    const year = url.searchParams.get("year")?.trim() || "";

    const rating = url.searchParams.get("rating")?.trim() || "";

    const sort = url.searchParams.get("sort")?.trim() || "popularity.desc";

    if (query.length > 100) {
      return res.status(400).json({
        error: "Search query is too long.",
      });
    }

    if (genre && !ALLOWED_GENRES.has(genre)) {
      return res.status(400).json({
        error: "Invalid genre.",
      });
    }

    if (!ALLOWED_RATINGS.has(rating)) {
      return res.status(400).json({
        error: "Invalid rating.",
      });
    }

    if (!ALLOWED_SORT_OPTIONS.has(sort)) {
      return res.status(400).json({
        error: "Invalid sort option.",
      });
    }

    if (year) {
      const parsedYear = Number(year);
      const currentYear = new Date().getFullYear();

      if (
        !Number.isInteger(parsedYear) ||
        parsedYear < 1888 ||
        parsedYear > currentYear + 1
      ) {
        return res.status(400).json({
          error: "Invalid year.",
        });
      }
    }

    const requestOptions = {
      query,
      genre,
      year,
      rating,
      sort,
      accessToken,
    };

    const firstPage = await fetchTmdbPage({
      ...requestOptions,
      page: 1,
    });

    const totalPages = Math.max(1, firstPage.total_pages || 1);

    const lastPageToFetch = Math.min(TMDB_PAGES_TO_FETCH, totalPages);

    const remainingPageNumbers = [];

    for (let page = 2; page <= lastPageToFetch; page += 1) {
      remainingPageNumbers.push(page);
    }

    const remainingPages = await Promise.all(
      remainingPageNumbers.map((page) =>
        fetchTmdbPage({
          ...requestOptions,
          page,
        }),
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
      filters: query
        ? null
        : {
            genre: genre || null,
            year: year || null,
            rating: rating || null,
            sort,
            minimumVotes:
              rating || sort === "vote_average.desc"
                ? MINIMUM_RATING_VOTES
                : null,
          },
    });
  } catch (error) {
    console.error("Error fetching movies:", error);

    if (error.status === 429) {
      return res.status(429).json({
        error: "TMDB request limit reached. Please try again shortly.",
      });
    }

    return res.status(502).json({
      error: "Unable to fetch movies.",
    });
  }
}
