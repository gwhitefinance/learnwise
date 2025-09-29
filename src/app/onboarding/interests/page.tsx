'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2, BookOpen, Atom, Globe, History, Palette, Music, Code, BarChart2, Briefcase, BrainCircuit, HeartPulse, AreaChart, Target, Brush, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateMiniCourse } from '@/lib/actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

const academicInterests = [
    { name: "Literature", icon: <BookOpen /> },
    { name: "Science", icon: <Atom /> },
    { name: "Geography", icon: <Globe /> },
    { name: "History", icon: <History /> },
    { name: "Art", icon: <Palette /> },
    { name: "Music", icon: <Music /> },
    { name: "Programming", icon: <Code /> },
    { name: "Math", icon: <BarChart2 /> },
];

const professionalInterests = [
    { name: "Business", icon: <Briefcase /> },
    { name: "Technology", icon: <BrainCircuit /> },
    { name: "Health & Wellness", icon: <HeartPulse /> },
    { name: "Finance", icon: <AreaChart /> },
    { name: "Marketing", icon: <Target /> },
    { name: "Creative Arts", icon: <Brush /> },
    { name: "Programming", icon: <Code /> },
    { name: "Project Management", icon: <FolderKanban /> },
]

export default function InterestsPage() {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    const [interestsList, setInterestsList] = useState(academicInterests);

    useEffect(() => {
        const gradeLevel = localStorage.getItem('onboardingGradeLevel');
        if (gradeLevel === 'Other') {
            setInterestsList(professionalInterests);
        } else {
            setInterestsList(academicInterests);
        }
    }, []);

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev => 
            prev.includes(interest) 
            ? prev.filter(i => i !== interest) 
            : [...prev, interest]
        );
    };

    const handleNext = async () => {
        if (selectedInterests.length < 1) {
            toast({
                variant: 'destructive',
                title: 'Select at least 1 interest',
                description: 'This helps us create the best starter courses for you.',
            });
            return;
        }

        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in.'});
            router.push('/signup');
            return;
        }

        setIsSubmitting(true);
        toast({ title: "Building your starter courses...", description: "This may take a moment. Please wait."});
        
        try {
            const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
            
            const courseGenerationPromises = selectedInterests.map(interest => 
                generateMiniCourse({
                    courseName: interest,
                    courseDescription: `A course about ${interest}.`,
                    learnerType: learnerType,
                }).then(courseOutline => {
                    const courseToAdd = {
                        name: courseOutline.courseTitle,
                        description: `A comprehensive course on ${courseOutline.courseTitle}.`,
                        instructor: "AI Assistant",
                        credits: 3,
                        url: '',
                        progress: 0,
                        files: 0,
                        userId: user.uid,
                        units: courseOutline.modules.map(module => ({
                            id: crypto.randomUUID(),
                            name: module.title,
                            chapters: module.chapters.map(chapter => ({ ...chapter, id: crypto.randomUUID() }))
                        })),
                    };
                    return addDoc(collection(db, "courses"), courseToAdd);
                })
            );

            await Promise.all(courseGenerationPromises);
            
            toast({ title: 'Courses Created!', description: 'Next, let\'s set your learning pace.'});
            
            router.push('/onboarding/pace');

        } catch (error) {
            console.error("Course generation failed:", error);
            toast({ variant: 'destructive', title: 'Course Generation Failed', description: 'There was an error creating your courses. Please try again.' });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-4xl px-8"
            >
                <div className="mb-8">
                    <p className="text-sm text-muted-foreground mb-2">Onboarding (3/4)</p>
                    <Progress value={75} />
                </div>

                <h1 className="text-4xl font-bold text-center mb-4">What are you passionate about?</h1>
                <p className="text-center text-muted-foreground mb-12">Select one or more interests to generate personalized starter courses.</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {interestsList.map(({ name, icon }) => (
                        <motion.div
                            key={name}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <button
                                onClick={() => toggleInterest(name)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-6 rounded-lg border w-full h-full text-center transition-all",
                                    selectedInterests.includes(name)
                                        ? "border-primary bg-primary/10 ring-2 ring-primary text-primary"
                                        : "border-border hover:bg-muted"
                                )}
                            >
                                <div className="h-8 w-8">{icon}</div>
                                <span className="font-semibold">{name}</span>
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 flex justify-end">
                    <Button size="lg" onClick={handleNext} disabled={selectedInterests.length < 1 || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating Courses...
                            </>
                        ) : (
                             <>
                                Next
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
