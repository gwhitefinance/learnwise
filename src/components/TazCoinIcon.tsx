
'use client';

import React from 'react';

const TazCoinIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="coin-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: '#FFD700' }} />
        <stop offset="60%" style={{ stopColor: '#FFA500' }} />
        <stop offset="100%" style={{ stopColor: '#FF8C00' }} />
      </radialGradient>
    </defs>
    <g>
      {/* Coin body with gold outline */}
      <circle cx="12" cy="12" r="11" fill="url(#coin-gradient)" stroke="#DAA520" strokeWidth="1.5" />
      
      {/* Taz Face - simplified */}
      <g transform="translate(0, 0.5) scale(0.45)">
        {/* Face Screen - Blue Background */}
        <rect x="13" y="13" width="22" height="14" rx="4" fill="#87CEEB" />
        {/* Eyes - Centered */}
        <circle cx="19" cy="20" r="2.5" fill="white" />
        <circle cx="29" cy="20" r="2.5" fill="white" />
        <circle cx="19" cy="20" r="1" fill="black" />
        <circle cx="29" cy="20" r="1" fill="black" />
        {/* Mouth */}
        <path d="M 21 24 Q 24 26 27 24" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
      
       {/* Inner gold ring */}
      <circle cx="12" cy="12" r="9" fill="none" stroke="#B8860B" strokeWidth="0.5" />

    </g>
  </svg>
);

export default TazCoinIcon;
