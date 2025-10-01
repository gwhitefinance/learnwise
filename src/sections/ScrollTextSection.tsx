
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const textContent = [
    "Your learning process deserves better.",
    "You're juggling projects, training, and new skills,",
    "but generic learning methods slow you down.",
    "It's hard to stay organized and even harder to know what to focus on.",
];

const Word = ({ children, progress, range, isFirstSentence }: { children: React.ReactNode, progress: any, range: [number, number], isFirstSentence?: boolean }) => {
    const opacity = useTransform(progress, range, [0.3, 1]);
    const color = useTransform(progress, range, ["hsl(240, 9%, 59%)", "hsl(0, 0%, 100%)"]);

    if (isFirstSentence) {
        return <span className="text-white">{children} </span>;
    }

    return (
        <span className="relative">
            <span className="absolute opacity-20">{children}</span>
            <motion.span style={{ opacity, color }}>{children} </motion.span>
        </span>
    )
}

export default function ScrollTextSection() {
    const targetRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start 0.9', 'end 0.2'],
    });
    
    const words = textContent.flatMap(sentence => sentence.split(' '));
    const firstSentenceLength = textContent[0].split(' ').length;

    return (
        <section ref={targetRef} className="py-32 bg-background">
            <div className="container mx-auto max-w-4xl text-center">
                 <div className="inline-block relative mb-12">
                    <h2 className="text-xl font-semibold text-white">Introducing LearnWise</h2>
                    <motion.div 
                        className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-blue-400"
                        style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
                    />
                </div>
                <p className="text-4xl md:text-6xl font-bold leading-tight text-white/80">
                    {words.map((word, i) => {
                         const start = i / words.length;
                         const end = start + (1 / words.length)
                        return (
                            <Word key={i} progress={scrollYProgress} range={[start, end]} isFirstSentence={i < firstSentenceLength}>
                               {word}
                            </Word>
                        )
                    })}
                </p>
                <p 
                    className="text-4xl md:text-6xl font-bold leading-tight text-blue-400 mt-8"
                >
                    That's why we built LearnWise.
                </p>
            </div>
        </section>
    );
}
