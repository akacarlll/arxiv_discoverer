import numpy as np
import pandas as pd
from pathlib import Path


def merge_embeddings_metadata(
    metadata_csv: pd.DataFrame,
    embeddings_dict: dict[str, np.ndarray]
) -> pd.DataFrame:
    """Merge embeddings dataframe with metadata dataframe on 'txt_path' column.

    Args:
        metadata_csv (pd.DataFrame): DataFrame containing metadata with 'txt_path' column.
        embeddings_df (pd.DataFrame): DataFrame containing embeddings with 'txt_path' column.

    Returns:
        pd.DataFrame: Merged DataFrame containing both metadata and embeddings.
    """
    embeddings_df = create_embeddings_dataframe(embeddings_dict)
    absolute_path_embeddings_df = convert_to_absolute_paths(embeddings_df)
    absolute_path_metadata_csv = convert_to_absolute_paths(metadata_csv)
    merged_df = absolute_path_metadata_csv.merge(
        absolute_path_embeddings_df, on="txt_path", how="inner"
    )

    assert verify_merge(merged_df, metadata_csv, embeddings_df), \
        "Merge verification failed: Merged DataFrame does not contain all entries from both DataFrames"
    
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
    metadata_paths = set(metadata_csv['txt_path'].apply(lambda path: Path.resolve(Path(path))))
    embeddings_paths = set(embeddings_df['txt_path'].apply(lambda path: Path.resolve(Path(path))))
    merged_paths = set(merged_df['txt_path'].apply(lambda path: Path.resolve(Path(path))))

    return metadata_paths.issubset(merged_paths) and embeddings_paths.issubset(merged_paths)

def create_embeddings_dataframe(embeddings_dict: dict[str, np.ndarray]) -> pd.DataFrame:
    """_summary_

    Args:
        embeddings_dict (dict[str, np.ndarray]): _description_

    Returns:
        pd.DataFrame: _description_
    """

    return pd.DataFrame([
        {'txt_path': k, 'x': v[0], 'y': v[1], 'z': v[2]} 
        for k, v in embeddings_dict.items()
    ])

def convert_to_absolute_paths(df: pd.DataFrame, column: str = "txt_path") -> pd.DataFrame:
    """_summary_

    Args:
        df (pd.DataFrame): _description_
        column (str, optional): _description_. Defaults to "txt_path".

    Returns:
        pd.DataFrame: _description_
    """
    df[column] = df[column].apply(lambda path: Path.resolve(Path(path)))
    return df