// PointCloud Component

import { EmbeddingsData } from '../../types';
import getColorByCategory from '../../utils/colors';
import Point from './Point';
import React, { useMemo, useState, useEffect } from "react";
import fetchPaper from '../../hooks/fetchPapersDetails';

const PointCloud: React.FC<{
  data: EmbeddingsData;
  selectedId: string | null;
  onSelectPoint: (id: string | null) => void;
  searchQuery?: string;
}> = ({ data, selectedId, onSelectPoint, searchQuery }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<string, any>>({}); // store fetched metadata

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "m" && hoveredId) {
        const paperDetails = detailsCache[hoveredId];
        if (paperDetails?.pdf_url) {
          window.open(paperDetails.pdf_url, "_blank");
        } else {
          console.warn("Aucun lien PDF pour ce papier :", hoveredId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [hoveredId, detailsCache]);

  const filteredPoints = useMemo(() => {
    if (!searchQuery) return data.coordinates;

    const query = searchQuery.toLowerCase();
    return data.coordinates.filter(coord => {
      const details = detailsCache[coord.id]; // now using fetched details
      return (
        details?.title?.toLowerCase().includes(query) ||
        details?.authors?.join(" ").toLowerCase().includes(query) || // join authors array
        details?.primary_category?.toLowerCase().includes(query)
      );
    });
  }, [data.coordinates, searchQuery, detailsCache]);

  const handleHover = async (hovering: boolean, id: string) => {
    setHoveredId(hovering ? id : null);
    onSelectPoint(hovering ? id : null);

    if (hovering && !detailsCache[id]) {
      // Fetch metadata only if not already cached
      try {
        const paperDetails = await fetchPaper(id); // call API
        setDetailsCache(prev => ({ ...prev, [id]: paperDetails }));
      } catch (err) {
        console.error("Failed to fetch paper details:", id, err);
      }
    }
  };

  return (
    <>
      {filteredPoints.map((coord) => {
        const details = detailsCache[coord.id]; // get metadata from cache
        const color = details ? getColorByCategory(details.primary_category) : "#888"; // default color while loading

        return (
          <Point
            key={coord.id}
            position={[coord.x, coord.y, coord.z]}
            id={coord.id}
            color={color}
            isSelected={selectedId === coord.id}
            isHovered={hoveredId === coord.id}
            onHover={(hovering) => handleHover(hovering, coord.id)}
          />
        );
      })}
    </>
  );
};

export default PointCloud;
