
"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';

const steps = [
    {
        title: "Add a new course",
        description: "Easily add a new course to your dashboard. Provide a name, instructor, and an optional URL for AI-powered content generation.",
        image: "addCourseDialog",
    },
    {
        title: "View your new course",
        description: "Your newly created course will appear in your course list, ready for you to add content and track your progress.",
        image: "courseAdded",
    },
    {
        title: "Generate course content",
        description: "With one click, let our AI generate a complete course structure with modules and chapters, tailored to your learning style.",
        image: "generatedContent",
    },
];

export default function HowItWorks() {
    const targetRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start end', 'end start'],
    });

    return (
        <section ref={targetRef} className="py-24 relative">
            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="lg:sticky top-24">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                        How It Works
                    </h2>
                    <p className="mt-4 text-lg text-white/70">
                        A simple, three-step process to get you started on your personalized learning journey.
                    </p>
                </div>

                <div className="space-y-16">
                    {steps.map((step, i) => {
                        const start = i / steps.length;
                        const end = start + 1 / steps.length;
                        const opacity = useTransform(scrollYProgress, [start, end], [0.3, 1]);
                        const scale = useTransform(scrollYProgress, [start, end], [0.9, 1]);
                        
                        return (
                            <motion.div
                                key={i}
                                style={{ opacity, scale }}
                                className="space-y-4 p-8 rounded-2xl border border-white/10 bg-white/5"
                            >
                                <h3 className="text-2xl font-bold text-white">
                                    <span className="text-blue-400">0{i + 1}</span> {step.title}
                                </h3>
                                <p className="text-white/70">{step.description}</p>
                                <div className="aspect-video relative mt-4 rounded-lg overflow-hidden border-2 border-white/10">
                                    <Image
                                        src={(placeholderImages.howItWorks as any)[step.image].src}
                                        alt={(placeholderImages.howItWorks as any)[step.image].alt}
                                        fill
                                        className="object-cover"
                                        data-ai-hint={(placeholderImages.howItWorks as any)[step.image].hint}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
