
'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { MouseEvent } from 'react';

export default function Spotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
      style={{
        background: useMotionTemplate`
          radial-gradient(
            650px circle at ${mouseX}px ${mouseY}px,
            rgba(120, 41, 190, 0.2),
            transparent 80%
          )
        `,
      }}
      onMouseMove={handleMouseMove}
    />
  );
}
