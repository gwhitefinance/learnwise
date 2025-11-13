
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AIBuddy from "./ai-buddy";

// UFO and Parts Components
const UFO = ({ foundParts }: { foundParts: string[] }) => (
    <div className="relative w-64 h-32">
        {/* Main Body */}
        <div className="absolute bottom-4 left-0 w-full h-16 bg-gray-400 rounded-full border-2 border-gray-500 shadow-lg" />
        {/* Cockpit */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-cyan-300/50 rounded-full border-2 border-cyan-300 shadow-inner" />
        {/* Lights */}
        <div className="absolute bottom-5 left-10 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
        <div className="absolute bottom-5 right-10 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
        <AnimatePresence>
            {foundParts.includes("light1") && (
                <motion.div key="light1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-5 left-20 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            )}
            {foundParts.includes("light2") && (
                <motion.div key="light2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-5 right-20 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            )}
        </AnimatePresence>
    </div>
);

const Strut = () => (
    <div className="w-4 h-12 bg-gray-500 rounded-t-sm border-b-8 border-gray-700" />
);

const CollectiblePart = ({ partType, onCollect }: { partType: string; onCollect: (type: string) => void }) => {
    return (
        <motion.div
            onClick={() => onCollect(partType)}
            className="absolute cursor-pointer"
            whileHover={{ scale: 1.1 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
            {partType.includes('strut') ? (
                <div className="w-4 h-12 bg-yellow-400 rounded-t-sm border-b-8 border-yellow-600 shadow-lg" />
            ) : (
                <div className="w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-white/50" />
            )}
        </motion.div>
    );
};


// Main Scene Component
export default function TazShowroomScene() {
    const [foundParts, setFoundParts] = useState<string[]>([]);
    const totalParts = 4;

    const handlePartCollect = (partType: string) => {
        if (!foundParts.includes(partType)) {
            setFoundParts(prev => [...prev, partType]);
        }
    };

    const isVictory = foundParts.length === totalParts;

    const partPositions = {
        strut1: { top: '70%', left: '15%' },
        strut2: { top: '65%', left: '80%' },
        light1: { top: '50%', left: '5%' },
        light2: { top: '40%', left: '90%' },
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-gray-900 text-white flex items-center justify-center">
            {/* Background Stars */}
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                />
            ))}

            {/* Ground */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-green-900/50 rounded-t-full" />
            
            {/* UFO Crash Site */}
            <div className="relative flex flex-col items-center">
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                >
                    <UFO foundParts={foundParts} />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end justify-center gap-12">
                        <Strut />
                         <AnimatePresence>
                            {foundParts.includes("strut1") && <motion.div key="strut1" initial={{opacity: 0}} animate={{opacity: 1}}><Strut /></motion.div>}
                        </AnimatePresence>
                        <div className="w-48"/>
                         <AnimatePresence>
                            {foundParts.includes("strut2") && <motion.div key="strut2" initial={{opacity: 0}} animate={{opacity: 1}}><Strut /></motion.div>}
                        </AnimatePresence>
                        <Strut />
                    </div>
                </motion.div>
                <div className="absolute top-1/2 -translate-y-1/3">
                    <AIBuddy isStatic={true} className="w-24 h-24" />
                </div>
            </div>

            {/* Collectible Parts */}
            {Object.entries(partPositions).map(([part, pos]) => 
                !foundParts.includes(part) && (
                    <div key={part} style={{ top: pos.top, left: pos.left }} className="absolute">
                        <CollectiblePart partType={part} onCollect={handlePartCollect} />
                    </div>
                )
            )}

            {/* UI Overlays */}
            <div className="absolute top-5 left-5 bg-black/70 p-4 rounded-lg font-bold border-2 border-blue-400">
                Parts Found: <span className="text-green-400">{foundParts.length}</span> / {totalParts}
            </div>
            <div className="absolute top-5 right-5 bg-black/70 p-4 rounded-lg max-w-sm">
                🔍 Click on the glowing UFO parts scattered around to repair the ship!
            </div>

            <AnimatePresence>
                {isVictory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-black/80 flex items-center justify-center text-center"
                    >
                        <div>
                            <h2 className="text-4xl font-bold text-green-400">🎉 ALL PARTS FOUND! 🎉</h2>
                            <p className="text-xl text-white mt-2">The UFO is restored!</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
