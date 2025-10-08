
'use client';

import { useTour } from '@/app/dashboard/layout';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { X, ArrowRight, Wand2, Loader2 } from 'lucide-react';
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
    '/dashboard': [], // No more tour on the main dashboard
    '/dashboard/courses': [
        {
            step: 2,
            title: "Your Courses",
            content: "We've created starter courses based on your interests. Let's pick one to generate a full Learning Lab.",
            elementId: 'courses-list-card',
            position: 'bottom',
        },
    ],
    '/dashboard/courses/[courseId]': [
        {
            step: 3,
            title: "Generate Your Lab",
            content: "This is where the magic happens! Click here to have the AI build out the full course content.",
            elementId: 'generate-lab-button',
            position: 'bottom-end',
            action: 'generateLab',
        },
        {
            step: 4,
            title: "You're All Set!",
            content: "Your first Learning Lab is ready. Dive in whenever you're ready to start. You can chat with me anytime using the icon in the corner.",
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

    // This is a bit of a hack to handle dynamic routes
    const dynamicPath = /^\/dashboard\/courses\/[^/]+$/;
    const currentPathConfigKey = dynamicPath.test(pathname) ? '/dashboard/courses/[courseId]' : pathname;
    
    const currentStepConfig = isTourActive 
        ? tourStepsConfig[currentPathConfigKey]?.find((s: any) => s.step === tourStep)
        : null;

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
                const interval = setInterval(() => {
                    if (checkElement()) {
                        clearInterval(interval);
                    }
                }, 100);
                const timeout = setTimeout(() => clearInterval(interval), 3000);
                return () => { clearInterval(interval); clearTimeout(timeout); };
            }
        } else {
            setElementRect(null);
        }
    }, [isTourActive, currentStepConfig]);


    const handleGenerateLab = async () => {
        if (!user) return;
        const courseId = pathname.split('/').pop();
        if (!courseId) return;

        setIsGenerating(true);
        toast({ title: "Generating Learning Lab...", description: "This may take a minute." });
        
        try {
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);
            if (!courseSnap.exists()) throw new Error("Course not found");
            const course = courseSnap.data() as Course;

            const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
            const result = await generateMiniCourse({
                courseName: course.name,
                courseDescription: course.description || `An in-depth course on ${course.name}.`,
                learnerType,
            });

            const newUnits = result.modules.map(module => ({
                id: crypto.randomUUID(),
                title: module.title,
                chapters: module.chapters.map(chapter => ({ ...chapter, id: crypto.randomUUID() }))
            }));

            await updateDoc(courseRef, { units: newUnits });

            toast({ title: "Success!", description: "Your Learning Lab is ready." });
            nextTourStep(); // Move to the final step of the tour

        } catch (error) {
            console.error("Failed to generate lab content:", error);
            toast({ variant: 'destructive', title: 'Generation Failed' });
            endTour(); // End the tour on failure
        } finally {
            setIsGenerating(false);
        }
    }
    
    if (!isTourActive) return null;

    // The very first step is the welcome modal
    if (tourStep === 1) {
        return (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                 <motion.div
                    key="step-1"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative max-w-sm w-full"
                >
                     <div className="bg-card rounded-2xl shadow-2xl p-6 flex flex-col text-center items-center">
                         <div className="flex-shrink-0 size-24 rounded-full bg-primary/10 text-primary shadow-lg flex items-center justify-center ring-4 ring-card mb-4">
                            <AIBuddy className="w-20 h-20"/>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Welcome to Tutorin!</h3>
                        <p className="text-sm text-muted-foreground mb-6">I'm your AI buddy, here to guide you. Let's take a quick tour to set up your first course.</p>
                        
                        <div className="flex justify-center gap-2 mt-4 w-full">
                            <Button variant="ghost" size="sm" onClick={endTour}>Dismiss</Button>
                            <Button size="sm" onClick={() => nextTourStep()} className="bg-primary hover:bg-primary/90 w-full">
                                Start Tour
                                <ArrowRight className="h-4 w-4 ml-2"/>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }

    if (!currentStepConfig) return null;
    
    if (currentStepConfig.position === 'center') {
        return (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                 <motion.div
                    key={tourStep}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative max-w-sm w-full"
                >
                     <div className="bg-card rounded-2xl shadow-2xl p-6 flex flex-col text-center items-center">
                         <div className="flex-shrink-0 size-24 rounded-full bg-primary/10 text-primary shadow-lg flex items-center justify-center ring-4 ring-card mb-4">
                            <AIBuddy className="w-20 h-20"/>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{currentStepConfig.title}</h3>
                        <p className="text-sm text-muted-foreground mb-6">{currentStepConfig.content}</p>
                        
                        <div className="flex justify-center gap-2 mt-4 w-full">
                             {currentStepConfig.isFinal ? (
                                <Button size="sm" onClick={endTour} className="bg-primary hover:bg-primary/90 w-full">Start Learning!</Button>
                            ) : (
                                <Button size="sm" onClick={() => nextTourStep(currentStepConfig.nextPath)} className="bg-primary hover:bg-primary/90 w-full">
                                    Next
                                    <ArrowRight className="h-4 w-4 ml-2"/>
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }

    const getPositionStyles = () => {
        if (!elementRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0 };
        const offset = 16;
        switch (currentStepConfig.position) {
            case 'bottom': return { top: `${elementRect.bottom + offset}px`, left: `${elementRect.left + elementRect.width / 2}px`, transform: 'translateX(-50%)' };
            case 'bottom-start': return { top: `${elementRect.bottom + offset}px`, left: `${elementRect.left}px` };
            case 'bottom-end': return { top: `${elementRect.bottom + offset}px`, right: `${window.innerWidth - elementRect.right}px` };
            case 'right': return { top: `${elementRect.top + elementRect.height / 2}px`, left: `${elementRect.right + offset}px`, transform: 'translateY(-50%)' };
            default: return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
    };


    return (
        <div className="fixed inset-0 z-40 p-4 bg-black/30 pointer-events-none">
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
                             <Button size="sm" onClick={() => currentStepConfig.action === 'generateLab' ? handleGenerateLab() : nextTourStep(currentStepConfig.nextPath)} className="bg-primary hover:bg-primary/90" disabled={isGenerating}>
                                {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Generating...</> : currentStepConfig.action === 'generateLab' ? <><Wand2 className="h-4 w-4 mr-2"/> Generate</> : 'Next'}
                                {!isGenerating && currentStepConfig.action !== 'generateLab' && <ArrowRight className="h-4 w-4 ml-2"/>}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TourGuide;
