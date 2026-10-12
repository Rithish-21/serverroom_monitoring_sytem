import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { ServerRack } from './ServerRack.jsx';
import { CracUnit } from './CracUnit.jsx';
import { FloatingParticles } from './FloatingParticles.jsx';

const CameraController = () => {
  const mouseRef = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Slow cinematic orbit + mouse parallax
    const targetX = Math.sin(t * 0.15) * 7 + mouseRef.current.x * 1.5;
    const targetZ = Math.cos(t * 0.15) * 7 - mouseRef.current.y * 1.2;
    const targetY = 4 + mouseRef.current.y * 0.8;

    state.camera.position.x += (targetX - state.camera.position.x) * 0.03;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.03;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.03;
    state.camera.lookAt(0, 1.5, 0);
  });

  return null;
};

const sampleRacks = [
  { id: 1, name: 'Rack 1', position_x: -3, position_y: 0, position_z: -2 },
  { id: 2, name: 'Rack 2', position_x: -3, position_y: 0, position_z: 2 },
  { id: 3, name: 'Rack 3', position_x: 3, position_y: 0, position_z: -2 },
  { id: 4, name: 'Rack 4', position_x: 3, position_y: 0, position_z: 2 }
];

export const LandingHero3D = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 4.5, 8], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#050811']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 12, 8]} intensity={0.8} />
        <directionalLight position={[-8, 6, -8]} intensity={0.4} color="#38bdf8" />

        <Suspense fallback={null}>
          <Grid
            position={[0, 0, 0]}
            args={[20, 20]}
            cellSize={0.6}
            cellThickness={0.8}
            cellColor="#1e293b"
            sectionSize={1.8}
            sectionThickness={1.2}
            sectionColor="#38bdf8"
            fadeDistance={25}
          />
          <CracUnit position={[0, 1.8, -5.5]} />
          {sampleRacks.map((rack) => (
            <ServerRack key={rack.id} rack={rack} />
          ))}
          <FloatingParticles count={90} />
          <CameraController />
        </Suspense>
      </Canvas>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(7,10,19,0.3) 0%, rgba(7,10,19,0.88) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};
