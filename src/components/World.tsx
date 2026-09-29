import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../store';

const WORLD_SIZE = 500;

// Terrain component with biomes
export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 128, 128);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Height map
      let height = 0;

      // Beach/ocean edge (south-east)
      const distFromCenter = Math.hypot(x, y);

      // Ocean depression in south-east
      if (x > WORLD_SIZE * 0.3 && y > WORLD_SIZE * 0.2) {
        height = -3;
      } else if (x > WORLD_SIZE * 0.2 && y > WORLD_SIZE * 0.1) {
        height = -1 + Math.random() * 0.5;
      }

      // Cave area (north-west, elevated)
      if (x < -WORLD_SIZE * 0.3 && y < -WORLD_SIZE * 0.3) {
        height += 5 + Math.sin(x * 0.05) * 3;
      }

      // General terrain noise
      height += Math.sin(x * 0.02) * Math.cos(y * 0.02) * 2;
      height += Math.sin(x * 0.05 + y * 0.03) * 1;

      // Clearing in center (flat)
      if (distFromCenter < 30) {
        height *= (distFromCenter / 30) * 0.3;
      }

      pos.setZ(i, height);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  // Color the terrain based on position
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.0,
    });
  }, []);

  // Apply vertex colors
  useMemo(() => {
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    const pos = geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const distFromCenter = Math.hypot(x, y);

      let r, g, b;

      // Ocean
      if (x > WORLD_SIZE * 0.3 && y > WORLD_SIZE * 0.2) {
        r = 0.1; g = 0.3; b = 0.6;
      }
      // Beach
      else if (x > WORLD_SIZE * 0.15 && y > WORLD_SIZE * 0.1) {
        r = 0.8; g = 0.75; b = 0.5;
      }
      // Cave area (rocky)
      else if (x < -WORLD_SIZE * 0.25 && y < -WORLD_SIZE * 0.25) {
        r = 0.4; g = 0.35; b = 0.3;
      }
      // Forest (north-west)
      else if (x < 0 && y < 0) {
        r = 0.15; g = 0.4; b = 0.1;
      }
      // Clearing (center)
      else if (distFromCenter < 35) {
        r = 0.3; g = 0.55; b = 0.15;
      }
      // General grass
      else {
        r = 0.2; g = 0.45; b = 0.12;
      }

      // Add variation
      const noise = (Math.random() - 0.5) * 0.05;
      colors[i * 3] = r + noise;
      colors[i * 3 + 1] = g + noise;
      colors[i * 3 + 2] = b + noise;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    </mesh>
  );
}

