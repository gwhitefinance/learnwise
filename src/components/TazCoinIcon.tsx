
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
    <g>
      {/* Gold outline */}
      <circle cx="12" cy="12" r="11" fill="none" stroke="#FFD700" strokeWidth="2" />
      
      {/* Blue background */}
      <circle cx="12" cy="12" r="9" fill="#3B82F6" />
      
      {/* Eyes */}
      <circle cx="9" cy="11" r="1.5" fill="white" />
      <circle cx="15" cy="11" r="1.5" fill="white" />
      
      {/* Pupils */}
      <circle cx="9" cy="11" r="0.75" fill="black" />
      <circle cx="15" cy="11" r="0.75" fill="black" />
      
      {/* Smile */}
      <path d="M 9 15 Q 12 18 15 15" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

export default TazCoinIcon;

