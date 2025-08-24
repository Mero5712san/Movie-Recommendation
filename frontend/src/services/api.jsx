import { useEffect, useState } from "react";
import axios from "axios";

const TMDB_API_KEY = import.meta.env.REACT_APP_TMDB_API_KEY;

export const useRecommendations = (userId, movieTitle) => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // Step 1: Get recommendations from backend
                const { data } = await axios.get("http://127.0.0.1:8000/recommend", {
                    params: {
                        user_id: userId,
                        movie_title: movieTitle,
                        alpha: 0.6,
                        top_n: 10,
                    },
                });

                // Step 2: For each recommended movie → search TMDB
                const enrichedMovies = await Promise.all(
                    data.recommendations.map(async (rec) => {
                        try {
                            const searchRes = await axios.get(
                                `https://api.themoviedb.org/3/search/movie`,
                                {
                                    params: {
                                        api_key: TMDB_API_KEY,
                                        query: rec.title.replace(/\(\d+\)/, "").trim(), // clean "Aliens (1986)" → "Aliens"
                                    },
                                }
                            );

                            const movie = searchRes.data.results[0];
                            if (!movie) return null;

                            return {
                                name: movie.title,
                                image: movie.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                    : "https://via.placeholder.com/300x450?text=No+Image",
                                id: movie.id,
                                score: rec.score,
                                duration: "0h 0min", // if runtime needed → extra TMDB API call
                                year: movie.release_date
                                    ? new Date(movie.release_date).getFullYear()
                                    : "N/A",
                            };
                        } catch (err) {
                            console.error("TMDB fetch error:", err);
                            return null;
                        }
                    })
                );

                setMovies(enrichedMovies.filter((m) => m !== null));
            } catch (err) {
                console.error("Backend fetch error:", err);
            }
        };

        fetchRecommendations();
    }, [userId, movieTitle]);

    return movies;
};


export const usePopularMovies = (topN = 10) => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                // Step 1: Get popular movies from backend
                const { data } = await axios.get("http://127.0.0.1:8000/popular-movies", {
                    params: { top_n: topN },
                });
                // Step 2: Enrich with TMDB posters
                const enrichedMovies = await Promise.all(
                    data.popular_movies.map(async (movie) => {
                        try {
                            const searchRes = await axios.get(
                                `https://api.themoviedb.org/3/search/movie`,
                                {
                                    params: {
                                        api_key: TMDB_API_KEY,
                                        query: movie.title.replace(/\(\d+\)/, "").trim(),
                                    },
                                }
                            );

                            const tmdbMovie = searchRes.data.results[0];
                            return {
                                ...movie,
                                name: movie.title,
                                image: tmdbMovie?.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
                                    : "https://via.placeholder.com/300x450?text=No+Image",
                                year: tmdbMovie?.release_date
                                    ? new Date(tmdbMovie.release_date).getFullYear()
                                    : "N/A",
                            };
                        } catch (err) {
                            console.error("TMDB fetch error:", err);
                            return { ...movie, image: "https://via.placeholder.com/300x450?text=No+Image" };
                        }
                    })
                );

                setMovies(enrichedMovies);
            } catch (err) {
                console.error("Backend fetch error:", err);
            }
        };

        fetchPopular();
    }, [topN]);

    return movies;
};


export const useSearchMovies = (query = "", genre = "", topN = 50) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query && !genre) {
            setMovies([]);
            return;
        }

        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const endpoint = query ? "/search" : "/genre-movies";
                const params = query
                    ? { query, genre, top_n: topN }
                    : { genre, top_n: topN };

                const { data } = await axios.get(`http://127.0.0.1:8000${endpoint}`, {
                    params,
                });

                const enrichedMovies = await Promise.all(
                    data.results.map(async (movie) => {
                        try {
                            const searchRes = await axios.get(
                                `https://api.themoviedb.org/3/search/movie`,
                                {
                                    params: {
                                        api_key: TMDB_API_KEY,
                                        query: movie.title.replace(/\(\d+\)/, "").trim(),
                                    },
                                }
                            );

                            const tmdbMovie = searchRes.data.results[0];
                            return {
                                ...movie,
                                name: movie.title,
                                id: movie.movieId,
                                image: tmdbMovie?.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
                                    : "https://via.placeholder.com/300x450?text=No+Image",
                                year: tmdbMovie?.release_date
                                    ? new Date(tmdbMovie.release_date).getFullYear()
                                    : "N/A",
                            };
                        } catch (err) {
                            console.error("TMDB fetch error:", err);
                            return {
                                ...movie,
                                id: movie.movieId,
                                name: movie.title,
                                image: "https://via.placeholder.com/300x450?text=No+Image",
                            };
                        }
                    })
                );

                setMovies(enrichedMovies);
            } catch (err) {
                console.error("Backend fetch error:", err);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query, genre, topN]);

    return { movies, loading };
};

export const useGenreMovies = (genre = "", topN = 10) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!genre) {
            setMovies([]);
            return;
        }

        const fetchGenreMovies = async () => {
            setLoading(true);
            try {
                // Step 1: Fetch movies from backend by genre
                const { data } = await axios.get("http://127.0.0.1:8000/genre-movies", {
                    params: { genre, top_n: topN },
                });
                console.log(data);
                // Step 2: Enrich with TMDB poster
                const enrichedMovies = await Promise.all(
                    data.results.map(async (movie) => {
                        try {
                            const searchRes = await axios.get(
                                `https://api.themoviedb.org/3/search/movie`,
                                {
                                    params: {
                                        api_key: TMDB_API_KEY,
                                        query: movie.title.replace(/\(\d+\)/, "").trim(),
                                    },
                                }
                            );

                            const tmdbMovie = searchRes.data.results[0];
                            return {
                                ...movie,
                                id: movie.movieId,
                                name: movie.title,
                                image: tmdbMovie?.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
                                    : "https://via.placeholder.com/300x450?text=No+Image",
                                year: tmdbMovie?.release_date
                                    ? new Date(tmdbMovie.release_date).getFullYear()
                                    : "N/A",
                            };
                        } catch (err) {
                            console.error("TMDB fetch error:", err);
                            return {
                                ...movie,
                                id: movie.movieId,
                                name: movie.title,
                                image: "https://via.placeholder.com/300x450?text=No+Image",
                            };
                        }
                    })
                );

                setMovies(enrichedMovies);
            } catch (err) {
                console.error("Backend fetch error:", err);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGenreMovies();
    }, [genre, topN]);

    return { movies, loading };
};
