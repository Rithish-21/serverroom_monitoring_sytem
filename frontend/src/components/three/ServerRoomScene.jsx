import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { ServerRack } from './ServerRack.jsx';
import { CracUnit } from './CracUnit.jsx';
import { SensorNode } from './SensorNode.jsx';
import { FloatingParticles } from './FloatingParticles.jsx';

const CameraAnimator = ({ preset = 'overview' }) => {
  const { camera } = useThree();

  const targetCoords = useMemo(() => {
    switch (preset) {
      case 'aisleA': return { pos: [-3.2, 3.2, 5.5], lookAt: [-3, 1.8, 0] };
      case 'aisleB': return { pos: [3.2, 3.2, 5.5], lookAt: [3, 1.8, 0] };
      case 'crac': return { pos: [0, 3.2, -1.8], lookAt: [0, 1.8, -5.5] };
      case 'topDown': return { pos: [0, 12, 0.01], lookAt: [0, 0, 0] };
      default: return { pos: [0, 6, 9], lookAt: [0, 1.5, 0] };
    }
  }, [preset]);

  useFrame(() => {
    camera.position.x += (targetCoords.pos[0] - camera.position.x) * 0.06;
    camera.position.y += (targetCoords.pos[1] - camera.position.y) * 0.06;
    camera.position.z += (targetCoords.pos[2] - camera.position.z) * 0.06;
  });

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={3}
      maxDistance={22}
      target={targetCoords.lookAt}
    />
  );
};

export const ServerRoomScene = ({
  racks = [],
  sensors = [],
  selectedRack = null,
  selectedSensor = null,
  thermalMode = false,
  cameraPreset = 'overview',
  onSelectRack,
  onSelectSensor
}) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 6, 9], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={[thermalMode ? '#08051a' : '#070a13']} />

        <ambientLight intensity={thermalMode ? 0.6 : 0.4} />
        <directionalLight position={[10, 15, 10]} intensity={0.7} />
        <directionalLight position={[-10, 10, -10]} intensity={0.4} color={thermalMode ? '#f59e0b' : '#38bdf8'} />

        <Suspense fallback={null}>
          <Grid
            position={[0, 0, 0]}
            args={[18, 18]}
            cellSize={0.6}
            cellThickness={0.8}
            cellColor="#1e293b"
            sectionSize={1.8}
            sectionThickness={1.2}
            sectionColor={thermalMode ? '#f59e0b' : '#38bdf8'}
            fadeDistance={22}
            fadeStrength={1}
          />

          <CracUnit position={[0, 1.8, -5.5]} />

          {racks.map((rack) => (
            <ServerRack
              key={rack.id}
              rack={rack}
              sensors={sensors}
              isSelected={selectedRack?.id === rack.id}
              thermalMode={thermalMode}
              onSelect={onSelectRack}
            />
          ))}

          {sensors.map((sensor) => (
            <SensorNode
              key={sensor.id}
              sensor={sensor}
              isSelected={selectedSensor?.id === sensor.id}
              onSelect={onSelectSensor}
            />
          ))}

          <FloatingParticles count={70} />
          <CameraAnimator preset={cameraPreset} />
        </Suspense>
      </Canvas>
    </div>
  );
};
