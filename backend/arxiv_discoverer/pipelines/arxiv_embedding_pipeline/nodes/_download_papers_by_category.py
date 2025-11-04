import logging

import arxiv
import boto3
import pandas as pd
import requests

from ._get_downloaded_papers import get_downloaded_papers_df

logger = logging.getLogger(__name__)


def download_papers_by_category(
    downloaded_papers_df : pd.DataFrame, categories: list, downloaded_papers_info: dict, max_results: int = 100
):
    """
    Download papers from specified arXiv categories and upload them to S3.

    Args:
        categories (list): List of arXiv publication categories.
        downloaded_papers_info (dict): Information about the S3 bucket and file paths.
        max_results (int): Maximum number of papers to download per category.

    Returns:
        pd.DataFrame: Updated DataFrame containing information about all downloaded papers.
    """
    s3_instance = boto3.client("s3")

    new_entries = []
    papers_ids = get_papers_ids(downloaded_papers_df)
    for i, category in enumerate(categories):

        category_clean = category.replace(" ", "_")

        for result in arxiv_search_query(category, max_results):
            if result.entry_id in papers_ids:
                logger.info(f"Paper {result.entry_id} already downloaded. Skipping.")
                continue

            pdf_url = result.pdf_url
            response = requests.get(pdf_url)  # type: ignore
            if response.status_code != 200:
                logger.warning(f"Failed to download {pdf_url}")
                continue

            s3_key = f"articles_files/{category_clean}/{result.get_short_id()}.pdf"

            upload_to_s3_bucket(
                s3_instance, response.content, downloaded_papers_info, s3_key
            )

            logger.info(
                f"✅ Uploaded {result.get_short_id()}.pdf to s3://{downloaded_papers_info["aws_bucket_name"]}/{s3_key}"
            )

            paper_info = extract_paper_info(result, category_clean)

            new_entries.append(paper_info)
            logger.info(f"Downloaded and added paper: {result.title}")

        logger.info(
            f"Downloaded {max_results} papers for category {i+1}/{len(categories)}: {category}"
        )

    return update_downloaded_papers_df(downloaded_papers_df, new_entries)


def update_downloaded_papers_df(downloaded_papers_df: pd.DataFrame, new_entries: list) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Update the DataFrame of downloaded papers with new entries.

    Args:
        downloaded_papers_df (pd.DataFrame): Existing DataFrame of downloaded papers.
        new_entries (list): List of new paper entries to add.

    Returns:
        pd.DataFrame: Updated DataFrame with new entries.
    """
    new_df = pd.DataFrame(new_entries)
    if downloaded_papers_df is None or downloaded_papers_df.empty:
        downloaded_papers_df = new_df
    else:
        downloaded_papers_df = pd.concat(
            [downloaded_papers_df, new_df], ignore_index=True
        )

    downloaded_papers_df["year_published"] = pd.to_datetime(
        downloaded_papers_df["published"]
    ).dt.year

    return downloaded_papers_df, downloaded_papers_df

def extract_paper_info(result, category_clean: str) -> dict:
    """
    Extract relevant information from an arXiv paper result.

    Args:
        result: arXiv paper result object.
        category_clean (str): Cleaned category name.

    Returns:
        dict: Dictionary containing extracted paper information.
    """
    return {
                "entry_id": result.entry_id,
                "updated": result.updated,
                "published": result.published,
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "comment": result.comment,
                "journal_ref": result.journal_ref,
                "doi": result.doi,
                "primary_category": result.primary_category,
                "categories": result.categories,
                "links": [link.href for link in result.links],
                "pdf_url": result.pdf_url,
                "pdf_path": f"articles_files/{category_clean}/{result.get_short_id()}.pdf",
                "txt_path": f"articles_files/{category_clean}/{result.get_short_id()}.txt",
                "summary": result.summary,
            }

def upload_to_s3_bucket(
    s3_instance, file_content: bytes, downloaded_papers_info: dict, s3_key: str
) -> None:
    """
    Upload a file to an S3 bucket.

    Args:
        s3_instance: Boto3 S3 client instance.
        file_content (bytes): Content of the file to upload.
        downloaded_papers_info (dict): Information about the S3 bucket.
        s3_key (str): S3 key for the uploaded file.

    Returns:
        None
    """
    s3_instance.put_object(
        Bucket=downloaded_papers_info["aws_bucket_name"],
        Key=s3_key,
        Body=file_content,
        ContentType="application/pdf",
    )


def arxiv_search_query(category: str, max_results: int):
    """
    Perform an arXiv search query for a specific category.

    Args:
        category (str): arXiv category to search.
        max_results (int): Maximum number of results to fetch.

    Returns:
        generator: Generator of arXiv search results.
    """
    client = arxiv.Client()

    search = arxiv.Search(
        query=category,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.SubmittedDate,
    )
    return client.results(search)


def get_papers_ids(df: pd.DataFrame) -> set:
    """
    Retrieve a set of paper IDs from the DataFrame.

    Args:
        df (pd.DataFrame): DataFrame containing paper information.

    Returns:
        set: Set of paper IDs.
    """
    if df.empty:
        return set()
    return set(df["entry_id"].tolist())
