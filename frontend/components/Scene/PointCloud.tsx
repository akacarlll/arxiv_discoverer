import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EmbeddingsData } from '../../types';
import getColorByCategory from '../../utils/colors';

// Create sprite texture once (same as original Point component)
const spriteTexture = (() => {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grd = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.3, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.6, 'rgba(255,255,255,0.2)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
})();

const PointCloud: React.FC<{
  data: EmbeddingsData;
  selectedId: string | null;
  onSelectPoint: (id: string | null) => void;
  searchQuery?: string;
}> = ({ data, selectedId, onSelectPoint, searchQuery }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { camera, raycaster, pointer, gl } = useThree();

  // Filter points based on search query
  const filteredPoints = useMemo(() => {
    if (!searchQuery) return data.coordinates;

    const query = searchQuery.toLowerCase();
    return data.coordinates.filter(coord => {
      const details = data.details[coord.id];
      return (
        details?.title?.toLowerCase().includes(query) ||
        details?.authors?.toLowerCase().includes(query) ||
        details?.primary_category?.toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery]);

  // Create a lookup map: instanceId -> paper id
  const instanceIdToPointId = useMemo(() => {
    const map = new Map<number, string>();
    filteredPoints.forEach((coord, idx) => {
      map.set(idx, coord.id);
    });
    return map;
  }, [filteredPoints]);

  // Create geometry (PlaneGeometry for sprites) and material with sprite texture
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  
  const material = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      map: spriteTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    return mat;
  }, []);

  // Populate instance matrices and colors
  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    const baseScale = 0.03;

    filteredPoints.forEach((coord, i) => {
      const details = data.details[coord.id];
      const categoryColor = getColorByCategory(details.primary_category);

      // Set position and base scale
      matrix.makeScale(baseScale, baseScale, baseScale);
      matrix.setPosition(coord.x, coord.y, coord.z);
      mesh.setMatrixAt(i, matrix);

      // Set color
      color.set(categoryColor);
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [filteredPoints, data.details]);

  // Update scale and opacity for selected/hovered points
  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const matrix = new THREE.Matrix4();
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();

    filteredPoints.forEach((coord, i) => {
      const isSelected = selectedId === coord.id;
      const isHovered = hoveredId === coord.id;
      
      // Use same scale values as original Point component
      const scaleValue = isSelected ? 0.06 : isHovered ? 0.045 : 0.03;

      mesh.getMatrixAt(i, matrix);
      matrix.decompose(position, quaternion, scale);
      
      // Apply new scale
      scale.setScalar(scaleValue);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [filteredPoints, selectedId, hoveredId]);

  // Make sprites always face the camera
  useFrame(() => {
    if (!meshRef.current) return;

    // Update all instances to face camera
    const mesh = meshRef.current;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();

    // Get camera quaternion
    const cameraQuaternion = camera.quaternion.clone();

    filteredPoints.forEach((coord, i) => {
      mesh.getMatrixAt(i, matrix);
      matrix.decompose(position, quaternion, scale);
      
      // Apply camera rotation so sprite faces camera
      matrix.compose(position, cameraQuaternion, scale);
      mesh.setMatrixAt(i, matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;

    // Handle raycasting for hover/click detection
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(mesh);

    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId;
      if (instanceId !== undefined) {
        const pointId = instanceIdToPointId.get(instanceId);
        if (pointId && pointId !== hoveredId) {
          setHoveredId(pointId);
          onSelectPoint(pointId);
        }
      }
    } else if (hoveredId) {
      setHoveredId(null);
      onSelectPoint(null);
    }
  });

  // Handle keyboard shortcut (M key to open PDF)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'm' && hoveredId) {
        const paperDetails = data.details[hoveredId];
        if (paperDetails?.pdf_url) {
          window.open(paperDetails.pdf_url, '_blank');
        } else {
          console.warn('Aucun lien PDF pour ce papier :', hoveredId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hoveredId, data.details]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, filteredPoints.length]}
      frustumCulled={true}
    />
  );
};

export default PointCloud;