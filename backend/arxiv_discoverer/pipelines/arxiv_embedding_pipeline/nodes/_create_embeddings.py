from tqdm import tqdm
from sentence_transformers import SentenceTransformer
import pandas as pd
import logging


logger = logging.getLogger(__name__)


def create_embeddings(
    downloaded_papers_df: pd.DataFrame, model_path: str
) -> dict[str, list[float]]:
    """
    Creates embeddings for every text file stored in S3.

    Args:
        bucket_name (str): Name of the S3 bucket.
        txt_keys (list[str]): List of S3 keys for .txt files.

    Returns:
        dict[str, list[float]]: Dictionary mapping S3 key -> embedding vector.
    """
    logger.info(f"Creating embeddings for {len(downloaded_papers_df)} papers.")
    model = SentenceTransformer(model_path)
    embeddings = {}

    for _, row in tqdm(
        downloaded_papers_df.iterrows(), total=len(downloaded_papers_df)
    ):
        key = row["paper_id"]
        text_to_encode = f"Title : {row["title"]}\n Abstract : {row["summary"]}"
        emb = model.encode(text_to_encode, normalize_embeddings=True)
        embeddings[key] = emb

    logger.info(f"Created embeddings for {len(embeddings)} papers.")

    return embeddings
