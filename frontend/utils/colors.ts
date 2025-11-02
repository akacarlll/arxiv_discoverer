// Color utilities
const getColorByCategory = (category?: string): string => {
  const colors: Record<string, string> = {
    'cs.AI': '#FF6B6B',
    'cs.LG': '#4ECDC4',
    'cs.CV': '#45B7D1',
    'cs.CL': '#FFA07A',
    'cs.NE': '#98D8C8',
    'math': '#F7DC6F',
    'physics': '#BB8FCE',
    'default': '#95A5A6'
  };
  return colors[category || 'default'] || colors.default;
};

export default getColorByCategory