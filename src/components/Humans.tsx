import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../store';

interface HumanMeshProps {
  human: {
    id: string;
    name: string;
    position: [number, number, number];
    state: string;
    health: number;
    hunger: number;
    alive: boolean;
    gender: 'male' | 'female';
    age: number;
  };
  isSelected: boolean;
}

function HumanMesh({ human, isSelected }: HumanMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const armLeftRef = useRef<THREE.Mesh>(null);
  const armRightRef = useRef<THREE.Mesh>(null);
  const legLeftRef = useRef<THREE.Mesh>(null);
  const legRightRef = useRef<THREE.Mesh>(null);
  const prevPosRef = useRef<[number, number, number]>([...human.position]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !human.alive) return;

    const t = clock.elapsedTime;

    // Smooth position interpolation
    groupRef.current.position.x += (human.position[0] - groupRef.current.position.x) * 0.1;
    groupRef.current.position.z += (human.position[2] - groupRef.current.position.z) * 0.1;

    // Calculate movement direction for rotation
    const dx = human.position[0] - prevPosRef.current[0];
    const dz = human.position[2] - prevPosRef.current[2];
    const isMoving = Math.hypot(dx, dz) > 0.01;

    if (isMoving) {
      const angle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = angle;
    }

    // Walking animation
    const walkSpeed = human.state === 'exploring' ? 8 : human.state === 'fighting' ? 10 : 5;
    const walkAmplitude = isMoving ? 0.5 : 0;

    if (armLeftRef.current) {
      armLeftRef.current.rotation.x = Math.sin(t * walkSpeed) * walkAmplitude;
    }
    if (armRightRef.current) {
      armRightRef.current.rotation.x = -Math.sin(t * walkSpeed) * walkAmplitude;
    }
    if (legLeftRef.current) {
      legLeftRef.current.rotation.x = -Math.sin(t * walkSpeed) * walkAmplitude * 0.7;
    }
    if (legRightRef.current) {
      legRightRef.current.rotation.x = Math.sin(t * walkSpeed) * walkAmplitude * 0.7;
    }

    // Gathering animation - bob up and down
    if (human.state === 'gathering' && isMoving === false) {
      groupRef.current.position.y = Math.abs(Math.sin(t * 3)) * 0.3;
    }

    // Resting animation - slight sway
    if (human.state === 'resting') {
      groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }

    prevPosRef.current = [...human.position];
  });

  if (!human.alive) return null;

  const skinColor = human.gender === 'male' ? '#c4956a' : '#d4a574';
  const clothColor = human.gender === 'male' ? '#5a4a3a' : '#6b4a5a';

  // Scale based on age
  const scale = human.age < 10 ? 0.5 : human.age < 18 ? 0.75 : 1;

  return (
    <group ref={groupRef} position={human.position} scale={scale}>
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 3, 0]}>
          <ringGeometry args={[0.8, 1, 16]} />
          <meshBasicMaterial color="#00ff88" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <sphereGeometry args={[0.27, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={human.gender === 'male' ? '#3a2a1a' : '#5a3a1a'} roughness={0.9} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
        <meshStandardMaterial color={clothColor} roughness={0.8} />
      </mesh>

      {/* Arms */}
      <mesh ref={armLeftRef} position={[-0.4, 1.3, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 4, 6]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      <mesh ref={armRightRef} position={[0.4, 1.3, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 4, 6]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Legs */}
      <mesh ref={legLeftRef} position={[-0.15, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 4, 6]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
      </mesh>
      <mesh ref={legRightRef} position={[0.15, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 4, 6]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
      </mesh>

      {/* State indicator */}
      {human.state === 'gathering' && (
        <mesh position={[0.5, 1.5, 0]}>
          <boxGeometry args={[0.05, 0.6, 0.05]} />
          <meshStandardMaterial color="#8B6914" />
        </mesh>
      )}
      {human.state === 'fighting' && (
        <mesh position={[0.5, 1.5, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.05, 0.8, 0.05]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
      )}

      {/* Health bar */}
      {human.health < 80 && (
        <group position={[0, 2.3, 0]}>
          <mesh>
            <planeGeometry args={[0.8, 0.1]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          <mesh position={[(human.health - 100) * 0.004, 0, 0.01]}>
            <planeGeometry args={[0.8 * (human.health / 100), 0.1]} />
            <meshBasicMaterial color={human.health > 50 ? '#44ff44' : human.health > 25 ? '#ffaa00' : '#ff4444'} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function Humans() {
  const humans = useStore(s => s.humans);
  const selectedHuman = useStore(s => s.selectedHuman);

  return (
    <group>
      {humans.filter(h => h.alive).map(human => (
        <HumanMesh
          key={human.id}
          human={human}
          isSelected={human.id === selectedHuman}
        />
      ))}
    </group>
  );
}

// Animals
export function Animals() {
  const animals = useStore(s => s.animals);
  const groupRefs = useRef<{ [key: string]: THREE.Group }>({});

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    animals.forEach(animal => {
      const ref = groupRefs.current[animal.id];
      if (ref) {
        ref.position.x += (animal.position[0] - ref.position.x) * 0.1;
        ref.position.z += (animal.position[2] - ref.position.z) * 0.1;

        const dx = animal.position[0] - ref.position.x;
        const dz = animal.position[2] - ref.position.z;
        if (Math.hypot(dx, dz) > 0.01) {
          ref.rotation.y = Math.atan2(dx, dz);
        }

        // Bob animation
        if (animal.state === 'wandering') {
          ref.position.y = Math.abs(Math.sin(t * 3 + parseInt(animal.id, 36))) * 0.1;
        } else if (animal.state === 'fleeing') {
          ref.position.y = Math.abs(Math.sin(t * 8)) * 0.2;
        }
      }
    });
  });

  return (
    <group>
      {animals.map(animal => {
        const size = animal.type === 'rabbit' ? 0.3 : animal.type === 'deer' ? 0.8 : animal.type === 'boar' ? 0.7 : animal.type === 'wolf' ? 0.6 : 1.2;
        const color = animal.type === 'rabbit' ? '#8B7355' : animal.type === 'deer' ? '#8B6914' : animal.type === 'boar' ? '#4a3020' : animal.type === 'wolf' ? '#555555' : '#3a2a1a';

        return (
          <group
            key={animal.id}
            ref={(el) => { if (el) groupRefs.current[animal.id] = el; }}
            position={animal.position}
            scale={size}
          >
            {/* Body */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.6, 0.5]} castShadow>
              <sphereGeometry args={[0.2, 6, 6]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Legs */}
            {[[-0.2, 0, -0.2], [0.2, 0, -0.2], [-0.2, 0, 0.2], [0.2, 0, 0.2]].map((pos, i) => (
              <mesh key={i} position={pos as [number, number, number]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.4, 4]} />
                <meshStandardMaterial color={color} roughness={0.9} />
              </mesh>
            ))}
            {/* Ears for deer/rabbit */}
            {(animal.type === 'deer' || animal.type === 'rabbit') && (
              <>
                <mesh position={[-0.1, 0.85, 0.45]}>
                  <capsuleGeometry args={[0.03, 0.15, 3, 4]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0.1, 0.85, 0.45]}>
                  <capsuleGeometry args={[0.03, 0.15, 3, 4]} />
                  <meshStandardMaterial color={color} />
                </mesh>
              </>
            )}
            {/* Antlers for deer */}
            {animal.type === 'deer' && (
              <>
                <mesh position={[-0.1, 0.95, 0.5]} rotation={[0.3, 0, -0.3]}>
                  <cylinderGeometry args={[0.02, 0.01, 0.3, 4]} />
                  <meshStandardMaterial color="#5a4a3a" />
                </mesh>
                <mesh position={[0.1, 0.95, 0.5]} rotation={[0.3, 0, 0.3]}>
                  <cylinderGeometry args={[0.02, 0.01, 0.3, 4]} />
                  <meshStandardMaterial color="#5a4a3a" />
                </mesh>
              </>
            )}
            {/* State indicator */}
            {animal.state === 'attacking' && (
              <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.1, 6, 6]} />
                <meshBasicMaterial color="#ff0000" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
