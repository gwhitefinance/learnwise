'use client';

import React from 'react';
import Image from 'next/image';

const Logo = ({ className }: { className?: string }) => (
  <Image
    src="https://i.postimg.cc/1thgyHpf/Tutor.png"
    alt="Tutor Taz Logo"
    width={28}
    height={28}
    className={className}
  />
);

export default Logo;
