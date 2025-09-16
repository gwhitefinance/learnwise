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

        const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
            // This could be used to sync customizations across devices in the future
        });

        return () => unsub();

    }, [user]);

    const robotColor = shopItems.colors.find(c => c.name === customizations.color)?.hex || '#D97706'; // Moby's default orange
    const RobotHat = shopItems.hats.find(h => h.name === customizations.hat)?.component;

    return (
        <div className="relative w-40 h-48">
             {RobotHat && (
                <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-24 z-10"
                    dangerouslySetInnerHTML={{ __html: RobotHat }}
                />
            )}
            <svg viewBox="0 0 150 170" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <style>
                    {`
                        .moby-eye-pupil {
                            animation: moby-thinking 3s ease-in-out infinite;
                        }
                        @keyframes moby-thinking {
                            0%, 100% { r: 4; }
                            50% { r: 2; }
                        }
                    `}
                </style>
                {/* Legs */}
                <g id="legs">
                    <rect x="40" y="125" width="20" height="30" fill="#a1a1aa" />
                    <rect x="90" y="125" width="20" height="30" fill="#a1a1aa" />
                    <path d="M 35 155 L 65 155 L 60 165 L 40 165 Z" fill={robotColor} stroke="#6b460a" strokeWidth="2"/>
                    <path d="M 85 155 L 115 155 L 110 165 L 90 165 Z" fill={robotColor} stroke="#6b460a" strokeWidth="2"/>
                    <path d="M 35 165 L 50 170 L 60 165 Z" fill="#facc15" stroke="#6b460a" strokeWidth="2"/>
                    <circle cx="100" cy="162.5" r="7.5" fill="#facc15" stroke="#6b460a" strokeWidth="2"/>
                </g>

                {/* Arms */}
                <g id="arms">
                    {/* Left Arm */}
                    <rect x="20" y="60" width="15" height="50" fill="#a1a1aa" />
                    <path d="M 15 110 C 5 110, 5 130, 15 130 L 40 130 C 50 130, 50 110, 40 110 Z" fill={robotColor} stroke="#6b460a" strokeWidth="2"/>
                    <path d="M 12 128 L 20 135 L 28 128" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round"/>
                    
                    {/* Right Arm */}
                    <rect x="115" y="60" width="15" height="50" fill="#a1a1aa" />
                    <path d="M 110 110 C 100 110, 100 130, 110 130 L 135 130 C 145 130, 145 110, 135 110 Z" fill={robotColor} stroke="#6b460a" strokeWidth="2"/>
                     <path d="M 122 128 L 130 135 L 138 128" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round"/>
                </g>
                
                {/* Body */}
                <path d="M 30 50 C 30 30, 120 30, 120 50 L 120 130 L 30 130 Z" fill={robotColor} stroke="#facc15" strokeWidth="3" />
                
                {/* Body Buttons */}
                <circle cx="55" cy="80" r="8" fill="#1e3a8a" stroke="#facc15" strokeWidth="1.5" />
                <circle cx="75" cy="80" r="8" fill="#1e3a8a" stroke="#facc15" strokeWidth="1.5" />
                <circle cx="95" cy="80" r="8" fill="#1e3a8a" stroke="#facc15" strokeWidth="1.5" />

                {/* Head */}
                <g id="head">
                    <path d="M 50 10 C 50 0, 100 0, 100 10 L 100 45 L 50 45 Z" fill={robotColor} stroke="#6b460a" strokeWidth="2"/>
                    <rect x="40" y="20" width="10" height="15" fill="#facc15" rx="3"/>
                    <rect x="100" y="20" width="10" height="15" fill="#facc15" rx="3"/>
                    {/* Eyes */}
                    <circle cx="65" cy="25" r="8" fill="white" />
                    <circle cx="65" cy="25" r="4" fill="black" className="moby-eye-pupil" />
                    <circle cx="85" cy="25" r="8" fill="white" />
                    <circle cx="85" cy="25" r="4" fill="black" className="moby-eye-pupil" />
                    {/* Mouth */}
                    <path d="M 65 40 L 85 40" stroke="black" strokeWidth="2" strokeDasharray="4 2"/>
                </g>
            </svg>
        </div>
    );
}