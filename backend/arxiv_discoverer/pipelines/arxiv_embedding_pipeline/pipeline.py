from kedro.pipeline import Node, Pipeline

from .nodes import (
    create_embeddings,
    download_papers_by_category,
    extract_text_from_pdf,
    fetch_arxiv_categories,
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
                    "params:aws_bucket_name",
                    "params:max_results_per_category",
                ],
                outputs=["downloaded_papers_df_local", "downloaded_papers_df_aws_s3"],
                name="download_papers_by_category_node",
            ),
            Node(
                func=extract_text_from_pdf,
                inputs=["downloaded_papers_df_local", "params:aws_bucket_name"],
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
