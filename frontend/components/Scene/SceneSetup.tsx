// Scene Setup
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

interface SceneSetupProps {
  controlsRef: React.RefObject<any>;
  cameraPosition: [number, number, number];
}

const SceneSetup: React.FC<SceneSetupProps> = ({ controlsRef, cameraPosition }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPosition} fov={60} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={10}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
    </>
  );
};
export default SceneSetup