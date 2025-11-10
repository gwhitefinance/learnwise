'use client';

import React from 'react';
import Image from 'next/image';

const Logo = ({ className }: { className?: string }) => (
  <Image
    src="https://i.postimg.cc/wjNyZZmQ/Tutor-removebg-preview.png"
    alt="Tutor Taz Logo"
    width={40}
    height={40}
    className={className}
  />
);

export default Logo;
