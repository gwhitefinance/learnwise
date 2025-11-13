"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Tazz from "@/components/Tazz";
import TazzLabel from "@/components/TazzLabel";
import { Suspense } from "react";

const getTypeEmoji = (type: string) => {
  switch (type) {
    case "fire": return "🔥";
    case "water": return "💧";
    case "electric": return "⚡";
    case "plant": return "🌿";
    case "ice": return "❄️";
    default: return "";
  }
};

const Index = () => {
  // Define 25 unique Tazzes with different colors, positions, ear types, names, and ABILITIES
  const tazzes = [
    // Row 1
    { name: "Blaze", color: "#FF6B4A", position: [-12, 6, 0] as [number, number, number], earType: "pointy" as const, pattern: "solid" as const, type: "fire" as const },
    { name: "Splash", color: "#4A9FFF", position: [-6, 6, 0] as [number, number, number], earType: "round" as const, pattern: "solid" as const, type: "water" as const },
    { name: "Sparky", color: "#FFE066", position: [0, 6, 0] as [number, number, number], earType: "pointy" as const, pattern: "solid" as const, type: "electric" as const },
    { name: "Leaf", color: "#7CDB6E", position: [6, 6, 0] as [number, number, number], earType: "floppy" as const, pattern: "solid" as const, type: "plant" as const },
    { name: "Frost", color: "#B3E5FC", position: [12, 6, 0] as [number, number, number], earType: "round" as const, pattern: "solid" as const, type: "ice" as const },
    
    // Row 2
    { name: "Ember", color: "#FF8C69", position: [-12, 2, 0] as [number, number, number], earType: "pointy" as const, pattern: "spots" as const, type: "fire" as const },
    { name: "Aqua", color: "#64B5F6", position: [-6, 2, 0] as [number, number, number], earType: "floppy" as const, pattern: "solid" as const, type: "water" as const },
    { name: "Volt", color: "#FFF176", position: [0, 2, 0] as [number, number, number], earType: "pointy" as const, pattern: "solid" as const, type: "electric" as const },
    { name: "Sprout", color: "#A5D6A7", position: [6, 2, 0] as [number, number, number], earType: "round" as const, pattern: "solid" as const, type: "plant" as const },
    { name: "Snowball", color: "#E1F5FE", position: [12, 2, 0] as [number, number, number], earType: "round" as const, pattern: "spots" as const, type: "ice" as const },
    
    // Row 3
    { name: "Inferno", color: "#FF5722", position: [-12, -2, 0] as [number, number, number], earType: "floppy" as const, pattern: "solid" as const, type: "fire" as const },
    { name: "Ripple", color: "#42A5F5", position: [-6, -2, 0] as [number, number, number], earType: "round" as const, pattern: "solid" as const, type: "water" as const },
    { name: "Thunder", color: "#FFEB3B", position: [0, -2, 0] as [number, number, number], earType: "pointy" as const, pattern: "spots" as const, type: "electric" as const },
    { name: "Blossom", color: "#81C784", position: [6, -2, 0] as [number, number, number], earType: "floppy" as const, pattern: "solid" as const, type: "plant" as const },
    { name: "Glacier", color: "#B2EBF2", position: [12, -2, 0] as [number, number, number], earType: "pointy" as const, pattern: "solid" as const, type: "ice" as const },
    
    // Row 4
    { name: "Scorch", color: "#FF7043", position: [-12, -6, 0] as [number, number, number], earType: "round" as const, pattern: "solid" as const, type: "fire" as const },
    { name: "Wave", color: "#29B6F6", position: [-6, -6, 0] as [number, number, number], earType: "pointy" as const, pattern: "solid" as const, type: "water" as const },
    { name: "Zap", color: "#FDD835", position: [0, -6, 0] as [number, number, number], earType: "floppy" as const, pattern: "solid" as const, type: "electric" as const },
    { name: "Petal", color: "#66BB6A", position: [6, -6, 0] as [number, number, number], earType: "round" as const, pattern: "spots" as const, type: "plant" as const },
    { name: "Icicle", color: "#80DEEA", position: [12, -6, 0] as [number, number, number], earType: "round" as const, pattern: "solid" as const, type: "ice" as const },
    
    // Row 5
    { name: "Flare", color: "#FF6E40", position: [-12, -10, 0] as [number, number, number], earType: "pointy" as const, pattern: "solid" as const, type: "fire" as const },
    { name: "Bubble", color: "#4FC3F7", position: [-6, -10, 0] as [number, number, number], earType: "round" as const, pattern: "spots" as const, type: "water" as const },
    { name: "Bolt", color: "#FFEE58", position: [0, -10, 0] as [number, number, number], earType: "pointy" as const, pattern: "solid" as const, type: "electric" as const },
    { name: "Vine", color: "#4CAF50", position: [6, -10, 0] as [number, number, number], earType: "floppy" as const, pattern: "solid" as const, type: "plant" as const },
    { name: "Crystal", color: "#B3E5FC", position: [12, -10, 0] as [number, number, number], earType: "round" as const, pattern: "solid" as const, type: "ice" as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-8 px-4 text-center">
        <h1 className="text-5xl font-bold mb-3 text-foreground">
          Meet the Baby Tazzes! 🌟
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Each Tazz has unique elemental abilities! 🔥 Fire • 💧 Water • ⚡ Electric • 🌿 Plant • ❄️ Ice
          <br />
          Hover over them to see them spin with joy!
        </p>
      </header>

      {/* 3D Canvas */}
      <div className="w-full h-[calc(100vh-180px)]">
        <Canvas shadows dpr={[1, 1.5]} performance={{ min: 0.5 }}>
          <PerspectiveCamera makeDefault position={[0, 0, 32]} />
          
          {/* Lighting - simplified for performance */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.4} color="#ffd7e5" />
          
          <Suspense fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#FFB6D9" />
            </mesh>
          }>
            {/* Render all 25 Tazzes with their names and types */}
            {tazzes.map((tazz, index) => (
              <group key={index}>
                <Tazz
                  name={tazz.name}
                  color={tazz.color}
                  position={tazz.position}
                  earType={tazz.earType}
                  pattern={tazz.pattern}
                  type={tazz.type}
                />
                <TazzLabel name={`${tazz.name} ${getTypeEmoji(tazz.type)}`} position={tazz.position} />
              </group>
            ))}
          </Suspense>

          {/* Camera controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minDistance={15}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground">
        <p className="text-sm">
          💝 Drag to rotate • Scroll to zoom • Click a Tazz to interact 💝
        </p>
      </footer>
    </div>
  );
};

export default Index;
