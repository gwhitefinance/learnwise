
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Hat, Shirt, Shoes } from './robot-accessories';

// --- Body Shape Components ---

const HeadZappy = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="40" fill={color} stroke="#4B5563" strokeWidth="2.5" />
        {/* Ears */}
        <path d="M 60 60 C 40 20, 80 30, 75 60" fill={color} stroke="#4B5563" strokeWidth="2.5" />
        <path d="M 140 60 C 160 20, 120 30, 125 60" fill={color} stroke="#4B5563" strokeWidth="2.5" />
        <g>
            <ellipse cx="85" cy="85" rx="12" ry="14" fill="white" />
            <motion.ellipse cx="85" cy="85" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="83" cy="79" r="2.5" fill="white" />
            
            <ellipse cx="115" cy="85" rx="12" ry="14" fill="white" />
            <motion.ellipse cx="115" cy="85" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="113" cy="79" r="2.5" fill="white" />
        </g>
        <path d="M 95 105 Q 100 110 105 105" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoZappy = ({ color }: any) => (
    <g>
        {/* Body */}
        <motion.ellipse
            cx="100"
            cy="150"
            rx="45"
            ry="40"
            fill={color}
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.98, 1], y: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <motion.circle
            cx="50"
            cy="155"
            r="15"
            fill={color}
            stroke="#4B5563" 
            strokeWidth="2.5"
            initial={{ rotate: 0, x: 0 }}
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.circle
            cx="150"
            cy="155"
            r="15"
            fill={color}
            stroke="#4B5563" 
            strokeWidth="2.5"
            initial={{ rotate: 0, x: 0 }}
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
    </g>
);


const HeadSeedling = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="40" fill={color} />
        <g>
            <ellipse cx="85" cy="85" rx="12" ry="14" fill="black" transform="rotate(-15 85 85)" />
            <circle cx="82" cy="80" r="2.5" fill="white" transform="rotate(-15 85 85)" />
            <ellipse cx="115" cy="85" rx="12" ry="14" fill="black" transform="rotate(15 115 85)" />
            <circle cx="112" cy="80" r="2.5" fill="white" transform="rotate(15 115 85)" />
        </g>
        <path d="M 95 105 Q 100 110 105 105" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Leaf on head */}
        <motion.path d="M 100 40 C 90 20, 110 20, 100 40 L 100 50" fill={color} stroke="#166534" strokeWidth="2"
             initial={{ rotate: 0 }}
             animate={{ rotate: [-5, 5, -5] }}
             transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
    </motion.g>
);

const TorsoSeedling = ({ color }: any) => (
    <g>
        {/* Body */}
        <motion.path d="M 70 180 C 40 140, 160 140, 130 180 Z" fill={color}
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.99, 1], y: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <path d="M 68 150 C 45 140, 50 165, 72 160" fill={color} />
        <path d="M 132 150 C 155 140, 150 165, 128 160" fill={color} />
    </g>
);


