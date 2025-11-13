
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
        {/* Feet */}
        <ellipse cx="80" cy="175" rx="15" ry="8" fill="#a16207" />
        <ellipse cx="120" cy="175" rx="15" ry="8" fill="#a16207" />

        {/* Body */}
        <path 
            d="M 60,170 C 40,140 40,80 70,60 C 90,40 110,40 130,60 C 160,80 160,140 140,170 Z" 
            fill={color} 
        />
        <path 
             d="M 80,165 C 70,145 70,110 100,105 C 130,110 130,145 120,165 Z"
             fill="rgba(255, 255, 255, 0.3)"
        />
        <path 
            d="M 60,170 C 40,140 40,80 70,60 C 90,40 110,40 130,60 C 160,80 160,140 140,170 Z" 
            fill="url(#bodyGradient)"
        />
         {/* Detail lines */}
        <path d="M 75,150 C 80,140 85,140 90,150" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
        <path d="M 110,150 C 115,140 120,140 125,150" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />


        {/* Hands */}
        <motion.path d="M 58,130 C 40,120 40,140 58,130" fill={color} stroke={color} strokeWidth="6" strokeLinecap="round" 
            animate={{ rotate: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            style={{ transformOrigin: '58px 130px' }}
        />
        <motion.path d="M 142,130 C 160,120 160,140 142,130" fill={color} stroke={color} strokeWidth="6" strokeLinecap="round"
             animate={{ rotate: [0, 10, 0], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }}
            style={{ transformOrigin: '142px 130px' }}
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
            <path d="M 95,105 Q 100,115 105,105" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Blush */}
            <ellipse cx="75" cy="95" rx="5" ry="3" fill="rgba(255, 105, 180, 0.4)" />
            <ellipse cx="125" cy="95" rx="5" ry="3" fill="rgba(255, 105, 180, 0.4)" />
        </motion.g>
    </>
);

const BodySpike = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="80" cy="175" rx="15" ry="8" fill="#333" />
        <ellipse cx="120" cy="175" rx="15" ry="8" fill="#333" />
        {/* Body */}
        <path d="M 70,170 Q 100,190 130,170 C 140,120 120,50 100,40 C 80,50 60,120 70,170 Z" fill={color} />
        <path d="M 85,165 C 90,150 110,150 115,165 Z" fill="rgba(255, 255, 255, 0.2)" />
        <path d="M 70,170 Q 100,190 130,170 C 140,120 120,50 100,40 C 80,50 60,120 70,170 Z" fill="url(#bodyGradient)" />
        {/* Hands */}
        <circle cx="65" cy="130" r="10" fill={color} />
        <circle cx="135" cy="130" r="10" fill={color} />
        <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}
        >
            <path d="M 60,50 L 70,40 L 80,50" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
            <path d="M 120,50 L 130,40 L 140,50" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
            <g>
                <circle cx="85" cy="100" r="12" fill="white" />
                <motion.circle cx="85" cy="100" r="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="115" cy="100" r="12" fill="white" />
                <motion.circle cx="115" cy="100" r="6" fill="black" style={{ x: pupilX, y: pupilY }}/>
            </g>
            <path d="M 90,120 C 95,135 105,135 110,120" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyGoop = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Body */}
        <path d="M 60,170 Q 50,120 80,100 C 110,80 140,100 150,140 Q 140,180 100,175 C 70,175 60,170 60,170 Z" fill={color} />
        {/* Internal Bubbles */}
        <circle cx="85" cy="120" r="4" fill="rgba(255,255,255,0.3)" />
        <circle cx="115" cy="150" r="6" fill="rgba(255,255,255,0.2)" />
        <circle cx="130" cy="125" r="3" fill="rgba(255,255,255,0.4)" />
        <path d="M 60,170 Q 50,120 80,100 C 110,80 140,100 150,140 Q 140,180 100,175 C 70,175 60,170 60,170 Z" fill="url(#bodyGradient)" />
        {/* Hands/Drips */}
        <path d="M 60,150 C 50,160 50,170 60,165" fill={color} />
        <path d="M 150,150 C 160,160 160,170 150,165" fill={color} />
        <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}
        >
            <g>
                <motion.circle cx="90" cy="130" r="10" fill="white" />
                <motion.circle cx="90" cy="130" r="5" fill="black" style={{ x: pupilX, y: pupilY }} />
                <motion.circle cx="120" cy="130" r="10" fill="white" />
                <motion.circle cx="120" cy="130" r="5" fill="black" style={{ x: pupilX, y: pupilY }} />
            </g>
            <path d="M 100,145 Q 105,155 110,145" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyGhosty = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Hands */}
        <ellipse cx="60" cy="130" rx="12" ry="8" fill={color} opacity="0.8"/>
        <ellipse cx="140" cy="130" rx="12" ry="8" fill={color} opacity="0.8"/>
        {/* Body */}
        <path d="M 60,100 C 60,50 140,50 140,100 V 170 Q 120,160 100,170 Q 80,180 60,170 Z" fill={color} opacity="0.9"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}>
            <g>
                <path d="M 80 90 C 85 105, 95 105, 100 90" stroke="white" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 110 90 C 115 105, 125 105, 130 90" stroke="white" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <path d="M 95,120 Q 105,135 115,120" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyRocky = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <rect x="60" y="165" width="30" height="15" rx="5" fill="#4a4a4a"/>
        <rect x="110" y="165" width="30" height="15" rx="5" fill="#4a4a4a"/>
        {/* Body */}
        <path d="M 60,170 L 50,120 L 70,80 L 100,70 L 130,80 L 150,120 L 140,170 Z" fill={color} />
        {/* Cracks */}
        <path d="M 80 90 L 90 100 L 85 110" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
        <path d="M 120 95 L 110 105" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
        {/* Hands */}
        <path d="M45,110 L35,120 L45,130" fill={color} stroke="#4a4a4a" strokeWidth="6"/>
        <path d="M155,110 L165,120 L155,130" fill={color} stroke="#4a4a4a" strokeWidth="6"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}>
            <g>
                <rect x="80" y="100" width="15" height="10" rx="2" fill="#333" />
                <rect x="115" y="100" width="15" height="10" rx="2" fill="#333" />
            </g>
            <rect x="90" y="125" width="30" height="5" rx="2" fill="#333" />
        </motion.g>
    </>
);

