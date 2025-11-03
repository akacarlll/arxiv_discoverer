from pathlib import Path
import logging
from typing import Literal
import boto3
import pandas as pd
import io

logger = logging.getLogger(__name__)

def get_downloaded_papers_df(downloaded_paper_info : dict, loading_type: Literal["local", "aws"] = "aws") -> pd.DataFrame :
    """
    Get a DataFrame of downloaded papers.

    Args:
        file_path (Path): Path to the downloaded papers CSV file. Defaults to DOWNLOADED_PAPERS_CSV_PATH.

    Returns:
        pd.DataFrame | None: DataFrame containing downloaded papers or None if file does not exist.
    """
    if loading_type == "aws":
        return get_downloaded_papers_df_on_aws(bucket_name=downloaded_paper_info["aws_bucket_name"], s3_key=downloaded_paper_info["df_file_name"])
    return get_downloaded_papers_df_local(downloaded_paper_info["downloaded_paper_csv_path"])

def get_downloaded_papers_df_local(downloaded_paper_csv_path : str,) -> pd.DataFrame:
    """
    Get a DataFrame of downloaded papers from a local CSV.

    Args:
        file_path (Path): Path to the downloaded papers CSV file.
    """
    if Path(downloaded_paper_csv_path).exists():
        df = pd.read_csv(downloaded_paper_csv_path)
        logger.info(f"Loaded {len(df)} downloaded papers from {downloaded_paper_csv_path}")
        return df
    else:
        logger.warning(f"No downloaded papers found at {downloaded_paper_csv_path}")
        return pd.DataFrame([])


def get_downloaded_papers_df_on_aws(bucket_name: str, s3_key: str) -> pd.DataFrame:
    """
    Get a DataFrame of downloaded papers from an S3 CSV.

    Args:
        bucket_name (str): Name of the S3 bucket.
        s3_key (str): S3 key of the CSV file.

    Returns:
        pd.DataFrame: DataFrame containing downloaded papers or empty DataFrame if file does not exist.
    """
    s3 = boto3.client("s3")

    try:
        obj = s3.get_object(Bucket=bucket_name, Key=s3_key)
        df = pd.read_csv(io.BytesIO(obj['Body'].read()))
        logger.info(f"Loaded {len(df)} downloaded papers from s3://{bucket_name}/{s3_key}")
        return df
    except s3.exceptions.NoSuchKey:
        logger.warning(f"No downloaded papers found at s3://{bucket_name}/{s3_key}")
        return pd.DataFrame([])
