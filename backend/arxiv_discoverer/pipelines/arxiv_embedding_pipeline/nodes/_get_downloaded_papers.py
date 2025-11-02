import pandas as pd 
from pathlib import Path

def get_downloaded_papers_df(downloaded_paper_csv_path : str) -> pd.DataFrame :
    """
    Get a DataFrame of downloaded papers.

    Args:
        file_path (Path): Path to the downloaded papers CSV file. Defaults to DOWNLOADED_PAPERS_CSV_PATH.

    Returns:
        pd.DataFrame | None: DataFrame containing downloaded papers or None if file does not exist.
    """
    if Path(downloaded_paper_csv_path).exists():
        df = pd.read_csv(downloaded_paper_csv_path)
        return df
    else:
        return pd.DataFrame([])
