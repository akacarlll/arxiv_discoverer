// Loading Screen
import React from "react"; 

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading embeddings...</p>
    </div>
  );
};

export default LoadingScreen;
