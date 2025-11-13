'use client';

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html } from "@react-three/drei";
import { useRef, useState, Suspense, useMemo } from "react";
import * as THREE from "three";

// ====================================================================
// Tazz Component - The core of our 3D character
// ====================================================================

interface TazzProps {
  color: string;
  position: [number, number, number];
  earType: "round" | "pointy" | "floppy";
  type: "fire" | "water" | "plant" | "electric" | "ice" | "normal";
  name: string;
}

function Tazz({ color, position, earType, type, name }: TazzProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const rotationSpeed = useMemo(() => Math.random() * 0.5 + 0.3, []);
  const bobOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + bobOffset) * 0.1;
      groupRef.current.rotation.y += hovered ? 0.02 : (0.002 * rotationSpeed);
    }
  });

  const baseColor = new THREE.Color(color);
  const darkerColor = baseColor.clone().multiplyScalar(0.7);

  const TypeEffect = () => {
    switch (type) {
      case "fire": return <mesh><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#ff4500" emissive="#ff4500" emissiveIntensity={2} /></mesh>;
      case "water": return <mesh><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#00bfff" transparent opacity={0.7} /></mesh>;
      case "plant": return <mesh><boxGeometry args={[0.08, 0.2, 0.02]} /><meshStandardMaterial color="#32cd32" /></mesh>;
      case "electric": return <mesh><boxGeometry args={[0.15, 0.05, 0.05]} /><meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} /></mesh>;
      case "ice": return <mesh><boxGeometry args={[0.12, 0.12, 0.12]} /><meshStandardMaterial color="#b0e0e6" transparent opacity={0.8} /></mesh>;
      default: return null;
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
      <group>
        {/* Body */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.7, 0.1]}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial color={baseColor.clone().lerp(new THREE.Color("white"), 0.3)} roughness={0.7} />
        </mesh>

        {/* Eyes */}
        <group>
          <mesh position={[-0.15, 0.75, 0.4]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[0.15, 0.75, 0.4]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[-0.12, 0.8, 0.45]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
           <mesh position={[0.18, 0.8, 0.45]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>

        {/* Smile */}
        <mesh position={[0, 0.58, 0.43]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.2, 0.04, 0.04]} />
            <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Ears */}
        {earType === "round" && <>
            <mesh position={[-0.3, 1.0, 0.05]}><sphereGeometry args={[0.18, 12, 12]} /><meshStandardMaterial color={color} /></mesh>
            <mesh position={[0.3, 1.0, 0.05]}><sphereGeometry args={[0.18, 12, 12]} /><meshStandardMaterial color={color} /></mesh>
        </>}
        {earType === "pointy" && <>
            <mesh position={[-0.3, 1.1, 0.05]} rotation={[0, 0, 0.4]}><coneGeometry args={[0.15, 0.4, 8]} /><meshStandardMaterial color={color} /></mesh>
            <mesh position={[0.3, 1.1, 0.05]} rotation={[0, 0, -0.4]}><coneGeometry args={[0.15, 0.4, 8]} /><meshStandardMaterial color={color} /></mesh>
        </>}
        {earType === "floppy" && <>
            <mesh position={[-0.35, 0.8, 0]} rotation={[0,0,0.5]}><boxGeometry args={[0.2, 0.5, 0.1]} /><meshStandardMaterial color={darkerColor} /></mesh>
            <mesh position={[0.35, 0.8, 0]} rotation={[0,0,-0.5]}><boxGeometry args={[0.2, 0.5, 0.1]} /><meshStandardMaterial color={darkerColor} /></mesh>
        </>}
      </group>

      <group position={[0,0.1,0]}>
        <TypeEffect />
      </group>
      
      <Html position={[0, -1, 0]} center>
          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
              {name}
          </div>
      </Html>

    </group>
  );
}

// ====================================================================
// Main Showcase Component
// ====================================================================

export default function TazzShowcase() {
  const tazzes = [
    { name: "Blaze", color: "#FF6B4A", position: [-6, 3, 0] as [number, number, number], earType: "pointy" as const, type: "fire" as const },
    { name: "Splash", color: "#4A9FFF", position: [0, 3, 0] as [number, number, number], earType: "round" as const, type: "water" as const },
    { name: "Sparky", color: "#FFE066", position: [6, 3, 0] as [number, number, number], earType: "pointy" as const, type: "electric" as const },
    { name: "Leaf", color: "#7CDB6E", position: [-3, -3, 0] as [number, number, number], earType: "floppy" as const, type: "plant" as const },
    { name: "Frost", color: "#B3E5FC", position: [3, -3, 0] as [number, number, number], earType: "round" as const, type: "ice" as const },
  ];

  return (
    <div className="w-full h-full bg-gray-900">
        <header className="absolute top-0 left-0 right-0 p-8 text-center z-10">
            <h1 className="text-5xl font-bold mb-3 text-white">3D Tazz Showcase</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">Hover over a Tazz to see it react. Drag to rotate the scene.</p>
        </header>
        <Canvas shadows dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
            
            {/* Lighting */}
            <ambientLight intensity={0.8} />
            <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffb0b0" />

            <Suspense fallback={null}>
                {tazzes.map((tazz) => (
                    <Tazz key={tazz.name} {...tazz} />
                ))}
            </Suspense>

            <OrbitControls enableZoom={true} enablePan={true} minDistance={10} maxDistance={40} />
        </Canvas>
    </div>
  );
};
