// Info Panel
import { PaperDetails, Coordinate } from "../../types";
import getColorByCategory from "../../utils/colors";
import { X } from 'lucide-react';

const InfoPanel: React.FC<{
  paperId: string | null;
  details: Record<string, PaperDetails>;
  onClose: () => void;
}> = ({ paperId, details, onClose }) => {
  if (!paperId) return null;

  const paper = details[paperId];
  if (!paper) return null;

  return (
    <div className="info-panel">
      <div className="info-header">
        <h2>Paper Details</h2>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
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

export default InfoPanel