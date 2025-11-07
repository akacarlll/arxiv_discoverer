// PointSprite.tsx
import React, { useMemo } from "react";
import * as THREE from "three";

const spriteTexture = (() => {
  // crée une tiny texture radial en mémoire (no file)
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grd = ctx.createRadialGradient(
    size/2, size/2, 0,
    size/2, size/2, size/2
  );
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.3, "rgba(255,255,255,0.9)");
  grd.addColorStop(0.6, "rgba(255,255,255,0.2)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0,0,size,size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
})();

type Props = {
  position: [number, number, number];
  id: string;
  color: string;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (hovering: boolean) => void;
};

const PointSprite: React.FC<Props> = ({ position, color, isSelected, isHovered, onHover }) => {
  const scale = isSelected ? 0.06 : isHovered ? 0.045 : 0.03;

  const material = useMemo(() => {
    const mat = new THREE.SpriteMaterial({
      map: spriteTexture,
      color: new THREE.Color(color),
      // additive blending donne l'effet "glow"
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false, // évite artefacts d'ordre
      opacity: isSelected ? 1 : 0.9,
    });
    return mat;
  }, [color, isSelected, isHovered]);

  return (
    <sprite
      position={position}
      scale={[scale, scale, 1]}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
      material={material}
    />
  );
};

export default PointSprite;