const HeadEmber = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="40" fill={color} />
        <g>
            <circle cx="85" cy="85" r="14" fill="white" />
            <motion.circle cx="85" cy="85" r="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="82" cy="79" r="2.5" fill="white" />
            <circle cx="115" cy="85" r="14" fill="white" />
            <motion.circle cx="115" cy="85" r="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="112" cy="79" r="2.5" fill="white" />
        </g>
        <path d="M 95 105 Q 100 110 105 105" stroke="#4A0404" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Flame "Ears" */}
         <motion.path
            d="M 70 40 Q 60 20 70 0 Q 80 20 70 40"
            fill="orange"
            animate={{ scaleY: [1, 1.2, 1], y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
         <motion.path
            d="M 130 40 Q 120 20 130 0 Q 140 20 130 40"
            fill="orange"
            animate={{ scaleY: [1, 1.2, 1], y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
    </motion.g>
);

const TorsoEmber = ({ color }: any) => (
    <g>
        {/* Body */}
        <motion.ellipse cx="100" cy="155" rx="50" ry="45" fill={color} 
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.97, 1], y: [0, 6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <ellipse cx="100" cy="160" rx="35" ry="30" fill="#FEF3C7" />
        {/* Hands */}
        <ellipse cx="45" cy="155" rx="18" ry="16" fill={color} />
        <ellipse cx="155" cy="155" rx="18" ry="16" fill={color} />
    </g>
);


const HeadShelly = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="35" fill={color} />
        <g>
            <ellipse cx="85" cy="85" rx="12" ry="14" fill="white" />
            <motion.ellipse cx="85" cy="85" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="83" cy="79" r="2.5" fill="white" />
            <ellipse cx="115" cy="85" rx="12" ry="14" fill="white" />
            <motion.ellipse cx="115" cy="85" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="113" cy="79" r="2.5" fill="white" />
        </g>
        <path d="M 95 105 Q 100 110 105 105" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoShelly = ({ color }: any) => (
    <g>
        {/* Shell */}
        <motion.path d="M 40 210 C 40 100, 160 100, 160 210 Z" fill="#1F2937" 
            animate={{y: [0, 2, 0]}} transition={{duration: 5, repeat: Infinity, ease:'easeInOut'}}
        />
        <path d="M 70 205 C 70 140, 130 140, 130 205" stroke="#4B5563" strokeWidth="4" fill="none" />
        <path d="M 100 102 L 100 210" stroke="#4B5563" strokeWidth="4" fill="none" />
        
        {/* Body (peeking out) */}
        <ellipse cx="100" cy="115" rx="38" ry="20" fill={color} />

        {/* Hands */}
        <ellipse cx="35" cy="180" rx="18" ry="15" fill={color} />
        <ellipse cx="165" cy="180" rx="18" ry="15" fill={color} />
    </g>
);


const HeadPuff = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="45" fill={color} />
        <g>
            <ellipse cx="85" cy="85" rx="14" ry="16" fill="white" />
            <motion.ellipse cx="85" cy="85" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="82" cy="78" r="3.5" fill="white" />
            <ellipse cx="115" cy="85" rx="14" ry="16" fill="white" />
            <motion.ellipse cx="115" cy="85" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="112" cy="78" r="3.5" fill="white" />
        </g>
        <path d="M 95 110 Q 100 115 105 110" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoPuff = ({ color }: any) => (
    <g>
        <motion.circle cx="100" cy="165" r="60" fill={color} 
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <circle cx="35" cy="165" r="18" fill={color} />
        <circle cx="165" cy="165" r="18" fill={color} />
    </g>
);


const HeadGoo = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <path d="M 60 110 Q 50 60, 100 60 Q 150 60, 140 110 Z" fill={color} />
        <g>
            <ellipse cx="85" cy="90" rx="12" ry="14" fill="white" />
            <motion.ellipse cx="85" cy="90" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }} />
            <circle cx="83" cy="84" r="2.5" fill="white" />
            <ellipse cx="115" cy="90" rx="12" ry="14" fill="white" />
            <motion.ellipse cx="115" cy="90" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }} />
            <circle cx="113" cy="84" r="2.5" fill="white" />
        </g>
        <path d="M 95 110 Q 100 115 105 110" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoGoo = ({ color }: any) => (
    <g>
        {/* Body */}
        <motion.path d="M 50 200 Q 30 150, 100 110 Q 170 150, 150 200 Z" fill={color}
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.98, 1], y: [0, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <path d="M 40 170 C 20 160, 25 190, 45 185" fill={color} />
        <path d="M 160 170 C 180 160, 175 190, 155 185" fill={color} />
    </g>
);


const HeadChirpy = ({ pupilX, pupilY, color }: any) => (
     <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="40" fill={color} />
        <g>
            <circle cx="85" cy="80" r="12" fill="black" />
            <circle cx="82" cy="76" r="3" fill="white" />
            <circle cx="115" cy="80" r="12" fill="black" />
            <circle cx="112" cy="76" r="3" fill="white" />
        </g>
        {/* Beak */}
        <path d="M 95 95 L 105 95 L 100 105 Z" fill="#F97316" />
        {/* Head Feather (Ear) */}
        <path d="M 100 40 C 90 20, 110 20, 100 40 L 100 50" fill={color} stroke="#CA8A04" strokeWidth="2" />
    </motion.g>
);

