import colorsys
from typing import Dict


def get_domain(category: str) -> str:  # type: ignore
    """
    Extract domain prefix from ArXiv category.
    e.g., "cs.CV" -> "cs", "astro-ph.GA" -> "astro-ph"
    """
    return category.split('.')[0]


def hash_string(s: str) -> int:
    """Generate a consistent hash for a string."""
    hash_val = 0
    for char in s:
        hash_val = ((hash_val << 5) - hash_val) + ord(char)
        hash_val = hash_val & 0xFFFFFFFF  # Convert to 32-bit integer
    return abs(hash_val)


def hsl_to_hex(h: float, s: float, l: float) -> str:
    """
    Convert HSL color to hex format.
    h: 0-360, s: 0-100, l: 0-100
    """
    h = h / 360.0
    s = s / 100.0
    l = l / 100.0
    
    r, g, b = colorsys.hls_to_rgb(h, l, s)

    r = int(round(r * 255))
    g = int(round(g * 255))
    b = int(round(b * 255))
    
    return f"#{r:02x}{g:02x}{b:02x}"


def get_category_color(category: str, saturation: int = 70, lightness: int = 55) -> str:
    """
    Generate hex color for a category with hierarchical awareness.
    Categories with the same base domain get similar colors.
    
    Args:
        category: ArXiv category (e.g., 'cs.CV', 'math.CO')
        saturation: Base saturation percentage (0-100)
        lightness: Base lightness percentage (0-100)
    
    Returns:
        Hex color string (e.g., "#3498db")
    """
    domain = get_domain(category)
    base_hue = DOMAIN_BASE_HUES[domain]
    
    if category == domain or '.' not in category:
        return hsl_to_hex(base_hue, saturation, lightness)
    
    subcategory = '.'.join(category.split('.')[1:])
    hash_val = hash_string(subcategory)
    
    hue_variation = (hash_val % 60) - 30
    final_hue = (base_hue + hue_variation + 360) % 360
    
    sat_variation = (hash_val % 20) - 10
    final_sat = max(50, min(90, saturation + sat_variation))
    
    return hsl_to_hex(final_hue, final_sat, lightness)


def generate_category_colors(vizualisation_json: Dict) -> Dict:
    """
    Generate color palette from metadata JSON.
    
    Args:
        vizualisation_json: Dictionary with structure:
            {
                "metadata": {
                    "statistics": {
                        "ordered_top_categories": {
                            "cs.CV": 101,
                            "cs.LG": 82,
                            ...
                        }
                    }
                }
            }
    
    Returns:
        dict : The ordered_top_categories dict with the values replaced by colors.
    """
    categories = vizualisation_json['metadata']['statistics']['ordered_top_categories']
    
    color_map = {}
    for category in categories.keys():
        color_map[category] = get_category_color(category)
    
    return color_map

DOMAIN_BASE_HUES = {
    'cs': 210,        # Blue
    'math': 270,      # Purple
    'physics': 30,    # Orange
    'quant-ph': 180,  # Cyan
    'stat': 120,      # Green
    'econ': 330,      # Pink
    'cond-mat': 60,   # Yellow
    'astro-ph': 240,  # Indigo
    'q-bio': 150,     # Teal
    'eess': 195,      # Light Blue
    'hep': 15,        # Red-Orange
    'gr-qc': 285,     # Violet
    'q-fin': 345,     # Magenta
    'nlin': 75,       # Yellow-Green
    'nucl': 45        # Amber
}
