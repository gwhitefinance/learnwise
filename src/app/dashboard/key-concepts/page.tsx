
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { generateFlashcardsFromNote, generateQuizAction, generateConceptExplanation } from '@/lib/actions';
import { Wand2, Lightbulb, Copy, Brain, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type Course = {
    id: string;
    name: string;
    units?: {
        id: string;
        title: string;
        chapters: {
            id: string;
            title: string;
            content?: string;
        }[];
    }[];
};

type Flashcard = {
    front: string;
    back: string;
    isRevealed?: boolean;
    isMastered?: boolean;
    userInput?: string;
    isCorrect?: boolean;
};

type TermExplanation = {
    simple: string;
    analogy: string;
    sentence: string;
};

export default function KeyConceptsPage() {
    const searchParams = useSearchParams();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    
    const [isQuizDialogOpen, setQuizDialogOpen] = useState(false);
    const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
    const [isQuizLoading, setIsQuizLoading] = useState(false);

    const [isExplanationDialogOpen, setExplanationDialogOpen] = useState(false);
    const [explanationTerm, setExplanationTerm] = useState<Flashcard | null>(null);
    const [explanation, setExplanation] = useState<Partial<TermExplanation>>({});
    const [isExplanationLoading, setExplanationLoading] = useState(false);

    const { toast } = useToast();
    const [user] = useAuthState(auth);

    useEffect(() => {
        if (!user) return;
        
        const q = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            
            const urlCourseId = searchParams.get('courseId');
            if (urlCourseId && userCourses.some(c => c.id === urlCourseId)) {
                setSelectedCourseId(urlCourseId);
            } else if (userCourses.length > 0) {
                setSelectedCourseId(userCourses[0].id);
            }
            setIsLoadingCourses(false);
        });

        return () => unsubscribe();
    }, [user, searchParams]);

    const handleGenerateContent = useCallback(async (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course || !course.units || course.units.length === 0) {
            toast({ variant: 'destructive', title: 'Course has no content' });
            return;
        }

        setIsLoadingContent(true);
        const courseContent = course.units.flatMap(u => u.chapters || []).map(c => `Chapter ${c.title}: ${c.content}`).join('\n\n');
        
        if (!courseContent.trim()) {
            toast({ variant: 'destructive', title: 'Content is empty' });
            setIsLoadingContent(false);
            return;
        }

        try {
            const result = await generateFlashcardsFromNote({ noteContent: courseContent, learnerType: 'Reading/Writing' });
            setFlashcards(result.flashcards.map(fc => ({...fc, isRevealed: false})));
            setCurrentFlashcardIndex(0);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to generate flashcards' });
        } finally {
            setIsLoadingContent(false);
        }
    }, [courses, toast]);
    
    useEffect(() => {
        if (selectedCourseId) {
            handleGenerateContent(selectedCourseId);
        }
    }, [selectedCourseId, handleGenerateContent]);

    const handleCheckAnswer = (index: number) => {
        const newFlashcards = [...flashcards];
        const card = newFlashcards[index];
        const isCorrect = card.userInput?.trim().toLowerCase() === card.back.trim().toLowerCase();
        
        newFlashcards[index] = { ...card, isRevealed: true, isCorrect };
        setFlashcards(newFlashcards);
    };

    const handleGenerateQuiz = async () => {
        const terms = flashcards.map(f => f.front).join(', ');
        if (!terms) {
            toast({ variant: 'destructive', title: 'No terms available' });
            return;
        }
        setIsQuizDialogOpen(true);
        setIsQuizLoading(true);
        try {
            const result = await generateQuizAction({
                topics: `Key concepts including: ${terms}`,
                questionType: 'Multiple Choice',
                difficulty: 'Medium',
                numQuestions: 5,
            });
            setQuiz(result);
        } catch(e) {
            toast({ variant: 'destructive', title: 'Failed to generate quiz' });
            setQuizDialogOpen(false);
        } finally {
            setIsQuizLoading(false);
        }
    };
    
    const handleExplainTerm = async (card: Flashcard) => {
        setExplanationTerm(card);
        setExplanation({});
        setExplanationDialogOpen(true);
        setExplanationLoading(true);
        const courseContext = courses.find(c => c.id === selectedCourseId)?.name || '';

        try {
            const types: ('simple' | 'analogy' | 'sentence')[] = ['simple', 'analogy', 'sentence'];
            const promises = types.map(type => generateConceptExplanation({
                term: card.front,
                definition: card.back,
                courseContext,
                explanationType: type,
            }));

            const results = await Promise.all(promises);
            const newExplanations: Partial<TermExplanation> = {};
            results.forEach((res, index) => {
                newExplanations[types[index]] = res.explanation;
            });
            setExplanation(newExplanations);

        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to get explanations' });
        } finally {
            setExplanationLoading(false);
        }
    }


    const currentCard = flashcards[currentFlashcardIndex];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Key Concepts Hub</h1>
                <p className="text-muted-foreground">Master the essential vocabulary from your courses.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={isLoadingContent}>
                    <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue placeholder="Select a course..." />
                    </SelectTrigger>
                    <SelectContent>
                        {isLoadingCourses ? <SelectItem value="loading" disabled>Loading courses...</SelectItem> : courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button onClick={handleGenerateQuiz} disabled={flashcards.length === 0}>
                    <Lightbulb className="mr-2 h-4 w-4" /> Quick Quiz
                </Button>
            </div>
            
            {isLoadingContent ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : flashcards.length > 0 ? (
                <div>
                     <div className="text-center text-sm text-muted-foreground mb-4">
                        Card {currentFlashcardIndex + 1} of {flashcards.length}
                    </div>
                    <AnimatePresence mode="wait">
                         <motion.div
                            key={currentFlashcardIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="relative"
                        >
                            <Card className="w-full max-w-2xl mx-auto min-h-[350px] flex flex-col justify-between p-8">
                               <div>
                                  <CardTitle className="text-2xl mb-8 text-center">{currentCard.front}</CardTitle>
                                  {currentCard.isRevealed ? (
                                      <div className="space-y-4">
                                          <p className={cn("p-3 rounded-md text-sm", currentCard.isCorrect ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300")}>
                                              <strong>Your Answer:</strong> {currentCard.userInput || "No answer"}
                                          </p>
                                          <p className="p-3 rounded-md bg-muted text-sm">
                                              <strong>Correct Answer:</strong> {currentCard.back}
                                          </p>
                                      </div>
                                  ) : (
                                       <Input 
                                          placeholder="Type the definition here..."
                                          value={currentCard.userInput || ''}
                                          onChange={(e) => {
                                              const newFlashcards = [...flashcards];
                                              newFlashcards[currentFlashcardIndex].userInput = e.target.value;
                                              setFlashcards(newFlashcards);
                                          }}
                                          onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer(currentFlashcardIndex)}
                                      />
                                  )}
                               </div>
                                <CardFooter className="p-0 pt-6 flex justify-between items-center">
                                    <Button variant="outline" onClick={() => handleExplainTerm(currentCard)}>
                                        <Wand2 className="mr-2 h-4 w-4"/> AI Explain It
                                    </Button>
                                    {currentCard.isRevealed ? (
                                        <Button onClick={() => {
                                            const newFlashcards = [...flashcards];
                                            newFlashcards[currentFlashcardIndex].isRevealed = false;
                                            newFlashcards[currentFlashcardIndex].userInput = '';
                                            newFlashcards[currentFlashcardIndex].isCorrect = undefined;
                                            setFlashcards(newFlashcards);
                                        }}>
                                            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                                        </Button>
                                    ) : (
                                        <Button onClick={() => handleCheckAnswer(currentFlashcardIndex)}>Check Answer</Button>
                                    )}
                                </CardFooter>
                            </Card>
                         </motion.div>
                    </AnimatePresence>
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <Button variant="outline" size="icon" onClick={() => setCurrentFlashcardIndex(prev => Math.max(0, prev - 1))} disabled={currentFlashcardIndex === 0}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setCurrentFlashcardIndex(prev => Math.min(flashcards.length - 1, prev + 1))} disabled={currentFlashcardIndex === flashcards.length - 1}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <Card className="text-center p-12">
                    <h3 className="text-lg font-semibold">No Key Concepts Found</h3>
                    <p className="text-muted-foreground mt-2">Could not generate any key terms from the selected course. Make sure the course has content.</p>
                </Card>
            )}

            <Dialog open={isQuizDialogOpen} onOpenChange={setQuizDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Term Tussle!</DialogTitle></DialogHeader>
                    {isQuizLoading ? <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div> : quiz && (
                         <div>
                            <p className="font-semibold mb-4">{quiz.questions[0].question}</p>
                            <RadioGroup>
                                <div className="space-y-2">
                                    {quiz.questions[0].options?.map((option, i) => (
                                        <Label key={i} htmlFor={`q-opt-${i}`} className="flex items-center gap-2 p-3 rounded-lg border">
                                            <RadioGroupItem value={option} id={`q-opt-${i}`} />
                                            {option}
                                        </Label>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                    <DialogFooter><DialogClose asChild><Button>Close</Button></DialogClose></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isExplanationDialogOpen} onOpenChange={setExplanationDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Brain className="text-purple-500" /> AI Explanations for "{explanationTerm?.front}"</DialogTitle>
                    </DialogHeader>
                    {isExplanationLoading ? <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div> : (
                        <div className="py-4 space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold text-sm mb-1">In Simple Terms</h4>
                                <p className="text-muted-foreground text-sm">{explanation.simple || '...'}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold text-sm mb-1">As an Analogy</h4>
                                <p className="text-muted-foreground text-sm">{explanation.analogy || '...'}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold text-sm mb-1">In a Sentence</h4>
                                <p className="text-muted-foreground text-sm italic">"{explanation.sentence || '...'}"</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