const BodyLeafy = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="80" cy="175" rx="15" ry="8" fill="#71452b" />
        <ellipse cx="120" cy="175" rx="15" ry="8" fill="#71452b" />
        {/* Body */}
        <ellipse cx="100" cy="130" rx="40" ry="45" fill={color} />
        <path d="M 95,60 C 80,40 120,40 105,60 Q 100,50 95,60" fill="#22c55e" />
        <path d="M 100,60 L 100,75" stroke="#166534" strokeWidth="2" />
        {/* Hands */}
        <path d="M 58,130 C 40,120 40,140 58,130" fill="#22c55e" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
        <path d="M 142,130 C 160,120 160,140 142,130" fill="#22c55e" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}>
            <g>
                <motion.circle cx="85" cy="125" r="10" fill="white" />
                <motion.circle cx="85" cy="125" r="5" fill="black" style={{ x: pupilX, y: pupilY }} />
                <motion.circle cx="115" cy="125" r="10" fill="white" />
                <motion.circle cx="115" cy="125" r="5" fill="black" style={{ x: pupilX, y: pupilY }} />
            </g>
            <path d="M 95,145 Q 100,155 105,145" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyDino = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <ellipse cx="80" cy="180" rx="20" ry="10" fill={color} />
        <ellipse cx="120" cy="180" rx="20" ry="10" fill={color} />
        {/* Main Body */}
        <path 
            d="M 50,180 C 50,120 30,80 70,50 C 90,30 110,30 130,50 C 170,80 150,120 150,180 Z"
            fill={color} 
        />
        {/* Belly */}
        <ellipse cx="100" cy="140" rx="35" ry="40" fill="rgba(255, 255, 255, 0.4)" />
        {/* Hands */}
        <ellipse cx="65" cy="130" rx="10" ry="15" fill={color} transform="rotate(-20, 65, 130)"/>
        <ellipse cx="135" cy="130" rx="10" ry="15" fill={color} transform="rotate(20, 135, 130)"/>
        {/* Back Spikes */}
        <path d="M 90 40 L 100 25 L 110 40" fill={color} />

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
            <path d="M 95,100 C 98,108 102,108 105,100" stroke="#a16207" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyFlarie = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Flame Tail */}
        <motion.path
            d="M 100,180 C 120,160 130,130 110,110 C 130,90 110,70 100,60 C 90,70 70,90 90,110 C 70,130 80,160 100,180 Z"
            fill="url(#flameGradient)"
            animate={{
                scaleY: [1, 1.1, 1],
                y: [0, -5, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Body */}
        <path d="M 80,140 C 60,110 70,70 100,70 C 130,70 140,110 120,140 C 110,150 90,150 80,140 Z" fill={color} />
        <path d="M 80,140 C 60,110 70,70 100,70 C 130,70 140,110 120,140 C 110,150 90,150 80,140 Z" fill="url(#bodyGradient)" />
        {/* Hands */}
        <circle cx="70" cy="120" r="8" fill={color} />
        <circle cx="130" cy="120" r="8" fill={color} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="90" cy="100" r="10" fill="white" />
                <motion.circle cx="90" cy="100" r="5" fill="#f97316" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="110" cy="100" r="10" fill="white" />
                <motion.circle cx="110" cy="100" r="5" fill="#f97316" style={{ x: pupilX, y: pupilY }}/>
            </g>
            <path d="M 95,115 Q 100,125 105,115" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyAquan = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Body with water effect */}
        <path d="M 70,170 C 40,150 40,80 100,80 C 160,80 160,150 130,170 Q 100,180 70,170 Z" fill={color} opacity="0.8"/>
        {/* Hands */}
        <path d="M60 140 C 40 130 50 160 60 150" fill={color} opacity="0.8" />
        <path d="M140 140 C 160 130 150 160 140 150" fill={color} opacity="0.8" />
        {/* Bubbles */}
        <motion.circle cx="80" cy="110" r="5" fill="white" opacity="0.5" animate={{ y: [0, -10, 0], opacity: [0.5, 0.8, 0.5]}} transition={{ duration: 3, repeat: Infinity}} />
        <motion.circle cx="120" cy="100" r="8" fill="white" opacity="0.4" animate={{ y: [0, -15, 0], opacity: [0.4, 0.7, 0.4]}} transition={{ duration: 4, repeat: Infinity, delay: 1}}/>
        <motion.circle cx="100" cy="140" r="3" fill="white" opacity="0.6" animate={{ y: [0, -8, 0], opacity: [0.6, 0.9, 0.6]}} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5}}/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <motion.circle cx="90" cy="120" r="9" fill="#00008B" style={{ x: pupilX, y: pupilY }} />
                <motion.circle cx="110" cy="120" r="9" fill="#00008B" style={{ x: pupilX, y: pupilY }} />
            </g>
            <path d="M 95,135 Q 100,145 105,135" stroke="#00008B" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyTerran = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Feet */}
        <rect x="65" y="165" width="25" height="15" rx="4" fill="#6b4a39"/>
        <rect x="110" y="165" width="25" height="15" rx="4" fill="#6b4a39"/>
        {/* Jagged rock body */}
        <path d="M 60,170 L 50,150 L 70,120 L 60,90 L 80,70 L 120,70 L 140,90 L 130,120 L 150,150 L 140,170 Z" fill={color} />
        {/* Hands */}
        <path d="M45 120 L 30 110 L 40 130 Z" fill="#6b4a39" />
        <path d="M155 120 L 170 110 L 160 130 Z" fill="#6b4a39" />
        {/* Moss details */}
        <circle cx="75" cy="155" r="8" fill="#556B2F" />
        <circle cx="125" cy="95" r="5" fill="#556B2F" />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <rect x="80" y="105" width="10" height="10" fill="yellow" />
                <rect x="110" y="105" width="10" height="10" fill="yellow" />
            </g>
             <rect x="90" y="130" width="20" height="4" fill="black" />
        </motion.g>
    </>
);

