
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { GitMerge, Plus, Check, Flag, Calendar, ArrowRight, Loader2 } from "lucide-react";
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { generateRoadmap, generateQuizFromModule } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';

type AnswerFeedback = { question: string; answer: string; correctAnswer: string; isCorrect: boolean; };

export const dynamic = "force-dynamic";

type Course = {
    id: string;
    name: string;
    description: string;
    url?: string;
    userId?: string;
    units?: { id: string; title: string; chapters: { id: string; title: string; content?: string }[] }[];
};

type Badge = {
    id: string;
    icon: string;
    title: string;
    description: string;
};

type Milestone = {
    id: string;
    icon: string;
    date: string; // YYYY-MM-DD
    title: string;
    description: string;
    completed: boolean;
};

type Roadmap = {
    id: string;
    courseId: string;
    userId: string;
    goals: Badge[];
    milestones: Milestone[];
};

const getIcon = (iconName: string | undefined, defaultIconName: string = 'Flag'): LucideIcon => {
    const nameToSearch = iconName || defaultIconName;
    const iconKey = Object.keys(LucideIcons).find((key) => key.toLowerCase() === nameToSearch.toLowerCase()) as keyof typeof LucideIcons | undefined;
    return (iconKey && LucideIcons[iconKey] as LucideIcon) || Flag;
};

