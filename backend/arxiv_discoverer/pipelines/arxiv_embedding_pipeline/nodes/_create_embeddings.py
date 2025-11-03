from tqdm import tqdm
from sentence_transformers import SentenceTransformer
import pickle
import pandas as pd
import logging 

logger = logging.getLogger(__name__)

import boto3
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import logging

logger = logging.getLogger(__name__)

def create_embeddings(downloaded_papers_info: dict, num_of_papers_processed : int) -> dict[str, list[float]]:
    """
    Creates embeddings for every text file stored in S3.

    Args:
        bucket_name (str): Name of the S3 bucket.
        txt_keys (list[str]): List of S3 keys for .txt files.

    Returns:
        dict[str, list[float]]: Dictionary mapping S3 key -> embedding vector.
    """
    logger.info(f"Creating embeddings for {num_of_papers_processed} papers.")
    
    txt_keys = get_txt_keys_from_s3(downloaded_papers_info["aws_bucket_name"], downloaded_papers_info["df_file_name"])

    s3 = boto3.client("s3")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = {}

    for key in tqdm(txt_keys, desc="Creating embeddings"):
        try:
            obj = s3.get_object(Bucket=downloaded_papers_info["aws_bucket_name"], Key=key)
            text = obj['Body'].read().decode('utf-8', errors='ignore')
            emb = model.encode(text, normalize_embeddings=True)
            embeddings[key] = emb
        except s3.exceptions.NoSuchKey:
            logger.warning(f"File not found in S3: {key}")
        except Exception as e:
            logger.error(f"Error processing {key}: {e}")

    logger.info(f"Created embeddings for {len(embeddings)} papers.")
    return embeddings

def get_txt_keys_from_s3(bucket_name: str, df_file_key: str) -> list[str]:
    """
    Reads the downloaded papers CSV from S3 and generates the list of .txt S3 keys.

    Args:
        bucket_name (str): Name of the S3 bucket.
        df_file_key (str): S3 key of the CSV containing metadata.

    Returns:
        List[str]: List of S3 keys for all .txt files.
    """
    s3 = boto3.client("s3")

    obj = s3.get_object(Bucket=bucket_name, Key=df_file_key)
    df = pd.read_csv(obj['Body'])

    txt_keys = df['txt_path'].tolist()

    return txt_keys

