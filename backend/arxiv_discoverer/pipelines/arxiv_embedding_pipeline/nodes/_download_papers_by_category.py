import logging

import arxiv
import pandas as pd
import numpy as np
logger = logging.getLogger(__name__)


def download_papers_by_category(
    downloaded_papers_df : pd.DataFrame, categories: list, max_results: int = 100
):
    """
    Download papers from specified arXiv categories and upload them to S3.

    Args:
        categories (list): List of arXiv publication categories.
        max_results (int): Maximum number of papers to download per category.

    Returns:
        pd.DataFrame: Updated DataFrame containing information about all downloaded papers.
    """

    new_entries = []
    papers_ids = get_papers_ids(downloaded_papers_df)
    for i, category in enumerate(categories[:30]):

        for result in arxiv_search_query(category, max_results):
            if result.entry_id in papers_ids:
                logger.info(f"Paper {result.entry_id} already downloaded. Skipping.")
                continue

            paper_info = extract_paper_info(result)

            new_entries.append(paper_info)
            logger.info(f"Added : {result.title}")

        logger.info(
            f"Downloaded papers for category {i+1}/{len(categories)}: {category}"
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

    return ensure_utf_8_compatibility(downloaded_papers_df), ensure_utf_8_compatibility(downloaded_papers_df)

def encode_to_utf_8(element):
    """
    Ensure the text is UTF-8 compatible.
    Replace or remove problematic characters.
    """
    if not element:
        return element
    elif isinstance(element, str):
        # Encode/decode safely to UTF-8
        return element.encode('utf-8', errors='ignore').decode('utf-8', errors='ignore')
    elif isinstance(element, (list, np.ndarray)):
        # Recursively sanitize each element
        return [encode_to_utf_8(subelement) for subelement in element]


def ensure_utf_8_compatibility(df: pd.DataFrame) -> pd.DataFrame:
    """
    Sanitize all string columns in a DataFrame to be UTF-8 compatible.
    """
    for col in df.columns:
        df[col] = df[col].apply(encode_to_utf_8)
    return df


def extract_paper_info(result) -> dict:
    """
    Extract relevant information from an arXiv paper result.

    Args:
        result: arXiv paper result object.
        category_clean (str): Cleaned category name.

    Returns:
        dict: Dictionary containing extracted paper information.
    """
    if not result.summary :
        logger.info(f"Paper {result.entry_id} has no abstract.")

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
                "summary": result.summary,
                "paper_id": result.get_short_id(),
            }

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
    return safe_results(client, search)

def safe_results(client, search):
    try:
        for r in client.results(search):
            yield r
    except Exception as e:
        print("Error while fetching results:", e)

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
