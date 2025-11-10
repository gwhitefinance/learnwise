'use client';

import React from 'react';
import Image from 'next/image';

const Logo = ({ className }: { className?: string }) => (
  <Image
    src="https://i.postimg.cc/gcsGkWRz/Tutor-1-removebg-preview.png"
    alt="Tutor Taz Logo"
    width={80}
    height={80}
    className={className}
  />
);

export default Logo;
