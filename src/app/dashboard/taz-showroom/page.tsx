
'use client';

import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// A single tree component
const Tree = (props: JSX.IntrinsicElements['group']) => (
    <group {...props}>
        <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
            <meshStandardMaterial color="#4a3a2a" flatShading />
        </mesh>
        <mesh position={[0, 4, 0]} castShadow>
            <coneGeometry args={[2, 4, 8]} />
            <meshStandardMaterial color="#2a6a4a" flatShading />
        </mesh>
    </group>
);

// The main rocket model
const Rocket = () => (
    <group rotation={[0.4, 0.3, 0.6]} position={[0, -0.5, 0]}>
        {/* Main Body */}
        <mesh castShadow>
            <cylinderGeometry args={[1.5, 1.5, 14, 12]} />
            <meshStandardMaterial color="#f0f0f0" flatShading />
        </mesh>

        {/* Stripes */}
        {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[0, -4 + i * 4, 0]}>
                <cylinderGeometry args={[1.52, 1.52, 1.5, 12]} />
                <meshStandardMaterial color="#ff3333" flatShading />
            </mesh>
        ))}

        {/* Nose Cone */}
        <mesh position={[0, 9, 0]} castShadow>
            <coneGeometry args={[1.5, 4, 12]} />
            <meshStandardMaterial color="#ff4444" flatShading />
        </mesh>

        {/* Window */}
        <mesh position={[0, 3, 1.51]}>
            <circleGeometry args={[0.8, 16]} />
            <meshStandardMaterial color="#88ccff" emissive="#4488cc" emissiveIntensity={0.5} />
        </mesh>

        {/* Fins */}
        {[...Array(4)].map((_, i) => {
            const angle = (i / 4) * Math.PI * 2;
            return (
                <mesh
                    key={i}
                    castShadow
                    position={[Math.cos(angle) * 1.7, -5, Math.sin(angle) * 1.7]}
                    rotation={[0, angle, 0]}
                >
                    <boxGeometry args={[0.4, 4, 3]} />
                    <meshStandardMaterial color="#4488ff" flatShading />
                </mesh>
            );
        })}

        {/* Nozzle */}
        <mesh position={[0, -8.5, 0]} castShadow>
            <cylinderGeometry args={[1.2, 1.8, 2.5, 12]} />
            <meshStandardMaterial color="#333333" flatShading />
        </mesh>

        {/* Text placeholder */}
        <mesh position={[0, 1, 1.55]}>
             <boxGeometry args={[2.5, 1, 0.1]} />
             <meshStandardMaterial color="#000000" flatShading />
        </mesh>
    </group>
);

const Ground = () => {
  const groundRef = useRef<THREE.Mesh>(null!);
  
  useEffect(() => {
    if (!groundRef.current) return;
    
    const vertices = groundRef.current.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const dist = Math.sqrt(x * x + y * y);
      if (dist < 12) {
        vertices[i + 2] = -Math.pow((12 - dist) / 12, 2) * 5;
      } else {
        vertices[i + 2] = Math.sin(x * 0.2) * 0.3 + Math.cos(y * 0.2) * 0.3;
      }
    }
    groundRef.current.geometry.attributes.position.needsUpdate = true;
    groundRef.current.geometry.computeVertexNormals();
  }, []);

  return (
    <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 120, 60, 60]} />
      <meshStandardMaterial color={0x3a5a4a} roughness={0.9} flatShading />
    </mesh>
  );
};

const Debris = () => {
    const debris = useMemo(() => {
        const largeDebris = [];
        const debrisColors = [0xf0f0f0, 0xff3333, 0x4488ff, 0x333333, 0xff6600];
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 3 + Math.random() * 8;
            largeDebris.push({
                position: [Math.cos(angle) * distance, -2 + Math.random() * 1, Math.sin(angle) * distance],
                rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
                scale: [0.5 + Math.random() * 1.5, 0.5 + Math.random() * 1.5, 0.5 + Math.random() * 1.5],
                color: debrisColors[Math.floor(Math.random() * debrisColors.length)],
            });
        }
        return largeDebris;
    }, []);

    return (
        <group>
            {debris.map((d, i) => (
                <mesh key={i} position={d.position as any} rotation={d.rotation as any} scale={d.scale as any} castShadow>
                    <boxGeometry />
                    <meshStandardMaterial color={d.color} flatShading />
                </mesh>
            ))}
        </group>
    );
};

const Sparks = () => {
    const sparkRef = useRef<THREE.Group>(null);
    useFrame(() => {
        if (sparkRef.current) {
            sparkRef.current.children.forEach((spark: any) => {
                spark.position.y += spark.velocity;
                if (spark.position.y > 8) {
                    spark.position.y = -1;
                }
            });
        }
    });

    const sparks = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 30; i++) {
            temp.push({
                position: [(Math.random() - 0.5) * 3, Math.random() * 3 - 1, (Math.random() - 0.5) * 3],
                velocity: Math.random() * 0.05 + 0.03,
                color: Math.random() > 0.5 ? 0xff6600 : 0xffaa00
            });
        }
        return temp;
    }, []);

    return (
        <group ref={sparkRef}>
            {sparks.map((s, i) => (
                <mesh key={i} position={s.position as any} userData={{ velocity: s.velocity }}>
                    <sphereGeometry args={[0.15, 6, 6]} />
                    <meshBasicMaterial color={s.color} transparent opacity={0.8} />
                </mesh>
            ))}
        </group>
    );
};

const CrashScene = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    cameraRef.current.position.x = Math.sin(time * 0.15) * 3;
    cameraRef.current.lookAt(0, 2, 0);
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={75} position={[0, 12, 20]} />
      <ambientLight color={0x3a4a6a} intensity={0.5} />
      <directionalLight 
        color={0x6a8fb8} 
        intensity={1} 
        position={[-10, 30, 5]} 
        castShadow
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <pointLight color={0xff6600} intensity={2} distance={25} position={[0, 3, 0]} />
      <pointLight color={0x00ffff} intensity={1.5} distance={20} position={[0, 2, 0]} />
      
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />
      
      <mesh position={[-30, 40, -50]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color={0xffffcc} />
      </mesh>
      
      <Ground />
      <Rocket />
      <Debris />
      <Sparks />

      {[...Array(25)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 18 + Math.random() * 25;
        return <Tree key={i} position={[Math.cos(angle) * distance, 0, Math.sin(angle) * distance]} />;
      })}
    </>
  );
};


export default function CrashSitePage() {
    const router = useRouter();
    return (
        <div className="w-full h-screen bg-[#0a0e27]">
             <Button variant="ghost" onClick={() => router.push('/dashboard')} className="absolute top-6 left-6 z-20 text-white hover:bg-white/10 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <div className="absolute bottom-6 left-6 z-20">
                <div className="w-16 h-16 bg-white/10 border-2 border-white/50 rounded-xl flex items-center justify-center text-3xl">🚀</div>
            </div>
            <div className="absolute bottom-6 right-6 z-20 text-white font-mono">
                1920 x 1080
            </div>
            <Canvas shadows>
                <Suspense fallback={null}>
                    <CrashScene />
                </Suspense>
            </Canvas>
        </div>
    );
}

