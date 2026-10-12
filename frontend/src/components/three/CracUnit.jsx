import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const CracUnit = ({ position = [0, 1.8, -5.5] }) => {
  const fanRef = useRef();

  useFrame((_, delta) => {
    if (fanRef.current) {
      fanRef.current.rotation.z += delta * 4;
    }
  });

  return (
    <group position={position}>
      {/* Main AC Cabinet */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 3.6, 1.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Air Discharge Plenum Top */}
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[2.2, 0.3, 1.2]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Front Intake Grille */}
      <mesh position={[0, -0.4, 0.71]}>
        <planeGeometry args={[2.0, 1.8]} />
        <meshStandardMaterial color="#0f172a" wireframe />
      </mesh>

      {/* Fan Blades indicator */}
      <group position={[0, 0.8, 0.72]} ref={fanRef}>
        <mesh>
          <boxGeometry args={[0.8, 0.12, 0.02]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.8, 0.12, 0.02]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Cool Air Blue Glow */}
      <pointLight position={[0, 1.8, 1.2]} color="#38bdf8" distance={4} intensity={0.8} />
    </group>
  );
};
