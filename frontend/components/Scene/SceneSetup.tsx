// Scene Setup
import { OrbitControls, PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SceneSetupProps {
  controlsRef: React.RefObject<any>;
  cameraPosition: [number, number, number];
  controlMode?: 'orbit' | 'fly' | 'pointer';
  movementSpeed?: number;
  onCameraMove?: (position: THREE.Vector3, target: THREE.Vector3) => void;
}

const SceneSetup: React.FC<SceneSetupProps> = ({ 
  controlsRef, 
  cameraPosition,
  controlMode = 'orbit',
  movementSpeed = 0.05,
  onCameraMove
}) => {
  const { camera } = useThree();
  const keysPressed = useRef<Set<string>>(new Set());
  const moveState = useRef({
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
    up: 0,
    down: 0
  });

  // Fly controls implementation
  useEffect(() => {
    if (controlMode !== 'fly') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      
      switch(e.key.toLowerCase()) {
        case 'z': moveState.current.forward = 1; break;
        case 's': moveState.current.backward = 1; break;
        case 'q': moveState.current.left = 1; break;
        case 'd': moveState.current.right = 1; break;
        case 'w': moveState.current.down = 1; break;
        case 'e': moveState.current.up = 1; break;
        case 'shift': movementSpeed *= 2; break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
      
      switch(e.key.toLowerCase()) {
        case 'w': moveState.current.forward = 0; break;
        case 's': moveState.current.backward = 0; break;
        case 'a': moveState.current.left = 0; break;
        case 'd': moveState.current.right = 0; break;
        case 'q': moveState.current.down = 0; break;
        case 'e': moveState.current.up = 0; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlMode, movementSpeed]);

  // Animation loop for fly controls
  useEffect(() => {
    if (controlMode !== 'fly') return;

    let animationId: number;
    const animate = () => {
      const direction = new THREE.Vector3();
      const right = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);

      // Get camera's forward and right directions
      camera.getWorldDirection(direction);
      right.crossVectors(direction, up).normalize();

      // Calculate movement
      const movement = new THREE.Vector3();
      
      // Forward/Backward
      movement.add(
        direction.multiplyScalar(
          (moveState.current.forward - moveState.current.backward) * movementSpeed
        )
      );
      
      // Left/Right (strafe)
      movement.add(
        right.multiplyScalar(
          (moveState.current.right - moveState.current.left) * movementSpeed
        )
      );
      
      // Up/Down
      movement.y += (moveState.current.up - moveState.current.down) * movementSpeed;

      // Apply movement
      if (movement.length() > 0) {
        camera.position.add(movement);
        
        if (onCameraMove && controlsRef.current) {
          onCameraMove(camera.position, controlsRef.current.target);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [camera, controlMode, movementSpeed, onCameraMove, controlsRef]);

  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPosition} fov={60} />
      
      {controlMode === 'orbit' && (
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={0.5}
          maxDistance={10}
          onChange={() => {
            if (onCameraMove && controlsRef.current) {
              onCameraMove(camera.position, controlsRef.current.target);
            }
          }}
        />
      )}
      
      {controlMode === 'fly' && (
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.1}
          rotateSpeed={0.5}
        />
      )}
      
      {controlMode === 'pointer' && (
        <PointerLockControls
          ref={controlsRef}
          selector="#canvas-container"
        />
      )}

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
    </>
  );
};

export default SceneSetup;

