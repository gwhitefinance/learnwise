"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Dodecahedron, Plane } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from 'three';

const UFO = ({ foundParts }: { foundParts: string[] }) => {
    return (
        <group rotation={[0.25, 0.3, 0.4]} position={[0, 0.5, 0]}>
            {/* Body */}
            <mesh castShadow position={[0, 1, 0]} scale={[5, 0.8, 3.5]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color="#b8b8b8" flatShading metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh castShadow position={[0, 0.5, 0]} scale={[4.8, 0.6, 3.3]}>
                <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
                <meshStandardMaterial color="#888888" flatShading metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Windows */}
            {[ { x: -2, z: 0 }, { x: -0.7, z: 0 }, { x: 0.7, z: 0 }, { x: 2, z: 0 } ].map((pos, i) => (
                <mesh key={i} position={[pos.x, 1.3, pos.z + 3.5]} lookAt={new THREE.Vector3(pos.x, 1.3, pos.z + 10)}>
                    <circleGeometry args={[0.4, 12]} />
                    <meshStandardMaterial color="#ffffff" emissive="#aaddff" emissiveIntensity={0.8} flatShading />
                </mesh>
            ))}

            {/* Text placeholder */}
            <mesh position={[0, 1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <boxGeometry args={[3, 0.8, 0.1]} />
                <meshStandardMaterial color="#222222" flatShading />
            </mesh>
            
            {/* Struts */}
            <Strut position={[3, 0, 2]} />
            <Strut position={[-3, 0, 2]} />
            {foundParts.includes('strut1') && <Strut position={[3, 0, -2]} />}
            {foundParts.includes('strut2') && <Strut position={[-3, 0, -2]} />}

            {/* Lights */}
            <UfoLight position={[1.5, 0.3, 1]} />
            <UfoLight position={[-1.5, 0.3, 1]} />
            {foundParts.includes('light1') && <UfoLight position={[1.5, 0.3, -1]} />}
            {foundParts.includes('light2') && <UfoLight position={[-1.5, 0.3, -1]} />}
        </group>
    );
};

const Strut = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        <mesh position={[0, -1, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 2, 8]} />
            <meshStandardMaterial color="#666666" flatShading metalness={0.7} />
        </mesh>
        <mesh position={[0, -2.2, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.5, 0.3, 8]} />
            <meshStandardMaterial color="#444444" flatShading metalness={0.8} />
        </mesh>
    </group>
);

const UfoLight = ({ position }: { position: [number, number, number] }) => (
    <mesh position={position}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 12]} />
        <meshStandardMaterial color="#00ffff" flatShading emissive="#00ffff" emissiveIntensity={1} />
    </mesh>
);


const CollectiblePart = ({ partType, position, onCollect }: { partType: string, position: [number, number, number], onCollect: (type: string) => void }) => {
    const meshRef = useRef<THREE.Group>(null);
    const [collected, setCollected] = useState(false);
    
    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.2;
            meshRef.current.rotation.y += 0.02;
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation();
        if (!collected) {
            setCollected(true);
            onCollect(partType);
        }
    };
    
    if (collected) return null;

    if (partType.includes('strut')) {
        return (
            <group ref={meshRef} position={position} onClick={handleClick}>
                <mesh castShadow position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 2, 8]} />
                    <meshStandardMaterial color="#666666" flatShading metalness={0.7} emissive="#333333" emissiveIntensity={0.4} />
                </mesh>
                <mesh castShadow position={[0, -1.2, 0]}>
                    <cylinderGeometry args={[0.4, 0.5, 0.3, 8]} />
                    <meshStandardMaterial color="#444444" flatShading metalness={0.8} emissive="#222222" emissiveIntensity={0.4} />
                </mesh>
            </group>
        );
    } else {
        return (
            <mesh ref={meshRef as any} position={position} onClick={handleClick} castShadow>
                <cylinderGeometry args={[0.4, 0.4, 0.2, 12]} />
                <meshStandardMaterial color="#00ffff" flatShading emissive="#00ffff" emissiveIntensity={1.2} />
            </mesh>
        );
    }
};

