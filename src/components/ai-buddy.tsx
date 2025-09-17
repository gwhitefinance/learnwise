
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import shopItems from '@/lib/shop-items.json';

interface AIBuddyProps {
    className?: string;
    color?: string; // Color name from shop-items.json
    hat?: string;   // Hat name from shop-items.json
}

const AIBuddy: React.FC<AIBuddyProps> = ({ className, color, hat }) => {
    const bodyColor = shopItems.colors.find(c => c.name === color)?.hex || '#4f4f4f';
    const HatComponent = shopItems.hats.find(h => h.name === hat)?.component;

    const eyeLidVariants = {
        open: { y: 0 },
        blink: { y: 15, transition: { duration: 0.05, yoyo: Infinity, repeatDelay: 3 } }
    };
    
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = {
        x: useMotionValue(0.5),
        y: useMotionValue(0.5)
    };
    const smoothMouse = {
        x: useSpring(mouse.x, { stiffness: 70, damping: 20, mass: 0.1 }),
        y: useSpring(mouse.y, { stiffness: 70, damping: 20, mass: 0.1 })
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
        const currentRef = containerRef.current;
        if(currentRef) {
            currentRef.addEventListener('mousemove', handleMouseMove);
            return () => {
                currentRef.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, []);

    const pupilX = (val: number) => (val - 0.5) * 20;
    const pupilY = (val: number) => (val - 0.5) * 15;


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
                {/* Shadow */}
                <motion.ellipse
                    cx="100"
                    cy="185"
                    rx="50"
                    ry="8"
                    fill="rgba(0,0,0,0.15)"
                    variants={{
                        initial: { opacity: 0 },
                        animate: { opacity: 1, transition: { delay: 0.5 } }
                    }}
                />
                
                {/* Main Body Animation Group */}
                <motion.g
                     variants={{
                        initial: { y: 0 },
                        animate: { y: [0, -5, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
                    }}
                >
                    {/* Legs */}
                    <path d="M85,170 L85,180 L75,180 L75,170 Z" fill={bodyColor} />
                    <path d="M115,170 L115,180 L125,180 L125,170 Z" fill={bodyColor} />
                    
                    {/* Body */}
                     <motion.g
                        variants={{
                            initial: { y: 200, opacity: 0 },
                            animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                        }}
                    >
                        <rect x="60" y="110" width="80" height="60" rx="15" fill={bodyColor} />
                    </motion.g>

                    {/* Arms */}
                    <motion.g
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -5, 0, 5, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }}}
                        style={{ transformOrigin: '55px 120px' }}
                    >
                        <path d="M55,120 Q40,140 50,160 L60,155 Q50,140 65,125 Z" fill={bodyColor} />
                    </motion.g>
                     <motion.g
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, 5, 0, -5, 0], transition: { duration: 4, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}}
                        style={{ transformOrigin: '145px 120px' }}
                    >
                        <path d="M145,120 Q160,140 150,160 L140,155 Q150,140 135,125 Z" fill={bodyColor} />
                    </motion.g>
                    

                    {/* Head */}
                     <motion.g
                        variants={{
                            initial: { scale: 0 },
                            animate: { scale: 1, transition: { delay: 0.2, type: 'spring', stiffness: 120 } }
                        }}
                     >
                        <circle cx="100" cy="80" r="50" fill={bodyColor} />
                        
                        {/* Face */}
                        <g>
                            {/* Left Eye */}
                            <circle cx="80" cy="80" r="12" fill="white" />
                            <motion.circle 
                                cx="80" 
                                cy="80" 
                                r="6" 
                                fill="black"
                                style={{
                                    translateX: useSpring(useMotionValue(0), { stiffness: 300, damping: 20 }),
                                    translateY: useSpring(useMotionValue(0), { stiffness: 300, damping: 20 })
                                }}
                                transformTemplate={({translateX, translateY}) => `translateX(${pupilX(smoothMouse.x.get())}px) translateY(${pupilY(smoothMouse.y.get())}px)`}
                            />

                             {/* Right Eye */}
                            <circle cx="120" cy="80" r="12" fill="white" />
                             <motion.circle 
                                cx="120" 
                                cy="80" 
                                r="6" 
                                fill="black"
                                style={{
                                    translateX: useSpring(useMotionValue(0), { stiffness: 300, damping: 20 }),
                                    translateY: useSpring(useMotionValue(0), { stiffness: 300, damping: 20 })
                                }}
                                transformTemplate={({translateX, translateY}) => `translateX(${pupilX(smoothMouse.x.get())}px) translateY(${pupilY(smoothMouse.y.get())}px)`}
                            />
                            
                             {/* Mouth */}
                            <path d="M90,100 Q100,110 110,100" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </g>
                    </motion.g>
                </motion.g>
            </motion.svg>
        </div>
    );
};

export default AIBuddy;
