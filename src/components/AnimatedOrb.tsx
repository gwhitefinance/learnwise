
'use client';

import { motion } from 'framer-motion';

const AnimatedOrb = ({ isPlaying }: { isPlaying: boolean }) => {
    return (
        <div className="relative w-full h-full">
            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-cyan-200 rounded-full"
                animate={{
                    scale: isPlaying ? [1, 1.1, 1, 1.05, 1] : 1,
                    opacity: isPlaying ? [0.8, 1, 0.85, 1, 0.8] : 0.7,
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute inset-0 bg-gradient-to-bl from-indigo-400 to-blue-300 rounded-full mix-blend-multiply"
                 animate={{
                    scale: isPlaying ? [1.1, 1, 1.08, 1, 1.1] : 1,
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                }}
            />
            <motion.div 
                className="absolute inset-0 rounded-full"
                style={{
                    backgroundImage: 'radial-gradient(circle at 30% 30%, hsla(0, 0%, 100%, 0.5), hsla(0, 0%, 100%, 0) 50%)',
                }}
                animate={{
                    x: isPlaying ? [-10, 10, -5, 5, -10] : 0,
                    y: isPlaying ? [10, -10, 5, -5, 10] : 0,
                }}
                 transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'circInOut',
                }}
            />
        </div>
    );
};

export default AnimatedOrb;
