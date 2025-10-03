
'use client';

import { useTour } from '@/app/dashboard/layout';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { X, ArrowRight } from 'lucide-react';
import AIBuddy from './ai-buddy';
import { useState, useEffect } from 'react';
import { generateMiniCourse } from '@/lib/actions';
import { useToast } from './ui/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';


type Course = {
    id: string;
    name: string;
    description: string;
};

const tourStepsConfig: any = {
    '/dashboard': [
        { 
            step: 1, 
            content: "Welcome to your dashboard! This is the central hub for all your learning activities.",
            position: 'center',
            nextPath: '/dashboard/courses'
        },
    ],
    '/dashboard/courses': [
         { 
            step: 2, 
            content: "We've created a few starter courses for you. Click 'Next' to see the study plans we've made.",
            position: 'center',
            nextPath: '/dashboard/roadmaps'
        },
    ],
    '/dashboard/roadmaps': [
         { 
            step: 3, 
            content: "Here are the AI-generated study roadmaps for your courses. Next, let's head to the Learning Lab to generate the course content!",
            position: 'center',
            nextPath: '/dashboard/learning-lab'
        },
    ],
    '/dashboard/learning-lab': [
         { 
            step: 4, 
            content: "This is where the magic happens. Let's generate the full outline for all your courses now.",
            position: 'center',
            action: 'generateOutlines',
        },
        {
            step: 5,
            content: "You're all set! Your dashboard is ready. Feel free to explore, or chat with me if you have any questions.",
            position: 'center',
            isFinal: true,
        }
    ],
};

const TourGuide = () => {
    const { isTourActive, tourStep, nextTourStep, endTour } = useTour();
    const pathname = usePathname();
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    const [isGenerating, setIsGenerating] = useState(false);

    const currentStepConfig = tourStepsConfig[pathname]?.find((s: any) => s.step === tourStep);
    
    const handleGenerateLabOutlines = async () => {
        if (!user) return;
        
        const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
        
        setIsGenerating(true);
        toast({ title: "Generating Lab Outlines...", description: "This might take a minute." });

        try {
            const coursesQuery = query(collection(db, 'courses'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(coursesQuery);
            const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));

            const courseOutlinePromises = courses.map(async (course) => {
                const outline = await generateMiniCourse({
                    courseName: course.name,
                    courseDescription: course.description || `A course about ${course.name}.`,
                    learnerType,
                });
                
                const newUnits = outline.modules.map(module => ({
                    id: crypto.randomUUID(),
                    title: module.title,
                    chapters: module.chapters.map(chapter => ({
                        ...chapter,
                        id: crypto.randomUUID(),
                    }))
                }));

                const courseRef = doc(db, 'courses', course.id);
                await updateDoc(courseRef, { units: newUnits });
            });
            
            await Promise.all(courseOutlinePromises);
            toast({ title: "Success!", description: "All course outlines have been generated."});
            nextTourStep();

        } catch (error) {
            console.error("Failed to generate lab outlines:", error);
            toast({ variant: 'destructive', title: 'Generation Failed'});
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isTourActive || !currentStepConfig) return null;

    const getPositionClass = (position: string) => {
        switch (position) {
            case 'top-left': return 'top-8 left-8';
            case 'top-right': return 'top-8 right-8';
            case 'bottom-left': return 'bottom-8 left-8';
            case 'bottom-right': return 'bottom-8 right-8';
            default: return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
        }
    }
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`fixed z-[100] w-80 bg-card/80 backdrop-blur-lg p-4 rounded-2xl shadow-xl border border-border/30 ${getPositionClass(currentStepConfig.position)}`}
        >
            <div className="flex flex-col gap-4">
                 <div className="flex items-start justify-between">
                     <AIBuddy className="w-16 h-16 flex-shrink-0"/>
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={endTour}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-sm text-card-foreground">{currentStepConfig.content}</p>
                <div className="flex justify-end">
                    {currentStepConfig.isFinal ? (
                        <Button size="sm" onClick={endTour}>Explore Dashboard</Button>
                    ) : currentStepConfig.action === 'generateOutlines' ? (
                        <Button size="sm" onClick={handleGenerateLabOutlines} disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate Course Outlines"}
                        </Button>
                    ) : (
                        <Button size="sm" onClick={() => nextTourStep(currentStepConfig.nextPath)}>
                            Next <ArrowRight className="w-4 h-4 ml-2"/>
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default TourGuide;
