from pathlib import Path
import pandas as pd 
import arxiv
import logging
from ._get_downloaded_papers import get_downloaded_papers_df
logger = logging.getLogger(__name__)

def download_papers_by_category(categories: list, downloaded_paper_csv_path : str, arxiv_articles_download_base_path : str, max_results: int = 100):
    """
    Download N maximum papers from each categories of a list of arxiv publication category.

    Args:
        categories (list): List of arxiv publication categories.
        max_results (int): Maximum number of papers to download from each category. Defaults to 3.
        download_base_path (str): Base path for downloading papers. Defaults to "./arxiv_papers".
        downloaded_papers_df (None | pd.DataFrame): DataFrame containing information about already downloaded papers. Defaults to None.

    Returns:
        pd.DataFrame: DataFrame containing information about all downloaded papers.
    """

    downloaded_papers_df = get_downloaded_papers_df(downloaded_paper_csv_path)

    new_entries = []
    papers_ids = get_papers_ids(downloaded_papers_df)
    for i, category in enumerate(categories[:10]):
        client = arxiv.Client()

        search = arxiv.Search(
            query = category,
            max_results = max_results,
            sort_by = arxiv.SortCriterion.SubmittedDate
            )


        category_path = Path(arxiv_articles_download_base_path) / category.replace(" ", "_")
        category_path.mkdir(parents=True, exist_ok=True)

        for result in client.results(search):
            if result.entry_id in papers_ids:
                logger.info(f"Paper {result.entry_id} already downloaded. Skipping.")
                continue
            result.download_pdf(dirpath=category_path, filename=f"{result.get_short_id()}.pdf")

            paper_info = {
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
                "pdf_path": str(category_path / f"{result.get_short_id()}.pdf"),
                "txt_path": str(category_path / f"{result.get_short_id()}.txt"),
                "summary" : result.summary
            }

            new_entries.append(paper_info)
            logger.info(f"Downloaded and added paper: {result.title}")

    logger.info(f"Downloaded {max_results} papers for category {i+1}/{len(categories)}: {category}")

    new_df = pd.DataFrame(new_entries)
    if downloaded_papers_df is None or downloaded_papers_df.empty:
        downloaded_papers_df = new_df
    else:
        downloaded_papers_df = pd.concat([downloaded_papers_df, new_df], ignore_index=True)

    downloaded_papers_df["year_published"] = pd.to_datetime(downloaded_papers_df["published"]).dt.year
    
    return downloaded_papers_df

def get_papers_ids(df: pd.DataFrame) -> set:
    if df.empty:
        return set()
    return set(df['entry_id'].tolist())