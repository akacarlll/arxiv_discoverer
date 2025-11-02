import { Search } from "lucide-react";
// Search Bar
const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}> = ({ value, onChange, resultCount }) => {
  return (
    <div className="search-bar">
      <Search size={18} />
      <input
        type="text"
        placeholder="Search papers, authors, categories..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <span className="result-count">{resultCount} results</span>
      )}
    </div>
  );
};

export default SearchBar