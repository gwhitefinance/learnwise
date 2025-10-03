
'use client';

import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g transform="translate(-50, -25) scale(1)">
        {/* Head */}
        <rect x="50" y="30" width="100" height="80" rx="40" fill="#87CEEB" />
        <rect x="50" y="30" width="100" height="80" rx="40" fill="url(#bodyGradient)" />

        {/* Antenna */}
        <g>
            <line x1="100" y1="30" x2="100" y2="10" stroke="#333" strokeWidth="3" />
            <circle cx="100" cy="8" r="5" fill="#FFC700" />
        </g>
        
        {/* Face Screen */}
        <rect x="65" y="50" width="70" height="45" rx="15" fill="#222" />
        
        {/* Eyes */}
        <g>
            {/* Left Eye */}
            <circle cx="85" cy="72" r="8" fill="white" />
            <circle 
                cx="85" 
                cy="72" 
                r="4" 
                fill="black"
            />
            
             {/* Right Eye */}
            <circle cx="115" cy="72" r="8" fill="white" />
             <circle 
                cx="115" 
                cy="72" 
                r="4" 
                fill="black"
            />
            
             {/* Mouth */}
            <path d="M92,86 Q100,91 108,86" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
    </g>
     <defs>
        <radialGradient id="bodyGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.3}} />
            <stop offset="100%" style={{stopColor: '#ffffff', stopOpacity: 0}} />
        </radialGradient>
    </defs>
  </svg>
);

export default Logo;
