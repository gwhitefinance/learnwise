
'use client';

import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { RewardContext } from '@/context/RewardContext';
import AIBuddy from '@/components/ai-buddy';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import TazCoinIcon from './TazCoinIcon';
import confetti from 'canvas-confetti';

export default function RewardPopup() {
    const { rewardInfo, isRewardVisible, hideReward } = useContext(RewardContext);
    const [user] = useAuthState(auth);
    const [customizations, setCustomizations] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user && isRewardVisible) {
            const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
            if(savedCustomizations) {
                try {
                    setCustomizations(JSON.parse(savedCustomizations));
                } catch(e) {
                    // handle error if JSON is malformed
                }
            }
            // Trigger confetti when the popup is shown
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [user, isRewardVisible]);


    const getMessage = () => {
        if (!rewardInfo) return null;
        switch (rewardInfo.type) {
            case 'coins_and_xp':
                return (
                    <div className="text-center">
                        <p className="font-semibold text-lg">You earned a reward!</p>
                        <div className="flex justify-center items-center gap-4 mt-2">
                             <span className="font-bold text-amber-500 flex items-center justify-center gap-1"><TazCoinIcon className="w-5 h-5"/> +{rewardInfo.amount}</span>
                             <span className="font-bold text-blue-500 flex items-center justify-center gap-1"><Star className="w-4 h-4 fill-current"/> +{rewardInfo.xp} XP</span>
                        </div>
                    </div>
                )
            default:
                return null;
        }
    };
    
    return (
        <AnimatePresence>
            {isRewardVisible && rewardInfo && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
                    onClick={hideReward}
                >
                    <motion.div 
                        initial={{ scale: 0.5, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm relative bg-card/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-border/30 text-card-foreground"
                    >
                        <button
                            onClick={hideReward}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col items-center text-center gap-4">
                             <div className="w-32 h-32">
                                <AIBuddy 
                                    isStatic={false}
                                    className="w-full h-full" 
                                    {...customizations}
                                />
                            </div>
                            {getMessage()}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
