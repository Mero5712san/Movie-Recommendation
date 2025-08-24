import pandas as pd
from src.contentBased import ContentBasedRecommender
from src.collaborative import CollaborativeRecommender


def hybrid_recommend(user_id, movie_title, alpha=0.6, top_n=5):
    # Content-based
    cb = ContentBasedRecommender()
    cb_recs = cb.recommend(movie_title, top_n=20)
    cb_recs = pd.DataFrame(cb_recs, columns=["title", "cb_score"])

    # Collaborative
    cf = CollaborativeRecommender()
    cf_recs = cf.recommend(user_id, top_n=20)
    cf_recs = pd.DataFrame(cf_recs, columns=["title", "cf_score"])

    # Merge
    hybrid = pd.merge(cb_recs, cf_recs, on="title", how="outer").fillna(0)

    # Weighted score
    hybrid["hybrid_score"] = (
        alpha * hybrid["cb_score"] + (1 - alpha) * hybrid["cf_score"]
    )

    # Sort
    hybrid = hybrid.sort_values(by="hybrid_score", ascending=False).head(top_n)

    return hybrid[["title", "hybrid_score"]].values.tolist()
