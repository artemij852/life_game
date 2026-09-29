import React, { useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import useStore from './store';
import { Terrain, Water, Cave, Trees, Rocks, Bushes, Herbs, Buildings, Sky, Campfire, Flowers, Clouds } from './components/World';
import { Humans, Animals } from './components/Humans';
import { GameUI } from './components/UI';

// Game loop component
function GameLoop() {
  const tick = useStore(s => s.tick);
  const initWorld = useStore(s => s.initWorld);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initWorld();
    }
  }, [initWorld]);

  useFrame((_, delta) => {
    tick(Math.min(delta, 0.1)); // Cap delta to prevent huge jumps
  });

  return null;
}

// Camera controller
function CameraController() {
  const controlsRef = useRef<any>(null);
  const cameraMode = useStore(s => s.cameraMode);
  const selectedHuman = useStore(s => s.selectedHuman);
  const humans = useStore(s => s.humans);
  const { camera } = useThree();

  useFrame(() => {
    if (cameraMode === 'follow' && selectedHuman && controlsRef.current) {
      const human = humans.find(h => h.id === selectedHuman);
      if (human) {
        const target = new THREE.Vector3(human.position[0], human.position[1] + 2, human.position[2]);
        controlsRef.current.target.lerp(target, 0.05);
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={300}
      maxPolarAngle={Math.PI / 2 - 0.05}
      enablePan={true}
      panSpeed={2}
      rotateSpeed={0.5}
      zoomSpeed={1.5}
    />
  );
}

// Click handler for selecting humans
function ClickHandler() {
  const { camera, raycaster, scene } = useThree();
  const selectHuman = useStore(s => s.selectHuman);
  const humans = useStore(s => s.humans);

  const handleClick = useCallback((event: any) => {
    // Use raycasting to find clicked human
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      // Find closest human to click point
      let closest: string | null = null;
      let closestDist = 5; // max selection distance

      humans.filter(h => h.alive).forEach(h => {
        const dist = Math.hypot(h.position[0] - point.x, h.position[2] - point.z);
        if (dist < closestDist) {
          closestDist = dist;
          closest = h.id;
        }
      });

      if (closest) {
        selectHuman(closest);
      }
    }
  }, [camera, raycaster, scene, humans, selectHuman]);

  useEffect(() => {
    window.addEventListener('dblclick', handleClick);
    return () => window.removeEventListener('dblclick', handleClick);
  }, [handleClick]);

  return null;
}

// Particle effects
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = Math.random() * 30 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const y = pos.getY(i);
        pos.setY(i, y - 0.02);
        if (y < 0) {
          pos.setY(i, 30);
          pos.setX(i, (Math.random() - 0.5) * 200);
          pos.setZ(i, (Math.random() - 0.5) * 200);
        }
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#ffffff"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

// Ground details - grass patches
function GrassPatches() {
  const patches = React.useMemo(() => {
    const p = [];
    for (let i = 0; i < 300; i++) {
      const x = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      // Skip ocean area
      if (x > 150 && z > 100) continue;
      p.push({ x, z, scale: 0.5 + Math.random() * 1.5 });
    }
    return p;
  }, []);

  return (
    <group>
      {patches.map((p, i) => (
        <mesh key={i} position={[p.x, 0.1, p.z]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
          <planeGeometry args={[p.scale, p.scale * 2]} />
          <meshStandardMaterial
            color={`hsl(${100 + Math.random() * 30}, ${50 + Math.random() * 20}%, ${25 + Math.random() * 15}%)`}
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

// Loading screen
function LoadingScreen() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🏛️</div>
        <h1 className="text-white text-2xl font-bold mb-2">Колония: От Каменного Века</h1>
        <p className="text-white/60 text-sm">Загрузка симуляции...</p>
        <div className="mt-4 w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
}

function Scene() {
  return (
    <>
      <Sky />
      <CameraController />
      <ClickHandler />
      <GameLoop />

      {/* World */}
      <Terrain />
      <Water />
      <Cave />
      <Trees />
      <Rocks />
      <Bushes />
      <Herbs />
      <Buildings />
      <Campfire />
      <Flowers />
      <Clouds />
      <GrassPatches />

      {/* Entities */}
      <Humans />
      <Animals />

      {/* Effects */}
      <Particles />

      {/* Ground plane for shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>
    </>
  );
}

function App() {
  const [loaded, setLoaded] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      {!loaded && <LoadingScreen />}
      <Canvas
        shadows
        camera={{
          position: [50, 40, 50],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        onCreated={() => setLoaded(true)}
      >
        <Scene />
      </Canvas>
      {loaded && <GameUI />}
    </div>
  );
}

export default App;
