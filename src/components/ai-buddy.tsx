

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
    <>
        {/* Body */}
        <motion.rect
            x="60"
            y="115"
            width="80"
            height="65"
            rx="20"
            fill={color}
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.98, 1], y: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Feet */}
        <path d="M 60 180 C 60 200, 90 200, 90 180" fill="#4B5563" />
        <path d="M 110 180 C 110 200, 140 200, 140 180" fill="#4B5563" />
        {/* Hands */}
        <motion.circle 
            cx="45" 
            cy="150" 
            r="15" 
            fill={color} 
            initial={{ rotate: 0, x: 0 }}
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.circle 
            cx="155" 
            cy="150" 
            r="15" 
            fill={color} 
            initial={{ rotate: 0, x: 0 }}
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
    </>
);


const HeadSeedling = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <ellipse cx="85" cy="125" rx="12" ry="14" fill="black" transform="rotate(-15 85 125)" />
            <circle cx="82" cy="120" r="2.5" fill="white" transform="rotate(-15 85 125)" />
            <ellipse cx="115" cy="125" rx="12" ry="14" fill="black" transform="rotate(15 115 125)" />
            <circle cx="112" cy="120" r="2.5" fill="white" transform="rotate(15 115 125)" />
        </g>
        <path d="M 95 155 Q 100 160 105 155" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 98 155 C 99 157, 101 157, 102 155" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoSeedling = ({ color }: any) => (
    <>
        {/* Body */}
        <motion.path d="M 50 210 C 20 140, 40 30, 100 30 C 160 30, 180 140, 150 210 Z" fill={color}
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.99, 1], y: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Feet */}
        <ellipse cx="70" cy="210" rx="35" ry="18" fill="#15803D" />
        <ellipse cx="130" cy="210" rx="35" ry="18" fill="#15803D" />
        {/* Body Details */}
        <path d="M 90 190 Q 100 195 110 190" fill="none" stroke="white" strokeWidth="3" opacity="0.3" strokeLinecap='round' />
        {/* Ears (Leaves) */}
        <motion.path d="M 70 80 C 45 65, 55 30, 78 60" fill="#22C55E" 
             initial={{ rotate: 0 }}
             animate={{ rotate: [-3, 3, -3] }}
             transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path d="M 130 80 C 155 65, 145 30, 122 60" fill="#22C55E" 
            initial={{ rotate: 0 }}
            animate={{ rotate: [3, -3, 3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M 76 70 C 70 65, 72 58, 78 60" stroke="#166534" strokeWidth="2" fill="none" />
        <path d="M 124 70 C 130 65, 128 58, 122 60" stroke="#166534" strokeWidth="2" fill="none" />
        {/* Hands */}
        <path d="M 48 180 C 25 170, 30 195, 52 190" fill={color} />
        <path d="M 152 180 C 175 170, 170 195, 148 190" fill={color} />
    </>
);


const HeadEmber = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <circle cx="85" cy="105" r="14" fill="white" />
            <motion.circle cx="85" cy="105" r="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="82" cy="99" r="2.5" fill="white" />
            <circle cx="115" cy="105" r="14" fill="white" />
            <motion.circle cx="115"cy="105" r="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="112" cy="99" r="2.5" fill="white" />
        </g>
        <path d="M 95 135 Q 100 140 105 135" stroke="#4A0404" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 98 135 C 99 137, 101 137, 102 135" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoEmber = ({ color }: any) => (
    <>
        {/* Body */}
        <motion.path d="M 70 210 C 40 140, 60 10, 100 10 C 140 10, 160 140, 130 210 Z" fill={color}
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.97, 1], y: [0, 6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <ellipse cx="100" cy="180" rx="45" ry="40" fill="#FEF3C7" />
        {/* Feet */}
        <path d="M 75 210 L 55 225 L 90 225 Z" fill="#D97706" />
        <path d="M 125 210 L 110 225 L 145 225 Z" fill="#D97706" />
        {/* Body Details */}
        <path d="M 90 180 C 95 185 105 185 110 180" fill="none" stroke="#FBBF24" strokeWidth="3" opacity="0.5" strokeLinecap='round' />
        <path d="M 93 190 C 98 195 108 195 113 190" fill="none" stroke="#FBBF24" strokeWidth="3" opacity="0.5" strokeLinecap='round' />
        {/* Ears */}
        <path d="M 75 60 C 60 30, 90 45, 80 70" fill={color} stroke="#D97706" strokeWidth="2.5" />
        <path d="M 125 60 C 140 30, 110 45, 120 70" fill={color} stroke="#D97706" strokeWidth="2.5" />
        {/* Hands */}
        <ellipse cx="55" cy="165" rx="20" ry="18" fill={color} />
        <ellipse cx="145" cy="165" rx="20" ry="18" fill={color} />
    </>
);


const HeadShelly = ({ pupilX, pupilY, color }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <circle cx="100" cy="100" r="35" fill={color} />
        <g>
            <ellipse cx="85" cy="105" rx="12" ry="14" fill="white" />
            <motion.ellipse cx="85" cy="105" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="83" cy="99" r="2.5" fill="white" />
            <ellipse cx="115" cy="105" rx="12" ry="14" fill="white" />
            <motion.ellipse cx="115" cy="105" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="113" cy="99" r="2.5" fill="white" />
        </g>
        <path d="M 95 125 Q 100 130 105 125" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 98 125 C 99 127, 101 127, 102 125" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoShelly = ({ color }: any) => (
    <>
        {/* Body */}
        <g>
            <path d="M 40 210 C 40 120, 160 120, 160 210 Z" fill={color} />
        </g>
        {/* Shell */}
        <g>
            <path d="M 30 180 C 30 90, 170 90, 170 180" fill="#1F2937" />
            <path d="M 30 180 C 30 90, 170 90, 170 180" stroke="#111827" strokeWidth="5" />
            <path d="M 60 175 C 60 120, 140 120, 140 175" stroke="#4B5563" strokeWidth="4" fill="none" />
            <path d="M 100 92 L 100 180" stroke="#4B5563" strokeWidth="4" fill="none" />
            <path d="M 65 140 L 135 140" stroke="#4B5563" strokeWidth="4" fill="none" />
        </g>
        {/* Hands */}
        <ellipse cx="35" cy="180" rx="22" ry="20" fill={color} />
        <ellipse cx="165" cy="180" rx="22" ry="20" fill={color} />
        {/* Feet */}
        <path d="M 60 205 C 55 225, 85 225, 80 205" fill="#22C55E" />
        <path d="M 120 205 C 115 225, 145 225, 140 205" fill="#22C55E" />
    </>
);


const HeadPuff = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <ellipse cx="85" cy="125" rx="20" ry="22" fill="white" />
            <motion.ellipse cx="85" cy="125" rx="9" ry="11" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="82" cy="117" r="3.5" fill="white" />
            <ellipse cx="115" cy="125" rx="20" ry="22" fill="white" />
            <motion.ellipse cx="115" cy="125" rx="9" ry="11" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="112" cy="117" r="3.5" fill="white" />
        </g>
        <path d="M 95 160 Q 100 165 105 160" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 98 160 C 99 162, 101 162, 102 160" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoPuff = ({ color }: any) => (
    <>
        {/* Body */}
        <motion.circle cx="100" cy="160" r="75" fill={color} 
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Feet */}
        <ellipse cx="80" cy="215" rx="22" ry="12" fill="#F472B6" />
        <ellipse cx="120" cy="215" rx="22" ry="12" fill="#F472B6" />
        {/* Body Details */}
        <path d="M 75 170 C 80 180, 90 180, 95 170" stroke="white" strokeWidth="3.5" opacity="0.4" fill="none" strokeLinecap='round' />
        <path d="M 105 170 C 110 180, 120 180, 125 170" stroke="white" strokeWidth="3.5" opacity="0.4" fill="none" strokeLinecap='round' />
        {/* Ears */}
        <path d="M 65 95 Q 35 65, 75 80" fill={color} stroke="#F472B6" strokeWidth="3.5" />
        <path d="M 135 95 Q 165 65, 125 80" fill={color} stroke="#F472B6" strokeWidth="3.5" />
        {/* Hands */}
        <path d="M 30 165 Q 5 155, 20 145" stroke={color} strokeWidth="30" fill="none" strokeLinecap="round"/>
        <path d="M 170 165 Q 195 155, 180 145" stroke={color} strokeWidth="30" fill="none" strokeLinecap="round"/>
    </>
);


