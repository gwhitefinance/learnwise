
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

// --- Body Shape Components ---

const BodyZappy = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 80 170 Q 70 190 90 185 Q 110 190 100 170" fill="#4B5563" />
        <path d="M 120 170 Q 110 190 130 185 Q 150 190 140 170" fill="#4B5563" />
        {/* Body */}
        <path d="M 70 170 C 50 120, 60 70, 100 70 C 140 70, 150 120, 130 170 Z" fill={color} />
        <path d="M 70 170 C 50 120, 60 70, 100 70 C 140 70, 150 120, 130 170" fill="url(#bodyGradient)" />
        {/* Ears */}
        <path d="M 70 75 Q 60 45, 80 60" fill={color} stroke="#4B5563" strokeWidth="2" />
        <path d="M 130 75 Q 140 45, 120 60" fill={color} stroke="#4B5563" strokeWidth="2" />
        {/* Hands */}
        <path d="M 60 130 C 40 120, 45 150, 60 145" fill={color} />
        <path d="M 140 130 C 160 120, 155 150, 140 145" fill={color} />
        {/* Body Details */}
        <path d="M 80 140 L 90 155 L 85 160" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap='round' opacity="0.3"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <ellipse cx="85" cy="100" rx="12" ry="14" fill="white" />
                <motion.ellipse cx="85" cy="100" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="83" cy="96" r="1.5" fill="white" />
                <ellipse cx="115" cy="100" rx="12" ry="14" fill="white" />
                <motion.ellipse cx="115" cy="100" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="113" cy="96" r="1.5" fill="white" />
            </g>
            <path d="M 95 120 Q 100 128 105 120" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodySeedling = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="75" cy="175" rx="25" ry="12" fill="#15803D" />
        <ellipse cx="125" cy="175" rx="25" ry="12" fill="#15803D" />
        {/* Body */}
        <path d="M 60 175 C 40 120, 60 80, 100 80 C 140 80, 160 120, 140 175 Z" fill={color}/>
        <path d="M 60 175 C 40 120, 60 80, 100 80 C 140 80, 160 120, 140 175" fill="url(#bodyGradient)" />
        {/* Body Details */}
        <path d="M 90 150 Q 100 155 110 150" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" strokeLinecap='round' />
        {/* Ears (Leaves) */}
        <path d="M 70 90 C 50 80, 60 60, 75 70" fill="#22C55E" />
        <path d="M 130 90 C 150 80, 140 60, 125 70" fill="#22C55E" />
        <path d="M 73 80 C 68 75, 70 70, 75 70" stroke="#166534" strokeWidth="1" fill="none" />
        {/* Hands */}
        <path d="M 58 140 C 40 130 45 155, 58 150" fill={color} />
        <path d="M 142 140 C 160 130 155 155, 142 150" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
             <g>
                <ellipse cx="87.5" cy="115" rx="8" ry="10" fill="black" transform="rotate(-15 87.5 115)" />
                 <circle cx="85" cy="111" r="1.5" fill="white" transform="rotate(-15 87.5 115)" />
                <ellipse cx="112.5" cy="115" rx="8" ry="10" fill="black" transform="rotate(15 112.5 115)" />
                <circle cx="110" cy="111" r="1.5" fill="white" transform="rotate(15 112.5 115)" />
            </g>
            <path d="M 95 130 C 100 140 105 140, 110 130" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyEmber = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 80 170 L 65 185 L 95 185 Z" fill="#D97706" />
        <path d="M 120 170 L 105 185 L 135 185 Z" fill="#D97706" />
        {/* Body */}
        <path d="M 80 170 C 60 120, 80 50, 100 50 C 120 50, 140 120, 120 170 Z" fill={color}/>
        <path d="M 80 170 C 60 120, 80 50, 100 50 C 120 50, 140 120, 120 170" fill="url(#bodyGradient)" />
        <ellipse cx="100" cy="145" rx="30" ry="25" fill="#FEF3C7" />
        {/* Body Details */}
        <path d="M 90 145 C 95 150 105 150 110 145" fill="none" stroke="#FBBF24" strokeWidth="1.5" opacity="0.5" strokeLinecap='round' />
        <path d="M 93 155 C 98 160 108 160 113 155" fill="none" stroke="#FBBF24" strokeWidth="1.5" opacity="0.5" strokeLinecap='round' />
        {/* Ears */}
        <path d="M 75 60 Q 70 40 85 50" fill={color} stroke="#D97706" strokeWidth="2" />
        <path d="M 125 60 Q 130 40 115 50" fill={color} stroke="#D97706" strokeWidth="2" />
        {/* Hands */}
        <ellipse cx="70" cy="130" rx="12" ry="10" fill={color} />
        <ellipse cx="130" cy="130" rx="12" ry="10" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="90" cy="90" r="10" fill="white" />
                <motion.circle cx="90" cy="90" r="5" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="88" cy="86" r="1.5" fill="white" />
                <circle cx="110" cy="90" r="10" fill="white" />
                <motion.circle cx="110" cy="90" r="5" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="108" cy="86" r="1.5" fill="white" />
            </g>
            <path d="M 95,105 Q 100,115 105,105" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyShelly = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 65 170 C 60 185, 90 185, 85 170" fill="#22C55E" />
        <path d="M 115 170 C 110 185, 140 185, 135 170" fill="#22C55E" />
        {/* Body */}
        <ellipse cx="100" cy="140" rx="60" ry="45" fill={color} />
        <ellipse cx="100" cy="140" rx="60" ry="45" fill="url(#bodyGradient)" />
        {/* Shell */}
        <path d="M 50 140 C 50 80, 150 80, 150 140" fill="#1F2937" />
        <path d="M 50 140 C 50 80, 150 80, 150 140" stroke="#111827" strokeWidth="3" />
        <path d="M 70 135 C 70 100, 130 100, 130 135" stroke="#4B5563" strokeWidth="2" fill="none" />
        <path d="M 100 82 L 100 140" stroke="#4B5563" strokeWidth="2" fill="none" />
        {/* Hands */}
        <ellipse cx="45" cy="140" rx="15" ry="12" fill={color} />
        <ellipse cx="155" cy="140" rx="15" ry="12" fill={color} />
        {/* Ears */}
        <circle cx="75" cy="85" r="8" fill={color}/>
        <circle cx="125" cy="85" r="8" fill={color}/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <ellipse cx="85" cy="120" rx="10" ry="12" fill="white" />
                <motion.ellipse cx="85" cy="120" rx="5" ry="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="83" cy="116" r="1.5" fill="white" />
                <ellipse cx="115" cy="120" rx="10" ry="12" fill="white" />
                <motion.ellipse cx="115" cy="120" rx="5" ry="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="113" cy="116" r="1.5" fill="white" />
            </g>
            <path d="M 95 135 Q 100 140 105 135" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyPuff = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="85" cy="175" rx="15" ry="8" fill="#F472B6" />
        <ellipse cx="115" cy="175" rx="15" ry="8" fill="#F472B6" />
        {/* Body */}
        <circle cx="100" cy="125" r="50" fill={color} />
        <circle cx="100" cy="125" r="50" fill="url(#bodyGradient)" />
        {/* Body Details */}
        <path d="M 80 130 C 85 140, 95 140, 100 130" stroke="white" strokeWidth="2" opacity="0.4" fill="none" strokeLinecap='round' />
        <path d="M 100 130 C 105 140, 115 140, 120 130" stroke="white" strokeWidth="2" opacity="0.4" fill="none" strokeLinecap='round' />
        {/* Ears */}
        <path d="M 70 80 Q 50 60, 80 70" fill={color} stroke="#F472B6" strokeWidth="2" />
        <path d="M 130 80 Q 150 60, 120 70" fill={color} stroke="#F472B6" strokeWidth="2" />
        {/* Hands */}
        <path d="M 60 130 Q 35 120 50 110" stroke={color} strokeWidth="15" fill="none" strokeLinecap="round"/>
        <path d="M 140 130 Q 165 120 150 110" stroke={color} strokeWidth="15" fill="none" strokeLinecap="round"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <ellipse cx="85" cy="110" rx="15" ry="18" fill="white" />
                <motion.ellipse cx="85" cy="110" rx="7" ry="9" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="83" cy="104" r="2" fill="white" />
                <ellipse cx="115" cy="110" rx="15" ry="18" fill="white" />
                <motion.ellipse cx="115" cy="110" rx="7" ry="9" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="113" cy="104" r="2" fill="white" />
            </g>
             <path d="M 95,135 C 100,145 105,145 110,135" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyDozer = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <rect x="65" y="175" width="30" height="15" rx="8" fill="#44403C" />
        <rect x="115" y="175" width="30" height="15" rx="8" fill="#44403C" />
        {/* Body */}
        <path d="M 50 180 C 50 100, 150 100, 150 180 Z" fill={color} />
        <path d="M 50 180 C 50 100, 150 100, 150 180" fill="url(#bodyGradient)" />
        <ellipse cx="100" cy="140" rx="35" ry="30" fill="#F5F5F4" />
        {/* Body Details */}
        <path d="M 80 160 L 75 165" stroke="white" strokeWidth="2" opacity="0.3" strokeLinecap='round' />
        <path d="M 120 160 L 125 165" stroke="white" strokeWidth="2" opacity="0.3" strokeLinecap='round' />
        {/* Ears */}
        <circle cx="70" cy="100" r="12" fill={color} />
        <circle cx="130" cy="100" r="12" fill={color} />
        {/* Hands */}
        <ellipse cx="50" cy="145" rx="25" ry="20" fill={color} />
        <ellipse cx="150" cy="145" rx="25" ry="20" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <path d="M 85 110 L 95 110" stroke="black" strokeWidth="3" strokeLinecap="round" />
                <path d="M 105 110 L 115 110" stroke="black" strokeWidth="3" strokeLinecap="round" />
            </g>
            <path d="M 90 125 C 95 130 105 130 110 125" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
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
                        cy="185"
                        rx="45"
                        ry="5"
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
