import { PaperDetails } from "../../types";
import getColorByCategory from "../../utils/colors";
import { X } from 'lucide-react';
import React, { useEffect, useState } from "react";
import fetchPaper from '../../hooks/fetchPapersDetails';

const InfoPanel: React.FC<{
  paperId: string | null;
  onClose: () => void;
}> = ({ paperId, onClose }) => {
  const [paper, setPaper] = useState<PaperDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!paperId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await fetchPaper(paperId);
        setPaper(data);
      } catch (err) {
        console.error("Failed to fetch paper details:", paperId, err);
        setPaper(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [paperId]);

  if (!paperId) return null;

  if (loading) {
    return (
      <div className="info-panel">
        <div className="info-header">
          <h2>Loading paper details...</h2>
        </div>
      </div>
    );
  }

  if (!paper) return null;

  return (
    <div className="info-panel">
      <div className="info-header">
        <h2>Paper Details</h2>
        <button onClick={onClose}><X /></button>
      </div>
      <div className="info-content">
        <h3>{paper.title}</h3>
        <p className="authors"><strong>Authors:</strong> {paper.authors}</p>
        {paper.year && <p><strong>Year:</strong> {paper.year}</p>}
        {paper.primary_category && (
          <p>
            <strong>Category:</strong>{' '}
            <span
              className="category-badge"
              style={{ backgroundColor: getColorByCategory(paper.primary_category) }}
            >
              {paper.primary_category}
            </span>
          </p>
        )}
        {paper.abstract && (
          <>
            <h4>Abstract</h4>
            <p className="abstract">{paper.abstract}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;