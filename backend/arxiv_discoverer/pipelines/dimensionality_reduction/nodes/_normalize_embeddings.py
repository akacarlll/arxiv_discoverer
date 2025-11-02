import numpy as np
from sklearn.preprocessing import StandardScaler, normalize, MinMaxScaler


normalizer_dict = {
    'standard': StandardScaler(),
    'minmax': MinMaxScaler(),
    'l2': lambda X: normalize(X, norm='l2')
}

def normalize_embeddings(
    embeddings_dict: dict[str, np.ndarray],
    method: str = 'standard'
) -> dict[str, np.ndarray]:
    """
    Normalize embeddings before dimensionality reduction.
    
    Args:
        embeddings_dict: {path: high_dim_vector}
        method: 'standard' (z-score), 'minmax', or 'l2'
    
    Returns:
        {path: normalized_vector}
    """

    paths = list(embeddings_dict.keys())
    vectors = np.array(list(embeddings_dict.values()))
    normalizer = normalizer_dict[method]

    # Handle sklearn scalers vs callable functions
    if callable(normalizer):
        normalized = normalizer(vectors)
    else:
        normalized = normalizer.fit_transform(vectors)

    return {path: normalized[i] for i, path in enumerate(paths)}