"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Text } from "@react-three/drei";
import Tazz from "@/components/Tazz";

const tazzes = [
    { name: 'Sparky', color: '#facc15', earType: 'pointy', type: 'electric', pattern: 'stripes' },
    { name: 'Bubbles', color: '#89cff0', earType: 'round', type: 'water', pattern: 'spots' },
    { name: 'Fern', color: '#55a630', earType: 'floppy', type: 'plant', pattern: 'solid' },
    { name: 'Blaze', color: '#ff6700', earType: 'pointy', type: 'fire', pattern: 'solid' },
    { name: 'Frosty', color: '#cde4f0', earType: 'round', type: 'ice', pattern: 'spots' },
    { name: 'Peanut', color: '#d2b48c', earType: 'floppy', type: 'normal', pattern: 'solid' },
];

export default function TazSpeciesPage() {
  return (
    <div className="w-full h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="absolute top-8 left-1/2 -translate-x-1/2 text-3xl font-bold text-gray-800 dark:text-gray-200 z-10">
            3D Tazzes Showroom
        </h1>
        <Canvas camera={{ position: [0, 2, 12], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
            <Suspense fallback={null}>
                {tazzes.map((tazz, index) => (
                    <group key={tazz.name}>
                        <Tazz
                            position={[(index % 3 - 1) * 5, 0, Math.floor(index / 3) * -6]}
                            {...tazz}
                        />
                        <Text
                            position={[(index % 3 - 1) * 5, -1.5, Math.floor(index / 3) * -6]}
                            fontSize={0.5}
                            color="black"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {tazz.name}
                        </Text>
                    </group>
                ))}
                <Environment preset="sunset" />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Suspense>
        </Canvas>
    </div>
  );
}
