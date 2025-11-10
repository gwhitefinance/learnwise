'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import AIBuddy from '@/components/ai-buddy';

const loadingSteps = [
    "Analyzing your selected material...",
    "Understanding your learning goal...",
    "Connecting to Gemini 2.5 Pro...",
    "Generating personalized explanations...",
    "Building your interactive session...",
    "Finalizing the lesson plan...",
];

export default function GeneratingTutorSession() {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const totalDuration = 10000; // 10 seconds
        let stepIndex = 0;
        let animationFrameId: number;
        let stepStartTime = 0;

        const stepDurations = [0.1, 0.1, 0.15, 0.3, 0.2, 0.15]; 

        const animateProgress = (timestamp: number) => {
            if (!stepStartTime) stepStartTime = timestamp;
            const elapsedTime = timestamp - stepStartTime;

            const currentStepInfo = loadingSteps[stepIndex];
            const previousStepProgress = stepIndex > 0 ? (stepIndex / loadingSteps.length) * 100 : 0;
            const stepDuration = totalDuration * stepDurations[stepIndex];
            
            let stepProgress = Math.min(1, elapsedTime / stepDuration);
            let newOverallProgress = Math.floor(previousStepProgress + stepProgress * (100 / loadingSteps.length));
            
            setProgress(newOverallProgress);
            setCurrentStep(stepIndex);

            if (stepProgress >= 1) {
                if (stepIndex < loadingSteps.length - 1) {
                    stepIndex++;
                    stepStartTime = timestamp;
                } else {
                    setProgress(99);
                    return;
                }
            }
            animationFrameId = requestAnimationFrame(animateProgress);
        };
        
        animationFrameId = requestAnimationFrame(animateProgress);
        
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6">
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full text-center"
            >
                 <div className="relative mb-8 flex flex-col items-center">
                    <div className="relative w-48 h-48">
                        <AIBuddy className="w-full h-full" isStatic={false} />
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold">Preparing your session...</h1>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    Your personal AI tutor is warming up. This will just take a moment.
                </p>

                <div className="w-full max-w-md mx-auto mt-8">
                     <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-muted-foreground text-left">
                           {loadingSteps[currentStep]}
                        </p>
                         <p className="text-sm font-semibold text-primary">{progress}%</p>
                    </div>
                    <Progress value={progress} className="h-2"/>
                </div>
            </motion.div>
        </div>
    );
}
