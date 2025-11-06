

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';

import LoadingScreen from "./components/UI/LoadingScreen.tsx";
import SearchBar from './components/UI/SearchBar.tsx';
import Controls from './components/UI/Control.tsx';
import InfoPanel from './components/UI/InfoPanel.tsx';
import getColorByCategory from './utils/colors.ts';
import { useEmbeddingsData } from './hooks/useEmbeddingsData.ts';
import SceneContainer from './components/Scene/SceneContainer.tsx';
import IntroModal from './components/UI/IntroModal.tsx';


const INTRO_STORAGE_KEY = "apev:skipIntro";
type ControlMode = "orbit" | "fly";

// Main App
const App: React.FC = () => {
  const { data, loading, error } = useEmbeddingsData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const controlsRef = useRef<any>(null);
  const [controlMode, setControlMode] = useState<ControlMode>("orbit");


  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(INTRO_STORAGE_KEY);
      return stored !== "true";
    } catch {
      return true;
    }
  });
  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setSelectedId(null);
    setSearchQuery('');
  };

  const filteredCount = useMemo(() => {
    if (!data || !searchQuery) return data?.coordinates.length || 0;
    const query = searchQuery.toLowerCase();
    return data.coordinates.filter(coord => {
      const details = data.details[coord.id];
      return (
        details?.title?.toLowerCase().includes(query) ||
        details?.authors?.toLowerCase().includes(query) ||
        details?.primary_category?.toLowerCase().includes(query)
      );
    }).length;
  }, [data, searchQuery]);

  if (loading) return <LoadingScreen />;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data) return <div className="error">No data loaded</div>;

  const categories : Array<string> = Object.keys(data.metadata.statistics.ordered_top_ten_categories);

  const handleStartFromIntro = (mode: ControlMode, dontShowAgain: boolean) => {
    setControlMode(mode);
    setShowIntro(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem(INTRO_STORAGE_KEY, "true");
      } catch {
        // ignore storage errors
      }
    }
  };

  return (
    <div className="app">
      <IntroModal
        defaultMode={controlMode}
        onStart={handleStartFromIntro}
        show={showIntro}
      />
      <div className="header">
        <h1>ArXiv Embeddings 3D Explorer</h1>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={filteredCount}
        />
      </div>

      <Controls onReset={handleReset} paperCount={data.coordinates.length} />
      
      <SceneContainer
        data={data}
        selectedId={selectedId}
        onSelectPoint={setSelectedId}
        controlMode={controlMode}
      />

      <InfoPanel
        paperId={selectedId}
        details={data.details}
        onClose={() => setSelectedId(null)}
      />

      <div className="legend">
        <h4>Categories</h4>
        <div className="legend-items">
          {categories.map(cat => (
            <div key={cat} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: getColorByCategory(cat) }}
              ></span>
              <span>{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;