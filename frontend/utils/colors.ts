// Color utilities
import colorMapping from '../public/data/colors_mapping.json';

const getColorByCategory = (primary_category?: string): string => {
  const colors : Record<string, string> = colorMapping || {};
  const mainCategory = primary_category ? primary_category.split(".")[0] : "";

  return colors[mainCategory || ""] || "#95A5A6";
};

export default getColorByCategory;