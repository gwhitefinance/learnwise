
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
import { cn } from '@/lib/utils';


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
            content: "I'm your AI buddy, here to guide you. Let's take a quick look around.",
            position: 'center',
        },
        {
            step: 2,
            title: "Your Dashboard",
            content: "This is your welcome banner. You'll find quick actions and an overview of your progress here.",
            elementId: 'welcome-banner',
            position: 'bottom',
        },
        {
            step: 3,
            title: "Streak & Rewards",
            content: "Track your study streak and claim rewards for your consistency. This is a great way to stay motivated!",
            elementId: 'streak-card',
            position: 'right',
        },
        {
            step: 4,
            title: "Recent Files & Courses",
            content: "Your recent files and active courses will appear in these cards for easy access.",
            elementId: 'recent-files-card',
            position: 'bottom-end',
        },
        {
            step: 5,
            title: "Navigation",
            content: "Use these tabs to explore different sections like your files, projects, and learning tools.",
            elementId: 'main-tabs-nav',
            position: 'bottom-start',
            nextPath: '/dashboard/courses',
        },
    ],
    '/dashboard/courses': [
         {
            step: 6,
            title: "Your Courses",
            content: "We've created starter courses for you based on your interests. You can view them all here.",
            position: 'center',
        },
        {
            step: 7,
            title: "Add a Course",
            content: "You can also manually add a new course at any time by clicking this button.",
            elementId: 'add-course-button',
            position: 'bottom-end',
            nextPath: '/dashboard/roadmaps'
        }
    ],
    '/dashboard/roadmaps': [
         {
            step: 8,
            title: "Study Roadmaps",
            content: "Here are the AI-generated roadmaps for your courses, complete with goals and milestones to guide you.",
            position: 'center',
            nextPath: '/dashboard/learning-lab'
        },
    ],
    '/dashboard/learning-lab': [
         {
            step: 9,
            title: "The Learning Lab",
            content: "This is where the magic happens. Let's generate the full outline for your courses now.",
            position: 'center',
            action: 'generateOutlines',
        },
        {
            step: 10,
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
    const [elementRect, setElementRect] = useState<DOMRect | null>(null);

    const currentStepConfig = tourStepsConfig[pathname]?.find((s: any) => s.step === tourStep);
    
    useEffect(() => {
        if (isTourActive && currentStepConfig && currentStepConfig.elementId) {
            const checkElement = () => {
                const element = document.getElementById(currentStepConfig.elementId);
                if (element) {
                    setElementRect(element.getBoundingClientRect());
                    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                    return true;
                }
                return false;
            }

            if (!checkElement()) {
                // Poll for the element if it's not immediately available
                const interval = setInterval(() => {
                    if (checkElement()) {
                        clearInterval(interval);
                    }
                }, 100);

                // Timeout to avoid infinite polling
                const timeout = setTimeout(() => {
                    clearInterval(interval);
                }, 3000);

                return () => {
                    clearInterval(interval);
                    clearTimeout(timeout);
                };
            }
        } else {
            setElementRect(null);
        }
    }, [isTourActive, currentStepConfig]);


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

    const getPositionStyles = () => {
        if (!elementRect) {
            return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
    
        const offset = 16; // 1rem
        switch (currentStepConfig.position) {
            case 'bottom':
                 return { top: `${elementRect.bottom + offset}px`, left: `${elementRect.left + elementRect.width / 2}px`, transform: 'translateX(-50%)' };
            case 'bottom-start':
                return { top: `${elementRect.bottom + offset}px`, left: `${elementRect.left}px` };
            case 'bottom-end':
                 return { top: `${elementRect.bottom + offset}px`, right: `${window.innerWidth - elementRect.right}px` };
            case 'top-start':
                 return { bottom: `${window.innerHeight - elementRect.top + offset}px`, left: `${elementRect.left}px` };
            case 'top-end':
                 return { bottom: `${window.innerHeight - elementRect.top + offset}px`, right: `${window.innerWidth - elementRect.right}px` };
            case 'right':
                return { top: `${elementRect.top + elementRect.height / 2}px`, left: `${elementRect.right + offset}px`, transform: 'translateY(-50%)' };
            default:
                return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
    };


    return (
        <div className="fixed inset-0 z-40 p-4 bg-black/30 backdrop-blur-sm pointer-events-none">
            {elementRect && (
                <div
                    className="fixed z-40 rounded-lg border-2 border-dashed border-primary bg-primary/10 transition-all duration-300 pointer-events-none"
                    style={{
                        width: elementRect.width + 16,
                        height: elementRect.height + 16,
                        top: elementRect.top - 8,
                        left: elementRect.left - 8,
                    }}
                />
            )}
            <motion.div
                key={tourStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative w-full z-50 fixed pointer-events-auto"
                style={getPositionStyles()}
            >
                <div className="relative max-w-sm w-full">
                    <div className="bg-card rounded-xl shadow-2xl p-6 flex flex-col">
                         <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 size-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center ring-4 ring-card">
                                <AIBuddy className="w-10 h-10"/>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold mb-1">{currentStepConfig.title}</h3>
                                <p className="text-sm text-muted-foreground">{currentStepConfig.content}</p>
                            </div>
                         </div>
                        <div className="flex justify-end gap-2 mt-4">
                             <Button variant="ghost" size="sm" onClick={endTour}>Dismiss</Button>
                             {currentStepConfig.isFinal ? (
                                <Button size="sm" onClick={endTour} className="bg-primary hover:bg-primary/90">Explore Dashboard</Button>
                            ) : (
                                <Button size="sm" onClick={() => currentStepConfig.action === 'generateOutlines' ? handleGenerateLabOutlines() : nextTourStep(currentStepConfig.nextPath)} className="bg-primary hover:bg-primary/90" disabled={isGenerating}>
                                    {isGenerating ? 'Generating...' : 'Next'}
                                    <ArrowRight className="h-4 w-4 ml-2"/>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TourGuide;
