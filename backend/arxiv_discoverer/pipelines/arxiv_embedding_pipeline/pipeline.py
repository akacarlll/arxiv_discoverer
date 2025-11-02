from kedro.pipeline import Node, Pipeline

from .nodes import (
    create_embeddings,
    download_papers_by_category,
    extract_text_from_pdf,
    fetch_arxiv_categories,
    get_downloaded_papers_df,
)


def create_pipeline() -> Pipeline:
    return Pipeline(
        [
            Node(
                func=fetch_arxiv_categories,
                inputs=None,
                outputs="categories_list",
                name="fetch_arxiv_categories_node",
            ),
            Node(
                func=download_papers_by_category,
                inputs=[
                    "categories_list",
                    "params:downloaded_paper_csv_path",
                    "params:arxiv_articles_download_base_path",
                    "params:max_results_per_category",
                ],
                outputs="downloaded_papers_df",
                name="download_papers_by_category_node",
            ),
            Node(
                func=extract_text_from_pdf,
                inputs=["params:arxiv_articles_download_base_path", "downloaded_papers_df"],
                outputs="num_of_papers_processed",
                name="extract_text_from_pdf_node",
            ),
            Node(
                func=create_embeddings,
                inputs=[
                    "params:arxiv_articles_download_base_path",
                    "num_of_papers_processed",
                ],
                outputs="arxiv_embeddings_dict",
                name="create_embeddings_node",
            ),
        ]
    )
