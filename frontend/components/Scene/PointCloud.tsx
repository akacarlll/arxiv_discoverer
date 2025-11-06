// PointCloud Component

import React, { useState, useMemo } from 'react';
import { EmbeddingsData } from '../../types';
import getColorByCategory from '../../utils/colors';
import Point from './Point';

const PointCloud: React.FC<{
  data: EmbeddingsData;
  selectedId: string | null;
  onSelectPoint: (id: string | null) => void;
  searchQuery?: string;
}> = ({ data, selectedId, onSelectPoint, searchQuery }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredPoints = useMemo(() => {
    if (!searchQuery) return data.coordinates;
    
    const query = searchQuery.toLowerCase();
    return data.coordinates.filter(coord => {
      const details = data.details[coord.id];
      return (
        details?.title?.toLowerCase().includes(query) ||
        details?.authors?.toLowerCase().includes(query) ||
        details?.primary_category?.toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery]);

  return (
    <>
      {filteredPoints.map((coord) => {
        const details = data.details[coord.id];
        const color = getColorByCategory(details.primary_category);
        console.log(details.primary_category)
        
        return (
          <Point
            key={coord.id}
            position={[coord.x, coord.y, coord.z]}
            id={coord.id}
            color={color}
            isSelected={selectedId === coord.id}
            isHovered={hoveredId === coord.id}
            onClick={() => onSelectPoint(coord.id)}
            onHover={(hovering) => setHoveredId(hovering ? coord.id : null)}
          />
        );
      })}
    </>
  );
};

export default PointCloud