import os

def get_file_paths(arxiv_base_path: str, is_loading_pdf: bool = True) -> list:
    """
    Get File paths from downloaded PDFs or their extracted text.

    Args:
        arxiv_base_path (str): Base path to the Arxiv papers directory.
        is_loading_pdf (bool): Flag indicating whether to load PDF files. Defaults to True.

    Returns:
        list: List of file paths.
    """
    file_paths = []
    for dirpath, dirnames, filenames in os.walk(arxiv_base_path):
        for filename in filenames:
            if is_loading_pdf and filename.endswith(".pdf"):
                file_paths.append(os.path.join(dirpath, filename))
            elif not is_loading_pdf and filename.endswith(".txt"):
                file_paths.append(os.path.join(dirpath, filename))
    return file_paths