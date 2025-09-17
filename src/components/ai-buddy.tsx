
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import shopItems from '@/lib/shop-items.json';

interface AIBuddyProps {
    className?: string;
    color?: string; // Color name from shop-items.json
    hat?: string;   // Hat name from shop-items.json
}

const AIBuddy: React.FC<AIBuddyProps> = ({ className, color, hat }) => {
    const bodyColor = shopItems.colors.find(c => c.name === color)?.hex || '#87CEEB'; // Cheerful blue default
    const HatComponent = shopItems.hats.find(h => h.name === hat)?.component;

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
        // Use the window for mouse tracking to make it feel more connected
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const pupilX = useTransform(mouse.x, [0, 1], [-6, 6]);
    const pupilY = useTransform(mouse.y, [0, 1], [-4, 4]);

    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 200);
        }, 3000); // Blink every 3 seconds
        return () => clearInterval(blinkInterval);
    }, []);

    return (
        <div ref={containerRef} className={`relative w-full h-full ${className}`}>
            
             {/* Hat */}
            {HatComponent && (
                 <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[55%] h-[55%] z-10"
                    style={{ transformOrigin: 'bottom center' }}
                    dangerouslySetInnerHTML={{ __html: HatComponent }} 
                />
            )}
           
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
                
                {/* Main Body Animation Group */}
                <motion.g
                     animate={{ y: [0, -4, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
                >
                    {/* Feet */}
                    <rect x="70" y="175" width="20" height="10" rx="5" fill="#333" />
                    <rect x="110" y="175" width="20" height="10" rx="5" fill="#333" />
                    
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
                        <rect x="65" y="100" width="70" height="60" rx="20" fill="url(#bodyGradient)" />
                    </motion.g>

                    {/* Arms */}
                    <motion.g
                        animate={{ rotate: [0, -8, 0, 8, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' }}}
                        style={{ transformOrigin: '70px 115px' }}
                    >
                        <rect x="45" y="110" width="20" height="35" rx="10" fill={bodyColor} />
                    </motion.g>
                     <motion.g
                        animate={{ rotate: [0, 8, 0, -8, 0], transition: { duration: 5, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}}
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

                        {/* Antenna */}
                        <motion.g 
                            style={{ transformOrigin: '100px 30px'}}
                            animate={{ rotate: [-5, 5, -5], transition: { duration: 6, repeat: Infinity, ease: 'linear' }}}
                        >
                            <line x1="100" y1="30" x2="100" y2="10" stroke="#333" strokeWidth="3" />
                            <circle cx="100" cy="8" r="5" fill="#FFC700" />
                        </motion.g>
                        
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
                            {/* Blink */}
                             <motion.path
                                d="M 75 72 Q 85 82, 95 72"
                                fill="none"
                                stroke={bodyColor}
                                strokeWidth="20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isBlinking ? 1 : 0 }}
                                transition={{ duration: 0.1 }}
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
                             <motion.path
                                d="M 105 72 Q 115 82, 125 72"
                                fill="none"
                                stroke={bodyColor}
                                strokeWidth="20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isBlinking ? 1 : 0 }}
                                transition={{ duration: 0.1 }}
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
