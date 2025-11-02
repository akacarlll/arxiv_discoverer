// Scene Setup
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

const SceneSetup: React.FC<{ controlsRef: React.RefObject<any> }> = ({ controlsRef }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[2, 2, 2]} fov={60} />
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
      <gridHelper args={[10, 20, '#444444', '#222222']} />
    </>
  );
};

export default SceneSetup