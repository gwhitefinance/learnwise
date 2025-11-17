
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, collection, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import { generateModuleContent } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

type Material = {
    type: 'file' | 'text' | 'url' | 'audio';
    content: string;
    fileName?: string;
};

type ChapterContentBlock = {
    type: 'text' | 'question';
    content?: string;
    question?: string;
    options?: string[];
    correctAnswer?: string;
};

type Chapter = {
    id: string;
    title: string;
    content?: ChapterContentBlock[]; // Content is now an object array, not a string
    activity?: string;
};

type Unit = {
    id: string;
    title: string;
    description?: string;
    chapters: Chapter[];
};

type Course = {
    id: string;
    name: string;
    description?: string;
    units: Unit[];
    completedChapters?: string[];
};

const ChapterContentDisplay = ({ chapter, courseId, onComplete }: { chapter: Chapter; courseId: string; onComplete: () => void }) => {
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});

    const contentBlocks = chapter.content || [];

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setUserAnswers(prev => ({...prev, [questionIndex]: answer}));
    }
    
    const handleSubmitAnswer = (questionIndex: number) => {
        setSubmittedAnswers(prev => ({...prev, [questionIndex]: true}));
    }

    return (
        <div className="py-4 space-y-6">
            {contentBlocks.map((block, index) => (
                <div key={index}>
                    {block.type === 'text' && (
                        <p className="text-muted-foreground leading-relaxed">{block.content}</p>
                    )}
                    {block.type === 'question' && (
                        <Card className="bg-muted/50">
                            <CardContent className="p-6">
                                <p className="font-semibold mb-4">{block.question}</p>
                                <RadioGroup 
                                    value={userAnswers[index]} 
                                    onValueChange={(val) => handleAnswerChange(index, val)}
                                    disabled={submittedAnswers[index]}
                                >
                                    {block.options?.map((option, i) => {
                                        const isSubmitted = submittedAnswers[index];
                                        const isCorrect = option === block.correctAnswer;
                                        const isSelected = userAnswers[index] === option;
                                        return (
                                            <Label key={i} className={cn("flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer",
                                                isSubmitted && isCorrect && "border-green-500 bg-green-500/10",
                                                isSubmitted && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                                                !isSubmitted && "hover:bg-background"
                                            )}>
                                                <RadioGroupItem value={option} />
                                                {option}
                                            </Label>
                                        )
                                    })}
                                </RadioGroup>
                                {!submittedAnswers[index] && (
                                    <Button onClick={() => handleSubmitAnswer(index)} size="sm" className="mt-4" disabled={!userAnswers[index]}>Submit</Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            ))}
             <Button onClick={onComplete} className="w-full mt-8">Complete &amp; Next Chapter</Button>
        </div>
    );
};


export default function StudyHubPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const router = useRouter();
    const [user, authLoading] = useAuthState(auth);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
    const [isGeneratingContent, setIsGeneratingContent] = useState<Record<string, boolean>>({});

    const { toast } = useToast();

    useEffect(() => {
        if (!user || !courseId) return;

        const courseRef = doc(db, 'courses', courseId);
        const unsubscribe = onSnapshot(courseRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                const courseData = { id: docSnap.id, ...docSnap.data() } as Course;
                
                // Ensure content is parsed
                courseData.units.forEach(unit => {
                    unit.chapters.forEach(chapter => {
                        if (typeof chapter.content === 'string') {
                            try {
                                chapter.content = JSON.parse(chapter.content);
                            } catch (e) {
                                console.error('Failed to parse chapter content on load:', e);
                                chapter.content = [];
                            }
                        }
                    });
                });

                setCourse(courseData);
            } else {
                router.push('/dashboard/courses');
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching course:", error);
            router.push('/dashboard/courses');
        });

        return () => unsubscribe();
    }, [courseId, user, router]);

    const handleGenerateContent = async (unit: Unit) => {
        if (!course) return;
        
        setIsGeneratingContent(prev => ({...prev, [unit.id]: true}));
        toast({ title: 'Generating Content', description: `AI is creating the content for ${unit.title}...`});
        
        try {
            const { updatedModule } = await generateModuleContent({
                courseName: course.name,
                module: {
                    id: unit.id,
                    title: unit.title,
                    chapters: unit.chapters.map(c => ({ id: c.id, title: c.title })),
                },
                learnerType: (localStorage.getItem('learnerType') as any) || 'Reading/Writing',
            });
            
            // The AI flow now returns objects, not strings, so no parsing needed here.
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
                const currentCourseData = courseSnap.data() as Course;
                const updatedUnits = currentCourseData.units.map(u => u.id === updatedModule.id ? updatedModule : u);
                await updateDoc(courseRef, { units: updatedUnits });
                
                // Directly set the selected unit with the already parsed content
                setSelectedUnit(updatedModule); 
            }

            toast({ title: 'Content Generated!', description: `${unit.title} is ready.`});

        } catch (error) {
            console.error("Content generation failed:", error);
            toast({ variant: 'destructive', title: 'Generation Failed'});
        } finally {
            setIsGeneratingContent(prev => ({...prev, [unit.id]: false}));
        }
    }

    const openModule = (unit: Unit) => {
        const hasContent = unit.chapters.some(c => c.content && Array.isArray(c.content) && c.content.length > 0);
        setSelectedUnit(unit);
        setActiveChapter(null); 
        
        if (!hasContent && !isGeneratingContent[unit.id]) {
            handleGenerateContent(unit);
        }
        setIsSheetOpen(true);
    };

    const handleChapterComplete = async () => {
        if (!course || !user || !activeChapter || !selectedUnit) return;
        
        const courseRef = doc(db, 'courses', courseId);
        
        try {
            await updateDoc(courseRef, {
                completedChapters: arrayUnion(activeChapter.id)
            });
            
            const currentIndex = selectedUnit.chapters.findIndex(c => c.id === activeChapter.id);
            if (currentIndex < selectedUnit.chapters.length - 1) {
                // Go to next chapter
                const nextChapter = selectedUnit.chapters[currentIndex + 1];
                if (typeof nextChapter.content === 'string') {
                    try {
                        nextChapter.content = JSON.parse(nextChapter.content);
                    } catch(e) { nextChapter.content = [] }
                }
                setActiveChapter(nextChapter);
            } else {
                // Last chapter completed
                setActiveChapter(null); // Go back to chapter list
                toast({ title: 'Module Complete!', description: `You finished ${selectedUnit.title}.` });
            }

        } catch (error) {
            console.error("Failed to mark chapter as complete:", error);
            toast({ variant: 'destructive', title: 'Update failed.' });
        }
    }

    if (loading || authLoading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
                <Skeleton className="h-10 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-24 w-full mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }
    
    if (!course) {
        return <div>Course not found or you do not have permission to view it.</div>;
    }

    const totalChapters = course.units?.flatMap(u => u.chapters).length || 0;
    const completedChaptersCount = course.completedChapters?.length || 0;
    const progress = totalChapters > 0 ? (completedChaptersCount / totalChapters) * 100 : 0;

    return (
        <>
            <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-grow">
                        <div className="flex flex-wrap justify-between gap-4 mb-6">
                            <div className="flex min-w-72 flex-col gap-2">
                                <p className="text-4xl font-black leading-tight tracking-[-0.033em]">{course.name}</p>
                                <p className="text-secondary-dark-text dark:text-gray-400 text-base font-normal leading-normal">{course.description || 'Your central dashboard for all course materials and study tools.'}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 mb-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                            <div className="flex gap-6 justify-between items-center">
                                <p className="text-base font-medium">Course Progress</p>
                                <p className="text-sm font-semibold">{Math.round(progress)}%</p>
                            </div>
                            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-2.5">
                                <div className="h-2.5 rounded-full bg-primary" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] mb-4">My Study Units</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {course.units?.map(unit => (
                                <div key={unit.id} className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-5 transition-shadow hover:shadow-lg">
                                    <div>
                                        <p className="text-lg font-bold leading-normal">{unit.title}</p>
                                        <p className="text-secondary-dark-text dark:text-gray-400 text-sm font-normal leading-normal mt-1 mb-4">{unit.description || `${unit.chapters.length} chapters`}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-auto">
                                        <Button className="w-full" onClick={() => openModule(unit)}>
                                            {completedChaptersCount > 0 ? 'Continue Module' : 'Start Module'}
                                        </Button>
                                        <Button variant="outline" className="w-full">
                                            <span className="material-symbols-outlined text-base">quiz</span> Take Practice Quiz
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <aside className="w-full lg:w-72 xl:w-80 lg:sticky top-24 self-start flex-shrink-0">
                        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4">Global Study Tools</h3>
                            <div className="flex flex-col gap-3">
                                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors group" href="#">
                                    <span className="material-symbols-outlined text-primary">school</span>
                                    <span className="text-sm font-medium">Final Exam Prep</span>
                                </a>
                                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors group" href="#">
                                    <span className="material-symbols-outlined text-primary">biotech</span>
                                    <span className="text-sm font-medium">Ask AI Tutor</span>
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="max-w-xl">
                    <SheetHeader>
                         {activeChapter ? (
                            <Button variant="ghost" size="sm" onClick={() => setActiveChapter(null)} className="mb-2 -ml-2 self-start">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Chapters
                            </Button>
                        ) : null}
                        <SheetTitle>{activeChapter ? activeChapter.title : selectedUnit?.title}</SheetTitle>
                        <SheetDescription>{activeChapter ? `Chapter in ${selectedUnit?.title}` : selectedUnit?.description}</SheetDescription>
                    </SheetHeader>
                    {isGeneratingContent[selectedUnit?.id || ''] && !activeChapter ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-muted-foreground">Generating chapter content...</p>
                        </div>
                    ) : activeChapter ? (
                        <ChapterContentDisplay chapter={activeChapter} courseId={course.id} onComplete={handleChapterComplete} />
                    ) : (
                        <div className="py-4 space-y-4">
                            {selectedUnit?.chapters.map((chapter, index) => {
                                const isCompleted = course?.completedChapters?.includes(chapter.id);
                                const isLocked = index > 0 && !course?.completedChapters?.includes(selectedUnit.chapters[index - 1].id);
                                return (
                                <div key={chapter.id} className="p-4 border rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {isCompleted ? <CheckCircle className="h-6 w-6 text-green-500" /> : isLocked ? <Lock className="h-6 w-6 text-muted-foreground"/> : <div className="h-6 w-6 rounded-full border-2 border-primary" />}
                                        <span className={cn("font-medium", isLocked && "text-muted-foreground")}>{chapter.title}</span>
                                    </div>
                                    <Button variant="secondary" size="sm" disabled={isLocked} onClick={() => {
                                        if (typeof chapter.content === 'string') {
                                            try { chapter.content = JSON.parse(chapter.content) } catch (e) { chapter.content = [] }
                                        }
                                        setActiveChapter(chapter)
                                    }}>View</Button>
                                </div>
                            )})}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
