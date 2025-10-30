'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import AIBuddy from '@/components/ai-buddy';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MemoryMatchGame from '@/components/MemoryMatchGame';
import { Gamepad2 } from 'lucide-react';

const generationSteps = [
    { progress: 10, label: "Analyzing topic..." },
    { progress: 40, label: "Generating challenging questions..." },
    { progress: 75, label: "Crafting detailed explanations..." },
    { progress: 99, label: "Assembling your study session..." },
    { progress: 99, label: "Almost there!" },
];

export default function GeneratingSession({ topic }: { topic: string }) {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const totalDuration = 8000; // Estimated time: 8 seconds
        const stepDurations = [0.1, 0.4, 0.35, 0.1, 0.05];

        let stepStartTime = 0;
        let stepIndex = 0;
        let animationFrameId: number;

        const animateProgress = (timestamp: number) => {
            if (!stepStartTime) stepStartTime = timestamp;
            const elapsedTime = timestamp - stepStartTime;

            const currentStepInfo = generationSteps[stepIndex];
            const previousStepProgress = stepIndex > 0 ? generationSteps[stepIndex - 1].progress : 0;
            const stepDuration = totalDuration * stepDurations[stepIndex];
            
            let stepProgress = Math.min(1, elapsedTime / stepDuration);
            let newOverallProgress = Math.floor(previousStepProgress + stepProgress * (currentStepInfo.progress - previousStepProgress));

            setProgress(newOverallProgress);
            setCurrentStep(stepIndex);

            if (stepProgress >= 1) {
                if (stepIndex < generationSteps.length - 1) {
                    stepIndex++;
                    stepStartTime = timestamp;
                } else {
                    setProgress(99); // Stop at 99%
                    return;
                }
            }
            animationFrameId = requestAnimationFrame(animateProgress);
        };
        
        animationFrameId = requestAnimationFrame(animateProgress);
        
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full"
            >
                 <div className="relative mb-8 flex flex-col items-center">
                    <div className="relative w-48 h-48">
                        <AIBuddy className="w-full h-full" isStatic={false}/>
                    </div>
                     <div className="h-2 w-56 bg-gray-200 dark:bg-gray-700 rounded-t-sm shadow-inner" />
                </div>
                
                <h1 className="text-3xl font-bold">Preparing your session:</h1>
                <h2 className="text-2xl font-bold text-primary mb-4">{topic}</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">Sit tight, grab some popcorn. I promise it will be worth it!</p>


                <div className="w-full max-w-md mx-auto">
                     <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-muted-foreground text-left">
                            {generationSteps[currentStep].label}
                        </p>
                         <p className="text-sm font-semibold text-primary">{progress}%</p>
                    </div>
                    <Progress value={progress} className="mb-6 h-2"/>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="lg">
                                <Gamepad2 className="mr-2 h-5 w-5" /> Play a Game While You Wait
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>AI Buddy Memory Match</DialogTitle>
                            </DialogHeader>
                            <MemoryMatchGame />
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>
        </div>
    );
}
