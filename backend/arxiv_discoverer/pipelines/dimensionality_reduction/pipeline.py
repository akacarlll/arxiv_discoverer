from kedro.pipeline import Node, Pipeline, node, pipeline  # noqa
from .nodes import (
    reduce_vectors_dimensionality,
    merge_embeddings_metadata,
    create_visualization_json
)

def create_pipeline() -> Pipeline:
    return pipeline([
        node(
            func=reduce_vectors_dimensionality,
            inputs=["arxiv_embeddings_dict", "params:dimensionality_reduction_params_umap"],
            outputs="reduced_embeddings_dict",
            name="reduce_vectors_dimensionality_node"
        ),
        node(
            func=merge_embeddings_metadata,
            inputs=["downloaded_papers_df_local", "reduced_embeddings_dict"],
            outputs="merged_embeddings_metadata_dict",
            name="merge_embeddings_metadata_node"
        ),
        node(
            func=create_visualization_json,
            inputs=["merged_embeddings_metadata_dict", "params:detail_fields"],
            outputs=["visualization_json_local","visualization_json_aws_s3"],
            name="create_visualization_json_node"
        )
    ])
