
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
  shake: { rotate: [0, -3, 3, -3, 3, 0], transition: { duration: 0.5 } },
  crack: {
    y: [0, -10, 0],
    rotate: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.7 }
  },
  breakTop: {
    y: -50,
    x: -20,
    rotate: -35,
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.8, delay: 0.3, ease: 'easeOut' }
  },
  breakBottom: {
    y: 20,
    scale: 0.95,
    opacity: 0,
    transition: { duration: 0.8, delay: 0.3, ease: 'easeOut' }
  }
};

const tazVariants = {
    hidden: { scale: 0, y: 20 },
    visible: { scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10, delay: 0.5 } }
}

const tazSpecies = ["Bulby", "Spike", "Goop", "Ghosty", "Rocky", "Leafy", "Dino", "Flarie", "Aquan", "Terran", "Volty", "Pilgrim", "Turkey", "Viking", "Fedora", "Knight"];

export default function HatchPage() {
    const [hatchState, setHatchState] = useState<'idle' | 'shaking' | 'cracking' | 'hatched'>('idle');
    const [petName, setPetName] = useState('');
    const [petColor, setPetColor] = useState('');
    const [petSpecies, setPetSpecies] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    useEffect(() => {
        // Generate a unique pet color and species based on user ID
        if (user) {
            const hash = user.uid.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
            const hue = hash % 360;
            const speciesIndex = Math.abs(hash) % tazSpecies.length;
            setPetColor(`hsl(${hue}, 70%, 60%)`);
            setPetSpecies(tazSpecies[speciesIndex]);
        }
    }, [user]);

    const handleHatch = () => {
        setHatchState('shaking');
        setTimeout(() => setHatchState('cracking'), 500);
        setTimeout(() => setHatchState('hatched'), 1200);
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
                    color: petColor,
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
                                viewBox="0 0 100 125"
                                className="absolute inset-0 w-full h-full drop-shadow-lg"
                                style={{ transformOrigin: "bottom center" }}
                                variants={eggShellVariants}
                                animate={hatchState}
                            >
                                <motion.path
                                    d="M 50,5 C 20,5 10,40 10,75 C 10,110 40,120 50,120 C 60,120 90,110 90,75 C 90,40 80,5 50,5 Z"
                                    fill="#fefce8"
                                    stroke="#fde047"
                                    strokeWidth="1"
                                />
                                {hatchState === 'cracking' && (
                                    <motion.path
                                        d="M 40 50 L 60 70 M 50 50 L 45 75"
                                        stroke="#a16207"
                                        strokeWidth="1.5"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    />
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