const BodyVolty = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Main Body */}
        <ellipse cx="100" cy="130" rx="50" ry="40" fill={color} />
        {/* Hands */}
        <path d="M50 130 L 30 120 L 40 140 Z" fill="#facc15" />
        <path d="M150 130 L 170 120 L 160 140 Z" fill="#facc15" />
        {/* Lightning bolts */}
        <motion.path d="M 80 110 L 90 130 L 85 140 L 95 160" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round" animate={{opacity: [1, 0.5, 1]}} transition={{duration: 1, repeat: Infinity}}/>
        <motion.path d="M 120 110 L 110 130 L 115 140 L 105 160" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round" animate={{opacity: [0.5, 1, 0.5]}} transition={{duration: 1, repeat: Infinity}} />
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <motion.path d="M 85 110 L 95 110" stroke="white" strokeWidth="3" style={{ x: pupilX, y: pupilY }}/>
                <motion.path d="M 105 110 L 115 110" stroke="white" strokeWidth="3" style={{ x: pupilX, y: pupilY }}/>
            </g>
             <path d="M 95,130 C 98,140 102,140 105,130" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyPilgrim = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Pear-shaped body */}
        <path d="M 100,180 C 60,180 50,100 70,70 C 85,45 115,45 130,70 C 150,100 140,180 100,180 Z" fill={color} />
        <path d="M 100,180 C 60,180 50,100 70,70 C 85,45 115,45 130,70 C 150,100 140,180 100,180 Z" fill="url(#bodyGradient)"/>
        {/* Hands */}
        <circle cx="65" cy="130" r="8" fill="#f3e8d7" />
        <circle cx="135" cy="130" r="8" fill="#f3e8d7" />
        {/* Feet */}
        <Shoes name="Pilgrim Shoes"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="85" cy="100" r="10" fill="white" />
                <motion.circle cx="85" cy="100" r="5" fill="black" style={{ x: pupilX, y: pupilY }} />
                <circle cx="115" cy="100" r="10" fill="white" />
                <motion.circle cx="115" cy="100" r="5" fill="black" style={{ x: pupilX, y: pupilY }} />
            </g>
            <path d="M 98,115 Q 100,120 102,115" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyTurkey = ({ color, pupilX, pupilY }: any) => (
     <>
        {/* Tail Feathers */}
        <path d="M 100,130 C 50,130 30,80 50,50" fill="#d32f2f" />
        <path d="M 100,130 C 70,130 50,90 60,60" fill="#FFC107" />
        <path d="M 100,130 C 130,130 150,90 140,60" fill="#FFC107" />
        <path d="M 100,130 C 150,130 170,80 150,50" fill="#d32f2f" />
        <path d="M 100,130 C 100,80 100,40 100,40" stroke="#A0522D" strokeWidth="10" strokeLinecap="round" />
        {/* Body */}
        <ellipse cx="100" cy="130" rx="40" ry="45" fill="#8B4513"/>
        {/* Wings as Hands */}
        <path d="M 60,130 C 40,120 50,160 60,150" fill="#a0522d" />
        <path d="M 140,130 C 160,120 150,160 140,150" fill="#a0522d" />
        {/* Feet */}
        <g stroke="#FFA500" strokeWidth="3" strokeLinecap="round">
            <path d="M80 170 L 70 185 M80 170 L 80 185 M80 170 L 90 185" />
            <path d="M120 170 L 110 185 M120 170 L 120 185 M120 170 L 130 185" />
        </g>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 120 } }}>
            <g>
                <circle cx="85" cy="125" r="10" fill="white" />
                <motion.circle cx="85" cy="125" r="5" fill="black" style={{ x: pupilX, y: pupilY }}/>
                <circle cx="115" cy="125" r="10" fill="white" />
                <motion.circle cx="115" cy="125" r="5" fill="black" style={{ x: pupilX, y: pupilY }}/>
            </g>
            <path d="M 100,105 L 100,115 L 105,110 Z" fill="red" />
        </motion.g>
    </>
);

