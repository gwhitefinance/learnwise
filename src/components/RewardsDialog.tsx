'use client';

import { useState, useEffect, useContext } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { RewardContext } from '@/context/RewardContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import rewardsData from '@/lib/rewards.json';
import TazCoinIcon from './TazCoinIcon';

const Chest = ({ isOpen, onOpen, rarity }: { isOpen: boolean, onOpen: () => void, rarity: string }) => {
    const rarityClasses = {
        Common: 'from-gray-500 to-gray-700',
        Uncommon: 'from-green-500 to-green-700',
        Rare: 'from-blue-500 to-blue-700',
        Epic: 'from-purple-500 to-purple-700',
        Legendary: 'from-orange-500 to-orange-700',
    };

    return (
        <motion.div 
            className="relative w-48 h-48 cursor-pointer" 
            onClick={onOpen}
            animate={isOpen ? { scale: 1.5, zIndex: 50, transition: { duration: 0.3 } } : { scale: 1, zIndex: 1 }}
        >
            <motion.div
                className="absolute w-full h-full"
                animate={isOpen ? {
                    rotate: [0, -2, 2, -2, 2, 0],
                    transition: { duration: 0.5, delay: 0.3, repeat: 1, repeatType: "mirror" }
                } : {}}
            >
                <motion.div
                    className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-b rounded-md"
                    initial={false}
                    animate={{ scaleY: isOpen ? 0.95 : 1, y: isOpen ? 5 : 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: isOpen ? 1.3 : 0 }}
                >
                    <div className={cn("w-full h-full rounded-b-md bg-gradient-to-b", rarityClasses[rarity as keyof typeof rarityClasses] || rarityClasses.Common)}></div>
                    <div className="absolute inset-x-2 -top-2 h-4 bg-yellow-400 border-2 border-yellow-600 rounded-sm"></div>
                </motion.div>
                <motion.div
                    className="absolute top-0 left-0 w-full h-2/3 origin-bottom"
                    initial={false}
                    animate={{ rotateX: isOpen ? -110 : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: isOpen ? 1.3 : 0 }}
                >
                    <div className={cn("w-full h-full rounded-t-md bg-gradient-to-b", rarityClasses[rarity as keyof typeof rarityClasses] || rarityClasses.Common)}></div>
                    <div className="absolute inset-x-2 -bottom-2 h-4 bg-yellow-400 border-2 border-yellow-600 rounded-sm"></div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default function RewardsDialog({ streak }: { streak: number }) {
    const [user] = useAuthState(auth);
    const { showReward } = useContext(RewardContext);
    const { toast } = useToast();
    const [claimedChests, setClaimedChests] = useState<Record<string, boolean>>({});
    const [openedChest, setOpenedChest] = useState<string | null>(null);
    const [earnedAmount, setEarnedAmount] = useState(0);

    useEffect(() => {
        const todayStr = new Date().toDateString();
        const claims: Record<string, boolean> = {};
        rewardsData.chests.forEach(chest => {
            const lastClaimed = localStorage.getItem(`lastClaimed_${chest.id}`);
            if (lastClaimed === todayStr) {
                claims[chest.id] = true;
            }
        });
        setClaimedChests(claims);
    }, []);

    const handleClaim = async (chestId: string) => {
        if (!user || claimedChests[chestId]) return;

        const chest = rewardsData.chests.find(c => c.id === chestId);
        if (!chest) return;

        const [min, max] = chest.coinRange;
        const amount = Math.floor(Math.random() * (max - min + 1)) + min;
        
        setEarnedAmount(amount);
        setOpenedChest(chestId);

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { coins: increment(amount) });

            setTimeout(() => {
                // FIXED: Changed 'coins: amount' to 'amount: amount' to match type definition
                showReward({ type: 'coins_and_xp', amount: amount, xp: 0 });
                
                const todayStr = new Date().toDateString();
                localStorage.setItem(`lastClaimed_${chest.id}`, todayStr);
                setClaimedChests(prev => ({ ...prev, [chestId]: true }));
                setOpenedChest(null);
            }, 2500); // Show coin amount before closing

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error claiming reward.' });
            setOpenedChest(null);
        }
    };
    
    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Daily & Streak Rewards</DialogTitle>
                <DialogDescription>Claim your rewards for consistent learning. New rewards are available daily!</DialogDescription>
            </DialogHeader>
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewardsData.chests.map(chest => {
                    const isUnlocked = !chest.unlocksAt || streak >= chest.unlocksAt;
                    const isClaimed = claimedChests[chest.id];
                    const canClaim = isUnlocked && !isClaimed;

                    return (
                        <div key={chest.id} className="flex flex-col items-center gap-4 text-center">
                            <div className="relative">
                                <AnimatePresence>
                                    {openedChest === chest.id && (
                                         <motion.div
                                            initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, y: -80, scale: [1, 1.4, 1.2] }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8, delay: 1.5, type: 'spring' }}
                                            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 font-bold text-3xl text-amber-400"
                                            style={{ textShadow: '0 0 10px #f59e0b' }}
                                        >
                                            <TazCoinIcon className="w-8 h-8"/> +{earnedAmount}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <Chest isOpen={openedChest === chest.id} onOpen={() => canClaim && handleClaim(chest.id)} rarity={chest.rarity} />
                            </div>
                            <h4 className="font-semibold">{chest.name}</h4>
                            <p className="text-xs text-muted-foreground">{chest.description}</p>
                            <Button onClick={() => handleClaim(chest.id)} disabled={!canClaim} className="w-full">
                                {isUnlocked ? (isClaimed ? 'Claimed Today' : `Claim (+${chest.coinRange[0]}-${chest.coinRange[1]})`) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" /> Unlocks at {chest.unlocksAt}-day streak
                                    </>
                                )}
                            </Button>
                        </div>
                    )
                })}
            </div>
        </DialogContent>
    );
}