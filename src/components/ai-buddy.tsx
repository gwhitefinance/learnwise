'use client';

import React from 'react';
import { motion } from 'framer-motion';
import shopItems from '@/lib/shop-items.json';

interface AIBuddyProps {
    className?: string;
    color?: string; // Color name from shop-items.json
    hat?: string;   // Hat name from shop-items.json
}

const AIBuddy: React.FC<AIBuddyProps> = ({ className, color, hat }) => {
    const bodyColor = shopItems.colors.find(c => c.name === color)?.hex || '#4f4f4f';
    const HatComponent = shopItems.hats.find(h => h.name === hat)?.component;

    return (
        <div className={`relative ${className}`}>
            {/* Hat */}
            {HatComponent && (
                 <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[70%] h-[70%] z-10" 
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
                    rx="60"
                    ry="10"
                    fill="rgba(0,0,0,0.1)"
                    variants={{
                        initial: { opacity: 0 },
                        animate: { opacity: 1, transition: { delay: 0.5 } }
                    }}
                />

                {/* Body */}
                <motion.g
                    variants={{
                        initial: { y: 200, opacity: 0 },
                        animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                    }}
                >
                    <path 
                        d="M50,180 C50,120 150,120 150,180 Z"
                        fill="url(#bodyGradient)"
                    />
                    <defs>
                        <radialGradient id="bodyGradient" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor={bodyColor} stopOpacity="0.7" />
                            <stop offset="100%" stopColor={bodyColor} />
                        </radialGradient>
                    </defs>
                </motion.g>

                {/* Head */}
                 <motion.g
                    variants={{
                        initial: { scale: 0 },
                        animate: { scale: 1, transition: { delay: 0.2, type: 'spring', stiffness: 120 } }
                    }}
                 >
                    <circle cx="100" cy="100" r="60" fill={bodyColor} />
                     {/* Eye Screen */}
                    <rect x="60" y="85" width="80" height="35" rx="15" fill="#111" />

                    {/* Eye Glow */}
                    <motion.ellipse
                        cx="100"
                        cy="102.5"
                        rx="30"
                        ry="8"
                        fill="#3498db"
                        variants={{
                             initial: { opacity: 0 },
                             animate: {
                                opacity: [0.5, 0.8, 0.5],
                                scaleX: [1, 1.05, 1],
                                transition: { delay: 1, duration: 2, repeat: Infinity, ease: 'easeInOut' }
                            }
                        }}
                    />
                </motion.g>
                
                 {/* Antennas */}
                <motion.g
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <line x1="80" y1="45" x2="70" y2="25" stroke="#999" strokeWidth="3" />
                    <circle cx="68" cy="23" r="5" fill="#f1c40f" />
                </motion.g>
            </motion.svg>
        </div>
    );
};

export default AIBuddy;
