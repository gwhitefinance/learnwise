
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Hat, Shirt, Shoes } from './robot-accessories';

// --- Body Shape Components ---

const BodyZappy = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 70 190 Q 55 210 80 205 Q 105 210 85 190" fill="#4B5563" />
        <path d="M 115 190 Q 100 210 125 205 Q 150 210 130 190" fill="#4B5563" />
        {/* Body */}
        <motion.path d="M 60 190 C 20 120, 40 40, 100 40 C 160 40, 180 120, 140 190 Z" fill={color} 
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.98, 1], y: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M 60 190 C 20 120, 40 40, 100 40 C 160 40, 180 120, 140 190 Z" fill="url(#bodyGradient)" />
        {/* Ears */}
        <path d="M 60 80 C 40 40, 80 50, 75 80" fill={color} stroke="#4B5563" strokeWidth="2.5" />
        <path d="M 140 80 C 160 40, 120 50, 125 80" fill={color} stroke="#4B5563" strokeWidth="2.5" />
        {/* Hands */}
        <motion.path d="M 50 150 C 25 140, 30 170, 55 165" fill={color} 
            initial={{ rotate: 0 }}
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.path d="M 150 150 C 175 140, 170 170, 145 165" fill={color}
            initial={{ rotate: 0 }}
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        {/* Body Details */}
        <path d="M 80 160 L 90 175 L 85 180" fill="none" stroke="white" strokeWidth="3" strokeLinecap='round' opacity="0.3"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <ellipse cx="80" cy="115" rx="16" ry="18" fill="white" />
                <motion.ellipse cx="80" cy="115" rx="8" ry="9" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="78" cy="108" r="3" fill="white" />
                <ellipse cx="120" cy="115" rx="16" ry="18" fill="white" />
                <motion.ellipse cx="120" cy="115" rx="8" ry="9" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="118" cy="108" r="3" fill="white" />
            </g>
            <path d="M 95 150 Q 100 155 105 150" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 98 150 C 99 152, 101 152, 102 150" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodySeedling = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="70" cy="190" rx="35" ry="18" fill="#15803D" />
        <ellipse cx="130" cy="190" rx="35" ry="18" fill="#15803D" />
        {/* Body */}
        <motion.path d="M 50 190 C 20 120, 40 50, 100 50 C 160 50, 180 120, 150 190 Z" fill={color}
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.99, 1], y: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M 50 190 C 20 120, 40 50, 100 50 C 160 50, 180 120, 150 190 Z" fill="url(#bodyGradient)" />
        {/* Body Details */}
        <path d="M 90 170 Q 100 175 110 170" fill="none" stroke="white" strokeWidth="3" opacity="0.3" strokeLinecap='round' />
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
        <path d="M 48 160 C 25 150, 30 175, 52 170" fill={color} />
        <path d="M 152 160 C 175 150, 170 175, 148 170" fill={color} />
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
    </>
);

