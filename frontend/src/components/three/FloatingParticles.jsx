import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FloatingParticles = ({ count = 60 }) => {
  const pointsRef = useRef();

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 4.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      vel.push({
        y: 0.002 + Math.random() * 0.006,
        x: (Math.random() - 0.5) * 0.003
      });
    }
    return [pos, vel];
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += velocities[i].y;
      array[i * 3] += velocities[i].x;

      if (array[i * 3 + 1] > 4.5) {
        array[i * 3 + 1] = 0.1;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#38bdf8"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
