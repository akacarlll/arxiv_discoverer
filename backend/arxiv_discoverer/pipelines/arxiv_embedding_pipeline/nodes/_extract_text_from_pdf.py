import logging 
import fitz
import pandas as pd
import boto3

logger = logging.getLogger(__name__)

def extract_text_from_pdf(downloaded_papers_df: pd.DataFrame, downloaded_papers_info : dict) -> int:
    """
    Extracts and returns all text from a PDF file.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        str: Extracted text from the entire PDF.
    """
    s3 = boto3.client("s3")
    downloaded_papers_df["len_text"] = 0
    
    for pdf_path in downloaded_papers_df['pdf_path'].tolist():

        s3_object = s3.get_object(Bucket=downloaded_papers_info["aws_bucket_name"], Key=pdf_path)
        pdf_bytes = s3_object["Body"].read()

        text = ""
        with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf:
            for page in pdf:
                text += page.get_text("text") # type : ignore

        downloaded_papers_df.loc[downloaded_papers_df['pdf_path'] == pdf_path, "len_text"] = len(text)

        s3_key = pdf_path.replace(".pdf", ".txt")
        s3.put_object(
            Bucket=downloaded_papers_info["aws_bucket_name"],
            Key=s3_key,            
            Body=text,
            ContentType="text/plain"
        )
        logger.info(f"Extracted text from {pdf_path} to {s3_key}")

    return len(downloaded_papers_df)