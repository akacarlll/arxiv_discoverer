import React, { useState } from "react";
import { Search } from "lucide-react";
import { EmbeddingsData } from "../../types";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  data: EmbeddingsData;
  onTeleport: (position: [number, number, number]) => void; // fonction de téléportation
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, data, onTeleport }) => {
  const [resultCount, setResultCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (!inputValue) {
      setResultCount(0);
      return;
    }

    // Vérifie si l'ID correspond à un article existant
    const coord = data.coordinates.find(c => c.id === inputValue);
    if (coord) {
      // Téléporte vers la position du point
      onTeleport([coord.x, coord.y, coord.z]);
    }

    // Compte le nombre de résultats correspondants à la recherche
    const query = inputValue.toLowerCase();
    const count = data.coordinates.filter(c => {
      const details = data.details[c.id];
      return (
        details.entry_id.toLowerCase().includes(query)
      );
    }).length;

    setResultCount(count);
  };

  return (
    <div className="search-bar">
      <Search size={18} />
      <input
        type="text"
        placeholder="Search papers point by papers url..."
        value={value}
        onChange={handleChange}
      />
      {value && (
        <span className="result-count">{resultCount} results</span>
      )}
    </div>
  );
};

export default SearchBar;