const Ground = () => {
    const groundRef = useRef<THREE.Mesh>(null);
    const geo = useMemo(() => {
        const geometry = new THREE.PlaneGeometry(120, 120, 60, 60);
        const vertices = geometry.attributes.position.array;
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
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        return geometry;
    }, []);

    return (
        <mesh ref={groundRef} geometry={geo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <meshStandardMaterial color="#3a5a4a" roughness={0.9} flatShading />
        </mesh>
    );
};

const Aurora = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = clock.getElapsedTime();
        }
    });

    const shaderMaterial = {
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: { time: { value: 0 } },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                float wave1 = sin(vUv.x * 3.0 + time * 0.5) * 0.5 + 0.5;
                float wave2 = sin(vUv.x * 5.0 - time * 0.3) * 0.5 + 0.5;
                float wave3 = sin(vUv.y * 2.0 + time * 0.4) * 0.5 + 0.5;
                float intensity = wave1 * wave2 * wave3;
                vec3 color1 = vec3(0.0, 1.0, 0.5);
                vec3 color2 = vec3(0.2, 0.5, 1.0);
                vec3 color3 = vec3(0.8, 0.2, 1.0);
                vec3 color = mix(color1, color2, vUv.x);
                color = mix(color, color3, wave1);
                float alpha = intensity * (1.0 - vUv.y * 0.7) * 0.5;
                gl_FragColor = vec4(color, alpha);
            }
        `
    };

    return (
        <>
            <mesh position={[-20, 50, -80]} rotation={[-0.3, 0, 0]}>
                <planeGeometry args={[150, 80, 50, 25]} />
                <shaderMaterial ref={materialRef} {...shaderMaterial} />
            </mesh>
            <mesh position={[30, 45, -70]} rotation={[-0.4, 0.3, 0]}>
                <planeGeometry args={[150, 80, 50, 25]} />
                <shaderMaterial {...shaderMaterial} />
            </mesh>
            <mesh position={[0, 55, -90]} rotation={[-0.2, -0.2, 0]}>
                <planeGeometry args={[150, 80, 50, 25]} />
                <shaderMaterial {...shaderMaterial} />
            </mesh>
        </>
    );
};

const Trees = () => {
    const trees = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 15 + Math.random() * 30;
            const scale = 0.8 + Math.random() * 0.6;
            temp.push({
                position: [Math.cos(angle) * distance, 0, Math.sin(angle) * distance],
                scale: scale
            });
        }
        return temp;
    }, []);

    return (
        <group>
            {trees.map((tree, i) => (
                <group key={i} position={tree.position as [number, number, number]}>
                    <mesh castShadow position={[0, 2 * tree.scale, 0]}>
                        <cylinderGeometry args={[0.3 * tree.scale, 0.4 * tree.scale, 4 * tree.scale, 8]} />
                        <meshStandardMaterial color="#4a3a2a" flatShading />
                    </mesh>
                    <mesh castShadow position={[0, 4 * tree.scale, 0]}>
                        <coneGeometry args={[2 * tree.scale, 4 * tree.scale, 8]} />
                        <meshStandardMaterial color="#2a6a4a" flatShading />
                    </mesh>
                </group>
            ))}
        </group>
    );
};


const Scene = ({ onPartCollect }: { onPartCollect: (type: string) => void }) => {
    const { camera } = useThree();
    useFrame(({ clock }) => {
        camera.position.x = Math.sin(clock.getElapsedTime() * 0.15) * 3;
        camera.lookAt(0, 2, 0);
    });
    
    return (
        <>
            <ambientLight color={0x3a4a6a} intensity={0.6} />
            <directionalLight color={0x6a8fb8} intensity={1.2} position={[-10, 30, 5]} castShadow />
            <pointLight color={0xff6600} intensity={2} distance={25} position={[0, 3, 0]} />
            <pointLight color={0x00ffff} intensity={2} distance={30} position={[0, 2, 0]} />
            <pointLight color={0x00ff88} intensity={0.6} distance={100} position={[0, 50, -50]} />
            
            <Stars radius={150} depth={50} count={5000} factor={0.4} saturation={0} fade />
            <Aurora />

            <mesh position={[-30, 40, -50]}>
                <sphereGeometry args={[3, 32, 32]} />
                <meshBasicMaterial color={0xffffcc} />
            </mesh>

            <Ground />
            <Trees />
            
            <UFO foundParts={[]} />

            <CollectiblePart partType="strut1" position={[-7, -1.5, -4]} onCollect={onPartCollect} />
            <CollectiblePart partType="strut2" position={[8, -2, 3]} onCollect={onPartCollect} />
            <CollectiblePart partType="light1" position={[-5, -2, 6]} onCollect={onPartCollect} />
            <CollectiblePart partType="light2" position={[6, -1.8, -5]} onCollect={onPartCollect} />
            
            {/* Add more scene elements here like rocks, debris etc */}
        </>
    );
};

export default function TazShowroomCanvas() {
    const [foundParts, setFoundParts] = useState<string[]>([]);
    const totalParts = 4;

    const handlePartCollect = (partType: string) => {
        setFoundParts(prev => [...prev, partType]);
    };

    const isVictory = foundParts.length === totalParts;

    return (
        <div className="w-full h-full relative">
            <Canvas camera={{ position: [0, 12, 20], fov: 75 }} shadows>
                <Suspense fallback={null}>
                    <Scene onPartCollect={handlePartCollect} />
                    <UFO foundParts={foundParts} />
                </Suspense>
            </Canvas>
            <div className="absolute bottom-5 left-5 w-14 h-14 bg-white/10 border-2 border-white rounded-xl flex items-center justify-center text-3xl">🛸</div>
            <div className="absolute top-5 left-5 bg-black/70 text-white p-4 rounded-lg font-bold border-2 border-blue-400">
                Parts Found: <span className="text-green-400">{foundParts.length}</span> / {totalParts}
            </div>
             <div className="absolute top-5 right-5 bg-black/70 text-white p-4 rounded-lg max-w-sm">
                🔍 Click on the missing UFO parts scattered around the crash site to collect them!
            </div>
            {isVictory && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-center">
                    <div>
                        <h2 className="text-4xl font-bold text-green-400">🎉 ALL PARTS FOUND! 🎉</h2>
                        <p className="text-xl text-white mt-2">UFO restored!</p>
                    </div>
                </div>
            )}
        </div>
    );
}

    