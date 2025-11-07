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
  movementSpeed = 0.01,
  onCameraMove
}) => {
  const { camera } = useThree();
  const moveState = useRef({
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
    up: 0,
    down: 0
  });
  const isShiftPressed = useRef(false);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("input")) {
        controlsRef.current?.unlock(); // déverrouille le pointer
      }
    };
    window.addEventListener("mousedown", handleMouseDown);
    return () => window.removeEventListener("mousedown", handleMouseDown);
  }, []);


  // 🔹 Keyboard movement logic
  useEffect(() => {
    if (controlMode !== 'fly') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'z': moveState.current.forward = 1; break;
        case 's': moveState.current.backward = 1; break;
        case 'q': moveState.current.left = 1; break;
        case 'd': moveState.current.right = 1; break;
        case 'e': moveState.current.down = 1; break;
        case 'a': moveState.current.up = 1; break;
        case 'shift': isShiftPressed.current = true; break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'z': moveState.current.forward = 0; break;
        case 's': moveState.current.backward = 0; break;
        case 'q': moveState.current.left = 0; break;
        case 'd': moveState.current.right = 0; break;
        case 'e': moveState.current.down = 0; break;
        case 'a': moveState.current.up = 0; break;
        case 'shift': isShiftPressed.current = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlMode]);

  // 🔹 Animation loop for Fly movement
  useEffect(() => {
    if (controlMode !== 'fly') return;

    let animationId: number;
    let prevTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = (now - prevTime) / 1000; // seconds
      prevTime = now;

      const direction = new THREE.Vector3();
      const right = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);

      camera.getWorldDirection(direction);
      right.crossVectors(direction, up).normalize();

      const moveVec = new THREE.Vector3();

      // Adjust speed dynamically
      const speed = (isShiftPressed.current ? movementSpeed * 2.5 : movementSpeed) * delta * 60;

      // Forward/Backward
      moveVec.add(direction.clone().multiplyScalar(
        (moveState.current.forward - moveState.current.backward) * speed
      ));

      // Left/Right
      moveVec.add(right.clone().multiplyScalar(
        (moveState.current.right - moveState.current.left) * speed
      ));

      // Up/Down
      moveVec.y += (moveState.current.up - moveState.current.down) * speed;

      // Apply movement
      if (moveVec.lengthSq() > 0) {
        camera.position.add(moveVec);
        if (onCameraMove && controlsRef.current) {
          onCameraMove(camera.position, controlsRef.current.target ?? new THREE.Vector3());
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [camera, controlMode, movementSpeed, onCameraMove, controlsRef]);

  return (
    <>
      {/* Main camera */}
      <PerspectiveCamera makeDefault position={cameraPosition} fov={90} />

      {/* Orbit mode */}
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

      {/* True Fly mode with mouse look */}
      {controlMode === 'fly' && (
        <PointerLockControls ref={controlsRef} />
      )}

      {/* Basic lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
    </>
  );
};

export default SceneSetup;
