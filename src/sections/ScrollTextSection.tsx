
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const textContent = [
    { type: 'highlight', text: "Your learning process deserves better." },
    { type: 'highlight', text: "You're juggling projects, training, and new skills," },
    { type: 'dim', text: "but generic learning methods slow you down." },
    { type: 'dim', text: "It's hard to stay organized and even harder to know what to focus on." },
    { type: 'highlight', text: "That's why we built LearnWise." }
];

const Word = ({ children, progress, range }: { children: string, progress: any, range: [number, number] }) => {
    const opacity = useTransform(progress, range, [0.3, 1]);
    return (
        <span className="relative">
            <span className="absolute opacity-30">{children}</span>
            <motion.span style={{ opacity }}>{children}</motion.span>
        </span>
    )
}

export default function ScrollTextSection() {
    const targetRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start end', 'end start'],
    });
    
    const words = textContent.flatMap(item => {
        const words = item.text.split(' ');
        return words.map(word => ({ ...item, text: word }));
    });

    return (
        <section ref={targetRef} className="py-24 bg-black">
            <div className="container mx-auto max-w-4xl">
                <p className="text-4xl md:text-6xl font-bold leading-tight text-white/80">
                    {words.map((item, i) => {
                         const start = i / words.length;
                         const end = start + (1 / words.length)
                        return (
                            <Word key={i} progress={scrollYProgress} range={[start, end]}>
                                <span className={item.type === 'highlight' ? 'text-white' : 'text-blue-400'}>
                                    {item.text + ' '}
                                </span>
                            </Word>
                        )
                    })}
                </p>
            </div>
        </section>
    );
}
