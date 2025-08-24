import pandas as pd


def load_movies(path="data/movies.csv"):
    """Load movies dataset"""
    return pd.read_csv(path)


def load_ratings(path="data/ratings.csv"):
    """Load ratings dataset"""
    return pd.read_csv(path)