const BodyEmber = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 75 190 L 55 205 L 90 205 Z" fill="#D97706" />
        <path d="M 125 190 L 110 205 L 145 205 Z" fill="#D97706" />
        {/* Body */}
        <motion.path d="M 70 190 C 40 120, 60 20, 100 20 C 140 20, 160 120, 130 190 Z" fill={color}
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.97, 1], y: [0, 6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M 70 190 C 40 120, 60 20, 100 20 C 140 20, 160 120, 130 190 Z" fill="url(#bodyGradient)" />
        <ellipse cx="100" cy="165" rx="45" ry="40" fill="#FEF3C7" />
        {/* Body Details */}
        <path d="M 90 165 C 95 170 105 170 110 165" fill="none" stroke="#FBBF24" strokeWidth="3" opacity="0.5" strokeLinecap='round' />
        <path d="M 93 175 C 98 180 108 180 113 175" fill="none" stroke="#FBBF24" strokeWidth="3" opacity="0.5" strokeLinecap='round' />
        {/* Ears */}
        <path d="M 75 60 C 60 30, 90 45, 80 70" fill={color} stroke="#D97706" strokeWidth="2.5" />
        <path d="M 125 60 C 140 30, 110 45, 120 70" fill={color} stroke="#D97706" strokeWidth="2.5" />
        {/* Hands */}
        <ellipse cx="55" cy="150" rx="20" ry="18" fill={color} />
        <ellipse cx="145" cy="150" rx="20" ry="18" fill={color} />
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
    </>
);

const BodyShelly = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 60 185 C 55 205, 85 205, 80 185" fill="#22C55E" />
        <path d="M 120 185 C 115 205, 145 205, 140 185" fill="#22C55E" />
        {/* Body */}
        <path d="M 40 190 C 40 100, 160 100, 160 190 Z" fill={color} />
        <path d="M 40 190 C 40 100, 160 100, 160 190 Z" fill="url(#bodyGradient)" />
        {/* Shell */}
        <path d="M 30 160 C 30 70, 170 70, 170 160" fill="#1F2937" />
        <path d="M 30 160 C 30 70, 170 70, 170 160" stroke="#111827" strokeWidth="5" />
        <path d="M 60 155 C 60 100, 140 100, 140 155" stroke="#4B5563" strokeWidth="4" fill="none" />
        <path d="M 100 72 L 100 160" stroke="#4B5563" strokeWidth="4" fill="none" />
        <path d="M 65 120 L 135 120" stroke="#4B5563" strokeWidth="4" fill="none" />
        {/* Hands */}
        <ellipse cx="35" cy="160" rx="22" ry="20" fill={color} />
        <ellipse cx="165" cy="160" rx="22" ry="20" fill={color} />
        {/* Head */}
        <circle cx="100" cy="100" r="35" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
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
    </>
);

const BodyPuff = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="80" cy="190" rx="22" ry="12" fill="#F472B6" />
        <ellipse cx="120" cy="190" rx="22" ry="12" fill="#F472B6" />
        {/* Body */}
        <motion.circle cx="100" cy="140" r="65" fill={color} 
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="100" cy="140" r="65" fill="url(#bodyGradient)" />
        {/* Body Details */}
        <path d="M 75 150 C 80 160, 90 160, 95 150" stroke="white" strokeWidth="3.5" opacity="0.4" fill="none" strokeLinecap='round' />
        <path d="M 105 150 C 110 160, 120 160, 125 150" stroke="white" strokeWidth="3.5" opacity="0.4" fill="none" strokeLinecap='round' />
        {/* Ears */}
        <path d="M 65 95 Q 35 65, 75 80" fill={color} stroke="#F472B6" strokeWidth="3.5" />
        <path d="M 135 95 Q 165 65, 125 80" fill={color} stroke="#F472B6" strokeWidth="3.5" />
        {/* Hands */}
        <path d="M 40 145 Q 15 135 30 125" stroke={color} strokeWidth="30" fill="none" strokeLinecap="round"/>
        <path d="M 160 145 Q 185 135 170 125" stroke={color} strokeWidth="30" fill="none" strokeLinecap="round"/>
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
    </>
);

