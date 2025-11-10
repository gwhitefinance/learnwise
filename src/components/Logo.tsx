'use client';

import React from 'react';
import Image from 'next/image';

const Logo = ({ className }: { className?: string }) => (
  <Image
    src="https://i.postimg.cc/4dPWDw0B/Tutor-4-removebg-preview.png"
    alt="Tutor Taz Logo"
    width={120}
    height={120}
    className={className}
  />
);

export default Logo;
