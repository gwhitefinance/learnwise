
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
      {/* Coin body */}
      <circle cx="12" cy="12" r="11" fill="url(#coin-gradient)" stroke="#DAA520" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="#B8860B" strokeWidth="1" strokeDasharray="2,2" />

      {/* Taz Face - simplified */}
      <g transform="translate(4, 5) scale(0.6)">
        {/* Face Screen */}
        <rect x="7" y="5" width="18" height="11" rx="4" fill="#222" />
        {/* Eyes */}
        <circle cx="12" cy="10" r="2.5" fill="white" />
        <circle cx="20" cy="10" r="2.5" fill="white" />
        <circle cx="12" cy="10" r="1" fill="black" />
        <circle cx="20" cy="10" r="1" fill="black" />
        {/* Mouth */}
        <path d="M 14 14 Q 16 16 18 14" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

export default TazCoinIcon;
