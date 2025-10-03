
'use client';

import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M5.83333 11.6667C5.83333 8.16667 8.66667 5.83333 12.1667 5.83333H15.8333C19.3333 5.83333 22.1667 8.16667 22.1667 11.6667V14C22.1667 17.5 19.3333 19.8333 15.8333 19.8333H12.1667C8.66667 19.8333 5.83333 17.5 5.83333 14V11.6667Z"
      stroke="#2563EB"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 19.8333V23.3333"
      stroke="#2563EB"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 23.3333H17.5"
      stroke="#2563EB"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.33331 2.33333L14 4.66667L18.6666 2.33333"
      stroke="#2563EB"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;