// Water plane with waves
export function Water() {
  const ref = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = -1.5 + Math.sin(clock.elapsedTime * 0.5) * 0.2;
    }
    if (materialRef.current) {
      materialRef.current.opacity = 0.65 + Math.sin(clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={ref} position={[WORLD_SIZE * 0.35, -1.5, WORLD_SIZE * 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WORLD_SIZE * 0.6, WORLD_SIZE * 0.6, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#1a6b8a"
          transparent
          opacity={0.7}
          roughness={0.05}
          metalness={0.4}
        />
      </mesh>
      {/* Wave foam lines */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={[WORLD_SIZE * 0.15 + i * 30, -1, WORLD_SIZE * 0.15 + i * 25]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <planeGeometry args={[40, 0.5]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Cave entrance
export function Cave() {
  return (
    <group position={[-WORLD_SIZE * 0.35, 0, -WORLD_SIZE * 0.35]}>
      {/* Cave entrance rock */}
      <mesh position={[0, 3, 0]} castShadow>
        <sphereGeometry args={[8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3d3028" roughness={1} />
      </mesh>
      {/* Dark entrance */}
      <mesh position={[0, 2, 3]}>
        <circleGeometry args={[4, 16]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
      {/* Surrounding rocks */}
      {[[-6, 1, -2], [5, 1.5, -1], [-3, 0.5, 4], [7, 1, 3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <dodecahedronGeometry args={[2 + Math.random() * 2, 0]} />
          <meshStandardMaterial color="#4a3f35" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// Trees (instanced for performance)
export function Trees() {
  const resources = useStore(s => s.resources);
  const trees = resources.filter(r => r.type === 'tree' && r.amount > 0);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useMemo(() => {
    if (!meshRef.current) return;
    const matrix = new THREE.Matrix4();
    trees.forEach((tree, i) => {
      if (i >= meshRef.current!.count) return;
      matrix.setPosition(tree.position[0], tree.position[1], tree.position[2]);
      meshRef.current!.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [trees.length]);

  return (
    <group>
      {trees.slice(0, 150).map((tree) => (
        <group key={tree.id} position={tree.position}>
          {/* Trunk */}
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.5, 4, 6]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, 5, 0]} castShadow>
            <coneGeometry args={[2.5, 4, 8]} />
            <meshStandardMaterial color="#1a5c1a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 6.5, 0]} castShadow>
            <coneGeometry args={[1.8, 3, 8]} />
            <meshStandardMaterial color="#227722" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Rocks
export function Rocks() {
  const resources = useStore(s => s.resources);
  const rocks = resources.filter(r => r.type === 'rock' && r.amount > 0);

  return (
    <group>
      {rocks.slice(0, 60).map((rock) => (
        <mesh key={rock.id} position={rock.position} castShadow>
          <dodecahedronGeometry args={[1 + Math.random() * 0.5, 0]} />
          <meshStandardMaterial color="#6b6b6b" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// Bushes (food sources)
export function Bushes() {
  const resources = useStore(s => s.resources);
  const bushes = resources.filter(r => r.type === 'bush' && r.amount > 0);

  return (
    <group>
      {bushes.slice(0, 50).map((bush) => (
        <group key={bush.id} position={bush.position}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#2d5a1e" roughness={0.9} />
          </mesh>
          {/* Berries */}
          {[0, 1, 2].map(i => (
            <mesh key={i} position={[
              Math.cos(i * 2.1) * 0.6,
              0.5 + Math.sin(i) * 0.3,
              Math.sin(i * 2.1) * 0.6
            ]}>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial color="#cc2244" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Herbs
export function Herbs() {
  const resources = useStore(s => s.resources);
  const herbs = resources.filter(r => r.type === 'herb' && r.amount > 0);

  return (
    <group>
      {herbs.slice(0, 30).map((herb) => (
        <group key={herb.id} position={herb.position}>
          {[0, 1, 2, 3].map(i => (
            <mesh key={i} position={[
              Math.cos(i * 1.57) * 0.3,
              0.3,
              Math.sin(i * 1.57) * 0.3
            ]} rotation={[Math.cos(i) * 0.3, 0, Math.sin(i) * 0.3]}>
              <planeGeometry args={[0.4, 0.8]} />
              <meshStandardMaterial color="#44aa44" side={THREE.DoubleSide} />
            </mesh>
          ))}
          {/* Flowers */}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.2, 6, 6]} />
            <meshStandardMaterial color="#ffdd44" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Buildings
export function Buildings() {
  const buildings = useStore(s => s.buildings);

  return (
    <group>
      {buildings.map((building) => {
        switch (building.type) {
          case 'hut':
            return (
              <group key={building.id} position={building.position}>
                <mesh position={[0, 1.5, 0]} castShadow>
                  <cylinderGeometry args={[2, 2.5, 3, 8]} />
                  <meshStandardMaterial color="#8B6914" roughness={0.9} />
                </mesh>
                <mesh position={[0, 3.5, 0]} castShadow>
                  <coneGeometry args={[3, 2, 8]} />
                  <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
                </mesh>
              </group>
            );
          case 'workshop':
            return (
              <group key={building.id} position={building.position}>
                <mesh position={[0, 1.5, 0]} castShadow>
                  <boxGeometry args={[4, 3, 4]} />
                  <meshStandardMaterial color="#6b4423" roughness={0.9} />
                </mesh>
                <mesh position={[0, 3.5, 0]} castShadow>
                  <boxGeometry args={[4.5, 0.5, 4.5]} />
                  <meshStandardMaterial color="#4a2f15" roughness={0.9} />
                </mesh>
              </group>
            );
          default:
            return (
              <group key={building.id} position={building.position}>
                <mesh position={[0, 1, 0]} castShadow>
                  <boxGeometry args={[3, 2, 3]} />
                  <meshStandardMaterial color="#7a5a3a" roughness={0.9} />
                </mesh>
              </group>
            );
        }
      })}
    </group>
  );
}

// Sky and atmosphere
export function Sky() {
  const time = useStore(s => s.time);

  const sunPosition = useMemo(() => {
    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2;
    return new THREE.Vector3(
      Math.cos(angle) * 200,
      Math.sin(angle) * 200,
      50
    );
  }, [time]);

  const skyColor = useMemo(() => {
    if (time > 6 && time < 18) {
      return '#87CEEB';
    } else if (time > 5 && time < 7) {
      return '#FF8C42';
    } else if (time > 17 && time < 19) {
      return '#FF6B35';
    }
    return '#0a1628';
  }, [time]);

  const sunIntensity = useMemo(() => {
    if (time > 6 && time < 18) return 1.5;
    if (time > 5 && time < 7) return 0.8;
    if (time > 17 && time < 19) return 0.8;
    return 0.05;
  }, [time]);

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 100, 400]} />
      <directionalLight
        position={sunPosition.toArray()}
        intensity={sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <ambientLight intensity={time > 6 && time < 18 ? 0.4 : 0.1} />
      <hemisphereLight
        color={skyColor}
        groundColor="#3d2b1f"
        intensity={0.3}
      />
      {/* Sun visual */}
      {(time > 5 && time < 19) && (
        <mesh position={sunPosition.toArray()}>
          <sphereGeometry args={[8, 16, 16]} />
          <meshBasicMaterial color="#FFDD44" />
        </mesh>
      )}
      {/* Moon */}
      {(time < 5 || time > 19) && (
        <mesh position={[-sunPosition.x, -sunPosition.y + 50, sunPosition.z]}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial color="#EEEEFF" />
        </mesh>
      )}
    </>
  );
}

// Campfire in center clearing
export function Campfire() {
  const ref = useRef<THREE.Group>(null);
  const time = useStore(s => s.time);
  const isNight = time < 6 || time > 18;

  useFrame(({ clock }) => {
    if (ref.current && isNight) {
      const t = clock.elapsedTime;
      ref.current.children.forEach((child, i) => {
        if (i > 0) {
          child.position.y = 0.5 + Math.sin(t * 5 + i) * 0.3;
          child.scale.setScalar(0.8 + Math.sin(t * 3 + i * 2) * 0.2);
        }
      });
    }
  });

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {/* Fire logs */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 6]} />
        <meshStandardMaterial color="#3a2010" />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[0, -0.5, Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 6]} />
        <meshStandardMaterial color="#3a2010" />
      </mesh>
      {/* Fire stones */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <mesh key={i} position={[Math.cos(i * 1.05) * 0.6, 0.1, Math.sin(i * 1.05) * 0.6]}>
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial color="#555555" roughness={1} />
        </mesh>
      ))}
      {/* Flames */}
      {isNight && [0, 1, 2].map(i => (
        <mesh key={i} position={[Math.cos(i * 2.1) * 0.15, 0.5, Math.sin(i * 2.1) * 0.15]}>
          <coneGeometry args={[0.15, 0.6, 6]} />
          <meshBasicMaterial color={i === 0 ? '#ff4400' : i === 1 ? '#ff8800' : '#ffcc00'} transparent opacity={0.8} />
        </mesh>
      ))}
      {/* Fire light */}
      {isNight && (
        <pointLight position={[0, 1, 0]} color="#ff6600" intensity={3} distance={20} />
      )}
    </group>
  );
}

// Clouds
export function Clouds() {
  const clouds = useMemo(() => {
    const c = [];
    for (let i = 0; i < 15; i++) {
      c.push({
        x: (Math.random() - 0.5) * 400,
        y: 40 + Math.random() * 30,
        z: (Math.random() - 0.5) * 400,
        scale: 5 + Math.random() * 15,
        speed: 0.5 + Math.random() * 1,
      });
    }
    return c;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.x += clouds[i].speed * 0.01;
        if (child.position.x > 250) child.position.x = -250;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <group key={i} position={[cloud.x, cloud.y, cloud.z]}>
          <mesh>
            <sphereGeometry args={[cloud.scale, 8, 6]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.8} roughness={1} />
          </mesh>
          <mesh position={[cloud.scale * 0.5, -cloud.scale * 0.2, 0]}>
            <sphereGeometry args={[cloud.scale * 0.7, 8, 6]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.7} roughness={1} />
          </mesh>
          <mesh position={[-cloud.scale * 0.4, -cloud.scale * 0.1, cloud.scale * 0.3]}>
            <sphereGeometry args={[cloud.scale * 0.6, 8, 6]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.75} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Decorative flowers and small details
export function Flowers() {
  const flowers = useMemo(() => {
    const f = [];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 150;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      // Skip ocean
      if (x > 150 && z > 100) continue;
      f.push({
        x, z,
        color: ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b6b'][Math.floor(Math.random() * 5)],
        scale: 0.2 + Math.random() * 0.3,
      });
    }
    return f;
  }, []);

  return (
    <group>
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, 0, f.z]}>
          <mesh position={[0, f.scale, 0]}>
            <sphereGeometry args={[f.scale * 0.5, 6, 6]} />
            <meshStandardMaterial color={f.color} />
          </mesh>
          <mesh position={[0, f.scale * 0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.02, f.scale, 4]} />
            <meshStandardMaterial color="#2d5a1e" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
