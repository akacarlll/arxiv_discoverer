

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

// Main App
const App: React.FC = () => {
  const [data, setData] = useState<EmbeddingsData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // For demo purposes, create sample data
    const sampleData: EmbeddingsData = {
      coordinates: Array.from({ length: 200 }, (_, i) => ({
        id: `paper_${i}`,
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
      })),
      details: Object.fromEntries(
        Array.from({ length: 200 }, (_, i) => [
          `paper_${i}`,
          {
            title: `Research Paper ${i + 1}: ${['Deep Learning', 'Neural Networks', 'Computer Vision', 'NLP', 'Reinforcement Learning'][i % 5]}`,
            authors: `Author ${i + 1} et al.`,
            year: 2020 + (i % 5),
            category: ['cs.AI', 'cs.LG', 'cs.CV', 'cs.CL', 'cs.NE'][i % 5],
            abstract: `This is a sample abstract for paper ${i + 1}. It explores various aspects of artificial intelligence and machine learning.`,
          },
        ])
      ),
      metadata: {},
    };

    // Simulate loading
    setTimeout(() => {
      setData(sampleData);
      setLoading(false);
    }, 1000);

    // In production, use:
    // fetch('/data/embeddings.json')
    //   .then(res => res.json())
    //   .then(setData)
    //   .catch(err => setError(err.message))
    //   .finally(() => setLoading(false));
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
        details?.category?.toLowerCase().includes(query)
      );
    }).length;
  }, [data, searchQuery]);

  if (loading) return <LoadingScreen />;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data) return <div className="error">No data loaded</div>;

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

      <Canvas className="canvas">
        <SceneSetup controlsRef={controlsRef} />
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
          {['cs.AI', 'cs.LG', 'cs.CV', 'cs.CL', 'cs.NE'].map(cat => (
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

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0a0e27;
          color: #fff;
          overflow: hidden;
        }

        .app {
          width: 100vw;
          height: 100vh;
          position: relative;
        }

        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 20px;
          background: rgba(10, 14, 39, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 30px;
        }

        h1 {
          font-size: 24px;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .search-bar {
          flex: 1;
          max-width: 500px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 15px;
        }

        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 14px;
          outline: none;
        }

        .search-bar input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .result-count {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .controls {
          position: absolute;
          top: 100px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 10;
        }

        .stats {
          background: rgba(10, 14, 39, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }

        .reset-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.4);
          color: #667eea;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          background: rgba(102, 126, 234, 0.3);
          transform: translateY(-2px);
        }

        .canvas {
          width: 100%;
          height: 100%;
        }

        .info-panel {
          position: absolute;
          top: 100px;
          left: 20px;
          width: 400px;
          max-height: calc(100vh - 140px);
          background: rgba(10, 14, 39, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          z-index: 10;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-header h2 {
          font-size: 18px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .info-content {
          padding: 20px;
          overflow-y: auto;
          max-height: calc(100vh - 220px);
        }

        .info-content h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          line-height: 1.4;
        }

        .info-content h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 15px 0 10px;
          color: rgba(255, 255, 255, 0.8);
        }

        .info-content p {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 12px;
        }

        .authors {
          color: rgba(255, 255, 255, 0.6);
        }

        .category-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          color: #fff;
        }

        .abstract {
          font-size: 13px;
          line-height: 1.7;
        }

        .legend {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(10, 14, 39, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 15px;
          z-index: 10;
        }

        .legend h4 {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.8);
        }

        .legend-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .loading-screen, .error {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;