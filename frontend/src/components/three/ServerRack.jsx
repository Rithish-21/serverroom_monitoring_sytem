import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ServerRack = ({ rack, sensors = [], isSelected, thermalMode = false, onSelect }) => {
  const groupRef = useRef();
  const ledRef = useRef();

  const rackSensors = useMemo(() => sensors.filter(s => s.rack_id === rack.id), [sensors, rack.id]);

  const rackStatus = useMemo(() => {
    if (rackSensors.some(s => s.status === 'critical')) return 'critical';
    if (rackSensors.some(s => s.status === 'warning')) return 'warning';
    return 'normal';
  }, [rackSensors]);

  // Compute thermal gradient color based on temperature
  const thermalColor = useMemo(() => {
    const tempSensor = rackSensors.find(s => s.type === 'temperature');
    const temp = tempSensor?.current_value || 24.0;
    if (temp <= 21.5) return '#06b6d4'; // Cool Intake Blue
    if (temp <= 26.5) return '#10b981'; // Optimal Green
    if (temp <= 30.5) return '#f59e0b'; // Warm Amber
    return '#ef4444'; // Hotspot Crimson
  }, [rackSensors]);

  const glowColor = useMemo(() => {
    if (thermalMode) return thermalColor;
    if (rackStatus === 'critical') return '#ef4444';
    if (rackStatus === 'warning') return '#f59e0b';
    return '#10b981';
  }, [thermalMode, thermalColor, rackStatus]);

  useFrame((state) => {
    if (ledRef.current) {
      const t = state.clock.getElapsedTime();
      const intensity = 0.6 + Math.sin(t * 4 + rack.id) * 0.4;
      ledRef.current.intensity = intensity;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[rack.position_x, rack.position_y, rack.position_z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect(rack);
      }}
    >
      {/* Cabinet Frame */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[1.2, 3.6, 1.2]} />
        <meshStandardMaterial
          color={thermalMode ? thermalColor : '#0b0f19'}
          roughness={0.4}
          metalness={0.8}
          wireframe={thermalMode}
        />
      </mesh>

      {/* Front Glass / Door with Status Tint */}
      <mesh position={[0, 1.8, 0.61]}>
        <planeGeometry args={[1.05, 3.4]} />
        <meshPhysicalMaterial
          color={glowColor}
          transparent
          opacity={isSelected ? 0.6 : thermalMode ? 0.5 : 0.25}
          roughness={0.1}
          metalness={0.9}
          transmission={thermalMode ? 0.2 : 0.6}
        />
      </mesh>

      {/* Server Blade Chassis Layers */}
      {[-1.2, -0.6, 0.0, 0.6, 1.2].map((yOffset, i) => (
        <mesh key={i} position={[0, 1.8 + yOffset, 0.1]}>
          <boxGeometry args={[1.0, 0.4, 0.95]} />
          <meshStandardMaterial
            color={thermalMode ? '#1e1b4b' : '#1e293b'}
            roughness={0.5}
            metalness={0.7}
          />
        </mesh>
      ))}

      {/* Status LED Light Strip */}
      <pointLight ref={ledRef} position={[0, 3.2, 0.7]} color={glowColor} distance={2.8} decay={2} />

      {/* Selection Halo Indicator */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.1, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};
