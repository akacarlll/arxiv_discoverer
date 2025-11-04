import pandas as pd
import hashlib
from typing import Any


def create_visualization_json(
    embedding_metadata_merged: pd.DataFrame,
    detail_fields: list[str],
    summary_max_length: int = 200,
    calculate_bounds: bool = True,
    add_statistics: bool = True
) -> tuple[dict[str, Any], dict[str, Any]]:
    """
    Create separated JSON structure for visualization
    
    Args:
        df: Merged DataFrame with columns: x, y, z, title, authors, etc.
        detail_fields: List of columns to include in details
        summary_max_length: Maximum length for abstract text
        calculate_bounds: Calculate spatial bounds for x, y, z
        add_statistics: Add metadata statistics
    
    Returns:
        Dictionary ready to be saved as JSON
    """

    df = embedding_metadata_merged.copy()
    df['id'] = df.apply(lambda row: generate_paper_id(row), axis=1)
    
    coordinates = []
    for _, row in df.iterrows():
        coordinates.append({
            'id': row['id'],
            'x': float(row['x']),
            'y': float(row['y']),
            'z': float(row['z'])
        })
    
    details = {}
    for _, row in df.iterrows():
        paper_id = row['id']
        paper_details = {}
        
        for field in detail_fields:
            if field not in df.columns:
                continue
            
            value = row[field]
            
            if pd.isna(value):
                paper_details[field] = None
                continue
            
            if field == 'summary':
                paper_details[field] = truncate_text(value, summary_max_length)
                
            elif field in ['year_published']:
                paper_details[field] = int(value)
            else:
                paper_details[field] = str(value)
        
        details[paper_id] = paper_details
    
    metadata = {
        'total_papers': len(df),
        'date_generated': pd.Timestamp.now().isoformat(),
    }
    
    if calculate_bounds:
        metadata['bounds'] = {
            'x': [float(df['x'].min()), float(df['x'].max())],
            'y': [float(df['y'].min()), float(df['y'].max())],
            'z': [float(df['z'].min()), float(df['z'].max())]
        }
        
        metadata['center'] = {
            'x': float(df['x'].mean()),
            'y': float(df['y'].mean()),
            'z': float(df['z'].mean())
        }
    
    if add_statistics:
        stats = {}
        
        if 'year_published' in df.columns:
            year_valid = df['year_published'].dropna()
            if len(year_valid) > 0:
                stats['year_range'] = [int(year_valid.min()), int(year_valid.max())]
        

        category_counts = df['primary_category'].value_counts().head(10).to_dict()
        stats['top_categories'] = {str(k): int(v) for k, v in category_counts.items()}
        
        stats['available_fields'] = detail_fields
        
        if stats:
            metadata['statistics'] = stats
    result = {
        'coordinates': coordinates,
        'details': details,
        'metadata': metadata
    }
    
    return result, result

def generate_paper_id(row: pd.Series) -> str:
    """
    Generate unique ID for each paper
    
    Args:
        row: DataFrame row
        method: 'hash' (path hash), 'sequential', 'doi'
    
    Returns:
        Unique ID string
    """
    return hashlib.md5(str(row['paper_id']).encode()).hexdigest()
    

def truncate_text(text: str, max_length: int = 200) -> str:
    """Truncate text to max_length, adding ellipsis if needed"""
    if pd.isna(text):
        return ""
    text = str(text).strip()
    if len(text) <= max_length:
        return text
    return text[:max_length].rsplit(' ', 1)[0] + '...'