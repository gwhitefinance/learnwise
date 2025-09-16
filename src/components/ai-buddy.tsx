
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import shopItems from '@/lib/shop-items.json';

export default function AIBuddy() {
    const [user] = useAuthState(auth);
    const [customizations, setCustomizations] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!user) return;
        // Load saved customizations for the robot preview
        const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
        if(savedCustomizations) {
            setCustomizations(JSON.parse(savedCustomizations));
        }

        // Listen for real-time changes to update equipped items if needed
        const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
            const data = doc.data();
            // This could be used to sync customizations across devices in the future
        });

        return () => unsub();

    }, [user]);

    const robotColor = shopItems.colors.find(c => c.name === customizations.color)?.hex || '#4f4f4f';
    const RobotHat = shopItems.hats.find(h => h.name === customizations.hat)?.component;

    return (
        <div className="relative w-40 h-40">
            {RobotHat && (
                <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 z-10"
                    dangerouslySetInnerHTML={{ __html: RobotHat }}
                />
            )}
            <div
                className="w-full h-full rounded-full transition-colors duration-500"
                style={{ backgroundColor: robotColor }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2/3 h-1/4 bg-black/30 rounded-full flex items-center justify-center">
                        <div className="w-1/2 h-1/2 bg-white rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
