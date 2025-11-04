import React, { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import SceneSetup from "./SceneSetup";
import PointCloud from "./PointCloud";
import { EmbeddingsData } from "../../types";

interface SceneContainerProps {
  data: EmbeddingsData;
  selectedId: string | null;
  onSelectPoint: (id: string | null) => void;
  controlMode: "orbit" | "fly" | "pointer";
}

const SceneContainer: React.FC<SceneContainerProps> = ({
  data,
  selectedId,
  onSelectPoint,
  controlMode
}) => {
  const controlsRef = useRef<any>(null);
  const cameraStartPosition: [number, number, number] = [
    data.metadata.center.x,
    data.metadata.center.y,
    data.metadata.center.z
  ];

  return (
    <Canvas className="canvas">
      <ambientLight intensity={0.5} />
      <SceneSetup
        controlsRef={controlsRef}
        cameraPosition={cameraStartPosition}
        controlMode={controlMode}
        movementSpeed={0.1}
        onCameraMove={() => {}}
      />
      <Suspense fallback={null}>
        <PointCloud
          data={data}
          selectedId={selectedId}
          onSelectPoint={onSelectPoint}
        />
      </Suspense>
    </Canvas>
  );
};

export default SceneContainer;
