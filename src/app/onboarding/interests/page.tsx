'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2, BookOpen, Atom, Globe, History, Palette, Music, Code, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateOnboardingCourse } from '@/lib/actions';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
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

        const gradeLevel = localStorage.getItem('onboardingGradeLevel');
        const specificGrade = localStorage.getItem('onboardingSpecificGrade');
        const fullGrade = specificGrade ? `${gradeLevel} (Grade ${specificGrade})` : gradeLevel;
        
        if (!gradeLevel) {
            toast({ variant: 'destructive', title: 'Grade level not found.'});
            router.push('/onboarding/grade-level');
            return;
        }

        setIsSubmitting(true);
        toast({ title: "Building your starter courses...", description: "You can continue to the next step. Your new courses will appear on your dashboard shortly!"});

        // Trigger all course generations in the background
        selectedInterests.forEach(interest => {
            generateOnboardingCourse({
                gradeLevel: fullGrade ?? 'High School',
                interest: interest,
            }).then(async (result) => {
                // Correctly structure the data to be saved to the 'courses' collection
                const courseToAdd = {
                    name: result.courseTitle,
                    description: `A personalized course about ${interest} for a ${fullGrade} student.`,
                    instructor: "AI Assistant",
                    credits: 3,
                    url: '',
                    progress: 0,
                    files: 0,
                    userId: user.uid,
                };

                await addDoc(collection(db, "courses"), courseToAdd);
                console.log(`Successfully generated and saved course for: ${interest}`);
                
            }).catch((error) => {
                console.error(`Background course generation failed for ${interest}:`, error);
                // Optionally, notify the user that one of the courses failed.
            });
        });

        // Immediately navigate to the next page
        router.push('/learner-type');
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
                                Proceeding...
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
