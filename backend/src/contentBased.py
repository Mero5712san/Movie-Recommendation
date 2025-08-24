import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .utils import load_movies


class ContentBasedRecommender:
    def __init__(self):
        self.movies = load_movies()
        self.indices = None
        self.cosine_sim = None
        self._prepare()

    def _prepare(self):
        # Handle missing genres
        self.movies["genres"] = self.movies["genres"].fillna("")

        # Convert genres to TF-IDF vectors
        tfidf = TfidfVectorizer(stop_words="english")
        tfidf_matrix = tfidf.fit_transform(self.movies["genres"])

        # Cosine similarity between all movies
        self.cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

        # Build index mapping (title -> index)
        self.indices = pd.Series(
            self.movies.index, index=self.movies["title"]
        ).drop_duplicates()


    def recommend(self, title, top_n=5):
        if title not in self.indices:
            return [("Movie not found!", 0.0)]
    
        idx = self.indices[title]
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1 : top_n + 1]
    
        movie_indices = [i[0] for i in sim_scores]
        scores = [i[1] for i in sim_scores]
    
        return list(zip(self.movies["title"].iloc[movie_indices], scores))
