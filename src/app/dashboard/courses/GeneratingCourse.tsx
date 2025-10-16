
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import AIBuddy from '@/components/ai-buddy';

const quotes = [
    "The beautiful thing about learning is that no one can take it from you.",
    "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    "The journey of a thousand miles begins with a single step.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Tell me and I forget. Teach me and I remember. Involve me and I learn."
];

const generationSteps = [
    { progress: 10, label: "Drafting course outline..." },
    { progress: 40, label: "Writing the first chapter..." },
    { progress: 75, label: "Generating activities & multimedia prompts..." },
    { progress: 95, label: "Building your personalized roadmap..." },
    { progress: 100, label: "Almost there!" },
];

export default function GeneratingCourse({ courseName }: { courseName: string }) {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const nextStep = generationSteps[currentStep];
                if (prev < nextStep.progress) {
                    return prev + 1;
                } else {
                    if (currentStep < generationSteps.length - 1) {
                        setCurrentStep(currentStep + 1);
                    }
                    return prev;
                }
            });
        }, 80);

        const quoteInterval = setInterval(() => {
            setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
        }, 5000);

        return () => {
            clearInterval(interval);
            clearInterval(quoteInterval);
        };
    }, [currentStep]);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <AIBuddy className="w-40 h-40 mb-8" />
                <h1 className="text-3xl font-bold">Building your course:</h1>
                <h2 className="text-2xl font-bold text-primary mb-8">{courseName}</h2>

                <div className="w-full max-w-md mx-auto">
                    <Progress value={progress} className="mb-2"/>
                    <p className="text-sm text-muted-foreground mb-8">
                        {generationSteps[currentStep].label}
                    </p>
                </div>
                
                <motion.p
                    key={currentQuoteIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-muted-foreground italic mt-4 max-w-md mx-auto"
                >
                    "{quotes[currentQuoteIndex]}"
                </motion.p>
            </motion.div>
        </div>
    );
}
