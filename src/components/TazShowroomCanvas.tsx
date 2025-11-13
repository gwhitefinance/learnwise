"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

export default function TazShowroomCanvas() {
  return (
    <div className="w-full h-screen">
      <Canvas>
        <Suspense fallback={null}>
          <ambientLight />
          <mesh>
            <boxGeometry />
            <meshStandardMaterial color="orange" />
          </mesh>
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
}
