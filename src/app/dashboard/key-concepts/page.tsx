
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { generateFlashcardsFromNote, generateConceptExplanation } from '@/lib/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Loading from './loading';
import { Wand2, Brain, Check, RefreshCw, ChevronLeft, ChevronRight, Bookmark, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type Course = {
    id: string;
    name: string;
    units?: { id: string; title: string; chapters?: { id: string; title: string; content?: string }[] }[];
};

type Flashcard = {
    front: string;
    back: string;
    distractors?: string[];
    isRevealed?: boolean;
    isCorrect?: boolean;
    userInput?: string;
    options?: string[]; // For multiple choice
};

type CardType = 'input' | 'choice' | 'definition';

export default function KeyConceptsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [user] = useAuthState(auth);

  // Flashcard state
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [cardType, setCardType] = useState<CardType>('input');
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Explanation dialog state
  const [isExplanationDialogOpen, setExplanationDialogOpen] = useState(false);
  const [explanationTerm, setExplanationTerm] = useState<Flashcard | null>(null);
  const [explanation, setExplanation] = useState<any>({});
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  
  // Mastery list
  const [knownTerms, setKnownTerms] = useState<Record<string, Flashcard[]>>({});

  const { toast } = useToast();

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            setIsLoading(false);
            if (userCourses.length > 0 && !selectedCourse) {
                setSelectedCourse(userCourses[0].id);
            }
        });

        const savedTerms = localStorage.getItem(`knownTerms_${user.uid}`);
        if (savedTerms) {
            setKnownTerms(JSON.parse(savedTerms));
        }

        return () => unsubscribe();
    }, [user, selectedCourse]);

    const handleGenerateFlashcards = useCallback(async () => {
        const course = courses.find(c => c.id === selectedCourse);
        if (!course) {
            toast({ variant: 'destructive', title: 'Please select a course' });
            return;
        }

        if (!course.units || course.units.length === 0) {
            toast({ variant: 'destructive', title: 'Course has no content', description: 'Please add units and chapters to this course first.' });
            return;
        }

        setIsLoadingContent(true);
        setFlashcards([]);
        const courseContent = course.units.flatMap(u => u.chapters || []).map(c => `Chapter ${c.title}: ${c.content}`).join('\n\n');
        
        if (!courseContent.trim()) {
            toast({ variant: 'destructive', title: 'Content is empty' });
            setIsLoadingContent(false);
            return;
        }

        try {
            const result = await generateFlashcardsFromNote({ noteContent: courseContent, learnerType: 'Reading/Writing' });
            
            const processedFlashcards = result.flashcards.map(fc => ({
                ...fc,
                isRevealed: false,
                options: fc.distractors ? shuffleArray([...fc.distractors, fc.back]) : undefined
            }));
            
            setFlashcards(processedFlashcards);
            setCurrentFlashcardIndex(0);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to generate flashcards' });
        } finally {
            setIsLoadingContent(false);
        }
    }, [courses, selectedCourse, toast]);
    
    useEffect(() => {
        setIsFlipped(false);
    }, [currentFlashcardIndex, cardType]);
    
    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const handleCheckAnswer = (index: number) => {
        const newFlashcards = [...flashcards];
        const card = newFlashcards[index];
        
        let isCorrect = false;
        const userInput = (card.userInput || '').trim().toLowerCase();
        const correctAnswer = card.back.trim().toLowerCase();
        
        if (cardType === 'input') {
            const similarity = (s1: string, s2: string) => {
                let longer = s1; let shorter = s2;
                if (s1.length < s2.length) { longer = s2; shorter = s1; }
                const longerLength = longer.length;
                if (longerLength === 0) return 1.0;
                return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString());
            };
            const editDistance = (s1: string, s2: string) => {
                s1 = s1.toLowerCase(); s2 = s2.toLowerCase();
                const costs = [];
                for (let i = 0; i <= s1.length; i++) {
                    let lastValue = i;
                    for (let j = 0; j <= s2.length; j++) {
                        if (i === 0) costs[j] = j;
                        else if (j > 0) {
                            let newValue = costs[j - 1];
                            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                            costs[j - 1] = lastValue; lastValue = newValue;
                        }
                    }
                    if (i > 0) costs[s2.length] = lastValue;
                }
                return costs[s2.length];
            };
            isCorrect = similarity(userInput, correctAnswer) > 0.8 || userInput.includes(correctAnswer) || correctAnswer.includes(userInput);
        } else if (cardType === 'choice') {
            isCorrect = userInput === correctAnswer.toLowerCase();
        }

        newFlashcards[index] = { ...card, isRevealed: true, isCorrect };
        setFlashcards(newFlashcards);
    };

    const handleExplainTerm = async (card: Flashcard) => {
        setExplanationTerm(card);
        setExplanation({});
        setExplanationDialogOpen(true);
        setIsExplanationLoading(true);
        const courseContext = courses.find(c => c.id === selectedCourse)?.name || '';

        try {
            const types: ('simple' | 'analogy' | 'sentence')[] = ['simple', 'analogy', 'sentence'];
            const promises = types.map(type => generateConceptExplanation({
                term: card.front,
                definition: card.back,
                courseContext,
                explanationType: type,
            }));

            const results = await Promise.all(promises);
            const newExplanations: Partial<any> = {};
            results.forEach((res, index) => {
                newExplanations[types[index]] = res.explanation;
            });
            setExplanation(newExplanations);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to get explanations' });
        } finally {
            setIsExplanationLoading(false);
        }
    };
    
    const handleKnowTerm = (card: Flashcard) => {
        if (!user) return;
        const newKnownTerms = { ...knownTerms };
        
        if (!newKnownTerms[selectedCourse]) {
            newKnownTerms[selectedCourse] = [];
        }

        if (!newKnownTerms[selectedCourse].some(t => t.front === card.front)) {
            newKnownTerms[selectedCourse].push(card);
            setKnownTerms(newKnownTerms);
            localStorage.setItem(`knownTerms_${user.uid}`, JSON.stringify(newKnownTerms));
            toast({ title: "Term Saved!", description: `"${card.front}" was added to your mastery list.`});
        } else {
            toast({ title: "Already Saved", description: `"${card.front}" is already in your mastery list.`});
        }
    };
    
    const currentCard = flashcards.length > 0 ? flashcards[currentFlashcardIndex] : null;

    if (isLoading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Key Concepts Hub</h1>
                <p className="text-muted-foreground">Master essential vocabulary with interactive flashcards and AI-powered explanations.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 <aside className="lg:col-span-1 h-full bg-card border rounded-lg p-4 flex flex-col lg:sticky lg:top-24">
                     <div className="flex-1 overflow-hidden flex flex-col">
                        <h2 className="text-lg font-bold mb-4">Mastery List</h2>
                        <ScrollArea className="flex-1 -mr-4 pr-4">
                            {Object.keys(knownTerms).length > 0 ? (
                                <Accordion type="multiple" defaultValue={Object.keys(knownTerms)} className="w-full">
                                    {courses.filter(c => knownTerms[c.id]).map(course => (
                                        <AccordionItem key={course.id} value={course.id}>
                                            <AccordionTrigger>{course.name}</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="space-y-1 pl-4 text-sm text-muted-foreground">
                                                    {knownTerms[course.id].map(term => (
                                                        <li key={term.front}>{term.front}</li>
                                                    ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="text-center text-muted-foreground text-sm py-16">
                                    <Bookmark className="mx-auto mb-2 h-8 w-8"/>
                                    <p>Click "I Know This" on a flashcard to save it here for later review.</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </aside>

                <main className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={isLoadingContent}>
                            <SelectTrigger className="w-full md:w-[300px]">
                                <SelectValue placeholder="Select a course..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={cardType} onValueChange={(v) => setCardType(v as CardType)} disabled={flashcards.length === 0}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Select practice mode..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="input">Fill in the Blank</SelectItem>
                                <SelectItem value="choice">Multiple Choice</SelectItem>
                                <SelectItem value="definition">Definition</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                      {flashcards.length > 0 && currentCard ? (
                        <div>
                            <div className="text-center text-sm text-muted-foreground mb-4">
                                Card {currentFlashcardIndex + 1} of {flashcards.length}
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${currentFlashcardIndex}-${cardType}`}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative"
                                >
                                    <Card className="w-full mx-auto min-h-[400px] flex flex-col justify-between p-8">
                                    <div>
                                        {cardType === 'definition' ? (
                                            <div
                                                className="relative w-full h-[250px] cursor-pointer"
                                                onClick={() => setIsFlipped(!isFlipped)}
                                                style={{ perspective: '1000px' }}
                                            >
                                                <motion.div
                                                    className="absolute w-full h-full p-6 flex items-center justify-center text-center rounded-lg border bg-card text-card-foreground shadow-sm"
                                                    style={{ backfaceVisibility: 'hidden' }}
                                                    initial={false}
                                                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                                                    transition={{ duration: 0.6 }}
                                                >
                                                    <p className="text-xl font-semibold">{currentCard.front}</p>
                                                </motion.div>
                                                <motion.div
                                                    className="absolute w-full h-full p-6 flex items-center justify-center text-center rounded-lg border bg-muted text-card-foreground shadow-sm"
                                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                                    initial={false}
                                                    animate={{ rotateY: isFlipped ? 0 : -180 }}
                                                    transition={{ duration: 0.6 }}
                                                >
                                                    <p className="text-lg">{currentCard.back}</p>
                                                </motion.div>
                                            </div>
                                        ) : (
                                            <>
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
                                                ) : cardType === 'input' ? (
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
                                                ) : cardType === 'choice' && currentCard.options ? (
                                                    <RadioGroup
                                                        value={currentCard.userInput}
                                                        onValueChange={(value) => {
                                                            const newFlashcards = [...flashcards];
                                                            newFlashcards[currentFlashcardIndex].userInput = value;
                                                            setFlashcards(newFlashcards);
                                                        }}
                                                    >
                                                        <div className="space-y-2">
                                                        {currentCard.options?.map((option, i) => (
                                                            <Label key={i} htmlFor={`mc-option-${i}`} className="flex items-center gap-4 p-3 rounded-lg border cursor-pointer hover:bg-muted">
                                                                <RadioGroupItem value={option} id={`mc-option-${i}`} />
                                                                <span>{option}</span>
                                                            </Label>
                                                        ))}
                                                        </div>
                                                    </RadioGroup>
                                                ) : null}
                                            </>
                                        )}
                                    </div>
                                    <CardFooter className="p-0 pt-6 flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => handleExplainTerm(currentCard)}>
                                                <Wand2 className="mr-2 h-4 w-4"/> AI Explain It
                                            </Button>
                                            <Button variant="secondary" onClick={() => handleKnowTerm(currentCard)}>
                                                <Check className="mr-2 h-4 w-4" /> I Know This
                                            </Button>
                                        </div>
                                        {cardType !== 'definition' ? (
                                            currentCard.isRevealed ? (
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
                                            )
                                        ) : <Button onClick={() => setIsFlipped(!isFlipped)}><RefreshCw className="mr-2 h-4 w-4" />Flip Card</Button>}
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
                        <Card className="text-center p-12 min-h-[400px] flex flex-col justify-center items-center">
                            {isLoadingContent ? (
                                <>
                                <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin mb-4" />
                                <h3 className="text-lg font-semibold">Generating Concepts...</h3>
                                </>
                            ): (
                                <>
                                    <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">Generate Key Concepts</h3>
                                    <p className="text-muted-foreground mt-2 mb-4">Select a course and click the button to generate flashcards.</p>
                                    <Button onClick={handleGenerateFlashcards} disabled={!selectedCourse || isLoadingContent}>
                                        <Wand2 className="mr-2 h-4 w-4" /> Generate Flashcards for "{courses.find(c => c.id === selectedCourse)?.name || '...'}"
                                    </Button>
                                </>
                            )}
                        </Card>
                    )}
                 </main>
            </div>
            <Dialog open={isExplanationDialogOpen} onOpenChange={setExplanationDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI Explanation for: {explanationTerm?.front}</DialogTitle>
                        <DialogDescription>{explanationTerm?.back}</DialogDescription>
                    </DialogHeader>
                    {isExplanationLoading ? (
                        <div className="py-8"><Skeleton className="h-24 w-full" /></div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div><h4 className="font-semibold text-sm">Simple Explanation</h4><p className="text-sm text-muted-foreground">{explanation.simple}</p></div>
                            <div><h4 className="font-semibold text-sm">Analogy</h4><p className="text-sm text-muted-foreground">{explanation.analogy}</p></div>
                            <div><h4 className="font-semibold text-sm">In a Sentence</h4><p className="text-sm text-muted-foreground">{explanation.sentence}</p></div>
                        </div>
                    )}
                    <DialogClose asChild><Button>Got it!</Button></DialogClose>
                </DialogContent>
            </Dialog>
        </div>
    );
}

