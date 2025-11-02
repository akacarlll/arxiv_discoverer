import logging 
import fitz
from .get_file_paths import get_file_paths
import pandas as pd
logger = logging.getLogger(__name__)

def extract_text_from_pdf(download_base_path: str, downloaded_papers_df: pd.DataFrame) -> int:
    """
    Extracts and returns all text from a PDF file.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        str: Extracted text from the entire PDF.
    """
    # pdf_paths = get_file_paths(download_base_path)
    
    for pdf_path in downloaded_papers_df['pdf_path'].tolist():
        text = ""
        with fitz.open(pdf_path) as pdf:
            for page in pdf:
                text += page.get_text("text") # type: ignore
        txt_path = pdf_path.replace(".pdf", ".txt")
        with open(txt_path, "w", encoding="utf-8") as txt_file:
            txt_file.write(text)
        logger.info(f"Extracted text from {pdf_path} to {txt_path}")
        
    return len(downloaded_papers_df)