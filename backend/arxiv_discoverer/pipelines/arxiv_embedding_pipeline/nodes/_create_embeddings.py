from tqdm import tqdm
from sentence_transformers import SentenceTransformer
import pickle
import logging 
from .get_file_paths import get_file_paths

logger = logging.getLogger(__name__)

def create_embeddings(download_base_path: str, num_of_papers_processed : int) -> dict[str, list[float]]:
    """
    Creates embeddings for every text file.
    """
    txt_path = get_file_paths(download_base_path, is_loading_pdf=False)

    model = SentenceTransformer("all-MiniLM-L6-v2")

    embeddings = {}
    for path in tqdm(txt_path, desc="Creating embeddings"):
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        emb = model.encode(text, normalize_embeddings=True)
        embeddings[path] = emb

    logger.info(f"Created embeddings for {len(embeddings)} papers.")

    return embeddings