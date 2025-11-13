'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

// --- Body Shape Components ---

const BodyZappy = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 80 170 Q 70 185 85 185 Q 100 185 90 170" fill="#D2691E" />
        <path d="M 110 170 Q 100 185 115 185 Q 130 185 120 170" fill="#D2691E" />
        {/* Body */}
        <path d="M 70 170 C 50 120, 60 70, 100 70 C 140 70, 150 120, 130 170 Z" fill={color} />
        {/* Hands */}
        <circle cx="65" cy="130" r="10" fill={color} />
        <circle cx="135" cy="130" r="10" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="85" cy="100" r="12" fill="white" stroke="black" strokeWidth="1"/>
                <motion.circle cx="85" cy="100" r="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="115" cy="100" r="12" fill="white" stroke="black" strokeWidth="1"/>
                <motion.circle cx="115" cy="100" r="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
            </g>
            <path d="M 95 115 C 100 125 105 125 110 115" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="70" cy="105" r="8" fill="red" />
            <circle cx="130" cy="105" r="8" fill="red" />
        </motion.g>
    </>
);

const BodySeedling = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="75" cy="175" rx="15" ry="8" fill="#059669" />
        <ellipse cx="125" cy="175" rx="15" ry="8" fill="#059669" />
        {/* Body */}
        <path d="M 60 175 C 40 120, 60 80, 100 80 C 140 80, 160 120, 140 175 Z" fill={color}/>
        {/* Bulb */}
        <path d="M 85 85 C 80 60, 120 60, 115 85" fill="#10B981" />
        <path d="M 90 70 L 100 55 L 110 70" fill="#34D399" />
        {/* Hands */}
        <path d="M 58 140 C 40 130 45 150 58 145" fill={color} />
        <path d="M 142 140 C 160 130 155 150 142 145" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
             <g>
                <path d="M 80 110 L 95 110" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" transform="rotate(-15 87.5 110)" />
                <path d="M 105 110 L 120 110" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" transform="rotate(15 112.5 110)" />
            </g>
            <path d="M 95 130 C 100 140 105 140 110 130" stroke="#B91C1C" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyEmber = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 80 170 L 70 185 L 90 185 Z" fill="#F59E0B" />
        <path d="M 120 170 L 110 185 L 130 185 Z" fill="#F59E0B" />
        {/* Body */}
        <path d="M 80 170 C 60 120, 80 50, 100 50 C 120 50, 140 120, 120 170 Z" fill={color}/>
        <ellipse cx="100" cy="145" rx="30" ry="25" fill="#FCD34D" />
        {/* Tail */}
        <motion.path 
            d="M 120 160 C 140 160, 150 140, 130 120"
            stroke="#FB923C" 
            strokeWidth="8" 
            fill="none" 
            strokeLinecap="round"
            animate={{ d: ["M 120 160 C 140 160, 150 140, 130 120", "M 120 160 C 145 155, 155 135, 130 120"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatType: "mirror" }}
        />
        {/* Flame */}
        <motion.path
            d="M 130 120 Q 135 110 140 120 Q 130 100 130 120"
            fill="url(#flameGradient)"
            animate={{ scaleY: [1, 1.2, 1], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <ellipse cx="70" cy="130" rx="6" ry="10" fill={color} />
        <ellipse cx="130" cy="130" rx="6" ry="10" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="90" cy="90" r="10" fill="white" />
                <motion.circle cx="90" cy="90" r="5" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="110" cy="90" r="10" fill="white" />
                <motion.circle cx="110" cy="90" r="5" fill="black" style={{ x: pupilX, y: pupilY }}/>
            </g>
            <path d="M 95,105 Q 100,115 105,105" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyShelly = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="75" cy="170" rx="15" ry="10" fill="#065F46" />
        <ellipse cx="125" cy="170" rx="15" ry="10" fill="#065F46" />
        {/* Body */}
        <ellipse cx="100" cy="140" rx="45" ry="35" fill={color} />
        {/* Shell */}
        <path d="M 60 140 C 60 100, 140 100, 140 140" fill="#8B4513" />
        <path d="M 60 140 C 60 100, 140 100, 140 140" stroke="#5D240A" strokeWidth="3" />
        {/* Hands */}
        <ellipse cx="60" cy="145" rx="10" ry="15" fill={color} />
        <ellipse cx="140" cy="145" rx="10" ry="15" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="90" cy="130" r="8" fill="white" />
                <motion.circle cx="90" cy="130" r="4" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="110" cy="130" r="8" fill="white" />
                <motion.circle cx="110" cy="130" r="4" fill="black" style={{ x: pupilX, y: pupilY }}/>
            </g>
            <path d="M 98,145 Q 100,140 102,145" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyPuff = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 80 160 L 70 175 L 90 175 Z" fill={color} />
        <path d="M 120 160 L 110 175 L 130 175 Z" fill={color} />
        {/* Body */}
        <circle cx="100" cy="125" r="50" fill={color} />
        {/* Hands */}
        <path d="M 60 130 Q 40 120 50 110" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"/>
        <path d="M 140 130 Q 160 120 150 110" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="85" cy="110" r="15" fill="#A5F3FC" />
                <motion.circle cx="85" cy="110" r="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="115" cy="110" r="15" fill="#A5F3FC" />
                <motion.circle cx="115" cy="110" r="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            </g>
             <path d="M 95,130 C 100,140 105,140 110,130" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyDozer = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <rect x="70" y="170" width="25" height="10" rx="5" fill="#525252" />
        <rect x="115" y="170" width="25" height="10" rx="5" fill="#525252" />
        {/* Body */}
        <path d="M 50 180 C 50 100, 150 100, 150 180 Z" fill={color} />
        <ellipse cx="100" cy="140" rx="35" ry="30" fill="#F5F5F5" />
        {/* Hands */}
        <ellipse cx="60" cy="140" rx="15" ry="12" fill={color} />
        <ellipse cx="140" cy="140" rx="15" ry="12" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <path d="M 85 110 L 95 110" stroke="black" strokeWidth="3" strokeLinecap="round" />
            <path d="M 105 110 L 115 110" stroke="black" strokeWidth="3" strokeLinecap="round" />
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

const AIBuddy: React.FC<AIBuddyProps> = ({ className, species = "Zappy", color, hat, shirt, shoes, isStatic = false }) => {
    const [bodyColor, setBodyColor] = useState('#87CEEB');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const defaultColors: Record<string, string> = {
            "Zappy": "#FFD700",
            "Seedling": "#4ADE80",
            "Ember": "#F97316",
            "Shelly": "#22D3EE",
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
                    <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#FFD700'}} />
                        <stop offset="50%" style={{stopColor: '#FF8C00'}} />
                        <stop offset="100%" style={{stopColor: '#FF4500'}} />
                    </linearGradient>
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
