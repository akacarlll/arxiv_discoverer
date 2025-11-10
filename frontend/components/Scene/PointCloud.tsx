import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EmbeddingsData } from '../../types';
import getColorByCategory from '../../utils/colors';

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

  // Create geometry and material once
  const geometry = useMemo(() => new THREE.SphereGeometry(0.015, 8, 8), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.9,
      }),
    []
  );

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

      // Set position
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

  // Update scale for selected/hovered points
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
      const scaleFactor = isSelected ? 2 : isHovered ? 1.5 : 1;

      mesh.getMatrixAt(i, matrix);
      matrix.decompose(position, quaternion, scale);
      
      // Apply new scale
      scale.setScalar(scaleFactor);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [filteredPoints, selectedId, hoveredId]);

  // Handle raycasting for hover/click detection
  useFrame(() => {
    if (!meshRef.current) return;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);

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