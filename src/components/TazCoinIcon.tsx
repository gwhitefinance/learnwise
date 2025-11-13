
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
      <radialGradient id="goldGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{stopColor: '#FFD700'}} />
        <stop offset="100%" style={{stopColor: '#FFA500'}} />
      </radialGradient>
    </defs>
    <g>
      {/* Gold coin body */}
      <circle cx="12" cy="12" r="11" fill="url(#goldGradient)" />
      {/* Outer rim */}
      <circle cx="12" cy="12" r="11" fill="none" stroke="#B8860B" strokeWidth="1.5" />
      {/* Inner rim */}
      <circle cx="12" cy="12" r="9" fill="none" stroke="#DAA520" strokeWidth="1" />

      {/* Stylized 'T' */}
      <path d="M 8 8 H 16 V 10 H 13 V 16 H 11 V 10 H 8 Z" fill="#654321" />

      {/* Star */}
      <path d="M 16 13 L 17 15 L 19 15.5 L 17.5 16.5 L 18 18.5 L 16 17.5 L 14 18.5 L 14.5 16.5 L 13 15.5 L 15 15 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="0.5" />
    </g>
  </svg>
);

export default TazCoinIcon;
