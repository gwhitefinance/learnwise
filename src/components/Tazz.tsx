"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Box } from "@react-three/drei";
import * as THREE from "three";

interface TazzProps {
  color: string;
  position: [number, number, number];
  earType: "round" | "pointy" | "floppy";
  pattern?: "spots" | "stripes" | "solid";
  name: string;
  type: "fire" | "water" | "plant" | "electric" | "ice" | "normal";
}

export default function Tazz({ color, position, earType, pattern = "solid", name, type }: TazzProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [rotationSpeed] = useState(Math.random() * 0.5 + 0.3);
  const [bobOffset] = useState(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle bobbing animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + bobOffset) * 0.1;
      
      // Slow rotation
      if (!hovered) {
        groupRef.current.rotation.y += 0.002 * rotationSpeed;
      } else {
        // Faster rotation when hovered
        groupRef.current.rotation.y += 0.02;
      }
    }
  });

  const baseColor = new THREE.Color(color);
  const darkerColor = baseColor.clone().multiplyScalar(0.7);
  const lighterColor = baseColor.clone().multiplyScalar(1.3);

  // Type-based effects
  const getTypeEffect = () => {
    switch (type) {
      case "fire":
        return (
          <>
            <Sphere args={[0.15, 8, 8]} position={[0.3, 0.3, 0.3]}>
              <meshStandardMaterial color="#ff4500" emissive="#ff4500" emissiveIntensity={1} />
            </Sphere>
            <Sphere args={[0.1, 8, 8]} position={[-0.3, 0.5, 0.3]}>
              <meshStandardMaterial color="#ff6b00" emissive="#ff6b00" emissiveIntensity={1} />
            </Sphere>
          </>
        );
      case "water":
        return (
          <>
            <Sphere args={[0.12, 8, 8]} position={[0.35, 0.2, 0.4]}>
              <meshStandardMaterial color="#00bfff" transparent opacity={0.7} />
            </Sphere>
            <Sphere args={[0.1, 8, 8]} position={[-0.35, 0.4, 0.35]}>
              <meshStandardMaterial color="#1e90ff" transparent opacity={0.6} />
            </Sphere>
          </>
        );
      case "plant":
        return (
          <>
            <Box args={[0.08, 0.2, 0.02]} position={[0.3, 0.8, 0.2]} rotation={[0.3, 0, 0.4]}>
              <meshStandardMaterial color="#32cd32" />
            </Box>
            <Sphere args={[0.08, 8, 8]} position={[0.3, 0.85, 0.2]}>
              <meshStandardMaterial color="#90ee90" />
            </Sphere>
          </>
        );
      case "electric":
        return (
          <>
            <Box args={[0.15, 0.05, 0.05]} position={[0.3, 0.4, 0.35]} rotation={[0, 0, 0.5]}>
              <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
            </Box>
            <Box args={[0.12, 0.05, 0.05]} position={[-0.3, 0.3, 0.35]} rotation={[0, 0, -0.5]}>
              <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
            </Box>
          </>
        );
      case "ice":
        return (
          <>
            <Box args={[0.12, 0.12, 0.12]} position={[0.35, 0.3, 0.35]} rotation={[0.5, 0.5, 0.5]}>
              <meshStandardMaterial color="#b0e0e6" transparent opacity={0.8} />
            </Box>
            <Box args={[0.1, 0.1, 0.1]} position={[-0.3, 0.5, 0.3]} rotation={[0.3, 0.7, 0.3]}>
              <meshStandardMaterial color="#add8e6" transparent opacity={0.7} />
            </Box>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 2.5 : 2.3}
    >
      {/* Body - fluffy sphere - OPTIMIZED */}
      <Sphere args={[0.6, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>

      {/* Head - slightly smaller sphere - OPTIMIZED */}
      <Sphere args={[0.45, 16, 16]} position={[0, 0.7, 0.1]}>
        <meshStandardMaterial
          color={lighterColor}
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>

      {/* Type-based visual effects */}
      {getTypeEffect()}

      {/* Ears - OPTIMIZED with lower poly count */}
      {earType === "round" && (
        <>
          <Sphere args={[0.15, 12, 12]} position={[-0.25, 1.0, 0.05]}>
            <meshStandardMaterial color={color} roughness={0.8} />
          </Sphere>
          <Sphere args={[0.15, 12, 12]} position={[0.25, 1.0, 0.05]}>
            <meshStandardMaterial color={color} roughness={0.8} />
          </Sphere>
        </>
      )}

      {earType === "pointy" && (
        <>
          <Box args={[0.15, 0.35, 0.1]} position={[-0.25, 1.1, 0.05]} rotation={[0, 0, 0.3]}>
            <meshStandardMaterial color={color} roughness={0.8} />
          </Box>
          <Box args={[0.15, 0.35, 0.1]} position={[0.25, 1.1, 0.05]} rotation={[0, 0, -0.3]}>
            <meshStandardMaterial color={color} roughness={0.8} />
          </Box>
        </>
      )}

      {earType === "floppy" && (
        <>
          <Sphere args={[0.12, 12, 12]} position={[-0.3, 0.85, 0]} scale={[1, 1.5, 0.5]}>
            <meshStandardMaterial color={darkerColor} roughness={0.8} />
          </Sphere>
          <Sphere args={[0.12, 12, 12]} position={[0.3, 0.85, 0]} scale={[1, 1.5, 0.5]}>
            <meshStandardMaterial color={darkerColor} roughness={0.8} />
          </Sphere>
        </>
      )}

      {/* Eyes - bigger cute eyes - OPTIMIZED */}
      <Sphere args={[0.16, 12, 12]} position={[-0.15, 0.75, 0.35]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <Sphere args={[0.16, 12, 12]} position={[0.15, 0.75, 0.35]}>
        <meshStandardMaterial color="white" />
      </Sphere>

      {/* Pupils - larger - OPTIMIZED */}
      <Sphere args={[0.08, 12, 12]} position={[-0.15, 0.75, 0.45]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Sphere>
      <Sphere args={[0.08, 12, 12]} position={[0.15, 0.75, 0.45]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Sphere>

      {/* Eye shine - more prominent */}
      <Sphere args={[0.04, 8, 8]} position={[-0.12, 0.78, 0.48]}>
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
      </Sphere>
      <Sphere args={[0.04, 8, 8]} position={[0.18, 0.78, 0.48]}>
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
      </Sphere>

      {/* Smile - bigger and more curved */}
      <Box args={[0.3, 0.05, 0.05]} position={[0, 0.58, 0.43]} rotation={[0, 0, -0.15]}>
        <meshStandardMaterial color="#ff6b9d" />
      </Box>
      <Sphere args={[0.04, 8, 8]} position={[-0.12, 0.59, 0.43]}>
        <meshStandardMaterial color="#ff6b9d" />
      </Sphere>
      <Sphere args={[0.04, 8, 8]} position={[0.12, 0.56, 0.43]}>
        <meshStandardMaterial color="#ff6b9d" />
      </Sphere>

      {/* Arms/Hands - small spheres - OPTIMIZED */}
      <Sphere args={[0.15, 12, 12]} position={[-0.65, 0.1, 0.2]}>
        <meshStandardMaterial color={lighterColor} roughness={0.8} />
      </Sphere>
      <Sphere args={[0.15, 12, 12]} position={[0.65, 0.1, 0.2]}>
        <meshStandardMaterial color={lighterColor} roughness={0.8} />
      </Sphere>

      {/* Feet - OPTIMIZED */}
      <Sphere args={[0.2, 12, 12]} position={[-0.25, -0.55, 0.25]} scale={[1, 0.6, 1.2]}>
        <meshStandardMaterial color={darkerColor} roughness={0.8} />
      </Sphere>
      <Sphere args={[0.2, 12, 12]} position={[0.25, -0.55, 0.25]} scale={[1, 0.6, 1.2]}>
        <meshStandardMaterial color={darkerColor} roughness={0.8} />
      </Sphere>

      {/* Pattern spots if applicable - OPTIMIZED */}
      {pattern === "spots" && (
        <>
          <Sphere args={[0.1, 10, 10]} position={[0.3, 0.2, 0.5]}>
            <meshStandardMaterial color={darkerColor} roughness={0.8} />
          </Sphere>
          <Sphere args={[0.08, 10, 10]} position={[-0.2, -0.1, 0.55]}>
            <meshStandardMaterial color={darkerColor} roughness={0.8} />
          </Sphere>
        </>
      )}
    </group>
  );
}
