// Color utilities
import colorMapping from '../public/data/colors_mapping.json';

const getColorByCategory = (primary_category?: string): string => {
  // Access the nested structure from your generated JSON
  const colors : Record<string, string> = colorMapping || {};
  
  // Return the color for the category, or a default gray if not found
  return colors[primary_category || ""] || "#95A5A6";
};

export default getColorByCategory;