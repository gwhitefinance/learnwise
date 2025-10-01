
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

const Word = ({ children, progress, range }: { children: React.ReactNode, progress: any, range: [number, number] }) => {
    const opacity = useTransform(progress, range, [0.3, 1]);
    const color = useTransform(progress, range, ["hsl(240, 9%, 59%)", "hsl(0, 0%, 100%)"]);

    return (
        <span className="relative">
            <span className="absolute opacity-20">{children}</span>
            <motion.span style={{ opacity, color }}>{children}</motion.span>
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
        <section ref={targetRef} className="py-32 bg-black">
            <div className="container mx-auto max-w-4xl text-center">
                 <div className="inline-block relative mb-12">
                    <h2 className="text-xl font-semibold text-white">Introducing LearnWise</h2>
                    <motion.div 
                        className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-blue-400"
                        style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
                    />
                </div>
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
