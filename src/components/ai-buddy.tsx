
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Hat, Shirt, Shoes } from '@/components/robot-accessories';


interface AIBuddyProps {
    className?: string;
    species?: string;
    color?: string; 
    hat?: string;   
    shirt?: string; 
    shoes?: string;
    isStatic?: boolean;
}

const BodyBulby = ({ color, pupilX, pupilY }: any) => (
    <>
        <path 
            d="M 60,170 C 40,140 40,80 70,60 C 90,40 110,40 130,60 C 160,80 160,140 140,170 Z" 
            fill={color} 
        />
        <path 
             d="M 80,165 C 70,145 70,110 100,105 C 130,110 130,145 120,165 Z"
             fill="rgba(255, 255, 255, 0.2)"
        />
        <path 
            d="M 60,170 C 40,140 40,80 70,60 C 90,40 110,40 130,60 C 160,80 160,140 140,170 Z" 
            fill="url(#bodyGradient)"
        />
        <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}
        >
            <g>
                {/* Left Eye */}
                <circle cx="85" cy="85" r="15" fill="white" />
                <motion.circle 
                    cx="85" 
                    cy="85" 
                    r="8" 
                    fill="black"
                    style={{ x: pupilX, y: pupilY }}
                />
                 <circle cx="80" cy="78" r="3" fill="white" />
                
                 {/* Right Eye */}
                <circle cx="115" cy="85" r="15" fill="white" />
                 <motion.circle 
                    cx="115" 
                    cy="85" 
                    r="8" 
                    fill="black"
                    style={{ x: pupilX, y: pupilY }}
                />
                 <circle cx="110" cy="78" r="3" fill="white" />
            </g>
             {/* Mouth */}
            <path d="M 95,105 Q 100,110 105,105" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodySpike = ({ color, pupilX, pupilY }: any) => (
    <>
        <path d="M 70,170 Q 100,190 130,170 C 140,120 120,50 100,40 C 80,50 60,120 70,170 Z" fill={color} />
        <path d="M 85,165 C 90,150 110,150 115,165 Z" fill="rgba(255, 255, 255, 0.2)" />
        <path d="M 70,170 Q 100,190 130,170 C 140,120 120,50 100,40 C 80,50 60,120 70,170 Z" fill="url(#bodyGradient)" />
        <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}
        >
            <path d="M 60,50 L 70,40 L 80,50" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
            <path d="M 120,50 L 130,40 L 140,50" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
            <g>
                <circle cx="85" cy="100" r="10" fill="white" />
                <motion.circle cx="85" cy="100" r="5" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="115" cy="100" r="10" fill="white" />
                <motion.circle cx="115" cy="100" r="5" fill="black" style={{ x: pupilX, y: pupilY }}/>
            </g>
            <path d="M 90,120 C 95,125 105,125 110,120" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyGoop = ({ color, pupilX, pupilY }: any) => (
    <>
        <path d="M 60,170 Q 50,120 80,100 C 110,80 140,100 150,140 Q 140,180 100,175 C 70,175 60,170 60,170 Z" fill={color} />
        <path d="M 60,170 Q 50,120 80,100 C 110,80 140,100 150,140 Q 140,180 100,175 C 70,175 60,170 60,170 Z" fill="url(#bodyGradient)" />
        <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}
        >
            <g>
                <motion.circle cx="90" cy="130" r="8" fill="black" style={{ x: pupilX, y: pupilY }} />
                <motion.circle cx="120" cy="130" r="8" fill="black" style={{ x: pupilX, y: pupilY }} />
            </g>
            <path d="M 100,145 Q 105,150 110,145" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyGhosty = ({ color, pupilX, pupilY }: any) => (
    <>
        <path d="M 60,100 C 60,50 140,50 140,100 V 170 Q 120,160 100,170 Q 80,180 60,170 Z" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}>
            <g>
                <path d="M 80 90 L 90 100 L 100 90" stroke="white" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 110 90 L 120 100 L 130 90" stroke="white" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <path d="M 95,120 Q 105,130 115,120" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyRocky = ({ color, pupilX, pupilY }: any) => (
    <>
        <path d="M 60,170 L 50,120 L 70,80 L 100,70 L 130,80 L 150,120 L 140,170 Z" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}>
            <g>
                <rect x="80" y="100" width="15" height="10" fill="black" />
                <rect x="115" y="100" width="15" height="10" fill="black" />
            </g>
            <rect x="90" y="125" width="30" height="5" fill="black" />
        </motion.g>
    </>
);

