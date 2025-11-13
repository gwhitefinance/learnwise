
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import AIBuddy from '@/components/ai-buddy';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const eggShellVariants = {
    initial: { rotate: 0, scale: 1 },
    shake: { 
        rotate: [0, -2, 2, -2, 2, 0], 
        transition: { duration: 0.5 } 
    },
    crack: {
        y: [0, -5, 0],
        scale: 1.02,
        transition: { duration: 0.7, delay: 0.5 }
    },
};

const crackVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
        pathLength: 1,
        opacity: 1,
        transition: {
            pathLength: { delay: 1 + i * 0.1, type: "spring", duration: 0.5, bounce: 0 },
            opacity: { delay: 1 + i * 0.1, duration: 0.01 }
        }
    })
};

const breakVariants = {
    hidden: { opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 },
    break: (i: number) => ({
        opacity: 0,
        scale: 0.8,
        rotate: (i % 2 === 0 ? 1 : -1) * (15 + Math.random() * 15),
        x: (Math.random() - 0.5) * 80,
        y: -40 + (Math.random() * -60),
        transition: { duration: 0.8, delay: 1.8, ease: 'easeOut' }
    })
}

const tazVariants = {
    hidden: { scale: 0, y: 20 },
    visible: { scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10, delay: 2 } }
}

const tazSpecies = ["Zappy", "Seedling", "Ember", "Shelly", "Puff", "Goo", "Chirpy", "Sparky", "Rocky", "Splash", "Bear", "Panda", "Bunny", "Boo", "Roly", "Whispy", "Spikey", "Bubbles"];


export default function HatchPage() {
    const [hatchState, setHatchState] = useState<'idle' | 'shaking' | 'cracking' | 'hatched'>('idle');
    const [petName, setPetName] = useState('');
    const [petColor, setPetColor] = useState('');
    const [petSpecies, setPetSpecies] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    useEffect(() => {
        if (user) {
            const hash = user.uid.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
            const speciesIndex = Math.abs(hash) % tazSpecies.length;
            setPetSpecies(tazSpecies[speciesIndex]);
        }
    }, [user]);

    const handleHatch = () => {
        setHatchState('shaking');
        setTimeout(() => setHatchState('cracking'), 500);
        setTimeout(() => setHatchState('hatched'), 2600); // Increased delay to allow animations
    };

    const handleContinue = async () => {
        if (!petName.trim()) {
            toast({ variant: 'destructive', title: "Your Taz needs a name!" });
            return;
        }
        if (user) {
            localStorage.setItem(`aiBuddyName`, petName);
            
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                taz: {
                    name: petName,
                    species: petSpecies,
                    level: 1,
                    xp: 0,
                }
            });
        }
        router.push('/dashboard');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8 text-center">
            <AnimatePresence mode="wait">
                {hatchState !== 'hatched' ? (
                    <motion.div
                        key="egg-stage"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <h1 className="text-4xl font-bold mb-4">A new companion appears!</h1>
                        <p className="text-muted-foreground text-lg mb-12">This is your new AI-powered study buddy, a Taz. What's inside?</p>
                        
                        <div className="relative w-64 h-80 mx-auto cursor-pointer" onClick={handleHatch}>
                             <motion.svg
                                viewBox="0 0 200 250"
                                className="absolute inset-0 w-full h-full drop-shadow-lg"
                                style={{ transformOrigin: "bottom center" }}
                                variants={eggShellVariants}
                                animate={hatchState === 'shaking' || hatchState === 'cracking' ? 'shake' : 'initial'}
                            >
                                <defs>
                                    <linearGradient id="eggGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{stopColor: "#fdfdfd"}} />
                                        <stop offset="100%" style={{stopColor: "#e4e4e7"}} />
                                    </linearGradient>
                                    <filter id="innerShadow">
                                        <feFlood floodColor="#a1a1aa" result="outside-color"/>
                                        <feComposite in="SourceGraphic" in2="outside-color" operator="atop"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feComposite in="SourceGraphic" in2="blur" operator="in"/>
                                    </filter>
                                </defs>
                                
                                {/* Base Egg Shape */}
                                <motion.g variants={breakVariants} custom={0} animate={hatchState === 'cracking' ? 'break' : 'hidden'}>
                                    <path 
                                        d="M 100,5 C 40,5 20,80 20,150 C 20,220 80,245 100,245 C 120,245 180,220 180,150 C 180,80 160,5 100,5 Z"
                                        fill="url(#eggGradient)"
                                        stroke="#18181b"
                                        strokeWidth="2.5"
                                    />
                                    {/* Highlight */}
                                    <path d="M 100,20 C 70,20 60,60, 80,100 C 100,140 130,120 130,80 C 130,40 120,20 100,20 Z" fill="white" opacity="0.4" />
                                    {/* Shadow */}
                                    <path d="M 100,220 C 140,220 160,180 140,140 C 120,100 80,120 80,160 C 80,200 80,220 100,220 Z" fill="#000000" opacity="0.05" style={{filter: 'url(#innerShadow)'}}/>
                                </motion.g>

                                {/* Cracks */}
                                {hatchState === 'cracking' && (
                                    <>
                                        <motion.path d="M 90 60 L 110 90 L 95 110 L 115 130" stroke="#18181b" strokeWidth="1.5" fill="none" variants={crackVariants} custom={1} initial="hidden" animate="visible" />
                                        <motion.path d="M 110 90 L 130 110" stroke="#18181b" strokeWidth="1.5" fill="none" variants={crackVariants} custom={2} initial="hidden" animate="visible" />
                                        <motion.path d="M 80 150 L 95 110" stroke="#18181b" strokeWidth="1.5" fill="none" variants={crackVariants} custom={3} initial="hidden" animate="visible" />
                                        <motion.path d="M 100 200 L 115 130" stroke="#18181b" strokeWidth="1.5" fill="none" variants={crackVariants} custom={4} initial="hidden" animate="visible" />
                                        <motion.path d="M 60 120 L 95 110" stroke="#18181b" strokeWidth="1.5" fill="none" variants={crackVariants} custom={5} initial="hidden" animate="visible" />
                                    </>
                                )}
                            </motion.svg>
                        </div>

                         <Button size="lg" onClick={handleHatch} className="mt-12" disabled={hatchState !== 'idle'}>
                            <Sparkles className="mr-2 h-5 w-5"/> {hatchState === 'idle' ? 'Hatch Your Egg' : 'Hatching...'}
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="hatched-stage"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md"
                    >
                        <h1 className="text-4xl font-bold mb-4">It's a baby {petSpecies}!</h1>
                        <p className="text-muted-foreground text-lg mb-8">This little creature will grow as you learn. Give it a name!</p>
                        
                        <div className="w-48 h-48 mx-auto">
                            <motion.div variants={tazVariants} initial="hidden" animate="visible">
                                <AIBuddy species={petSpecies} color={petColor} className="w-full h-full"/>
                            </motion.div>
                        </div>
                        
                        <div className="mt-8">
                            <Input 
                                placeholder="e.g., Sparky, Bolt, Chip..."
                                className="h-12 text-center text-lg"
                                value={petName}
                                onChange={(e) => setPetName(e.target.value)}
                            />
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button size="lg" onClick={handleContinue} disabled={!petName.trim()}>
                                Let's Start Learning!
                               <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