const TorsoChirpy = ({ color }: any) => (
    <g>
        <motion.circle cx="100" cy="150" r="55" fill={color} 
            initial={{ y: 0 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <ellipse cx="100" cy="160" rx="40" ry="30" fill="#FFFBEB" />
        {/* Wings/Hands */}
        <motion.path d="M 40 150 C 20 130, 20 170, 40 160" fill={color} 
            initial={{ rotate: 0 }}
            animate={{ rotate: [-10, 5, -10] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path d="M 160 150 C 180 130, 180 170, 160 160" fill={color}
             initial={{ rotate: 0 }}
            animate={{ rotate: [10, -5, 10] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
    </g>
);


const HeadSparky = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="40" fill={color}/>
        <g>
            <ellipse cx="85" cy="80" rx="10" ry="14" fill="black" />
            <circle cx="83" cy="75" r="3" fill="white" />
            <ellipse cx="115" cy="80" rx="10" ry="14" fill="black" />
            <circle cx="113" cy="75" r="3" fill="white" />
        </g>
        <path d="M 98 100 C 100 103, 100 103, 102 100" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Ears */}
        <path d="M 60 50 C 30 10, 80 10, 70 50" fill={color} stroke="black" strokeWidth="2.5"/>
        <path d="M 140 50 C 170 10, 120 10, 130 50" fill={color} stroke="black" strokeWidth="2.5"/>
    </motion.g>
);

const TorsoSparky = ({ color }: any) => (
    <g>
        <motion.path d="M 60 190 C 50 120, 150 120, 140 190 Z" fill={color} 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <circle cx="50" cy="150" r="15" fill={color} />
        <circle cx="150" cy="150" r="15" fill={color} />
    </g>
);


const HeadRocky = ({ pupilX, pupilY, color }: any) => (
     <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <path d="M 60 110 L 50 60 L 150 60 L 140 110 Z" fill={color} />
        <g>
            <rect x="75" y="80" width="20" height="10" fill="#4B5563" />
            <rect x="105" y="80" width="20" height="10" fill="#4B5563" />
        </g>
        <path d="M 80 100 L 120 100" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoRocky = ({ color }: any) => (
    <g>
        {/* Body */}
        <motion.path d="M 50 180 L 40 110 L 160 110 L 150 180 Z" fill={color} 
            initial={{ y: 0 }}
            animate={{ y: [0, 2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <path d="M 30 150 L 50 130 L 60 170 Z" fill={color} />
        <path d="M 170 150 L 150 130 L 140 170 Z" fill={color} />
    </g>
);


const HeadSplash = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="40" fill={color} />
        <g>
            <ellipse cx="85" cy="80" rx="14" ry="16" fill="white" />
            <motion.ellipse cx="85" cy="80" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="83" cy="75" r="3" fill="white" />
            <ellipse cx="115" cy="80" rx="14" ry="16" fill="white" />
            <motion.ellipse cx="115" cy="80" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="113" cy="75" r="3" fill="white" />
        </g>
        <path d="M 95 105 Q 100 115 105 105" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoSplash = ({ color }: any) => (
    <g>
        <motion.path d="M 100 120 C 50 120, 40 200, 40 200 L 160 200 C 160 200, 150 120, 100 120 Z" fill={color} 
            initial={{ scaleY: 1, scaleX: 1 }}
            animate={{ scaleY: [1, 0.95, 1], scaleX: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <path d="M 40 160 C 20 150, 20 180, 40 170" fill={color} />
        <path d="M 160 160 C 180 150, 180 180, 160 170" fill={color} />
    </g>
);


const HeadBear = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        {/* Ears */}
        <circle cx="65" cy="45" r="20" fill={color} />
        <circle cx="135" cy="45" r="20" fill={color} />
        <circle cx="100" cy="80" r="40" fill={color} />
        <ellipse cx="100" cy="95" rx="25" ry="20" fill="#D2B48C" />
        <g>
            <circle cx="85" cy="80" r="10" fill="black" />
            <circle cx="82" cy="76" r="2.5" fill="white" />
            <circle cx="115" cy="80" r="10" fill="black" />
            <circle cx="112" cy="76" r="2.5" fill="white" />
        </g>
        <path d="M 100 95 L 100 105" stroke="black" strokeWidth="2" />
        <path d="M 90 110 Q 100 120 110 110" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoBear = ({ color }: any) => (
    <g>
        {/* Body */}
        <path d="M 50 190 C 20 150, 30 110, 100 110 C 170 110, 180 150, 150 190 Z" fill={color} />
        {/* Hands */}
        <circle cx="45" cy="150" r="20" fill={color} />
        <circle cx="155" cy="150" r="20" fill={color} />
    </g>
);


const HeadBunny = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        {/* Ears */}
        <path d="M 70,75 C 50,5 80,5, 80,75" fill={color} stroke="#F472B6" strokeWidth="2"/>
        <path d="M 130,75 C 150,5, 120,5, 120,75" fill={color} stroke="#F472B6" strokeWidth="2"/>
        <circle cx="100" cy="110" r="35" fill={color} />
        <g>
            <circle cx="85" cy="110" r="10" fill="black" />
            <circle cx="83" cy="106" r="2.5" fill="white" />
            <circle cx="115" cy="110" r="10" fill="black" />
            <circle cx="113" cy="106" r="2.5" fill="white" />
        </g>
        <path d="M 100 120 L 100 130" stroke="black" strokeWidth="2" />
        <path d="M 95 130 C 90 135, 110 135, 105 130" stroke="black" strokeWidth="2" fill="none" />
    </motion.g>
);

const TorsoBunny = ({ color }: any) => (
    <g>
        {/* Body */}
        <ellipse cx="100" cy="170" rx="45" ry="50" fill={color} />
        {/* Hands */}
        <ellipse cx="50" cy="170" rx="18" ry="15" fill={color} />
        <ellipse cx="150" cy="170" rx="18" ry="15" fill={color} />
    </g>
);


const HeadBoo = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="100" r="40" fill={color} />
        <g>
            <ellipse cx="85" cy="100" rx="14" ry="16" fill="black" />
            <circle cx="82" cy="94" r="3" fill="white" />
            <ellipse cx="115" cy="100" rx="14" ry="16" fill="black" />
            <circle cx="112" cy="94" r="3" fill="white" />
        </g>
        <path d="M 95,125 Q 100,130 105,125" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoBoo = ({ color }: any) => (
     <g>
        <motion.path d="M 50 210 C 20 120, 180 120, 150 210 C 140 200, 120 215, 100 200 C 80 215, 60 200, 50 210 Z" fill={color}
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <path d="M 40 160 C 20 150, 25 180, 45 175" fill={color} />
        <path d="M 160 160 C 180 150, 175 180, 155 175" fill={color} />
    </g>
);


const HeadRoly = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="30" fill={color} />
        <g>
            <circle cx="90" cy="80" r="8" fill="black" />
            <circle cx="88" cy="76" r="2" fill="white" />
            <circle cx="110" cy="80" r="8" fill="black" />
            <circle cx="108" cy="76" r="2" fill="white" />
        </g>
        <path d="M 98 95 L 102 95" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Antennae (Ears) */}
        <path d="M 80 55 Q 70 35, 60 40" stroke="#374151" strokeWidth="3" fill="none" />
        <path d="M 120 55 Q 130 35, 140 40" stroke="#374151" strokeWidth="3" fill="none" />
    </motion.g>
);

const TorsoRoly = ({ color }: any) => (
    <g>
        <ellipse cx="100" cy="150" rx="70" ry="60" fill={color} />
        {/* Shell Lines */}
        <path d="M 30 150 C 40 100, 160 100, 170 150" stroke="#4B5563" strokeWidth="10" fill="none" />
        <path d="M 40 150 C 50 120, 150 120, 160 150" stroke="#4B5563" strokeWidth="8" fill="none" />
    </g>
);


const HeadWhispy = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="100" r="30" fill={color} />
        <g>
            <ellipse cx="90" cy="100" rx="8" ry="10" fill="white" />
            <motion.ellipse cx="90" cy="100" rx="4" ry="5" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="88" cy="96" r="1.5" fill="white" />
            <ellipse cx="110" cy="100" rx="8" ry="10" fill="white" />
            <motion.ellipse cx="110" cy="100" rx="4" ry="5" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="108" cy="96" r="1.5" fill="white" />
        </g>
        <path d="M 98 115 C 100 117, 100 117, 102 115" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </motion.g>
);

const TorsoWhispy = ({ color }: any) => (
    <g>
        <motion.path d="M 100 130 C 40 130, 40 200, 70 220 C 80 230, 120 230, 130 220 C 160 200, 160 130, 100 130 Z" fill={color}
            initial={{ y: 0 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
    </g>
);


const HeadSpikey = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="35" fill={color} />
        <g>
            <circle cx="90" cy="80" r="8" fill="black" />
            <circle cx="88" cy="77" r="2" fill="white" />
            <circle cx="110" cy="80" r="8" fill="black" />
            <circle cx="108" cy="77" r="2" fill="white" />
        </g>
        <path d="M 95 95 Q 100 90 105 95" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoSpikey = ({ color }: any) => (
    <g>
        {/* Body */}
        <path d="M 70 210 C 70 110, 130 110, 130 210 Z" fill={color} />
        {/* Spikes */}
        <path d="M 100 45 L 100 65" stroke={color} strokeWidth="12" strokeLinecap='round' />
        <path d="M 80 55 L 95 70" stroke={color} strokeWidth="12" strokeLinecap='round' />
        <path d="M 120 55 L 105 70" stroke={color} strokeWidth="12" strokeLinecap='round' />
        {/* Hands */}
        <path d="M 70 160 C 50 160, 50 180, 70 180" fill={color} />
        <path d="M 130 160 C 150 160, 150 180, 130 180" fill={color} />
    </g>
);


const HeadBubbles = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="80" r="40" fill={color} />
        <g>
            <ellipse cx="85" cy="80" rx="14" ry="16" fill="white" />
            <motion.ellipse cx="85" cy="80" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="83" cy="75" r="3" fill="white" />
            <ellipse cx="115" cy="80" rx="14" ry="16" fill="white" />
            <motion.ellipse cx="115" cy="80" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="113" cy="75" r="3" fill="white" />
        </g>
        <path d="M 95 105 Q 100 115 105 105" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoBubbles = ({ color }: any) => (
    <g>
        <motion.circle cx="100" cy="150" r="50" fill={color} opacity="0.8" 
             initial={{ scale: 1 }}
             animate={{ scale: [1, 1.01, 1] }}
             transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Bubbles as hands/feet */}
        <circle cx="45" cy="150" r="15" fill={color} opacity="0.5" />
        <circle cx="155" cy="150" r="15" fill={color} opacity="0.5" />
    </g>
);


const speciesComponents: Record<string, { Head: React.FC<any>; Torso: React.FC<any> }> = {
    "Zappy": { Head: HeadZappy, Torso: TorsoZappy },
    "Seedling": { Head: HeadSeedling, Torso: TorsoSeedling },
    "Ember": { Head: HeadEmber, Torso: TorsoEmber },
    "Shelly": { Head: HeadShelly, Torso: TorsoShelly },
    "Puff": { Head: HeadPuff, Torso: TorsoPuff },
    "Goo": { Head: HeadGoo, Torso: TorsoGoo },
    "Chirpy": { Head: HeadChirpy, Torso: TorsoChirpy },
    "Sparky": { Head: HeadSparky, Torso: TorsoSparky },
    "Rocky": { Head: HeadRocky, Torso: TorsoRocky },
    "Splash": { Head: HeadSplash, Torso: TorsoSplash },
    "Bear": { Head: HeadBear, Torso: TorsoBear },
    "Bunny": { Head: HeadBunny, Torso: TorsoBunny },
    "Boo": { Head: HeadBoo, Torso: TorsoBoo },
    "Roly": { Head: HeadRoly, Torso: TorsoRoly },
    "Whispy": { Head: HeadWhispy, Torso: TorsoWhispy },
    "Spikey": { Head: HeadSpikey, Torso: TorsoSpikey },
    "Bubbles": { Head: HeadBubbles, Torso: TorsoBubbles },
};

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
            "Goo": "#34D399",
            "Chirpy": "#FBBF24",
            "Sparky": "#FDE047",
            "Rocky": "#A8A29E",
            "Splash": "#60A5FA",
            "Bear": "#A0522D",
            "Bunny": "#FCE7F3",
            "Boo": "#F0F8FF",
            "Roly": "#D1D5DB",
            "Whispy": "#E0E7FF",
            "Spikey": "#F59E0B",
            "Bubbles": "rgba(165, 243, 252, 0.8)",
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
    
    const bodyAnimation = isStatic ? {} : { y: [0, -5, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } };

    const { Head, Torso } = speciesComponents[species] || speciesComponents.Zappy;

    return (
        <div ref={containerRef} className={`relative w-full h-full ${className}`}>
            <motion.svg 
                viewBox="0 0 200 200" 
                className="w-full h-full"
                initial="initial"
                animate="animate"
            >
                {!isStatic && (
                    <motion.ellipse
                        cx="100"
                        cy="205"
                        rx="50"
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
                        <g>
                            <Shoes name={shoes} />
                            <Torso color={bodyColor} />
                            <Shirt name={shirt} />
                            <Head color={bodyColor} pupilX={pupilX} pupilY={pupilY} />
                            <Hat name={hat} />
                        </g>
                    </motion.g>
                </motion.g>
            </motion.svg>
        </div>
    );
};

export default AIBuddy;
