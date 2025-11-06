
import React, { useRef } from 'react';


// Point Component
const Point: React.FC<{
  position: [number, number, number];
  id: string;
  color: string;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (hovering: boolean) => void;
}> = ({ position, id, color, isSelected, isHovered,  onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scale = isSelected ? 2.5 : isHovered ? 1.8 : 1;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
      scale={scale}
    >
      <sphereGeometry args={[0.015, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSelected ? 10: isHovered ? 5 : 2.5}
        transparent
        opacity={isSelected ? 1 : 0.85}
      />
    </mesh>
  );
};



export default Point;