'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Loading from './loading';

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
    content?: ChapterContentBlock[] | string;
    activity?: string;
};

type Unit = {
    id: string;
    title: string;
    chapters: Chapter[];
};

type Course = {
    id: string;
    name: string;
    units: Unit[];
    completedChapters?: string[];
};

export default function ChapterPage() {
    const params = useParams();
    const router = useRouter();
    const { courseId, chapterId } = params;

    const [user, authLoading] = useAuthState(auth);
    const { toast } = useToast();
    
    const [course, setCourse] = useState<Course | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);

    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (!user || !courseId || !chapterId) {
            if (!authLoading) router.push('/dashboard/courses');
            return;
        }

        const courseRef = doc(db, 'courses', courseId as string);
        const unsubscribe = onSnapshot(courseRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                const courseData = { id: docSnap.id, ...docSnap.data() } as Course;
                setCourse(courseData);
                
                const foundChapter = courseData.units
                    ?.flatMap(u => u.chapters)
                    .find(c => c.id === chapterId);

                if (foundChapter) {
                    if (typeof foundChapter.content === 'string' && foundChapter.content.trim().startsWith('[')) {
                        try {
                            foundChapter.content = JSON.parse(foundChapter.content);
                        } catch (e) {
                            console.error("Failed to parse chapter content:", e);
                            foundChapter.content = [{ type: 'text', content: 'Error displaying content.' }];
                        }
                    } else if (typeof foundChapter.content === 'string') {
                         foundChapter.content = [{ type: 'text', content: foundChapter.content }];
                    }
                    
                    setChapter(foundChapter);
                } else {
                    toast({ variant: 'destructive', title: 'Chapter not found' });
                }
            } else {
                 toast({ variant: 'destructive', title: 'Course not found' });
                 router.push('/dashboard/courses');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [courseId, chapterId, user, authLoading, router, toast]);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setUserAnswers(prev => ({...prev, [questionIndex]: answer}));
    };
    
    const handleSubmitAnswer = (questionIndex: number) => {
        setSubmittedAnswers(prev => ({...prev, [questionIndex]: true}));
    };

    const handleComplete = async () => {
        if (!course || !user || !chapter) return;
        
        const courseRef = doc(db, 'courses', courseId as string);
        
        try {
            await updateDoc(courseRef, {
                completedChapters: arrayUnion(chapter.id)
            });
            
            toast({ title: 'Chapter Complete!', description: 'Moving to the next chapter.'});

            let currentUnit: Unit | undefined;
            let chapterIndex = -1;

            for(const unit of course.units) {
                const index = unit.chapters.findIndex(c => c.id === chapter.id);
                if (index !== -1) {
                    currentUnit = unit;
                    chapterIndex = index;
                    break;
                }
            }
            
            if (currentUnit && chapterIndex < currentUnit.chapters.length - 1) {
                const nextChapter = currentUnit.chapters[chapterIndex + 1];
                router.push(`/dashboard/courses/${courseId}/${nextChapter.id}`);
            } else {
                router.push(`/dashboard/courses/${courseId}`);
            }

        } catch (error) {
            console.error("Failed to mark chapter as complete:", error);
            toast({ variant: 'destructive', title: 'Update failed.' });
        }
    };


    if (loading || authLoading) {
        return <Loading />;
    }

    if (!chapter) {
        return <div>Chapter not found.</div>
    }

    const contentBlocks = Array.isArray(chapter.content) ? chapter.content : [];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Button variant="ghost" onClick={() => router.push(`/dashboard/courses/${courseId}`)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Course
            </Button>
            <h1 className="text-4xl font-bold mb-2">{chapter.title}</h1>
            <p className="text-muted-foreground mb-8">From course: {course?.name}</p>

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
            
            <Button onClick={handleComplete} size="lg" className="w-full mt-12">
                <Check className="mr-2 h-5 w-5"/>
                Complete & Next Chapter
            </Button>
        </div>
    )
}
