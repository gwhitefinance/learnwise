
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

// --- Body Shape Components ---

const BodyZappy = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 75 180 Q 60 200 85 195 Q 110 200 95 180" fill="#4B5563" />
        <path d="M 125 180 Q 110 200 135 195 Q 160 200 145 180" fill="#4B5563" />
        {/* Body */}
        <path d="M 60 180 C 40 120, 50 60, 100 60 C 150 60, 160 120, 140 180 Z" fill={color} />
        <path d="M 60 180 C 40 120, 50 60, 100 60 C 150 60, 160 120, 140 180 Z" fill="url(#bodyGradient)" />
        {/* Ears */}
        <path d="M 60 90 C 50 60, 75 70, 70 90" fill={color} stroke="#4B5563" strokeWidth="2" />
        <path d="M 140 90 C 150 60, 125 70, 130 90" fill={color} stroke="#4B5563" strokeWidth="2" />
        {/* Hands */}
        <path d="M 50 140 C 30 130, 35 160, 55 155" fill={color} />
        <path d="M 150 140 C 170 130, 165 160, 145 155" fill={color} />
        {/* Body Details */}
        <path d="M 80 150 L 90 165 L 85 170" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap='round' opacity="0.3"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <ellipse cx="80" cy="110" rx="14" ry="16" fill="white" />
                <motion.ellipse cx="80" cy="110" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="78" cy="104" r="2.5" fill="white" />
                <ellipse cx="120" cy="110" rx="14" ry="16" fill="white" />
                <motion.ellipse cx="120" cy="110" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="118" cy="104" r="2.5" fill="white" />
            </g>
            <path d="M 95 135 Q 100 143 105 135" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodySeedling = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="70" cy="180" rx="30" ry="15" fill="#15803D" />
        <ellipse cx="130" cy="180" rx="30" ry="15" fill="#15803D" />
        {/* Body */}
        <path d="M 50 180 C 30 120, 50 70, 100 70 C 150 70, 170 120, 150 180 Z" fill={color}/>
        <path d="M 50 180 C 30 120, 50 70, 100 70 C 150 70, 170 120, 150 180 Z" fill="url(#bodyGradient)" />
        {/* Body Details */}
        <path d="M 90 160 Q 100 165 110 160" fill="none" stroke="white" strokeWidth="2.5" opacity="0.3" strokeLinecap='round' />
        {/* Ears (Leaves) */}
        <path d="M 70 80 C 50 70, 60 40, 78 60" fill="#22C55E" />
        <path d="M 130 80 C 150 70, 140 40, 122 60" fill="#22C55E" />
        <path d="M 76 70 C 71 65, 73 60, 78 60" stroke="#166534" strokeWidth="1.5" fill="none" />
        {/* Hands */}
        <path d="M 48 150 C 30 140, 35 165, 52 160" fill={color} />
        <path d="M 152 150 C 170 140, 165 165, 148 160" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
             <g>
                <ellipse cx="85" cy="120" rx="10" ry="12" fill="black" transform="rotate(-15 85 120)" />
                 <circle cx="82" cy="116" r="2" fill="white" transform="rotate(-15 85 120)" />
                <ellipse cx="115" cy="120" rx="10" ry="12" fill="black" transform="rotate(15 115 120)" />
                <circle cx="112" cy="116" r="2" fill="white" transform="rotate(15 115 120)" />
            </g>
            <path d="M 95 140 C 100 150 105 150, 110 140" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyEmber = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 75 180 L 55 195 L 90 195 Z" fill="#D97706" />
        <path d="M 125 180 L 110 195 L 145 195 Z" fill="#D97706" />
        {/* Body */}
        <path d="M 70 180 C 50 120, 70 40, 100 40 C 130 40, 150 120, 130 180 Z" fill={color}/>
        <path d="M 70 180 C 50 120, 70 40, 100 40 C 130 40, 150 120, 130 180 Z" fill="url(#bodyGradient)" />
        <ellipse cx="100" cy="155" rx="40" ry="35" fill="#FEF3C7" />
        {/* Body Details */}
        <path d="M 90 155 C 95 160 105 160 110 155" fill="none" stroke="#FBBF24" strokeWidth="2.5" opacity="0.5" strokeLinecap='round' />
        <path d="M 93 165 C 98 170 108 170 113 165" fill="none" stroke="#FBBF24" strokeWidth="2.5" opacity="0.5" strokeLinecap='round' />
        {/* Ears */}
        <path d="M 75 60 C 65 35, 90 50, 80 65" fill={color} stroke="#D97706" strokeWidth="2" />
        <path d="M 125 60 C 135 35, 110 50, 120 65" fill={color} stroke="#D97706" strokeWidth="2" />
        {/* Hands */}
        <ellipse cx="60" cy="140" rx="18" ry="15" fill={color} />
        <ellipse cx="140" cy="140" rx="18" ry="15" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="85" cy="95" r="12" fill="white" />
                <motion.circle cx="85" cy="95" r="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="82" cy="90" r="2" fill="white" />
                <circle cx="115" cy="95" r="12" fill="white" />
                <motion.circle cx="115" cy="95" r="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="112" cy="90" r="2" fill="white" />
            </g>
            <path d="M 95,115 Q 100,125 105,115" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyShelly = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 60 175 C 55 195, 85 195, 80 175" fill="#22C55E" />
        <path d="M 120 175 C 115 195, 145 195, 140 175" fill="#22C55E" />
        {/* Body */}
        <path d="M 40 180 C 40 100, 160 100, 160 180 Z" fill={color} />
        <path d="M 40 180 C 40 100, 160 100, 160 180 Z" fill="url(#bodyGradient)" />
        {/* Shell */}
        <path d="M 30 150 C 30 70, 170 70, 170 150" fill="#1F2937" />
        <path d="M 30 150 C 30 70, 170 70, 170 150" stroke="#111827" strokeWidth="4" />
        <path d="M 60 145 C 60 100, 140 100, 140 145" stroke="#4B5563" strokeWidth="3" fill="none" />
        <path d="M 100 72 L 100 150" stroke="#4B5563" strokeWidth="3" fill="none" />
        <path d="M 65 110 L 135 110" stroke="#4B5563" strokeWidth="3" fill="none" />
        {/* Hands */}
        <ellipse cx="35" cy="150" rx="20" ry="18" fill={color} />
        <ellipse cx="165" cy="150" rx="20" ry="18" fill={color} />
        {/* Head */}
        <circle cx="100" cy="100" r="30" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <ellipse cx="85" cy="105" rx="10" ry="12" fill="white" />
                <motion.ellipse cx="85" cy="105" rx="5" ry="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="83" cy="100" r="2" fill="white" />
                <ellipse cx="115" cy="105" rx="10" ry="12" fill="white" />
                <motion.ellipse cx="115" cy="105" rx="5" ry="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="113" cy="100" r="2" fill="white" />
            </g>
            <path d="M 95 120 Q 100 128 105 120" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyPuff = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="80" cy="180" rx="20" ry="10" fill="#F472B6" />
        <ellipse cx="120" cy="180" rx="20" ry="10" fill="#F472B6" />
        {/* Body */}
        <circle cx="100" cy="130" r="55" fill={color} />
        <circle cx="100" cy="130" r="55" fill="url(#bodyGradient)" />
        {/* Body Details */}
        <path d="M 75 140 C 80 150, 90 150, 95 140" stroke="white" strokeWidth="3" opacity="0.4" fill="none" strokeLinecap='round' />
        <path d="M 105 140 C 110 150, 120 150, 125 140" stroke="white" strokeWidth="3" opacity="0.4" fill="none" strokeLinecap='round' />
        {/* Ears */}
        <path d="M 65 85 Q 40 60, 75 70" fill={color} stroke="#F472B6" strokeWidth="3" />
        <path d="M 135 85 Q 160 60, 125 70" fill={color} stroke="#F472B6" strokeWidth="3" />
        {/* Hands */}
        <path d="M 50 135 Q 25 125 40 115" stroke={color} strokeWidth="20" fill="none" strokeLinecap="round"/>
        <path d="M 150 135 Q 175 125 160 115" stroke={color} strokeWidth="20" fill="none" strokeLinecap="round"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <ellipse cx="85" cy="115" rx="18" ry="20" fill="white" />
                <motion.ellipse cx="85" cy="115" rx="8" ry="10" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="82" cy="108" r="3" fill="white" />
                <ellipse cx="115" cy="115" rx="18" ry="20" fill="white" />
                <motion.ellipse cx="115" cy="115" rx="8" ry="10" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="112" cy="108" r="3" fill="white" />
            </g>
             <path d="M 95,145 C 100,155 105,155 110,145" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyDozer = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <rect x="60" y="180" width="35" height="18" rx="10" fill="#44403C" />
        <rect x="105" y="180" width="35" height="18" rx="10" fill="#44403C" />
        {/* Body */}
        <path d="M 40 185 C 40 90, 160 90, 160 185 Z" fill={color} />
        <path d="M 40 185 C 40 90, 160 90, 160 185 Z" fill="url(#bodyGradient)" />
        <ellipse cx="100" cy="150" rx="45" ry="40" fill="#F5F5F4" />
        {/* Body Details */}
        <path d="M 75 170 L 70 175" stroke="white" strokeWidth="3" opacity="0.3" strokeLinecap='round' />
        <path d="M 125 170 L 130 175" stroke="white" strokeWidth="3" opacity="0.3" strokeLinecap='round' />
        {/* Ears */}
        <circle cx="65" cy="100" r="15" fill={color} />
        <circle cx="135" cy="100" r="15" fill={color} />
        {/* Hands */}
        <ellipse cx="40" cy="155" rx="30" ry="25" fill={color} />
        <ellipse cx="160" cy="155" rx="30" ry="25" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <path d="M 80 115 L 95 115" stroke="black" strokeWidth="4" strokeLinecap="round" />
                <path d="M 105 115 L 120 115" stroke="black" strokeWidth="4" strokeLinecap="round" />
            </g>
            <path d="M 90 130 C 95 138 105 138 110 130" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const speciesComponents: Record<string, React.FC<any>> = {
    "Zappy": BodyZappy,
    "Seedling": BodySeedling,
    "Ember": BodyEmber,
    "Shelly": BodyShelly,
    "Puff": BodyPuff,
    "Dozer": BodyDozer,
};

