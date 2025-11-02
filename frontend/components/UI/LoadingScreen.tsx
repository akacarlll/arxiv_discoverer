import React from "react";
import styles from "./LoadingScreen.module.css";

const LoadingScreen: React.FC = () => {
  return (
    <div className={styles.container}>
      <div>Loading Embeddings</div>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default LoadingScreen;
