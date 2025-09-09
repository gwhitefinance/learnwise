
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, Play, Pause, ChevronLeft, ChevronRight, Wand2, FlaskConical, Lightbulb, Copy, RefreshCw, Check, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateMiniCourse } from '@/ai/flows/mini-course-flow';
import type { GenerateMiniCourseOutput } from '@/ai/schemas/mini-course-schema';
import { Skeleton } from '@/components/ui/skeleton';
import { generateQuizFromModule } from '@/ai/flows/module-quiz-flow';
import { generateFlashcardsFromModule } from '@/ai/flows/module-flashcard-flow';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';


type Course = {
    id: string;
    name: string;
    description: string;
    url?: string;
    userId?: string;
};

type Module = GenerateMiniCourseOutput['modules'][0];

type Flashcard = {
    front: string;
    back: string;
};

export default function LearningLabPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [miniCourse, setMiniCourse] = useState<GenerateMiniCourseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [isCourseComplete, setIsCourseComplete] = useState(false);
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Quiz states
  const [isQuizDialogOpen, setQuizDialogOpen] = useState(false);
  const [isQuizLoading, setQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  
  // Flashcard states
  const [isFlashcardDialogOpen, setFlashcardDialogOpen] = useState(false);
  const [isFlashcardLoading, setFlashcardLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);


  useEffect(() => {
    if (authLoading || !user) return;

    const q = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
    });

    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleGenerateCourse = async () => {
    if (!selectedCourseId) {
        toast({ variant: 'destructive', title: 'Please select a course.'});
        return;
    }
    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) return;

    setIsLoading(true);
    setMiniCourse(null); // Clear previous course to show loading state
    setCompletedModules([]);
    setIsCourseComplete(false);
    setCurrentModuleIndex(0);
    setCurrentChapterIndex(0);
    toast({ title: 'Generating Your Learning Lab...', description: 'The AI is crafting a personalized course for you.' });

    try {
        const result = await generateMiniCourse({
            courseName: course.name,
            courseDescription: course.description,
            learnerType: (learnerType as any) ?? 'Reading/Writing'
        });
        setMiniCourse(result);
        toast({ title: 'Ready to Learn!', description: 'Your new mini-course has been generated.'});
    } catch (error) {
        console.error("Failed to generate mini-course:", error);
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create a course at this time.' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async (module: Module) => {
    const moduleContent = module.chapters.map(c => `Chapter: ${c.title}\n${c.content}`).join('\n\n');
    setQuizDialogOpen(true);
    setQuizLoading(true);
    setGeneratedQuiz(null);
    try {
        const result = await generateQuizFromModule({
            moduleContent,
            learnerType: (learnerType as any) ?? 'Reading/Writing'
        });
        setGeneratedQuiz(result);
    } catch(error) {
        console.error("Failed to generate quiz:", error);
        toast({
            variant: 'destructive',
            title: 'Quiz Generation Failed',
            description: 'Could not generate a quiz for this module.',
        });
        setQuizDialogOpen(false);
    } finally {
        setQuizLoading(false);
    }
  };
  
  const handleGenerateFlashcards = async (module: Module) => {
    const moduleContent = module.chapters.map(c => `Chapter: ${c.title}\n${c.content}`).join('\n\n');
    setFlashcardDialogOpen(true);
    setFlashcardLoading(true);
    setFlashcards([]);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    try {
        const result = await generateFlashcardsFromModule({
            moduleContent,
            learnerType: (learnerType as any) ?? 'Reading/Writing'
        });
        setFlashcards(result.flashcards);
    } catch(error) {
        console.error("Failed to generate flashcards:", error);
        toast({
            variant: 'destructive',
            title: 'Flashcard Generation Failed',
            description: 'Could not generate flashcards for this module.',
        });
        setFlashcardDialogOpen(false);
    } finally {
        setFlashcardLoading(false);
    }
  };

  const handleMarkModuleComplete = (moduleIndex: number) => {
    if (completedModules.includes(moduleIndex)) return;
    const newCompletedModules = [...completedModules, moduleIndex];
    setCompletedModules(newCompletedModules);
    toast({
        title: `🎉 Module ${moduleIndex + 1} Complete! 🎉`,
        description: "Great job! Keep up the momentum.",
    });

    if (newCompletedModules.length === miniCourse?.modules.length) {
        setIsCourseComplete(true);
         toast({
            title: "🎉 Congratulations! 🎉",
            description: "You've completed the entire course! Great job!",
        })
    } else {
        // Move to the next module
        if (miniCourse && moduleIndex < miniCourse.modules.length - 1) {
            setCurrentModuleIndex(moduleIndex + 1);
            setCurrentChapterIndex(0);
        }
    }
  }

  const startNewCourse = () => {
    setMiniCourse(null);
    setSelectedCourseId(null);
    setIsCourseComplete(false);
    setCompletedModules([]);
  }
  
  const handleNextChapter = () => {
    if (!miniCourse) return;
    const currentModule = miniCourse.modules[currentModuleIndex];
    if (currentChapterIndex < currentModule.chapters.length - 1) {
        setCurrentChapterIndex(prev => prev + 1);
    }
  };
  
  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
        setCurrentChapterIndex(prev => prev - 1);
    } else if (currentModuleIndex > 0) {
        const prevModuleIndex = currentModuleIndex - 1;
        const prevModule = miniCourse?.modules[prevModuleIndex];
        if (prevModule) {
            setCurrentModuleIndex(prevModuleIndex);
            setCurrentChapterIndex(prevModule.chapters.length - 1);
        }
    }
  };

  const progress = miniCourse ? (completedModules.length / miniCourse.modules.length) * 100 : 0;
  const currentModule = miniCourse?.modules[currentModuleIndex];
  const currentChapter = currentModule?.chapters[currentChapterIndex];
  const isLastChapterInModule = currentModule ? currentChapterIndex === currentModule.chapters.length - 1 : false;

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Lab</h1>
        <p className="text-muted-foreground">
          Your personalized learning environment, generated by AI.
        </p>
      </div>

       {!miniCourse && !isLoading && (
        <Card className="text-center p-12">
           <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Select a Course to Begin</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            Choose one of your courses from the dropdown below, and the AI will generate a personalized mini-course tailored to your learning style.
          </p>
           <div className="flex justify-center gap-4">
                <Select onValueChange={setSelectedCourseId} value={selectedCourseId ?? ''}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select a course..." />
                    </SelectTrigger>
                    <SelectContent>
                        {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleGenerateCourse} disabled={!selectedCourseId}>
                    <Wand2 className="mr-2 h-4 w-4"/> Generate
                </Button>
           </div>
        </Card>
      )}

      {(isLoading || miniCourse) && (
          <>
            <Card>
                <CardHeader>
                <CardTitle>Now Learning: {miniCourse?.courseTitle ?? <Skeleton className="h-6 w-2/3"/>}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-medium">
                        <span>Overall Progress ({completedModules.length} / {miniCourse?.modules.length ?? 0})</span>
                        <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} />
                </CardContent>
            </Card>
            
            {isCourseComplete ? (
                 <Card className="text-center p-12">
                    <Star className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                    <h2 className="text-xl font-semibold">Course Complete!</h2>
                    <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                        Fantastic work! You've successfully completed this course.
                    </p>
                    <Button onClick={startNewCourse}>
                        Start a New Course
                    </Button>
                </Card>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2">
                    {isLoading ? (
                        <Card>
                            <CardHeader><Skeleton className="h-6 w-3/4 mb-2"/></CardHeader>
                            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                        </Card>
                     ) : currentChapter ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Chapter {currentChapterIndex + 1}: {currentChapter.title}
                                </CardTitle>
                                <CardDescription>
                                    Module {currentModuleIndex + 1}: {currentModule?.title}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                     <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{currentChapter.content}</p>
                                    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                        <h5 className="font-semibold flex items-center gap-2 text-amber-700 text-sm"><Lightbulb size={16}/> Suggested Activity</h5>
                                        <p className="text-muted-foreground mt-1 text-sm">{currentChapter.activity}</p>
                                    </div>
                                    
                                     {isLastChapterInModule && (
                                         <div className="mt-6 pt-6 border-t-2 border-dashed">
                                            <h4 className="font-semibold mb-4 text-lg text-center">Module {currentModuleIndex + 1} Review</h4>
                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <Button variant="outline" onClick={() => handleGenerateQuiz(currentModule)}>
                                                    <Lightbulb className="mr-2 h-4 w-4"/> Module Test
                                                </Button>
                                                <Button variant="outline" onClick={() => handleGenerateFlashcards(currentModule)}>
                                                    <Copy className="mr-2 h-4 w-4"/> Review Flashcards
                                                </Button>
                                                 {!completedModules.includes(currentModuleIndex) && (
                                                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleMarkModuleComplete(currentModuleIndex)}>
                                                        <Check className="mr-2 h-4 w-4"/> Mark Module Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                     )}
                                </div>
                            </CardContent>
                        </Card>
                     ) : <p>No chapter data found.</p>}
                     <div className="mt-4 flex justify-between">
                          <Button variant="outline" onClick={handlePrevChapter} disabled={currentModuleIndex === 0 && currentChapterIndex === 0}>
                            <ChevronLeft className="mr-2 h-4 w-4"/> Previous
                          </Button>
                          <Button onClick={handleNextChapter} disabled={isLastChapterInModule}>
                            Next <ChevronRight className="ml-2 h-4 w-4"/>
                          </Button>
                     </div>
                </div>
                <div className="space-y-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Course Outline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {miniCourse?.modules.map((module, mIndex) => (
                                    <li key={mIndex}>
                                        <button
                                            className={cn(
                                                "w-full text-left p-2 rounded-md font-semibold flex items-center gap-3",
                                                mIndex === currentModuleIndex ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                            )}
                                            onClick={() => {setCurrentModuleIndex(mIndex); setCurrentChapterIndex(0);}}
                                        >
                                           {completedModules.includes(mIndex) ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <div className="h-5 w-5 rounded-full border-2 border-primary flex-shrink-0" />}
                                           <span>Module {mIndex + 1}: {module.title}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Start Over</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Button className="w-full" variant="secondary" onClick={startNewCourse}>
                                Choose a Different Course
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            )}
         </>
      )}

    </div>
    
    <Dialog open={isQuizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Lightbulb className="text-yellow-500" />
                    Module Test
                </DialogTitle>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
                {isQuizLoading ? (
                     <div className="space-y-4 p-4">
                        <Skeleton className="h-6 w-3/4"/>
                        <div className="space-y-2 pt-2">
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-full"/>
                        </div>
                    </div>
                ) : (
                   generatedQuiz && (
                       <div className="space-y-6">
                           {generatedQuiz.questions.map((q, index) => (
                               <div key={index}>
                                   <p className="font-semibold">{index + 1}. {q.question}</p>
                                   <RadioGroup className="mt-2 space-y-2">
                                       {q.options?.map((opt, i) => (
                                           <div key={i} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt} id={`q${index}-opt${i}`} />
                                                <Label htmlFor={`q${index}-opt${i}`}>{opt}</Label>
                                           </div>
                                       ))}
                                   </RadioGroup>
                               </div>
                           ))}
                       </div>
                   )
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button>Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isFlashcardDialogOpen} onOpenChange={setFlashcardDialogOpen}>
        <DialogContent className="max-w-xl">
             <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Copy className="text-blue-500" />
                    Flashcards
                </DialogTitle>
            </DialogHeader>
            <div className="py-4">
                {isFlashcardLoading ? (
                    <div className="flex items-center justify-center h-52">
                        <p className="animate-pulse">Generating your flashcards...</p>
                    </div>
                ) : flashcards.length > 0 ? (
                    <div className="space-y-4">
                         <div className="text-center text-sm text-muted-foreground">
                            Card {currentFlashcardIndex + 1} of {flashcards.length}
                        </div>
                        <div
                            className="relative w-full h-64 cursor-pointer"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <AnimatePresence>
                                <motion.div
                                    key={isFlipped ? 'back' : 'front'}
                                    initial={{ rotateY: isFlipped ? 180 : 0 }}
                                    animate={{ rotateY: 0 }}
                                    exit={{ rotateY: isFlipped ? 0 : -180 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute w-full h-full p-6 flex items-center justify-center text-center rounded-lg border bg-card text-card-foreground shadow-sm"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <p className="text-xl font-semibold">
                                        {isFlipped ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="flex justify-center items-center gap-4">
                            <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.max(0, prev - 1))}} disabled={currentFlashcardIndex === 0}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => setIsFlipped(!isFlipped)}>
                                <RefreshCw className="mr-2 h-4 w-4"/> Flip Card
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.min(flashcards.length - 1, prev + 1))}} disabled={currentFlashcardIndex === flashcards.length - 1}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-52">
                        <p>No flashcards were generated.</p>
                    </div>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button>Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    </>
  );
}
