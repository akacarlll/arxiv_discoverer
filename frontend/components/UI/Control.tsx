// Controls
import { RotateCcw} from 'lucide-react';

const Controls: React.FC<{
  onReset: () => void;
  paperCount: number;
}> = ({ onReset, paperCount }) => {
  return (
    <div className="controls">
      <div className="stats">
        <span>{paperCount} papers</span>
      </div>
      <button onClick={onReset} className="reset-btn">
        <RotateCcw size={18} />
        Reset View
      </button>
    </div>
  );
};

export default Controls