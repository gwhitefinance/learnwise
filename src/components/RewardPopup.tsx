
'use client';

import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gem } from 'lucide-react';
import { RewardContext } from '@/context/RewardContext';
import AIBuddy from '@/components/ai-buddy';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export default function RewardPopup() {
    const { rewardInfo, isRewardVisible, hideReward } = useContext(RewardContext);
    const [user] = useAuthState(auth);
    const [customizations, setCustomizations] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
            if(savedCustomizations) {
                setCustomizations(JSON.parse(savedCustomizations));
            }
        }
    }, [user, isRewardVisible]);


    const getMessage = () => {
        if (!rewardInfo) return null;
        switch (rewardInfo.type) {
            case 'xp':
                return <p className="text-sm text-muted-foreground">You earned <span className="font-bold text-primary">+{rewardInfo.amount} XP!</span> Keep up the great work.</p>;
            case 'coins':
                return <p className="text-sm text-muted-foreground">You earned <span className="font-bold text-amber-500 flex items-center justify-center gap-1"><Gem size={14}/> +{rewardInfo.amount} Coins!</span></p>;
            case 'levelUp':
                return (
                    <div className="text-center">
                        <p className="font-bold text-lg text-primary">Level Up! You are now Level {rewardInfo.level}!</p>
                        <p className="text-sm text-muted-foreground mt-1">You also earned <span className="font-bold text-amber-500 flex items-center justify-center gap-1"><Gem size={14}/> +{rewardInfo.coins} Coins!</span></p>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <AnimatePresence>
            {isRewardVisible && rewardInfo && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed bottom-8 right-8 z-50"
                >
                    <div className="w-[400px] relative bg-card/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-border/30 text-card-foreground">
                        <button
                            onClick={hideReward}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col items-center text-center gap-4">
                            <AIBuddy 
                                className="w-24 h-24" 
                                color={customizations.color}
                                hat={customizations.hat}
                                shirt={customizations.shirt}
                                shoes={customizations.shoes}
                            />
                            {getMessage()}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