const BodyViking = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Stocky Body */}
        <path d="M 60,175 C 60,100 140,100 140,175 Z" fill={color} />
        {/* Hands */}
        <circle cx="55" cy="130" r="12" fill={color} />
        <circle cx="145" cy="130" r="12" fill={color} />
        {/* Feet */}
        <Shoes name="Boots"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="85" cy="85" r="15" fill="white" />
                <motion.circle cx="85" cy="85" r="8" fill="black" style={{ x: pupilX, y: pupilY }} />
                <circle cx="115" cy="85" r="15" fill="white" />
                <motion.circle cx="115" cy="85" r="8" fill="black" style={{ x: pupilX, y: pupilY }} />
            </g>
            {/* Beard */}
            <path d="M 80,100 C 80,130 120,130 120,100 L 100,135 Z" fill="orange" />
            <path d="M 95,105 Q 100,115 105,105" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyFedora = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Slender Body */}
        <path d="M 75,175 C 70,100 130,100 125,175 Z" fill={color} />
        {/* Hands */}
        <ellipse cx="70" cy="130" rx="6" ry="12" fill={color} />
        <ellipse cx="130" cy="130" rx="6" ry="12" fill={color} />
        {/* Feet */}
        <Shoes name="Formal Shoes"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <circle cx="90" cy="95" r="10" fill="white" />
                <motion.circle cx="90" cy="95" r="5" fill="black" style={{ x: pupilX, y: pupilY }} />
                <circle cx="110" cy="95" r="10" fill="white" />
                <motion.circle cx="110" cy="95" r="5" fill="black" style={{ x: pupilX, y: pupilY }} />
            </g>
            <path d="M 98,110 Q 100,115 102,110" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>
    </>
);

const BodyKnight = ({ color, pupilX, pupilY }: any) => (
    <>
        {/* Armored Body */}
        <path d="M 70,175 L 60,100 L 140,100 L 130,175 Z" fill="#b0c4de" />
        <rect x="65" y="120" width="70" height="10" fill="#a9a9a9" />
        {/* Hands (Gauntlets) */}
        <circle cx="55" cy="140" r="10" fill="#a9a9a9" />
        <circle cx="145" cy="140" r="10" fill="#a9a9a9" />
        {/* Feet */}
        <Shoes name="Knight Boots"/>
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <g>
                <rect x="75" y="75" width="50" height="20" fill="#333" />
                <rect x="75" y="78" width="50" height="4" fill="#555" />
            </g>
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
    "Flarie": BodyFlarie,
    "Aquan": BodyAquan,
    "Terran": BodyTerran,
    "Volty": BodyVolty,
    "Pilgrim": BodyPilgrim,
    "Turkey": BodyTurkey,
    "Viking": BodyViking,
    "Fedora": BodyFedora,
    "Knight": BodyKnight,
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
