
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2, BookOpen, Atom, Globe, History, Palette, Music, Code, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateMiniCourse } from '@/ai/flows/mini-course-flow';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

const interestsList = [
    { name: "Literature", icon: <BookOpen /> },
    { name: "Science", icon: <Atom /> },
    { name: "Geography", icon: <Globe /> },
    { name: "History", icon: <History /> },
    { name: "Art", icon: <Palette /> },
    { name: "Music", icon: <Music /> },
    { name: "Programming", icon: <Code /> },
    { name: "Math", icon: <BarChart2 /> },
];

export default function InterestsPage() {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev => 
            prev.includes(interest) 
            ? prev.filter(i => i !== interest) 
            : [...prev, interest]
        );
    };

    const handleNext = async () => {
        if (selectedInterests.length < 3) {
            toast({
                variant: 'destructive',
                title: 'Select at least 3 interests',
                description: 'This helps us create the best starter course for you.',
            });
            return;
        }

        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in.'});
            router.push('/signup');
            return;
        }

        const gradeLevel = localStorage.getItem('onboardingGradeLevel');
        if (!gradeLevel) {
            toast({ variant: 'destructive', title: 'Grade level not found.'});
            router.push('/onboarding/grade-level');
            return;
        }

        setIsLoading(true);
        toast({ title: "Building your starter course...", description: "The AI is personalizing your first learning experience."});

        try {
            // We use the mini-course flow, but we only need the generated title and modules for the initial course.
            // The learner type is not yet known, so we pass "Unknown".
            const result = await generateMiniCourse({
                courseName: '', // Not needed, AI will generate from interests
                courseDescription: '', // Not needed, AI will generate from interests
                learnerType: 'Unknown',
                gradeLevel: gradeLevel,
                interests: selectedInterests,
            });

            // The full course content is now in `result`. We can save it.
            // We will create a simpler representation for the general "courses" list.
            const courseToAdd = {
                name: result.courseTitle,
                description: result.modules.map(m => m.title).join(', '), // A summary of modules
                instructor: "AI Assistant",
                credits: 3,
                url: '',
                progress: 0,
                files: 0,
                userId: user.uid,
                // We add the full generated course content here.
                // This could be stored in a subcollection or directly if not too large.
                // For simplicity, we'll imagine it's added here. A real app might use a subcollection.
                miniCourseContent: result,
            };

            await addDoc(collection(db, "courses"), courseToAdd);

            toast({ title: "Course Created!", description: "Your personalized course is waiting for you."});

            router.push('/learner-type');

        } catch (error) {
            console.error("Failed to generate or save course:", error);
            toast({ variant: 'destructive', title: "Course Creation Failed", description: "There was an error creating your course. Please try again."});
            setIsLoading(false);
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
                    <p className="text-sm text-muted-foreground mb-2">Onboarding (2/3)</p>
                    <Progress value={66} />
                </div>

                <h1 className="text-4xl font-bold text-center mb-4">What are you passionate about?</h1>
                <p className="text-center text-muted-foreground mb-12">Select at least 3 interests to help us tailor your first course.</p>

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
                    <Button size="lg" onClick={handleNext} disabled={selectedInterests.length < 3 || isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating Course...
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
