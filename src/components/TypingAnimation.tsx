
'use client';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

export default function TypingAnimation({ text, className }: { text: string; className?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

  useEffect(() => {
    const controls = animate(count, text.length, {
      type: 'tween',
      duration: 1,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
      repeatDelay: 3,
    });
    return controls.stop;
  }, [text, count]);

  return (
    <span className={className}>
      <motion.span>{displayText}</motion.span>
      <span className="typing-cursor"></span>
    </span>
  );
}
