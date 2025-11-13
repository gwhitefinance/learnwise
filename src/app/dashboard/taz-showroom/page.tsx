
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AIBuddy from '@/components/ai-buddy';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const allSpecies = ["Zappy", "Seedling", "Ember", "Shelly", "Puff", "Goo", "Chirpy", "Sparky", "Rocky", "Splash", "Bear", "Panda", "Bunny", "Boo", "Roly", "Whispy", "Spikey", "Bubbles"];

const Rocket = () => (
    <motion.g 
        initial={{ y: -200, rotate: -15 }}
        animate={{ y: 0, rotate: -15 }}
        transition={{ duration: 1, type: 'spring' }}
    >
        {/* Main Body */}
        <path d="M100 50 L120 180 L80 180 Z" fill="#E5E7EB" />
        <path d="M100 50 L120 180 L80 180 Z" stroke="#9CA3AF" strokeWidth="2" />
        
        {/* Window */}
        <circle cx="100" cy="100" r="15" fill="#60A5FA" stroke="white" strokeWidth="2" />

        {/* Fins */}
        <path d="M80 160 L60 190 L80 180 Z" fill="#F87171" />
        <path d="M120 160 L140 190 L120 180 Z" fill="#F87171" />

        {/* Smoke/Damage */}
        <motion.g
             animate={{
                opacity: [0.6, 0.9, 0.6],
                scale: [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <circle cx="90" cy="80" r="10" fill="gray" opacity="0.7" />
            <circle cx="110" cy="120" r="15" fill="gray" opacity="0.5" />
        </motion.g>
    </motion.g>
);

export default function CrashSitePage() {
    const router = useRouter();

    return (
        <div className="relative w-full h-screen bg-[#0a0e27] overflow-hidden flex items-center justify-center">
            {/* Stars */}
            {[...Array(100)].map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `twinkle ${2 + Math.random() * 4}s linear infinite`,
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                };
                return <div key={i} className="absolute bg-white rounded-full" style={style}></div>;
            })}
            
            <style jsx global>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
            
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="absolute top-6 left-6 z-20 text-white hover:bg-white/10 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            
            <div className="relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                     <svg viewBox="0 0 200 200" className="w-[600px] h-[600px] drop-shadow-2xl">
                        <Rocket />
                    </svg>
                </div>

                {allSpecies.map((species, i) => {
                     const angle = (i / allSpecies.length) * 2 * Math.PI;
                     const radius = 250 + (i % 3) * 40;
                     const x = 50 + (radius / 5) * Math.cos(angle);
                     const y = 50 + (radius / 200) * Math.sin(angle); // Flatter ellipse

                    return (
                        <motion.div
                            key={species}
                            className="absolute w-24 h-24"
                            style={{
                                left: `calc(${x}% - 48px)`,
                                top: `calc(${y}% - 48px)`,
                            }}
                             initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 1 + i * 0.1, type: 'spring' }}
                        >
                            <AIBuddy species={species} isStatic={false} />
                        </motion.div>
                    );
                })}
            </div>
             <div className="absolute bottom-10 text-center text-white/80 z-10">
                <h1 className="text-4xl font-bold">The Arrival</h1>
                <p>They've crash-landed, ready to help you learn!</p>
            </div>
        </div>
    );
}
