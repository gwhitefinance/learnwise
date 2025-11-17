
'use client';

import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, collection, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { CheckCircle, Lock, ArrowLeft, Loader2, X, Check, BookMarked, BrainCircuit, MessageSquare, Copy, Lightbulb, Play } from 'lucide-react';
import { generateModuleContent, generateSummary, generateChapterContent } from '@/lib/actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FloatingChatContext } from '@/components/floating-chat';
import AIBuddy from '@/components/ai-buddy';

type Chapter = {
    id: string;
    title: string;
    content?: any;
    activity?: string;
};

type ChapterContentBlock = {
    type: 'text' | 'question';
    content?: string;
    question?: string;
    options?: string[];
    correctAnswer?: string;
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

const ChapterContentDisplay = ({ chapter }: { chapter: Chapter }) => {
    const [contentBlocks, setContentBlocks] = useState<ChapterContentBlock[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (chapter.content) {
            try {
                // Check if it's already an object (from state updates) or a string
                const content = typeof chapter.content === 'string' ? JSON.parse(chapter.content) : chapter.content;
                setContentBlocks(Array.isArray(content) ? content : [{ type: 'text', content: chapter.content as string }]);
            } catch (e) {
                // If parsing fails, treat it as a plain text string
                setContentBlocks([{ type: 'text', content: chapter.content as string }]);
            }
        }
    }, [chapter]);


    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setUserAnswers(prev => ({...prev, [questionIndex]: answer}));
    };
    
    const handleSubmitAnswer = (questionIndex: number) => {
        setSubmittedAnswers(prev => ({...prev, [questionIndex]: true}));
    };

    return (
        <div className="py-4 space-y-8 prose dark:prose-invert max-w-none">
            {contentBlocks.map((block, index) => (
                <div key={index}>
                    {block.type === 'text' && (
                        <p>{block.content}</p>
                    )}
                    {block.type === 'question' && (
                        <Card className="bg-muted/50 my-6">
                            <CardContent className="p-6">
                                <p className="font-semibold mb-4">{block.question}</p>
                                <RadioGroup 
                                    value={userAnswers[index]} 
                                    onValueChange={(val) => handleAnswerChange(index, val)}
                                    disabled={submittedAnswers[index]}
                                >
                                    <div className="space-y-2">
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
                                    </div>
                                </RadioGroup>
                                {!submittedAnswers[index] && (
                                    <Button onClick={() => handleSubmitAnswer(index)} size="sm" className="mt-4" disabled={!userAnswers[index]}>Submit</Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            ))}
            {chapter.activity && (
                 <Card className="bg-yellow-500/10 border-yellow-500/20">
                    <CardContent className="p-6">
                         <h4 className="font-bold text-yellow-700">Quick Activity</h4>
                         <p className="text-yellow-800/80">{chapter.activity}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
};

const GeneratingNextChapter = ({ summary, progress }: { summary: string, progress: number }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 max-w-2xl mx-auto">
            <div className="relative mb-8 flex flex-col items-center">
                <div className="relative w-32 h-32">
                    <AIBuddy className="w-full h-full" isStatic={false} />
                </div>
            </div>
            <h1 className="text-2xl font-bold">Building your next chapter...</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">While you wait, here's a quick summary of what you just learned!</p>
            <Card className="w-full mb-8 text-left">
                <CardHeader><CardTitle>Chapter Summary</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{summary}</p>
                </CardContent>
            </Card>
            <div className="w-full max-w-sm mx-auto">
                <Progress value={progress} className="h-2" />
            </div>
        </div>
    )
}

export default function CoursePage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const router = useRouter();
    const [user, authLoading] = useAuthState(auth);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [isGeneratingContent, setIsGeneratingContent] = useState<Record<string, boolean>>({});
    const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
    const [aiBuddyName, setAiBuddyName] = useState('Taz');

    const [isGeneratingNext, setIsGeneratingNext] = useState(false);
    const [currentSummary, setCurrentSummary] = useState('');
    const [generationProgress, setGenerationProgress] = useState(0);

    const { toast } = useToast();
    const { openChatWithPrompt } = useContext(FloatingChatContext) as any;

    useEffect(() => {
        if (!user) return;
        const savedName = localStorage.getItem('aiBuddyName');
        if (savedName) {
            setAiBuddyName(savedName);
        }
    }, [user]);

    useEffect(() => {
        if (!user || !courseId) return;

        const courseRef = doc(db, 'courses', courseId);
        const unsubscribe = onSnapshot(courseRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                const courseData = { id: docSnap.id, ...docSnap.data() } as Course;
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
            
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
                const currentCourseData = courseSnap.data() as Course;
                const updatedUnits = currentCourseData.units.map(u => u.id === updatedModule.id ? { ...updatedModule, chapters: updatedModule.chapters.map(c => ({...c, content: c.content })) } : u);
                await updateDoc(courseRef, { units: updatedUnits });
                
                setSelectedUnit({ ...updatedModule, chapters: updatedModule.chapters.map(c => ({...c, content: c.content})) });
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
        const hasContent = unit.chapters.some(c => c.content);
        setSelectedUnit(unit);
        setActiveChapter(null);
        
        if (!hasContent && !isGeneratingContent[unit.id]) {
            handleGenerateContent(unit);
        }
        setIsSheetOpen(true);
    };

    const handleComplete = async () => {
        if (!course || !user || !activeChapter || !selectedUnit) return;

        const courseRef = doc(db, 'courses', courseId as string);

        try {
            await updateDoc(courseRef, {
                completedChapters: arrayUnion(activeChapter.id)
            });

            toast({ title: 'Chapter Complete!' });

            const chapterIndex = selectedUnit.chapters.findIndex(c => c.id === activeChapter.id);

            if (chapterIndex < selectedUnit.chapters.length - 1) {
                const nextChapter = selectedUnit.chapters[chapterIndex + 1];
                 const nextUnitIndex = course.units.findIndex(u => u.id === selectedUnit.id);
                const nextChapterData = course.units[nextUnitIndex]?.chapters[chapterIndex + 1];
                
                if (nextChapterData && !nextChapterData.content) {
                     setIsSheetOpen(false);
                    setIsGeneratingNext(true);

                    const summaryResult = await generateSummary({ noteContent: JSON.stringify(activeChapter.content) });
                    setCurrentSummary(summaryResult.summary);
                    setGenerationProgress(20);

                    const nextContent = await generateChapterContent({
                        courseName: course.name,
                        moduleTitle: selectedUnit.title,
                        chapterTitle: nextChapter.title,
                        learnerType: (localStorage.getItem('learnerType') as any) || 'Reading/Writing'
                    });
                    setGenerationProgress(80);
                    
                    const fullCourseSnap = await getDoc(courseRef);
                    const fullCourseData = fullCourseSnap.data() as Course;
                    const updatedUnits = fullCourseData.units.map(u => {
                        if (u.id === selectedUnit.id) {
                            return {
                                ...u,
                                chapters: u.chapters.map(c => 
                                    c.id === nextChapter.id 
                                    ? { ...c, content: nextContent.content, activity: nextContent.activity } 
                                    : c
                                )
                            };
                        }
                        return u;
                    });
                    await updateDoc(courseRef, { units: updatedUnits });
                    setGenerationProgress(100);

                    router.push(`/dashboard/courses/${courseId}/${nextChapter.id}`);

                } else {
                     router.push(`/dashboard/courses/${courseId}/${nextChapter.id}`);
                }
            } else {
                 setIsSheetOpen(false);
                 setActiveChapter(null);
            }
        } catch (error) {
            console.error("Failed to mark chapter as complete:", error);
            toast({ variant: 'destructive', title: 'Update failed.' });
             setIsGeneratingNext(false);
        }
    };
    
    if (isGeneratingNext) {
        return <GeneratingNextChapter summary={currentSummary} progress={generationProgress} />;
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
                 <Button variant="ghost" onClick={() => router.push('/dashboard/courses')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Courses
                </Button>
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
                                        <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200" onClick={() => openModule(unit)}>
                                            <Play className="mr-2 h-4 w-4"/>
                                            {completedChaptersCount > 0 ? 'Continue Module' : 'Start Module'}
                                        </Button>
                                        <Button className="w-full" variant="outline">
                                            <Copy className="mr-2 h-4 w-4"/> Start Flashcards
                                        </Button>
                                        <hr className="my-2 border-border" />
                                        <Button className="w-full" asChild>
                                            <Link href={`/dashboard/courses/${courseId}/${unit.chapters.find(c => c.title === 'Module Quiz')?.id || ''}`}>
                                                <Lightbulb className="mr-2 h-4 w-4"/>
                                                Take Practice Quiz
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <aside className="w-full lg:w-72 xl:w-80 lg:sticky top-24 self-start flex-shrink-0">
                        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4">Study Tools</h3>
                            <div className="flex flex-col gap-3">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/dashboard/key-concepts">
                                        <BookMarked className="mr-2 h-4 w-4" /> Key Concepts
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/dashboard/taz-tutors">
                                        <BrainCircuit className="mr-2 h-4 w-4" /> Taz Study Session
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => openChatWithPrompt(`I have a question about ${course.name}`)}>
                                    <MessageSquare className="mr-2 h-4 w-4" /> Ask {aiBuddyName}
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="max-w-2xl w-full sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle className="text-2xl">{selectedUnit?.title}</SheetTitle>
                        <SheetDescription>{selectedUnit?.description}</SheetDescription>
                    </SheetHeader>
                    {isGeneratingContent[selectedUnit?.id || ''] ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-muted-foreground">Generating chapter content...</p>
                        </div>
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
                                    <Button asChild variant="secondary" size="sm" disabled={isLocked}>
                                        <Link href={`/dashboard/courses/${courseId}/${chapter.id}`}>View</Link>
                                    </Button>
                                </div>
                            )})}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

