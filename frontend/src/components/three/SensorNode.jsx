import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const SensorNode = ({ sensor, isSelected, onSelect }) => {
  const meshRef = useRef();
  const auraRef = useRef();

  const color = sensor.status === 'critical'
    ? '#ef4444'
    : sensor.status === 'warning'
      ? '#f59e0b'
      : '#10b981';

  // Compute 3D position based on sensor type and rack position
  const position = [
    sensor.position_x !== undefined ? sensor.position_x : (sensor.id % 2 === 0 ? 3.0 : -3.0),
    sensor.type === 'smoke' ? 4.2 : sensor.type === 'water_leak' ? 0.2 : 2.5,
    sensor.position_z !== undefined ? sensor.position_z : (sensor.id > 3 ? 2.5 : -2.5) + 0.65
  ];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (auraRef.current) {
      const scale = 1 + Math.sin(t * 3 + sensor.id) * 0.2;
      auraRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect(sensor);
      }}
    >
      {/* Sensor Beacon Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.5 : 0.8}
        />
      </mesh>

      {/* Pulsing Aura */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={sensor.status === 'critical' ? 0.5 : 0.25}
          wireframe
        />
      </mesh>

      {/* Point light illuminating surrounding rack */}
      <pointLight color={color} distance={1.2} intensity={0.6} />
    </group>
  );
};
