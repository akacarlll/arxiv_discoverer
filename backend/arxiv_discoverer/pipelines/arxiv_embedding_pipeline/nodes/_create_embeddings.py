import os
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
import pandas as pd
import tempfile
import numpy as np
import logging


logger = logging.getLogger(__name__)


def create_embeddings(
    downloaded_papers_df: pd.DataFrame, model_path: str, chunk_size: int = 500
) -> dict[str, list[float]]:
    """
    Creates embeddings for papers in chunks, saving them temporarily to disk,
    and automatically cleans up the temporary directory upon completion.

    Args:
        downloaded_papers_df (pd.DataFrame): DataFrame of papers with 'paper_id',
                                             'title', and 'summary' columns.
        model_path (str): Path to the SentenceTransformer model.
        chunk_size (int): Number of embeddings to process and save per batch.

    Returns:
        dict[str, list[float]]: Dictionary mapping paper_id -> embedding vector.
    """
    
    logger.info(f"Creating embeddings for {len(downloaded_papers_df)} papers in chunks of {chunk_size}.")
    

    model = SentenceTransformer(model_path)

    all_paper_ids = downloaded_papers_df["paper_id"].tolist()
    total_papers = len(downloaded_papers_df)
    
    with tempfile.TemporaryDirectory() as temp_dir:
        logger.info(f"Temporary directory created at: {temp_dir}")
        
        num_chunks = (total_papers + chunk_size - 1) // chunk_size # Ceiling division
        
        for chunk_idx in range(num_chunks):
            start_index = chunk_idx * chunk_size
            end_index = min((chunk_idx + 1) * chunk_size, total_papers)
            
            chunk_df = downloaded_papers_df.iloc[start_index:end_index]
            
            logger.info(f"Processing chunk {chunk_idx + 1}/{num_chunks}: papers {start_index + 1} to {end_index}")

            texts_to_encode = [
                f"Title : {row['title']}\n Abstract : {row['summary']}"
                for _, row in chunk_df.iterrows()
            ]

            chunk_embeddings_array = model.encode(texts_to_encode, normalize_embeddings=True)
            
            chunk_ids = chunk_df["paper_id"].tolist()
            
            chunk_data_to_save = dict(zip(chunk_ids, chunk_embeddings_array))

            temp_file_path = os.path.join(temp_dir, f"embeddings_chunk_{chunk_idx}.npy")
            np.save(temp_file_path, chunk_data_to_save) # type: ignore
            
            logger.info(f"Saved {len(chunk_ids)} embeddings to {temp_file_path}")
      
        final_embeddings: dict[str, list[float]] = {}
        logger.info("Consolidating all temporary embedding files...")
        
        for file_name in os.listdir(temp_dir):
            if file_name.endswith(".npy"):
                file_path = os.path.join(temp_dir, file_name)
                loaded_chunk = np.load(file_path, allow_pickle=True).item()
                final_embeddings.update(loaded_chunk)
        
    logger.info("Temporary directory cleaned up.")
    logger.info(f"Created a total of {len(final_embeddings)} embeddings.")

    return final_embeddings
