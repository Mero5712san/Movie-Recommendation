import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class CollaborativeRecommender:
    def __init__(self, ratings_path="data/ratings.csv", movies_path="data/movies.csv"):
        self.ratings = pd.read_csv(ratings_path)
        self.movies = pd.read_csv(movies_path)

        # Pivot ratings
        self.user_movie_matrix = self.ratings.pivot(
            index="userId", columns="movieId", values="rating"
        ).fillna(0)

        # Compute similarity between users
        self.user_similarity = cosine_similarity(self.user_movie_matrix)
        np.fill_diagonal(self.user_similarity, 0)
        self.user_similarity_df = pd.DataFrame(
            self.user_similarity,
            index=self.user_movie_matrix.index,
            columns=self.user_movie_matrix.index,
        )

    def recommend(self, user_id, top_n=5):
        if user_id not in self.user_movie_matrix.index:
            return [("User not found", 0.0)]

        # Similar users
        similar_users = (
            self.user_similarity_df[user_id].sort_values(ascending=False).head(5).index
        )

        # Weighted ratings
        user_ratings = (
            self.user_movie_matrix.loc[similar_users]
            .mean()
            .sort_values(ascending=False)
        )

        # Remove already rated movies
        already_rated = self.user_movie_matrix.loc[user_id]
        user_ratings = user_ratings[already_rated == 0]

        # Get top recommendations
        top_recs = user_ratings.head(top_n)
        movie_titles = (
            self.movies.set_index("movieId").loc[top_recs.index]["title"].tolist()
        )

        return list(zip(movie_titles, top_recs.values))