// ... (Rest of the component remains the same)
interface AIBuddyProps {
    className?: string;
    species?: string;
    color?: string;
    hat?: string;
    shirt?: string;
    shoes?: string;
    isStatic?: boolean;
}


const AIBuddy: React.FC<AIBuddyProps> = ({ className, species = "Zappy", color, hat, shirt, shoes, isStatic = false }) => {
    const [bodyColor, setBodyColor] = useState('#87CEEB');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const defaultColors: Record<string, string> = {
            "Zappy": "#FFD700",
            "Seedling": "#4ADE80",
            "Ember": "#F97316",
            "Shelly": "#38BDF8",
            "Puff": "#F472B6",
            "Dozer": "#A8A29E",
        };
        setBodyColor(color || defaultColors[species] || '#87CEEB');
    }, [color, species, isMounted]);

    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = {
        x: useSpring(0.5, { stiffness: 100, damping: 15, mass: 0.1 }),
        y: useSpring(0.5, { stiffness: 100, damping: 15, mass: 0.1 })
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isStatic) return;
        const { current } = containerRef;
        if (current) {
            const { left, top, width, height } = current.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;
            mouse.x.set(x);
            mouse.y.set(y);
        }
    };
    
    useEffect(() => {
        if (isMounted && !isStatic) {
            window.addEventListener('mousemove', handleMouseMove);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, [isMounted, isStatic]);

    const pupilX = useTransform(mouse.x, [0, 1], [-4, 4]);
    const pupilY = useTransform(mouse.y, [0, 1], [-3, 3]);
    
    if (!isMounted) return null;
    
    const bodyAnimation = isStatic ? {} : { y: [0, -4, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } };

    const BodyComponent = speciesComponents[species] || BodyZappy;

    return (
        <div ref={containerRef} className={`relative w-full h-full ${className}`}>
            <motion.svg 
                viewBox="0 0 200 200" 
                className="w-full h-full"
                initial="initial"
                animate="animate"
            >
                <defs>
                    <radialGradient id="bodyGradient" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" style={{stopColor: 'white', stopOpacity: 0.3}} />
                        <stop offset="100%" style={{stopColor: 'white', stopOpacity: 0}} />
                    </radialGradient>
                    <radialGradient id="glassReflection" cx="30%" cy="30%" r="40%">
                        <stop offset="0%" style={{ stopColor: "white", stopOpacity: 0.6 }} />
                        <stop offset="100%" style={{ stopColor: "white", stopOpacity: 0 }} />
                    </radialGradient>
                </defs>

                {!isStatic && (
                    <motion.ellipse
                        cx="100"
                        cy="195"
                        rx="55"
                        ry="8"
                        fill="rgba(0,0,0,0.1)"
                        animate={{ 
                            scale: [1, 1.05, 1],
                            transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                        }}
                    />
                )}
                
                <motion.g animate={bodyAnimation}>
                    <motion.g
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15, delay: 0.2 } }}
                    >
                        <BodyComponent color={bodyColor} pupilX={pupilX} pupilY={pupilY} />
                    </motion.g>
                </motion.g>
            </motion.svg>
        </div>
    );
};

export default AIBuddy;