const HeadGoo = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <ellipse cx="85" cy="130" rx="12" ry="14" fill="white" />
            <motion.ellipse cx="85" cy="130" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }} />
            <circle cx="83" cy="124" r="2.5" fill="white" />
            <ellipse cx="115" cy="130" rx="12" ry="14" fill="white" />
            <motion.ellipse cx="115" cy="130" rx="6" ry="7" fill="black" style={{ x: pupilX, y: pupilY }} />
            <circle cx="113" cy="124" r="2.5" fill="white" />
        </g>
        <path d="M 95 155 Q 100 160 105 155" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 98 155 C 99 157, 101 157, 102 155" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoGoo = ({ color }: any) => (
    <>
        {/* Body */}
        <motion.path d="M 50 210 Q 30 120, 100 90 Q 170 120, 150 210 Z" fill={color}
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.98, 1], y: [0, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Drips/Feet */}
        <path d="M 50 210 Q 60 220, 70 210" fill={color} />
        <path d="M 150 210 Q 140 220, 130 210" fill={color} />
        {/* Bubbles */}
        <circle cx="80" cy="170" r="5" fill="white" opacity="0.3" />
        <circle cx="120" cy="180" r="3" fill="white" opacity="0.3" />
        <circle cx="100" cy="140" r="4" fill="white" opacity="0.3" />
        {/* Hands */}
        <path d="M 40 180 C 20 170, 25 200, 45 195" fill={color} />
        <path d="M 160 180 C 180 170, 175 200, 155 195" fill={color} />
    </>
);


