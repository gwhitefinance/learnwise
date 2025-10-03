
'use client';

import { useTour } from '@/app/dashboard/layout';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { X, ArrowRight, Wand2 } from 'lucide-react';
import AIBuddy from './ai-buddy';
import { useState, useEffect } from 'react';
import { generateMiniCourse } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
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
            title: "Welcome to LearnWise!",
            content: "This is your central hub for all learning activities. Let's take a quick look around.",
            position: 'center',
            nextPath: '/dashboard/courses'
        },
    ],
    '/dashboard/courses': [
         { 
            step: 2, 
            title: "Your Courses",
            content: "We've created a few starter courses for you based on your interests. Next, we'll generate your study plans.",
            position: 'center',
            nextPath: '/dashboard/roadmaps'
        },
    ],
    '/dashboard/roadmaps': [
         { 
            step: 3, 
            title: "Study Roadmaps",
            content: "Here are the AI-generated roadmaps for your courses. Now, let's head to the Learning Lab to generate the course content!",
            position: 'center',
            nextPath: '/dashboard/learning-lab'
        },
    ],
    '/dashboard/learning-lab': [
         { 
            step: 4, 
            title: "The Learning Lab",
            content: "This is where the magic happens. Let's generate the full outline for your courses now.",
            position: 'center',
            action: 'generateOutlines',
        },
        {
            step: 5,
            title: "You're All Set!",
            content: "Your dashboard is ready. Feel free to explore, or chat with me if you have any questions.",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="fixed inset-0 bg-black/30 z-40" />
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative max-w-sm w-full z-50"
            >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="size-24 rounded-full bg-primary text-white shadow-lg flex items-center justify-center ring-4 ring-card">
                       <AIBuddy className="w-16 h-16"/>
                    </div>
                </div>
                <div className="bg-card rounded-xl shadow-2xl p-6 pt-16 text-center">
                    <h3 className="text-lg font-bold mb-2">{currentStepConfig.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{currentStepConfig.content}</p>
                    <div className="flex justify-center gap-2">
                        {currentStepConfig.isFinal ? (
                            <Button onClick={endTour} className="bg-primary hover:bg-primary/90">Explore Dashboard</Button>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={endTour} className="text-muted-foreground">Dismiss</Button>
                                <Button onClick={() => currentStepConfig.action === 'generateOutlines' ? handleGenerateLabOutlines() : nextTourStep(currentStepConfig.nextPath)} className="bg-primary hover:bg-primary/90" disabled={isGenerating}>
                                    {isGenerating ? 'Generating...' : 'Next'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TourGuide;
