
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


const speciesComponents: Record<string, React.FC<any>> = {
    "Bulby": BodyBulby,
    "Spike": BodySpike,
    "Goop": BodyGoop,
};

const AIBuddy: React.FC<AIBuddyProps> = ({ className, species = "Bulby", color, hat, shirt, shoes, isStatic = false }) => {
    const [bodyColor, setBodyColor] = useState('#87CEEB');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            const colors = [
                { "name": "Default", "hex": "#87CEEB" },
                { "name": "Mint", "hex": "#98FF98" },
                { "name": "Lavender", "hex": "#E6E6FA" },
                { "name": "Rose", "hex": "#FFC0CB" },
            ];
            const selectedColor = colors.find(c => c.name === color)?.hex || color || '#87CEEB';
            setBodyColor(selectedColor);
        }
    }, [color, isMounted]);


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
