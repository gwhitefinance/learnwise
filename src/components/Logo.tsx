
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
    <g transform="translate(0, -5)">
      {/* Lightbulb Screw Base */}
      <path d="M40 85 H60 L62 90 H38 Z" fill="#E0E0E0" />
      <path d="M41 90 H59 L61 95 H39 Z" fill="#BDBDBD" />
      <path d="M42 95 H58 L60 100 H40 Z" fill="#E0E0E0" />

      {/* Brain Shape */}
      <path 
        d="M50 15 C 25 15, 20 40, 30 50 C 15 55, 15 75, 35 80 C 35 90, 65 90, 65 80 C 85 75, 85 55, 70 50 C 80 40, 75 15, 50 15 Z"
        fill="#FFC0CB"
        stroke="#D18193"
        strokeWidth="3"
      />
      {/* Brain Details/Lobes */}
      <path d="M50 15 C 55 25, 65 25, 70 35" fill="none" stroke="#F4A7B9" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 20 C 40 28, 35 35, 35 45" fill="none" stroke="#F4A7B9" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 50 C 35 60, 45 65, 50 60" fill="none" stroke="#F4A7B9" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 50 C 65 60, 55 65, 50 60" fill="none" stroke="#F4A7B9" strokeWidth="3" strokeLinecap="round" />
      <path d="M35 80 C 45 70, 55 70, 65 80" fill="none" stroke="#F4A7B9" strokeWidth="3" strokeLinecap="round" />
      
      {/* Face */}
      <circle cx="43" cy="55" r="3" fill="#6D4C41" />
      <circle cx="57" cy="55" r="3" fill="#6D4C41" />
      <path d="M45 65 Q 50 70, 55 65" fill="none" stroke="#6D4C41" strokeWidth="2" strokeLinecap="round" />

      {/* Sparks */}
      <path d="M20 25 L25 30" stroke="#D18193" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M80 25 L75 30" stroke="#D18193" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15 50 L22 50" stroke="#D18193" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M85 50 L78 50" stroke="#D18193" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 80 L30 75" stroke="#D18193" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M75 80 L70 75" stroke="#D18193" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 10 L50 18" stroke="#D18193" strokeWidth="2.5" strokeLinecap="round" />

    </g>
  </svg>
);

export default Logo;