const BodyGoo = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Body */}
        <motion.path d="M 50 190 Q 30 100, 100 70 Q 170 100, 150 190 Z" fill={color}
            initial={{ scaleY: 1, y: 0 }}
            animate={{ scaleY: [1, 0.98, 1], y: [0, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M 50 190 Q 30 100, 100 70 Q 170 100, 150 190 Z" fill="url(#bodyGradient)" />
        {/* Drips */}
        <path d="M 50 190 Q 60 200, 70 190" fill={color} />
        <path d="M 150 190 Q 140 200, 130 190" fill={color} />
        {/* Bubbles */}
        <circle cx="80" cy="150" r="5" fill="white" opacity="0.3" />
        <circle cx="120" cy="160" r="3" fill="white" opacity="0.3" />
        <circle cx="100" cy="120" r="4" fill="white" opacity="0.3" />
        {/* Hands */}
        <path d="M 40 160 C 20 150, 25 180, 45 175" fill={color} />
        <path d="M 160 160 C 180 150, 175 180, 155 175" fill={color} />
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
    </>
);

const BodyChirpy = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 80 185 L 70 200 L 90 200 Z" fill="#F97316" />
        <path d="M 120 185 L 110 200 L 130 200 Z" fill="#F97316" />
        {/* Body */}
        <motion.circle cx="100" cy="140" r="55" fill={color} 
            initial={{ y: 0 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="100" cy="140" r="55" fill="url(#bodyGradient)" />
        <ellipse cx="100" cy="150" rx="40" ry="30" fill="#FFFBEB" />
        {/* Wings/Hands */}
        <motion.path d="M 50 140 C 30 120, 30 160, 50 150" fill={color} 
            initial={{ rotate: 0 }}
            animate={{ rotate: [-10, 5, -10] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path d="M 150 140 C 170 120, 170 160, 150 150" fill={color}
             initial={{ rotate: 0 }}
            animate={{ rotate: [10, -5, 10] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Head Feather */}
        <path d="M 100 85 C 90 65, 110 65, 100 85 M 95 70 Q 100 60 105 70" fill={color} stroke="#CA8A04" strokeWidth="2" />
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
    </>
);

const BodySparky = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="80" cy="190" rx="20" ry="10" fill="#A16207" />
        <ellipse cx="120" cy="190" rx="20" ry="10" fill="#A16207" />
        {/* Body */}
        <motion.path d="M 60 190 C 50 100, 150 100, 140 190 Z" fill={color} 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M 60 190 C 50 100, 150 100, 140 190 Z" fill="url(#bodyGradient)" />
        {/* Ears */}
        <path d="M 60 90 C 30 50, 80 50, 70 90" fill={color} stroke="black" strokeWidth="2.5"/>
        <path d="M 140 90 C 170 50, 120 50, 130 90" fill={color} stroke="black" strokeWidth="2.5"/>
        {/* Hands */}
        <circle cx="50" cy="150" r="15" fill={color} />
        <circle cx="150" cy="150" r="15" fill={color} />
        {/* Body Details (cheeks) */}
        <circle cx="70" cy="140" r="12" fill="#DC2626" />
        <circle cx="130" cy="140" r="12" fill="#DC2626" />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <ellipse cx="85" cy="120" rx="10" ry="14" fill="black" />
                <circle cx="83" cy="115" r="3" fill="white" />
                <ellipse cx="115" cy="120" rx="10" ry="14" fill="black" />
                <circle cx="113" cy="115" r="3" fill="white" />
            </g>
            <path d="M 98 145 C 100 148, 100 148, 102 145" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </motion.g>
    </>
);

const BodyRocky = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <path d="M 60 180 L 90 180 L 90 195 L 60 195 Z" fill="#4B5563" />
        <path d="M 110 180 L 140 180 L 140 195 L 110 195 Z" fill="#4B5563" />
        {/* Body */}
        <motion.path d="M 50 180 L 40 100 L 160 100 L 150 180 Z" fill={color} 
            initial={{ y: 0 }}
            animate={{ y: [0, 2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M 50 180 L 40 100 L 160 100 L 150 180 Z" fill="url(#bodyGradient)" />
        {/* Hands */}
        <path d="M 30 140 L 50 120 L 60 160 Z" fill={color} />
        <path d="M 170 140 L 150 120 L 140 160 Z" fill={color} />
        {/* Details */}
        <path d="M 80 150 L 90 160" stroke="white" strokeWidth="3" opacity="0.2" strokeLinecap="round" />
        <path d="M 110 140 L 120 155" stroke="white" strokeWidth="3" opacity="0.2" strokeLinecap="round" />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <rect x="75" y="110" width="20" height="10" fill="#4B5563" />
                <rect x="105" y="110" width="20" height="10" fill="#4B5563" />
            </g>
            <path d="M 80 140 L 120 140" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodySplash = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Body */}
        <motion.path d="M 100 50 C 50 50, 40 190, 40 190 L 160 190 C 160 190, 150 50, 100 50 Z" fill={color} 
            initial={{ scaleY: 1, scaleX: 1 }}
            animate={{ scaleY: [1, 0.95, 1], scaleX: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M 100 50 C 50 50, 40 190, 40 190 L 160 190 C 160 190, 150 50, 100 50 Z" fill="url(#bodyGradient)" />
        {/* Hands */}
        <path d="M 40 150 C 20 140, 20 170, 40 160" fill={color} />
        <path d="M 160 150 C 180 140, 180 170, 160 160" fill={color} />
        {/* Feet (puddle) */}
        <ellipse cx="100" cy="190" rx="70" ry="15" fill={color} opacity="0.8" />
        {/* Details */}
        <circle cx="100" cy="80" r="5" fill="white" opacity="0.5" />
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
    </>
);

const BodyBear = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="80" cy="190" rx="25" ry="12" fill="#6B4226" />
        <ellipse cx="120" cy="190" rx="25" ry="12" fill="#6B4226" />
        {/* Body */}
        <path d="M 50 190 C 20 130, 30 60, 100 60 C 170 60, 180 130, 150 190 Z" fill={color} />
        {/* Ears */}
        <circle cx="70" cy="70" r="20" fill={color} />
        <circle cx="130" cy="70" r="20" fill={color} />
        <circle cx="70" cy="70" r="12" fill="#D2B48C" />
        <circle cx="130" cy="70" r="12" fill="#D2B48C" />
        {/* Hands */}
        <circle cx="45" cy="140" r="20" fill={color} />
        <circle cx="155" cy="140" r="20" fill={color} />
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
    </>
);

const BodyBunny = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="80" cy="190" rx="25" ry="15" fill="#FBCFE8" />
        <ellipse cx="120" cy="190" rx="25" ry="15" fill="#FBCFE8" />
        {/* Body */}
        <ellipse cx="100" cy="150" rx="55" ry="60" fill={color} />
        {/* Ears */}
        <path d="M 70 90 C 50 20, 80 20, 80 90" fill={color} stroke="#F472B6" strokeWidth="2"/>
        <path d="M 130 90 C 150 20, 120 20, 120 90" fill={color} stroke="#F472B6" strokeWidth="2"/>
        <path d="M 70 85 C 65 40, 75 40, 75 85" fill="#FBCFE8" />
        <path d="M 130 85 C 135 40, 125 40, 125 85" fill="#FBCFE8" />
        {/* Hands */}
        <ellipse cx="50" cy="150" rx="18" ry="15" fill={color} />
        <ellipse cx="150" cy="150" rx="18" ry="15" fill={color} />
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
    </>
);

const BodyBoo = ({ color, pupilX, pupilY }: any) => (
    <g transform="scale(1, 0.9) translate(0, 10)">
        <motion.path d="M 50 190 C 20 80, 180 80, 150 190 C 140 180, 120 195, 100 180 C 80 195, 60 180, 50 190 Z" fill={color}
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M 50 190 C 20 80, 180 80, 150 190 C 140 180, 120 195, 100 180 C 80 195, 60 180, 50 190 Z" fill="url(#bodyGradient)" />
        
        <path d="M 40 140 C 20 130, 25 160, 45 155" fill={color} />
        <path d="M 160 140 C 180 130, 175 160, 155 155" fill={color} />
        
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
    </g>
);

const BodyRoly = ({ color, pupilX, pupilY }: any) => (
    <>
        <ellipse cx="100" cy="150" rx="70" ry="50" fill={color} />
        <path d="M 30 150 C 40 100, 160 100, 170 150" stroke="#4B5563" strokeWidth="10" fill="none" />
        <path d="M 40 150 C 50 120, 150 120, 160 150" stroke="#4B5563" strokeWidth="8" fill="none" />
        <path d="M 50 150 C 60 135, 140 135, 150 150" stroke="#4B5563" strokeWidth="6" fill="none" />

        {/* Antennae */}
        <path d="M 80 105 Q 70 85, 60 90" stroke="#374151" strokeWidth="3" fill="none" />
        <path d="M 120 105 Q 130 85, 140 90" stroke="#374151" strokeWidth="3" fill="none" />
        
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="85" cy="120" r="8" fill="black" />
                <circle cx="83" cy="116" r="2" fill="white" />
                <circle cx="115" cy="120" r="8" fill="black" />
                <circle cx="113" cy="116" r="2" fill="white" />
            </g>
            <path d="M 98 135 L 102 135" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyWhispy = ({ color, pupilX, pupilY }: any) => (
    <>
        <motion.path d="M 100 50 C 40 80, 40 150, 70 180 C 80 190, 120 190, 130 180 C 160 150, 160 80, 100 50 Z" fill={color}
            initial={{ y: 0 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M 100 50 C 40 80, 40 150, 70 180 C 80 190, 120 190, 130 180 C 160 150, 160 80, 100 50 Z" fill="url(#bodyGradient)" opacity="0.7" />
        
        {/* Flame */}
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
        </motion.g>
    </>
);

const BodySpikey = ({ color, pupilX, pupilY }: any) => (
    <g transform="scale(1.3) translate(-15, -30)">
        {/* Feet */}
        <ellipse cx="80" cy="190" rx="20" ry="10" fill="#22C55E" />
        <ellipse cx="120" cy="190" rx="20" ry="10" fill="#22C55E" />
        {/* Body */}
        <path d="M 70 190 C 70 100, 130 100, 130 190 Z" fill={color} />
        {/* Spikes */}
        <path d="M 100 80 L 100 100 M 80 95 L 95 105 M 120 95 L 105 105" stroke={color} strokeWidth="5" strokeLinecap='round' />
        <path d="M 70 140 L 50 140" stroke={color} strokeWidth="5" strokeLinecap='round' />
        <path d="M 130 140 L 150 140" stroke={color} strokeWidth="5" strokeLinecap='round' />
        {/* Hands */}
        <path d="M 70 150 C 50 150, 50 170, 70 170" fill={color} />
        <path d="M 130 150 C 150 150, 150 170, 130 170" fill={color} />
        
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
             <g>
                <circle cx="90" cy="140" r="8" fill="black" />
                <circle cx="88" cy="137" r="2" fill="white" />
                <circle cx="110" cy="140" r="8" fill="black" />
                 <circle cx="108" cy="137" r="2" fill="white" />
            </g>
            <path d="M 95 160 Q 100 155 105 160" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </g>
);

const BodyBubbles = ({ color, pupilX, pupilY }: any) => (
    <>
        <motion.circle cx="100" cy="140" r="60" fill={color} opacity="0.8" 
             initial={{ scale: 1 }}
             animate={{ scale: [1, 1.01, 1] }}
             transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Bubbles */}
        <circle cx="70" cy="110" r="10" fill="white" opacity="0.5" />
        <circle cx="130" cy="160" r="15" fill="white" opacity="0.4" />
        <circle cx="100" cy="180" r="8" fill="white" opacity="0.6" />
        
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
    </>
);



const speciesComponents: Record<string, React.FC<any>> = {
    "Zappy": BodyZappy,
    "Seedling": BodySeedling,
    "Ember": BodyEmber,
    "Shelly": BodyShelly,
    "Puff": BodyPuff,
    "Goo": BodyGoo,
    "Chirpy": BodyChirpy,
    "Sparky": BodySparky,
    "Rocky": BodyRocky,
    "Splash": BodySplash,
    "Bear": BodyBear,
    "Bunny": BodyBunny,
    "Boo": BodyBoo,
    "Roly": BodyRoly,
    "Whispy": BodyWhispy,
    "Spikey": BodySpikey,
    "Bubbles": BodyBubbles,
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
                        cy="205"
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
                        <BodyComponent color={bodyColor} pupilX={pupilX} pupilY={pupilY} />
                        <Shirt name={shirt} />
                        <Hat name={hat} />
                    </motion.g>
                </motion.g>
            </motion.svg>
        </div>
    );
};

export default AIBuddy;
