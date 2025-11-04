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
                func=get_downloaded_papers_df,
                inputs="params:downloaded_papers_info",
                outputs="downloaded_papers_df_previous_iteration",
                name="get_downloaded_papers_df_node",
            ),
            Node(
                func=download_papers_by_category,
                inputs=[
                    "downloaded_papers_df_previous_iteration",
                    "categories_list",
                    "params:max_results_per_category",
                ],
                outputs=["downloaded_papers_df_local", "downloaded_papers_df_aws_s3"],
                name="download_papers_by_category_node",
            ),
            Node(
                func=create_embeddings,
                inputs=[
                    "downloaded_papers_df_local",
                    "params:model_path"
                ],
                outputs="arxiv_embeddings_dict",
                name="create_embeddings_node",
            ),
        ]
    )
