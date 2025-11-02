import numpy as np
from sklearn.decomposition import PCA
import umap
import warnings
warnings.filterwarnings('ignore')
import logging 

logger = logging.getLogger(__name__)

def reduce_umap(
    embeddings_dict: dict[str, np.ndarray],
    n_neighbors: int = 15,
    min_dist: float = 0.1,
    metric: str = 'cosine',
    random_state: int = 42
) -> dict[str, np.ndarray]:
    """
    UMAP - Uniform Manifold Approximation and Projection
    
    BEST FOR: General purpose visualization, preserves both local and global structure
    SPEED: Fast (minutes for 10k samples)
    QUALITY: Excellent balance
    
    Args:
        embeddings_dict: {path: high_dim_vector}
        n_neighbors: Balance local vs global structure (5-50, default 15)
                    - Lower: focuses on local structure
                    - Higher: preserves more global structure
        min_dist: Minimum distance between points (0.0-0.99, default 0.1)
                 - Lower: tighter clusters
                 - Higher: more spread out
        metric: Distance metric ('cosine', 'euclidean', 'manhattan')
        random_state: For reproducibility
    
    Returns:
        {path: 3d_coordinates}
    """
    paths = list(embeddings_dict.keys())
    vectors = np.array(list(embeddings_dict.values()))
    
    reducer = umap.UMAP(
        n_components=3,
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        metric=metric,
        random_state=random_state,
        n_jobs=-1  
    )
    
    reduced = reducer.fit_transform(vectors)
    
    return {path: reduced[i] for i, path in enumerate(paths)}

def reduce_pca(
    embeddings_dict: dict[str, np.ndarray],
    whiten: bool = False,
    random_state: int = 42
) -> dict[str, np.ndarray]:
    """
    PCA - Principal Component Analysis
    
    BEST FOR: Quick baseline, understanding linear structure, very large datasets
    SPEED: Very fast (seconds for 100k samples)
    QUALITY: Only captures linear relationships, may miss complex structure
    
    Args:
        embeddings_dict: {path: high_dim_vector}
        whiten: Whether to normalize components (usually False for visualization)
        random_state: For reproducibility
    
    Returns:
        ({path: 3d_coordinates}, variance_explained_ratio)
    """
    paths = list(embeddings_dict.keys())
    vectors = np.array(list(embeddings_dict.values()))
    
    reducer = PCA(
        n_components=3,
        whiten=whiten,
        random_state=random_state
    )
    
    reduced = reducer.fit_transform(vectors)
    variance_explained = reducer.explained_variance_ratio_.sum()
    
    result_dict = {path: reduced[i] for i, path in enumerate(paths)}
    
    print(f"PCA: {variance_explained:.2%} variance explained by 3 components")
    
    return result_dict

def reduce_pca_umap(
    embeddings_dict: dict[str, np.ndarray],
    pca_components: int = 50,
    n_neighbors: int = 15,
    min_dist: float = 0.1,
    random_state: int = 42
) -> dict[str, np.ndarray]:
    """
    Hybrid approach: PCA preprocessing + UMAP
    
    BEST FOR: Very high-dimensional data (>500 dims), speeds up UMAP
    SPEED: Faster than pure UMAP
    QUALITY: Nearly as good as pure UMAP, sometimes better
    
    Args:
        embeddings_dict: {path: high_dim_vector}
        pca_components: Reduce to this many dimensions first (50-100)
        n_neighbors: UMAP parameter
        min_dist: UMAP parameter
        random_state: For reproducibility
    
    Returns:
        {path: 3d_coordinates}
    """
    paths = list(embeddings_dict.keys())
    vectors = np.array(list(embeddings_dict.values()))
    
    pca = PCA(n_components=pca_components, random_state=random_state)
    vectors_pca = pca.fit_transform(vectors)
    
    print(f"PCA: Reduced {vectors.shape[1]} → {pca_components} dims, "
          f"{pca.explained_variance_ratio_.sum():.2%} variance retained")
    
    reducer = umap.UMAP(
        n_components=3,
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        metric='cosine',
        random_state=random_state,
        n_jobs=-1
    )
    
    reduced = reducer.fit_transform(vectors_pca)
    
    return {path: reduced[i] for i, path in enumerate(paths)}

reducers = {
        'umap': reduce_umap,
        'pca': reduce_pca,
        'pca_umap': reduce_pca_umap
}

def reduce_vectors_dimensionality(embeddings_dict: dict[str, np.ndarray], method_params: dict) -> dict[str, np.ndarray]:
    """
    Reduce high-dimensional vectors to 3D using specified method.
    
    Args:
        embeddings_dict: {path: high_dim_vector}
        method: Dimensionality reduction method ('umap', 'pca', 'pca_umap')
        method_params: Parameters for the chosen method
    
    Returns:
        dict[str, np.ndarray]: A dict with paths as keys and 3D vectors as values
    """

    reducer = reducers[method_params["dimensionality_reduction_method"]]
    return reducer(embeddings_dict, **method_params["dimensionality_reduction_params"])