const HeadChirpy = ({ pupilX, pupilY }: any) => (
     <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <circle cx="85" cy="120" r="12" fill="black" />
            <circle cx="82" cy="116" r="3" fill="white" />
            <circle cx="115" cy="120" r="12" fill="black" />
            <circle cx="112" cy="116" r="3" fill="white" />
        </g>
        {/* Beak */}
        <path d="M 95 140 L 105 140 L 100 150 Z" fill="#F97316" />
    </motion.g>
);

const TorsoChirpy = ({ color }: any) => (
    <>
        {/* Body */}
        <motion.circle cx="100" cy="160" r="65" fill={color} 
            initial={{ y: 0 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <ellipse cx="100" cy="170" rx="50" ry="40" fill="#FFFBEB" />
        {/* Feet */}
        <path d="M 80 210 L 70 225 L 90 225 Z" fill="#F97316" />
        <path d="M 120 210 L 110 225 L 130 225 Z" fill="#F97316" />
        {/* Wings/Hands */}
        <motion.path d="M 40 160 C 20 140, 20 180, 40 170" fill={color} 
            initial={{ rotate: 0 }}
            animate={{ rotate: [-10, 5, -10] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path d="M 160 160 C 180 140, 180 180, 160 170" fill={color}
             initial={{ rotate: 0 }}
            animate={{ rotate: [10, -5, 10] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Head Feather (Ear) */}
        <path d="M 100 85 C 90 65, 110 65, 100 85 M 95 70 Q 100 60 105 70" fill={color} stroke="#CA8A04" strokeWidth="2" />
    </>
);


const HeadSparky = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <ellipse cx="85" cy="120" rx="10" ry="14" fill="black" />
            <circle cx="83" cy="115" r="3" fill="white" />
            <ellipse cx="115" cy="120" rx="10" ry="14" fill="black" />
            <circle cx="113" cy="115" r="3" fill="white" />
        </g>
        <path d="M 98 145 C 100 148, 100 148, 102 145" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </motion.g>
);

const TorsoSparky = ({ color }: any) => (
    <>
        {/* Body */}
        <motion.path d="M 60 210 C 50 120, 150 120, 140 210 Z" fill={color} 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Feet */}
        <ellipse cx="80" cy="210" rx="20" ry="10" fill="#A16207" />
        <ellipse cx="120" cy="210" rx="20" ry="10" fill="#A16207" />
        {/* Ears */}
        <path d="M 60 90 C 30 50, 80 50, 70 90" fill={color} stroke="black" strokeWidth="2.5"/>
        <path d="M 140 90 C 170 50, 120 50, 130 90" fill={color} stroke="black" strokeWidth="2.5"/>
        {/* Hands */}
        <circle cx="50" cy="170" r="15" fill={color} />
        <circle cx="150" cy="170" r="15" fill={color} />
        {/* Body Details (cheeks) */}
        <circle cx="70" cy="160" r="12" fill="#DC2626" />
        <circle cx="130" cy="160" r="12" fill="#DC2626" />
    </>
);


const HeadRocky = ({ pupilX, pupilY }: any) => (
     <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <rect x="75" y="110" width="20" height="10" fill="#4B5563" />
            <rect x="105" y="110" width="20" height="10" fill="#4B5563" />
        </g>
        <path d="M 80 140 L 120 140" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoRocky = ({ color }: any) => (
    <>
        {/* Body */}
        <motion.path d="M 50 200 L 40 100 L 160 100 L 150 200 Z" fill={color} 
            initial={{ y: 0 }}
            animate={{ y: [0, 2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Feet */}
        <path d="M 60 200 L 90 200 L 90 215 L 60 215 Z" fill="#4B5563" />
        <path d="M 110 200 L 140 200 L 140 215 L 110 215 Z" fill="#4B5563" />
        {/* Hands */}
        <path d="M 30 160 L 50 140 L 60 180 Z" fill={color} />
        <path d="M 170 160 L 150 140 L 140 180 Z" fill={color} />
        {/* Details */}
        <path d="M 80 170 L 90 180" stroke="white" strokeWidth="3" opacity="0.2" strokeLinecap="round" />
        <path d="M 110 160 L 120 175" stroke="white" strokeWidth="3" opacity="0.2" strokeLinecap="round" />
    </>
);


const HeadSplash = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <ellipse cx="85" cy="130" rx="14" ry="16" fill="white" />
            <motion.ellipse cx="85" cy="130" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="83" cy="123" r="3" fill="white" />
            <ellipse cx="115" cy="130" rx="14" ry="16" fill="white" />
            <motion.ellipse cx="115" cy="130" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="113" cy="123" r="3" fill="white" />
        </g>
        <path d="M 95 160 Q 100 165 105 160" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 98 160 C 99 162, 101 162, 102 160" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoSplash = ({ color }: any) => (
    <>
        {/* Body */}
        <motion.path d="M 100 50 C 50 50, 40 210, 40 210 L 160 210 C 160 210, 150 50, 100 50 Z" fill={color} 
            initial={{ scaleY: 1, scaleX: 1 }}
            animate={{ scaleY: [1, 0.95, 1], scaleX: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <path d="M 40 170 C 20 160, 20 190, 40 180" fill={color} />
        <path d="M 160 170 C 180 160, 180 190, 160 180" fill={color} />
        {/* Feet (puddle) */}
        <ellipse cx="100" cy="210" rx="70" ry="15" fill={color} opacity="0.8" />
        {/* Details (drips/ears) */}
        <circle cx="100" cy="80" r="5" fill="white" opacity="0.5" />
        <path d="M 70 80 Q 60 70, 65 60" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 130 80 Q 140 70, 135 60" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />
    </>
);


const HeadBear = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <ellipse cx="100" cy="150" rx="40" ry="30" fill="#D2B48C" />
        <g>
            <circle cx="85" cy="120" r="10" fill="black" />
            <circle cx="82" cy="116" r="2.5" fill="white" />
            <circle cx="115" cy="120" r="10" fill="black" />
            <circle cx="112" cy="116" r="2.5" fill="white" />
        </g>
        <path d="M 100 135 L 100 150" stroke="black" strokeWidth="2" />
        <path d="M 90 160 Q 100 170 110 160" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 93 160 C 95 165, 105 165, 107 160" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoBear = ({ color }: any) => (
    <>
        {/* Body */}
        <path d="M 50 210 C 20 150, 30 60, 100 60 C 170 60, 180 150, 150 210 Z" fill={color} />
        {/* Feet */}
        <ellipse cx="80" cy="210" rx="25" ry="12" fill="#6B4226" />
        <ellipse cx="120" cy="210" rx="25" ry="12" fill="#6B4226" />
        {/* Ears */}
        <circle cx="70" cy="70" r="20" fill={color} />
        <circle cx="130" cy="70" r="20" fill={color} />
        <circle cx="70" cy="70" r="12" fill="#D2B48C" />
        <circle cx="130" cy="70" r="12" fill="#D2B48C" />
        {/* Hands */}
        <circle cx="45" cy="160" r="20" fill={color} />
        <circle cx="155" cy="160" r="20" fill={color} />
    </>
);


const HeadBunny = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <circle cx="85" cy="130" r="10" fill="black" />
            <circle cx="83" cy="126" r="2.5" fill="white" />
            <circle cx="115" cy="130" r="10" fill="black" />
            <circle cx="113" cy="126" r="2.5" fill="white" />
        </g>
        <path d="M 100 140 L 100 150" stroke="black" strokeWidth="2" />
        <path d="M 95 150 C 90 155, 110 155, 105 150" stroke="black" strokeWidth="2" fill="none" />
    </motion.g>
);

const TorsoBunny = ({ color }: any) => (
    <>
        {/* Body */}
        <ellipse cx="100" cy="170" rx="55" ry="70" fill={color} />
        {/* Feet */}
        <ellipse cx="80" cy="220" rx="25" ry="15" fill="#FBCFE8" />
        <ellipse cx="120" cy="220" rx="25" ry="15" fill="#FBCFE8" />
        {/* Ears */}
        <path d="M 70 90 C 50 20, 80 20, 80 90" fill={color} stroke="#F472B6" strokeWidth="2"/>
        <path d="M 130 90 C 150 20, 120 20, 120 90" fill={color} stroke="#F472B6" strokeWidth="2"/>
        <path d="M 70 85 C 65 40, 75 40, 75 85" fill="#FBCFE8" />
        <path d="M 130 85 C 135 40, 125 40, 125 85" fill="#FBCFE8" />
        {/* Hands */}
        <ellipse cx="50" cy="170" rx="18" ry="15" fill={color} />
        <ellipse cx="150" cy="170" rx="18" ry="15" fill={color} />
    </>
);


const HeadBoo = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <ellipse cx="85" cy="130" rx="14" ry="16" fill="black" />
            <circle cx="82" cy="124" r="3" fill="white" />
            <ellipse cx="115" cy="130" rx="14" ry="16" fill="black" />
            <circle cx="112" cy="124" r="3" fill="white" />
        </g>
        <path d="M 95 155 Q 100 160 105 155" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 98 155 C 99 157, 101 157, 102 155" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoBoo = ({ color }: any) => (
     <g transform="scale(1, 1.2) translate(0, -10)">
        <motion.path d="M 50 210 C 20 100, 180 100, 150 210 C 140 200, 120 215, 100 200 C 80 215, 60 200, 50 210 Z" fill={color}
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Hands */}
        <path d="M 40 160 C 20 150, 25 180, 45 175" fill={color} />
        <path d="M 160 160 C 180 150, 175 180, 155 175" fill={color} />
    </g>
);


const HeadRoly = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <circle cx="85" cy="120" r="8" fill="black" />
            <circle cx="83" cy="116" r="2" fill="white" />
            <circle cx="115" cy="120" r="8" fill="black" />
            <circle cx="113" cy="116" r="2" fill="white" />
        </g>
        <path d="M 98 135 L 102 135" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoRoly = ({ color }: any) => (
    <>
        <ellipse cx="100" cy="170" rx="70" ry="60" fill={color} />
        {/* Shell Lines */}
        <path d="M 30 170 C 40 120, 160 120, 170 170" stroke="#4B5563" strokeWidth="10" fill="none" />
        <path d="M 40 170 C 50 140, 150 140, 160 170" stroke="#4B5563" strokeWidth="8" fill="none" />
        <path d="M 50 170 C 60 155, 140 155, 150 170" stroke="#4B5563" strokeWidth="6" fill="none" />
        {/* Antennae (Ears) */}
        <path d="M 80 105 Q 70 85, 60 90" stroke="#374151" strokeWidth="3" fill="none" />
        <path d="M 120 105 Q 130 85, 140 90" stroke="#374151" strokeWidth="3" fill="none" />
        {/* Feet */}
        <rect x="60" y="215" width="20" height="8" rx="4" fill="#6B7280" />
        <rect x="120" y="215" width="20" height="8" rx="4" fill="#6B7280" />
    </>
);


const HeadWhispy = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <ellipse cx="85" cy="130" rx="10" ry="12" fill="white" />
            <motion.ellipse cx="85" cy="130" rx="5" ry="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="83" cy="125" r="2" fill="white" />
            <ellipse cx="115" cy="130" rx="10" ry="12" fill="white" />
            <motion.ellipse cx="115" cy="130" rx="5" ry="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="113" cy="125" r="2" fill="white" />
        </g>
        <path d="M 98 150 C 100 152, 100 152, 102 150" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Flame (Ear) */}
        <motion.path
            d="M 100 40 Q 90 20 100 0 Q 110 20 100 40"
            fill="orange"
            animate={{ scaleY: [1, 1.2, 1], y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
            d="M 100 35 Q 95 25 100 15 Q 105 25 100 35"
            fill="yellow"
            animate={{ scaleY: [1, 1.1, 1], y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
    </motion.g>
);

const TorsoWhispy = ({ color }: any) => (
    <>
        <motion.path d="M 100 50 C 40 80, 40 170, 70 200 C 80 210, 120 210, 130 200 C 160 170, 160 80, 100 50 Z" fill={color}
            initial={{ y: 0 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
    </>
);


const HeadSpikey = ({ pupilX, pupilY }: any) => (
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <circle cx="90" cy="140" r="8" fill="black" />
            <circle cx="88" cy="137" r="2" fill="white" />
            <circle cx="110" cy="140" r="8" fill="black" />
            <circle cx="108" cy="137" r="2" fill="white" />
        </g>
        <path d="M 95 160 Q 100 155 105 160" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoSpikey = ({ color }: any) => (
    <g transform="scale(1.2, 1) translate(-17, 30)">
        {/* Body */}
        <path d="M 70 210 C 70 120, 130 120, 130 210 Z" fill={color} />
        {/* Spikes (Ears) */}
        <path d="M 100 100 L 100 120 M 80 115 L 95 125 M 120 115 L 105 125" stroke={color} strokeWidth="8" strokeLinecap='round' />
        <path d="M 70 160 L 50 160" stroke={color} strokeWidth="8" strokeLinecap='round' />
        <path d="M 130 160 L 150 160" stroke={color} strokeWidth="8" strokeLinecap='round' />
        {/* Hands */}
        <path d="M 70 170 C 50 170, 50 190, 70 190" fill={color} />
        <path d="M 130 170 C 150 170, 150 190, 130 190" fill={color} />
        {/* Feet */}
        <ellipse cx="80" cy="210" rx="20" ry="10" fill="#22C55E" />
        <ellipse cx="120" cy="210" rx="20" ry="10" fill="#22C55E" />
    </g>
);


const HeadBubbles = ({ pupilX, pupilY }: any) => (
     <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
        <g>
            <ellipse cx="85" cy="130" rx="14" ry="16" fill="white" />
            <motion.ellipse cx="85" cy="130" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="83" cy="125" r="3" fill="white" />
            <ellipse cx="115" cy="130" rx="14" ry="16" fill="white" />
            <motion.ellipse cx="115" cy="130" rx="7" ry="8" fill="black" style={{ x: pupilX, y: pupilY }}/>
            <circle cx="113" cy="125" r="3" fill="white" />
        </g>
        <path d="M 95 155 Q 100 165 105 155" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 98 155 C 99 157, 101 157, 102 155" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.g>
);

const TorsoBubbles = ({ color }: any) => (
    <>
        <motion.circle cx="100" cy="160" r="70" fill={color} opacity="0.8" 
             initial={{ scale: 1 }}
             animate={{ scale: [1, 1.01, 1] }}
             transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Bubbles (Ears/Hands/Feet proxy) */}
        <circle cx="70" cy="130" r="10" fill="white" opacity="0.5" />
        <circle cx="130" cy="180" r="15" fill="white" opacity="0.4" />
        <circle cx="100" cy="200" r="8" fill="white" opacity="0.6" />
        <circle cx="65" cy="170" r="8" fill="white" opacity="0.5" />
        <circle cx="135" cy="140" r="6" fill="white" opacity="0.5" />
    </>
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
            "Bubbles": "#A5F3FC",
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
                        cy="225"
                        rx="60"
                        ry="9"
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
                        <Shoes name={shoes} />
                        <Torso color={bodyColor} />
                        <Shirt name={shirt} />
                        <Head color={bodyColor} pupilX={pupilX} pupilY={pupilY} />
                        <Hat name={hat} />
                    </motion.g>
                </motion.g>
            </motion.svg>
        </div>
    );
};

export default AIBuddy;
