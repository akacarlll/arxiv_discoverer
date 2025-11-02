// Color utilities
const getColorByCategory = (primary_category?: string): string => {
  const colors: Record<string, string> = {
    "cs.AI": "#FF6B6B",
    "cs.LG": "#4ECDC4",
    "cs.CV": "#45B7D1",
    "cs.CL": "#FFA07A",
    "cs.NE": "#98D8C8",
    "hep-th": "#730303",
    "stat.ME": "#39fa83",
    "math": "#ed5050ff",
    "physics": "#BB8FCE",
    "default": "#95A5A6",
  };
  return colors[primary_category || "default"] || colors.default;
};

export default getColorByCategory