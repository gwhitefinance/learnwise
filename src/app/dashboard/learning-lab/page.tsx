
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, Play, Pause, ChevronLeft, ChevronRight, Wand2, FlaskConical, Lightbulb, Copy, RefreshCw, Check, Star } from 'lucide-react';
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

type Course = {
    id: string;
    name: string;
    description: string;
    url?: string;
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
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isCourseComplete, setIsCourseComplete] = useState(false);
  const { toast } = useToast();

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
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');
  }, []);

  const handleGenerateCourse = async () => {
    if (!selectedCourseId) {
        toast({ variant: 'destructive', title: 'Please select a course.'});
        return;
    }
    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) return;

    setIsLoading(true);
    setMiniCourse(null);
    setCurrentModuleIndex(0);
    setIsCourseComplete(false);
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

  const handleGenerateQuiz = async (moduleContent: string) => {
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
  
  const handleGenerateFlashcards = async (moduleContent: string) => {
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

  const handleMarkComplete = () => {
    setIsCourseComplete(true);
    toast({
        title: "🎉 Congratulations! 🎉",
        description: "You've completed the mini-course! Great job!",
    })
  }

  const progress = miniCourse ? ((currentModuleIndex + 1) / miniCourse.modules.length) * 100 : 0;
  const currentModule: Module | null = miniCourse ? miniCourse.modules[currentModuleIndex] : null;

  const startNewCourse = () => {
    setMiniCourse(null);
    setSelectedCourseId(null);
    setIsCourseComplete(false);
  }

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
                <CardDescription>
                    A mini-course generated from your uploaded materials, tailored to your learning style.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} />
                </CardContent>
            </Card>
            
            {isCourseComplete ? (
                 <Card className="text-center p-12">
                    <Star className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                    <h2 className="text-xl font-semibold">Course Complete!</h2>
                    <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                        Fantastic work! You've successfully completed this mini-course.
                    </p>
                    <Button onClick={startNewCourse}>
                        Start a New Course
                    </Button>
                </Card>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            {isLoading ? (
                                <>
                                 <Skeleton className="h-6 w-3/4 mb-2"/>
                                 <Skeleton className="h-4 w-1/2"/>
                                </>
                            ) : (
                                <>
                                <CardTitle>Module {currentModuleIndex + 1}: {currentModule?.title}</CardTitle>
                                <CardDescription>Engage with the content below. The format is adapted to your learning style.</CardDescription>
                                </>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-4 w-1/4 mb-2" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2 mb-6">
                                        <h3 className="font-semibold text-lg">Content</h3>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{currentModule?.content}</p>
                                    </div>
                                    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 mb-6">
                                        <h4 className="font-semibold flex items-center gap-2 text-amber-700"><Lightbulb/> Suggested Activity</h4>
                                        <p className="text-muted-foreground mt-2">{currentModule?.activity}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => handleGenerateQuiz(currentModule?.content ?? '')}>
                                            <Lightbulb className="mr-2 h-4 w-4"/> Checkpoint Quiz
                                        </Button>
                                        <Button variant="outline" onClick={() => handleGenerateFlashcards(currentModule?.content ?? '')}>
                                            <Copy className="mr-2 h-4 w-4"/> Generate Flashcards
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-around">
                            <Button variant="outline" size="icon" onClick={() => setCurrentModuleIndex(prev => Math.max(0, prev - 1))} disabled={currentModuleIndex === 0 || isLoading}>
                                <ChevronLeft />
                            </Button>
                            <div className="text-center">
                                <p className="font-bold text-lg">{currentModuleIndex + 1} / {miniCourse?.modules.length ?? '?'}</p>
                                <p className="text-sm text-muted-foreground">Module</p>
                            </div>
                            <Button variant="outline" size="icon" onClick={() => setCurrentModuleIndex(prev => Math.min(miniCourse!.modules.length - 1, prev + 1))} disabled={!miniCourse || currentModuleIndex === miniCourse.modules.length - 1 || isLoading}>
                                <ChevronRight />
                            </Button>
                        </CardContent>
                        {miniCourse && currentModuleIndex === miniCourse.modules.length - 1 && (
                            <CardContent>
                                 <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleMarkComplete}>
                                    <Check className="mr-2 h-4 w-4"/> Mark as Complete
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Start Over</CardTitle>
                            <CardDescription>Generate a new course or select a different one.</CardDescription>
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
                    Checkpoint Quiz
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
