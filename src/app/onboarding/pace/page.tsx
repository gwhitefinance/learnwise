
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight, Rabbit, Snail, Turtle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';
import { generateRoadmap } from '@/lib/actions';

const paces = [
  { value: "6", label: "Casual", description: "A relaxed pace, perfect for exploring topics without pressure.", icon: <Snail className="h-6 w-6" /> },
  { value: "3", label: "Steady", description: "A balanced pace for consistent and thorough learning.", icon: <Turtle className="h-6 w-6" /> },
  { value: "1", label: "Intense", description: "A fast-paced schedule for when you need to learn quickly.", icon: <Rabbit className="h-6 w-6" /> },
];

export default function PacePage() {
    const [selectedPace, setSelectedPace] = useState<string | null>("3");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    const handleNext = async () => {
        if (!selectedPace || !user) {
            toast({
                variant: 'destructive',
                title: 'Please select a pace',
            });
            return;
        }

        setIsSubmitting(true);
        localStorage.setItem('learningPace', selectedPace);

        try {
            // Fetch the most recently created course for the user
            const coursesRef = collection(db, 'courses');
            const q = query(coursesRef, where('userId', '==', user.uid), orderBy('__name__', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // This case should ideally not happen if the flow is correct, but good to handle.
                // We can just proceed to the next step.
                router.push('/onboarding/learner-type');
                return;
            }

            const courseDoc = querySnapshot.docs[0];
            const courseData = courseDoc.data() as { name: string, description: string, url: string };
            const course = { id: courseDoc.id, ...courseData };
            
            toast({ title: "Generating your personalized roadmap..." });
            
            const roadmapResponse = await generateRoadmap({
                courseName: course.name,
                courseDescription: course.description,
                courseUrl: course.url,
                durationInMonths: parseInt(selectedPace, 10),
            });

            const roadmapData = {
                courseId: course.id,
                userId: user.uid,
                goals: roadmapResponse.goals.map(g => ({ ...g, id: crypto.randomUUID() })),
                milestones: roadmapResponse.milestones.map(m => ({ ...m, id: crypto.randomUUID(), completed: false }))
            };
            await addDoc(collection(db, 'roadmaps'), roadmapData);

            // Add milestones to calendar events
            for (const milestone of roadmapData.milestones) {
                await addDoc(collection(db, 'calendarEvents'), {
                    title: milestone.title,
                    description: milestone.description,
                    date: milestone.date,
                    startTime: '09:00',
                    endTime: '10:00',
                    type: 'Homework',
                    color: 'bg-blue-500',
                    userId: user.uid,
                });
            }

            toast({ title: 'Roadmap & Calendar Created!', description: "Next, let's find your learning style." });
            router.push('/onboarding/learner-type');

        } catch (error) {
            console.error("Failed to generate roadmap:", error);
            toast({ variant: 'destructive', title: 'Roadmap Generation Failed' });
            setIsSubmitting(false);
            // Even if it fails, let's move to the next step
            router.push('/onboarding/learner-type');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl px-8"
            >
                 <div className="mb-8">
                    <p className="text-sm text-muted-foreground mb-2">Onboarding (3/4)</p>
                    <Progress value={75} />
                 </div>

                <h1 className="text-4xl font-bold text-center mb-12">How quickly do you want to learn?</h1>

                <RadioGroup value={selectedPace ?? ''} onValueChange={setSelectedPace}>
                    <div className="space-y-4">
                        {paces.map(({ value, label, icon, description }) => (
                             <Label key={value} htmlFor={value} className={cn(
                                "flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                selectedPace === value ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border hover:bg-muted"
                            )}>
                                <RadioGroupItem value={value} id={value} className="mt-1" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {icon}
                                        <span className="font-semibold text-lg">{label}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                                </div>
                            </Label>
                        ))}
                    </div>
                </RadioGroup>

                <div className="mt-12 flex justify-end">
                    <Button size="lg" onClick={handleNext} disabled={!selectedPace || isSubmitting}>
                         {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating Roadmap...
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
