
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Hat, Shirt, Shoes } from '@/components/robot-accessories';


interface AIBuddyProps {
    className?: string;
    color?: string; 
    hat?: string;   
    shirt?: string; 
    shoes?: string;
    isStatic?: boolean;
}

const AIBuddy: React.FC<AIBuddyProps> = ({ className, color, hat, shirt, shoes, isStatic = false }) => {
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
                { "name": "Sakura", "hex": "#FFB7C5" },
                { "name": "Sky", "hex": "#87CEFA" },
                { "name": "Ocean", "hex": "#008B8B" },
                { "name": "Sunset", "hex": "#FF6347" },
                { "name": "Graphite", "hex": "#4f4f4f" },
                { "name": "Ivory", "hex": "#FFFFF0" },
                { "name": "Pumpkin", "hex": "#f57d00" },
                { "name": "Autumn Leaf", "hex": "#b33b00" },
                { "name": "Gold", "hex": "#FFD700" },
                { "name": "Emerald", "hex": "#50C878" },
                { "name": "Silver", "hex": "#C0C0C0" },
                { "name": "Forest Green", "hex": "#228B22" },
                { "name": "Ruby", "hex": "#E0115F" },
                { "name": "Amethyst", "hex": "#9966CC" },
                { "name": "Obsidian", "hex": "#343434" },
                { "name": "Bronze", "hex": "#CD7F32" },
                { "name": "Electric Lime", "hex": "#CCFF00" },
                { "name": "Hot Pink", "hex": "#FF69B4" }
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
        if (isMounted) {
            window.addEventListener('mousemove', handleMouseMove);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, [isMounted]);

    const pupilX = useTransform(mouse.x, [0, 1], [-6, 6]);
    const pupilY = useTransform(mouse.y, [0, 1], [-4, 4]);
    

    if (!isMounted) {
        return null; // Or a placeholder/skeleton
    }
    
    const bodyAnimation = isStatic ? {} : { y: [0, -4, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } };


    return (
        <div ref={containerRef} className={`relative w-full h-full ${className}`}>
           
            <motion.svg 
                viewBox="0 0 200 200" 
                className="w-full h-full"
                initial="initial"
                animate="animate"
            >
                <defs>
                    <radialGradient id="bodyGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.3}} />
                        <stop offset="100%" style={{stopColor: '#ffffff', stopOpacity: 0}} />
                    </radialGradient>
                </defs>

                {/* Shadow */}
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
                
                {/* Main Body Animation Group */}
                <motion.g
                     animate={bodyAnimation}
                >
                    {/* Feet/Shoes */}
                    <Shoes name={shoes} />
                    
                     {/* Body */}
                     <motion.g
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15, delay: 0.2 } }}
                    >
                        {/* Legs */}
                        <rect x="75" y="150" width="15" height="25" fill={bodyColor} />
                        <rect x="110" y="150" width="15" height="25" fill={bodyColor} />
                        
                        {/* Main Body - Bigger */}
                        <rect x="65" y="100" width="70" height="60" rx="20" fill={bodyColor} />
                        
                        {/* Shirt */}
                        <Shirt name={shirt} />

                        <rect x="65" y="100" width="70" height="60" rx="20" fill="url(#bodyGradient)" />
                    </motion.g>

                    {/* Arms */}
                    <motion.g
                        animate={{ rotate: isStatic ? 0 : [0, -8, 0, 8, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
                        style={{ transformOrigin: '70px 115px' }}
                    >
                        <rect x="45" y="110" width="20" height="35" rx="10" fill={bodyColor} />
                    </motion.g>
                     <motion.g
                        animate={{ rotate: isStatic ? 0 : [0, 8, 0, -8, 0], transition: { duration: 5, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}}
                        style={{ transformOrigin: '130px 115px' }}
                    >
                        <rect x="135" y="110" width="20" height="35" rx="10" fill={bodyColor} />
                    </motion.g>
                    

                    {/* Head */}
                     <motion.g
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}
                     >
                        <rect x="50" y="30" width="100" height="80" rx="40" fill={bodyColor} />
                        <rect x="50" y="30" width="100" height="80" rx="40" fill="url(#bodyGradient)" />

                        {/* Antenna or Hat */}
                        {(hat && hat !== 'None') ? (
                            <Hat name={hat} />
                        ) : (
                          <motion.g 
                              style={{ transformOrigin: '100px 30px'}}
                              animate={{ rotate: isStatic ? 0 : [-5, 5, -5], transition: { duration: 6, repeat: Infinity, ease: 'linear' }}}
                          >
                              <line x1="100" y1="30" x2="100" y2="10" stroke="#333" strokeWidth="3" />
                              <circle cx="100" cy="8" r="5" fill="#FFC700" />
                          </motion.g>
                        )}
                        
                        {/* Face Screen */}
                        <rect x="65" y="50" width="70" height="45" rx="15" fill="#222" />
                        
                        {/* Eyes */}
                        <g>
                            {/* Left Eye */}
                            <circle cx="85" cy="72" r="10" fill="white" />
                            <motion.circle 
                                cx="85" 
                                cy="72" 
                                r="5" 
                                fill="black"
                                style={{ x: pupilX, y: pupilY }}
                            />
                            
                             {/* Right Eye */}
                            <circle cx="115" cy="72" r="10" fill="white" />
                             <motion.circle 
                                cx="115" 
                                cy="72" 
                                r="5" 
                                fill="black"
                                style={{ x: pupilX, y: pupilY }}
                            />
                            
                             {/* Mouth */}
                            <path d="M92,88 Q100,93 108,88" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </g>
                    </motion.g>
                </motion.g>
            </motion.svg>
        </div>
    );
};

export default AIBuddy;