const BodyLeafy = ({ color, pupilX, pupilY }: any) => (
    <>
        <ellipse cx="100" cy="130" rx="40" ry="45" fill={color} />
        <path d="M 95,60 C 80,40 120,40 105,60 Q 100,50 95,60" fill="#22c55e" />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}>
            <g>
                <motion.circle cx="85" cy="125" r="8" fill="black" style={{ x: pupilX, y: pupilY }} />
                <motion.circle cx="115" cy="125" r="8" fill="black" style={{ x: pupilX, y: pupilY }} />
            </g>
            <path d="M 95,145 Q 100,155 105,145" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyDino = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Main Body */}
        <path 
            d="M 50,180 C 50,120 30,80 70,50 C 90,30 110,30 130,50 C 170,80 150,120 150,180 Z"
            fill={color} 
        />
        {/* Belly */}
        <ellipse cx="100" cy="140" rx="35" ry="40" fill="rgba(255, 255, 255, 0.3)" />

        <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}
        >
            <g>
                {/* Left Eye */}
                <circle cx="85" cy="80" r="12" fill="white" />
                <circle cx="85" cy="80" r="8" fill="#22c55e" />
                <motion.circle 
                    cx="85" 
                    cy="80" 
                    r="5" 
                    fill="black"
                    style={{ x: pupilX, y: pupilY }}
                />
                 <circle cx="82" cy="76" r="2.5" fill="white" />
                
                 {/* Right Eye */}
                <circle cx="115" cy="80" r="12" fill="white" />
                <circle cx="115" cy="80" r="8" fill="#22c55e" />
                 <motion.circle 
                    cx="115" 
                    cy="80" 
                    r="5" 
                    fill="black"
                    style={{ x: pupilX, y: pupilY }}
                />
                 <circle cx="112" cy="76" r="2.5" fill="white" />
            </g>
             {/* Mouth */}
            <path d="M 95,100 C 98,98 102,98 105,100" stroke="#a16207" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const speciesComponents: Record<string, React.FC<any>> = {
    "Bulby": BodyBulby,
    "Spike": BodySpike,
    "Goop": BodyGoop,
    "Ghosty": BodyGhosty,
    "Rocky": BodyRocky,
    "Leafy": BodyLeafy,
    "Dino": BodyDino,
};

const AIBuddy: React.FC<AIBuddyProps> = ({ className, species = "Bulby", color, hat, shirt, shoes, isStatic = false }) => {
    const [bodyColor, setBodyColor] = useState('#fde047');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            if (species === "Dino") {
                setBodyColor('#fde047');
                return;
            }
            const colors = [
                { "name": "Default", "hex": "#87CEEB" },
                { "name": "Mint", "hex": "#98FF98" },
                { "name": "Lavender", "hex": "#E6E6FA" },
                { "name": "Rose", "hex": "#FFC0CB" },
            ];
            const selectedColor = colors.find(c => c.name === color)?.hex || color || '#87CEEB';
            setBodyColor(selectedColor);
        }
    }, [color, species, isMounted]);


    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = {
        x: useSpring(0.5, { stiffness: 100, damping: 15, mass: 0.1 }),
        y: useSpring(0.5, { stiffness: 100, damping: 15, mass: 0.1 })
    };

    const handleMouseMove = (e: MouseEvent) => {
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
    

    if (!isMounted) {
        return null;
    }
    
    const bodyAnimation = isStatic ? {} : { y: [0, -4, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } };

    const BodyComponent = speciesComponents[species] || BodyBulby;

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
                    <radialGradient id="glassReflection">
                        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.1" />
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
                    <Shoes name={shoes} />
                    
                    <motion.g
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15, delay: 0.2 } }}
                    >
                        <BodyComponent color={bodyColor} pupilX={pupilX} pupilY={pupilY} />
                    </motion.g>

                    <motion.g
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}
                    >
                        <Hat name={hat} />
                    </motion.g>
                </motion.g>
            </motion.svg>
        </div>
    );
};

export default AIBuddy;
