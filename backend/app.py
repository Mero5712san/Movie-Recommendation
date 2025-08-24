from fastapi import FastAPI, Query
from typing import Optional
import pandas as pd
from src.hybird import hybrid_recommend
from fastapi.middleware.cors import CORSMiddleware

# Load datasets once at startup
movies_df = pd.read_csv("data/movies.csv")
ratings_df = pd.read_csv("data/ratings.csv")

app = FastAPI(title="Movie Recommendation API")


# ---------------------------
# 1. Hybrid Recommendation
# ---------------------------
@app.get("/recommend")
def recommend_movies(
    user_id: int = Query(..., description="User ID for recommendations"),
    movie_title: str = Query(..., description="Movie title for context"),
    alpha: float = Query(0.6, description="Weight between CF & Content"),
    top_n: int = Query(5, description="Number of recommendations"),
):
    recommendations = hybrid_recommend(user_id, movie_title, alpha=alpha, top_n=top_n)

    return {
        "user_id": user_id,
        "movie_title": movie_title,
        "recommendations": [
            {"rank": idx + 1, "title": title, "score": float(score)}
            for idx, (title, score) in enumerate(recommendations)
        ],
    }


# ---------------------------
# 2. Popular Movies
# ---------------------------
@app.get("/popular-movies")
def get_popular_movies(top_n: int = 10):
    movie_stats = (
        ratings_df.groupby("movieId")
        .agg(avg_rating=("rating", "mean"), count=("rating", "count"))
        .reset_index()
    )
    movie_stats["popularity"] = movie_stats["avg_rating"] * movie_stats["count"]

    popular = movie_stats.merge(movies_df, on="movieId")
    popular = popular.sort_values("popularity", ascending=False).head(top_n)

    return {
        "popular_movies": [
            {
                "rank": idx + 1,
                "title": row["title"],
                "avg_rating": round(row["avg_rating"], 2),
                "ratings_count": int(row["count"]),
                "popularity_score": round(row["popularity"], 2),
            }
            for idx, row in popular.iterrows()
        ]
    }


# ---------------------------
# 3. Search Movies
# ---------------------------
@app.get("/search")
def search_movies(
    query: Optional[str] = Query(None, description="Search by movie title"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    top_n: int = Query(10, description="Max results"),
):
    results = movies_df.copy()

    # Filter by title if query provided
    if query:
        results = results[results["title"].str.contains(query, case=False, na=False)]

    # Filter by genre if genre provided
    if genre:
        results = results[results["genres"].str.contains(genre, case=False, na=False)]

    results = results.head(top_n)

    return {
        "results": [
            {
                "movieId": int(row["movieId"]),
                "title": row["title"],
                "genres": row["genres"],
            }
            for _, row in results.iterrows()
        ]
    }


# ---------------------------
# 4. Filter Movies by Genre Only
# ---------------------------
@app.get("/genre-movies")
def filter_movies_by_genre(
    genre: str = Query(..., description="Genre to filter movies by"),
    top_n: int = Query(10, description="Max results"),
):
    results = movies_df[movies_df["genres"].str.contains(genre, case=False, na=False)]
    results = results.head(top_n)

    return {
        "results": [
            {
                "movieId": int(row["movieId"]),
                "title": row["title"],
                "genres": row["genres"],
            }
            for _, row in results.iterrows()
        ]
    }


# ---------------------------
# CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
