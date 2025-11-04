import numpy as np
import pandas as pd
from pathlib import Path


def merge_embeddings_metadata(
    metadata_df: pd.DataFrame,
    embeddings_dict: dict[str, np.ndarray]
) -> pd.DataFrame:
    """Merge embeddings dataframe with metadata dataframe on 'paper_id' column.

    Args:
        metadata_df (pd.DataFrame): DataFrame containing metadata with 'paper_id' column.
        embeddings_df (pd.DataFrame): DataFrame containing embeddings with 'paper_id' column.

    Returns:
        pd.DataFrame: Merged DataFrame containing both metadata and embeddings.
    """
    embeddings_df = create_embeddings_dataframe(embeddings_dict)
    merged_df = metadata_df.merge(
        embeddings_df, on="paper_id", how="inner"
    )
    try : 
        assert verify_merge(merged_df, metadata_df, embeddings_df), \
            "Merge verification failed: Merged DataFrame does not contain all entries from both DataFrames"
    except AssertionError :
        print(f"Length mismatch between two DataFrames. \nEmbeddings Dataframe length : {len(embeddings_df)} \nMetadata Dataframe length : {len(metadata_df)}")
    
    return merged_df

def verify_merge(merged_df, metadata_csv, embeddings_df) -> bool:
    """Verify that the merged DataFrame contains all entries from both original DataFrames.

    Args:
        merged_df (pd.DataFrame): Merged DataFrame.
        metadata_csv (pd.DataFrame): Original metadata DataFrame.
        embeddings_df (pd.DataFrame): Original embeddings DataFrame.

    Returns:
        bool: True if verification passes, False otherwise.
    """
    metadata_papers_id = set(metadata_csv['paper_id'])
    embeddings_papers_id = set(embeddings_df['paper_id'])
    merged_papers_id = set(merged_df['paper_id'])

    return metadata_papers_id.issubset(merged_papers_id) and embeddings_papers_id.issubset(merged_papers_id)

def create_embeddings_dataframe(embeddings_dict: dict[str, np.ndarray]) -> pd.DataFrame:
    """_summary_

    Args:
        embeddings_dict (dict[str, np.ndarray]): _description_

    Returns:
        pd.DataFrame: _description_
    """

    return pd.DataFrame([
        {'paper_id': k, 'x': v[0], 'y': v[1], 'z': v[2]} 
        for k, v in embeddings_dict.items()
    ])