export default function RoadmapsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [roadmaps, setRoadmaps] = useState<Record<string, Roadmap>>({});
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);
    const router = useRouter();
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

    // Mastery Challenge State
    const [isChallengeOpen, setIsChallengeOpen] = useState(false);
    const [challengeMilestone, setChallengeMilestone] = useState<Milestone | null>(null);
    const [challengeQuiz, setChallengeQuiz] = useState<GenerateQuizOutput | null>(null);
    const [isChallengeLoading, setIsChallengeLoading] = useState(false);
    const [currentChallengeQuestionIndex, setCurrentChallengeQuestionIndex] = useState(0);
    const [selectedChallengeAnswer, setSelectedChallengeAnswer] = useState<string | null>(null);
    const [challengeAnswers, setChallengeAnswers] = useState<AnswerFeedback[]>([]);
    const [challengeState, setChallengeState] = useState<'in-progress' | 'results'>('in-progress');

    useEffect(() => {
        if (authLoading || !user) return;

        const coursesQuery = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            if (userCourses.length > 0 && !activeCourseId) {
                setActiveCourseId(userCourses[0].id);
            } else if (userCourses.length === 0) {
                setActiveCourseId(null);
            }
        });

        const roadmapsQuery = query(collection(db, "roadmaps"), where("userId", "==", user.uid));
        const unsubscribeRoadmaps = onSnapshot(roadmapsQuery, (snapshot) => {
            const userRoadmaps: Record<string, Roadmap> = {};
            snapshot.forEach(doc => {
                const roadmapData = { id: doc.id, ...doc.data() } as Roadmap;
                userRoadmaps[roadmapData.courseId] = roadmapData;
            });
            setRoadmaps(userRoadmaps);
        });
        
        return () => {
            unsubscribeCourses();
            unsubscribeRoadmaps();
        }
        
    }, [user, authLoading, activeCourseId]);
    
    const activeRoadmap = activeCourseId ? roadmaps[activeCourseId] : null;

    const handleGenerateRoadmap = async (course: Course) => {
        if (!user) return;
        setIsLoading(prev => ({ ...prev, [course.id]: true }));
        toast({ title: 'Generating Roadmap...', description: `The AI is creating a personalized study plan for ${course.name}.` });
        try {
            const moduleTitles = course.units?.map(unit => unit.title).join(', ') || 'general topics';
            const response = await generateRoadmap({
                courseName: course.name,
                courseDescription: `A course about ${course.name}. The modules are: ${moduleTitles}`,
                courseUrl: course.url,
            });

            const roadmapData = {
                courseId: course.id,
                userId: user.uid,
                goals: response.goals.map(g => ({ ...g, id: crypto.randomUUID(), icon: g.icon || 'Flag' })),
                milestones: response.milestones.map(m => ({ ...m, id: crypto.randomUUID(), icon: m.icon || 'Calendar', completed: false }))
            };
            
            const existingRoadmapId = roadmaps[course.id]?.id;
            
            if (existingRoadmapId) {
                const roadmapRef = doc(db, 'roadmaps', existingRoadmapId);
                await updateDoc(roadmapRef, roadmapData);
            } else {
                await addDoc(collection(db, 'roadmaps'), roadmapData);
            }
           
            toast({
                title: 'Roadmap Generated!',
                description: `Your new roadmap for ${course.name} is ready.`,
            });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate roadmap.' });
        } finally {
            setIsLoading(prev => ({ ...prev, [course.id]: false }));
        }
    };
    
    const startMasteryChallenge = async (milestone: Milestone) => {
        if (!activeCourseId) return;
        const course = courses.find(c => c.id === activeCourseId);
        const module = course?.units?.find(u => u.title.includes(milestone.title.split(':')[1]?.trim()));
        
        if (!module || !module.chapters?.length) {
            toast({ variant: 'destructive', title: 'Content Not Found', description: 'This module has no content to generate a quiz from.' });
            return;
        }

        setChallengeMilestone(milestone);
        setIsChallengeOpen(true);
        setIsChallengeLoading(true);
        setChallengeState('in-progress');
        setChallengeAnswers([]);
        setCurrentChallengeQuestionIndex(0);

        try {
            const moduleContent = module.chapters.map(c => `Chapter: ${c.title}\n${c.content}`).join('\n\n');
            const result = await generateQuizFromModule({ moduleContent, learnerType: 'Reading/Writing' });
            setChallengeQuiz(result);
        } catch (error) {
            console.error("Failed to generate challenge quiz:", error);
            toast({ variant: 'destructive', title: 'Could not start challenge.' });
            setIsChallengeOpen(false);
        } finally {
            setIsChallengeLoading(false);
        }
    };
    
    const handleChallengeAnswer = async () => {
        if (!challengeQuiz) return;
        const currentQuestion = challengeQuiz.questions[currentChallengeQuestionIndex];
        const isCorrect = selectedChallengeAnswer?.toLowerCase() === currentQuestion.answer.toLowerCase();
        
        const newAnswers = [...challengeAnswers, {
            question: currentQuestion.question,
            answer: selectedChallengeAnswer || '',
            correctAnswer: currentQuestion.answer,
            isCorrect,
        }];
        setChallengeAnswers(newAnswers);

        if (!isCorrect) {
            toast({ variant: 'destructive', title: 'Incorrect', description: 'You must get all questions right to pass. Review the material and try again!' });
            setIsChallengeOpen(false);
            return;
        }
        
        setSelectedChallengeAnswer(null);

        if (currentChallengeQuestionIndex < challengeQuiz.questions.length - 1) {
            setCurrentChallengeQuestionIndex(prev => prev + 1);
        } else {
            // Passed the challenge
            await handleToggleMilestone(challengeMilestone!.id, true);
            toast({ title: 'Milestone Complete!', description: `You've earned the "${challengeMilestone?.title}" badge!` });
            setChallengeState('results');
        }
    };
    
    const handleToggleMilestone = async (milestoneId: string, completed: boolean) => {
        if (!activeCourseId || !roadmaps[activeCourseId]) return;

        let updatedRoadmap = { ...roadmaps[activeCourseId] };
        updatedRoadmap.milestones = updatedRoadmap.milestones.map(m => 
            m.id === milestoneId ? { ...m, completed } : m
        );

        try {
            const roadmapRef = doc(db, 'roadmaps', updatedRoadmap.id);
            await updateDoc(roadmapRef, { milestones: updatedRoadmap.milestones });
        } catch (error) {
            console.error("Error toggling milestone: ", error);
            toast({ variant: 'destructive', title: 'Update Failed' });
        }
    };

    return (
    <>
      <div className="space-y-6">
        <header>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Mastery Path</h1>
              <p className="text-muted-foreground">
                Select a course to view your learning journey and earn badges by proving your knowledge.
              </p>
            </div>
             {courses.length > 0 && (
                <div className="relative mt-4">
                    <Select value={activeCourseId ?? undefined} onValueChange={(value) => setActiveCourseId(value)}>
                      <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue placeholder="Select a course..." />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
            )}
        </header>

        {authLoading ? (
             <Skeleton className="h-96 w-full" />
        ) : courses.length > 0 ? (
            <div className="grid grid-cols-1">
            {activeCourseId && courses.find((c) => c.id === activeCourseId) ? (
                 (() => {
                    const course = courses.find((c) => c.id === activeCourseId)!;
                    const roadmap = roadmaps[course.id];
                    const courseIsLoading = isLoading[course.id];

                    if (!roadmap && !courseIsLoading) {
                      return (
                        <Card className="text-center p-12 col-span-full">
                          <h2 className="text-xl font-semibold">No Roadmap Yet for {course.name}</h2>
                          <p className="text-muted-foreground mt-2 mb-6">Click the button to create a personalized study plan for this course.</p>
                          <Button onClick={() => handleGenerateRoadmap(course)} disabled={courseIsLoading}>
                            <GitMerge className="mr-2 h-4 w-4" /> {courseIsLoading ? 'Generating...' : 'Generate with AI'}
                          </Button>
                        </Card>
                      );
                    }
      
                    if (courseIsLoading && !roadmap) {
                      return <Skeleton className="h-96 w-full" />;
                    }
      
                    if (roadmap) {
                      return (
                        <div className="relative p-8">
                            <div className="absolute left-16 top-0 bottom-0 w-1 bg-border -z-10"></div>
                            <div className="space-y-16">
                                {roadmap.milestones.map((milestone, index) => {
                                    const Icon = getIcon(milestone.icon, 'Calendar');
                                    const canAttempt = index === 0 || roadmap.milestones[index - 1].completed;
                                    return (
                                        <motion.div 
                                            key={milestone.id} 
                                            className="flex items-center gap-8"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            <div className="z-10 flex-shrink-0">
                                                {milestone.completed ? (
                                                    <div className="w-24 h-24 rounded-full bg-green-500/10 border-4 border-green-500 flex items-center justify-center text-green-500">
                                                        <Check className="h-10 w-10"/>
                                                    </div>
                                                ) : (
                                                    <div className={cn("w-24 h-24 rounded-full border-4 flex items-center justify-center", canAttempt ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground")}>
                                                        <Icon className="h-10 w-10" />
                                                    </div>
                                                )}
                                            </div>
                                            <Card className={cn("flex-1", !canAttempt && "opacity-60")}>
                                                <CardContent className="p-6 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">{new Date(milestone.date).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
                                                        <h3 className="text-xl font-bold mt-1">{milestone.title}</h3>
                                                        <p className="text-muted-foreground mt-2">{milestone.description}</p>
                                                    </div>
                                                    {!milestone.completed && (
                                                        <Button onClick={() => startMasteryChallenge(milestone)} disabled={!canAttempt}>
                                                          Start Challenge <ArrowRight className="ml-2 h-4 w-4"/>
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                      );
                    }
                    return null;
                  })()
            ) : null}
            </div>
        ) : (
          <Card className="text-center p-12">
            <h2 className="text-xl font-semibold">No Courses Found</h2>
            <p className="text-muted-foreground mt-2">Add a course to start creating roadmaps.</p>
            <Link href="/dashboard/courses">
              <Button className="mt-6">Go to Courses</Button>
            </Link>
          </Card>
        )}
      </div>

       <Dialog open={isChallengeOpen} onOpenChange={(open) => { if (!open) setIsChallengeOpen(false); }}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Mastery Challenge: {challengeMilestone?.title}</DialogTitle>
                <DialogDescription>Answer all questions correctly to complete this milestone.</DialogDescription>
            </DialogHeader>
             <div className="py-4 max-h-[70vh] overflow-y-auto">
                {isChallengeLoading ? (
                    <div className="flex h-60 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
                ) : challengeQuiz && challengeState === 'in-progress' ? (
                     <div className="space-y-6">
                        <div className="text-center">
                             <p className="text-muted-foreground mb-2">Question {currentChallengeQuestionIndex + 1} of {challengeQuiz.questions.length}</p>
                            <h3 className="text-xl font-bold">{challengeQuiz.questions[currentChallengeQuestionIndex].question}</h3>
                        </div>
                         <RadioGroup value={selectedChallengeAnswer ?? ''} onValueChange={setSelectedChallengeAnswer}>
                            <div className="space-y-3">
                                {challengeQuiz.questions[currentChallengeQuestionIndex].options?.map((option, index) => (
                                    <Label key={index} htmlFor={`c-opt-${index}`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors">
                                        <RadioGroupItem value={option} id={`c-opt-${index}`} />
                                        <span>{option}</span>
                                    </Label>
                                ))}
                            </div>
                        </RadioGroup>
                    </div>
                ) : challengeState === 'results' && (
                    <div className="text-center space-y-4 py-12">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-24 h-24 mx-auto rounded-full bg-green-500/10 border-4 border-green-500 flex items-center justify-center text-green-500">
                             <Check className="h-12 w-12"/>
                        </motion.div>
                        <h2 className="text-3xl font-bold">Challenge Passed!</h2>
                        <p className="text-muted-foreground">You've mastered this milestone and earned a badge!</p>
                    </div>
                )}
             </div>
             <DialogFooter>
                 {challengeState === 'in-progress' && (
                    <Button onClick={handleChallengeAnswer} disabled={!selectedChallengeAnswer || isChallengeLoading}>
                        {currentChallengeQuestionIndex < (challengeQuiz?.questions.length ?? 0) - 1 ? 'Next Question' : 'Finish Challenge'}
                    </Button>
                )}
                {challengeState === 'results' && <DialogClose asChild><Button>Awesome!</Button></DialogClose>}
             </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
