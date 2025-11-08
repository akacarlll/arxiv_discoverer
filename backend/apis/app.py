from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import os

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load metadata once on startup
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))  # go up 2 levels
metadata_file = os.path.join(project_root, "data/03_primary/articles_metadata.json")
with open(metadata_file, "r", encoding="utf-8") as f:
    metadata = json.load(f)


@app.get("/api/paper/{paper_id}")
def get_paper(paper_id: str):
    """
    Return metadata for a single paper by its ID
    """
    paper = metadata.get(paper_id)
    if paper is None:
        raise HTTPException(status_code=404, detail="Paper not found")
    return JSONResponse(paper)
