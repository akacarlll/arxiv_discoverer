

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

import LoadingScreen from "./components/UI/LoadingScreen.tsx";
import { EmbeddingsData, PaperDetails, Coordinate} from "./types/index.ts"
import SearchBar from './components/UI/SearchBar.tsx';
import Controls from './components/UI/Control.tsx';
import SceneSetup from './components/Scene/SceneSetup.tsx';
import PointCloud from './components/Scene/PointCloud.tsx';
import InfoPanel from './components/UI/InfoPanel.tsx';
import getColorByCategory from './utils/colors.ts';
import NavigationControls from './components/Scene/NavigationControl.tsx';

// Main App
const App: React.FC = () => {
  const [data, setData] = useState<EmbeddingsData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);
  const [controlMode, setControlMode] = useState<'orbit' | 'fly' | 'pointer'>('orbit');


  useEffect(() => {
    fetch('/data/viz_data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);


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

  const categories : Array<string> = Object.keys(data.metadata.statistics.top_categories);
  const cameraStartPosition: [number, number, number] = data
    ? [data.metadata.center.x, data.metadata.center.y, data.metadata.center.z]
    : [2,2,2]

  return (
    <div className="app">
      <div className="header">
        <h1>ArXiv Embeddings 3D Explorer</h1>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={filteredCount}
        />
      </div>

      <Controls onReset={handleReset} paperCount={data.coordinates.length} />
      
      <NavigationControls 
        currentMode={controlMode}
        onModeChange={setControlMode}
      />
      <Canvas className="canvas">
        <SceneSetup
        controlsRef={controlsRef}
        cameraPosition={cameraStartPosition}
        controlMode={controlMode}
        movementSpeed={0.1}
        onCameraMove={(pos, target) => {
          // Optional: Update UI, load nearby papers, etc.
        }}
      />
        <Suspense fallback={null}>
          <PointCloud
            data={data}
            selectedId={selectedId}
            onSelectPoint={setSelectedId}
            searchQuery={searchQuery}
          />
        </Suspense>
      </Canvas>

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