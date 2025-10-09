
'use client';

import { useState, useEffect, useContext, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, ChevronLeft, ChevronRight, Wand2, FlaskConical, Lightbulb, Copy, RefreshCw, Check, Star, CheckCircle, Send, Bot, User, GitMerge, PanelLeft, Minimize, Maximize, Loader2, Plus, Trash2, MoreVertical, XCircle, ArrowRight, RotateCcw, Video, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, getDocs, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import AudioPlayer from '@/components/audio-player';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { addCoins, generateMiniCourse, generateQuizFromModule, generateFlashcardsFromModule, generateTutorResponse, generateChapterContent, generateMidtermExam, generateRoadmap } from '@/lib/actions';
import { RewardContext } from '@/context/RewardContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Loading from './loading';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';

type Course = {
    id: string;
    name: string;
    description: string;
    url?: string;
    userId?: string;
    units?: Module[];
};

type Module = {
    id: string;
    title: string;
    chapters: Chapter[];
};

type Chapter = {
    id: string;
    title: string;
    content?: string;
    activity?: string;
    imageUrl?: string;
    diagramUrl?: string;
    videoUrl?: string;
    interactiveTool?: string;
};

type Flashcard = {
    front: string;
    back: string;
};

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

type AnswerFeedback = { question: string; answer: string; correctAnswer: string; isCorrect: boolean; explanation?: string; };

type QuizState = 'configuring' | 'in-progress' | 'results';
type AnswerState = 'unanswered' | 'answered';

function LearningLabComponent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [learnerType, setLearnerType] = useState<string | null>(null);
  
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChapterContentLoading, setChapterContentLoading] = useState<Record<string, boolean>>({});

  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const { showReward } = useContext(RewardContext);

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  
  const [isQuizDialogOpen, setQuizDialogOpen] = useState(false);
  const [isQuizLoading, setQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  
  const [quizState, setQuizState] = useState<QuizState>('configuring');
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<AnswerFeedback[]>([]);

  
  const [isFlashcardDialogOpen, setFlashcardDialogOpen] = useState(false);
  const [isFlashcardLoading, setFlashcardLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  const [isStartLabDialogOpen, setStartLabDialogOpen] = useState(false);
  const [newLabCourseId, setNewLabCourseId] = useState<string | null>(null);
  const [isCourseReadyDialogOpen, setIsCourseReadyDialogOpen] = useState(false);


  const [isRoadmapGenerating, setIsRoadmapGenerating] = useState(false);


  useEffect(() => {
    if (authLoading || !user) return;

    const q = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
        setIsLoading(false);
    });

    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');
    
    const courseIdFromUrl = searchParams.get('courseId');

    if (courseIdFromUrl) {
        setSelectedCourseId(courseIdFromUrl);
         const savedState = localStorage.getItem(`learningLabState_${courseIdFromUrl}`);
        if(savedState) {
            const { moduleIndex, chapterIndex } = JSON.parse(savedState);
            setCurrentModuleIndex(moduleIndex);
            setCurrentChapterIndex(chapterIndex);
        }
    } else {
        setSelectedCourseId(null);
    }

    return () => unsubscribe();
  }, [user, authLoading, searchParams]);
  
  useEffect(() => {
    const loadCourseData = async () => {
        if (!user || !selectedCourseId) {
            setActiveCourse(null);
            return;
        };

        setIsLoading(true);
        const courseRef = doc(db, 'courses', selectedCourseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
            const courseData = { id: courseSnap.id, ...courseSnap.data() } as Course;
            setActiveCourse(courseData);
        } else {
             setActiveCourse(null);
             toast({ variant: 'destructive', title: 'Course not found.' });
        }
        setIsLoading(false);
    }
    loadCourseData();
  }, [selectedCourseId, user, toast]);
  
  useEffect(() => {
      if (selectedCourseId) {
          const stateToSave = {
              moduleIndex: currentModuleIndex,
              chapterIndex: currentChapterIndex,
          };
          localStorage.setItem(`learningLabState_${selectedCourseId}`, JSON.stringify(stateToSave));
      }
  }, [selectedCourseId, currentModuleIndex, currentChapterIndex]);


  useEffect(() => {
    setChatHistory([]);
    setChatInput('');
  }, [currentChapterIndex, currentModuleIndex]);
  
  const currentModule = activeCourse?.units?.[currentModuleIndex];
  const currentChapter = currentModule?.chapters[currentChapterIndex];

  const handleGenerateCourse = async () => {
    if (!newLabCourseId || !user) return;
    
    const course = courses.find(c => c.id === newLabCourseId);
    if (!course) {
        toast({ variant: 'destructive', title: 'Course not found.' });
        return;
    }

    setIsGenerating(true);
    setStartLabDialogOpen(false);
    toast({ title: 'Generating Course Outline...', description: `This might take a minute...` });

    try {
        const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
        const result = await generateMiniCourse({
            courseName: course.name,
            courseDescription: course.description || `An in-depth course on ${course.name}`,
            learnerType,
        });

        const newUnits = result.modules.map(module => ({
            id: crypto.randomUUID(),
            title: module.title,
            chapters: module.chapters.map(chapter => ({ 
                ...chapter, 
                id: crypto.randomUUID(),
            }))
        }));
        
        if (newUnits.length === 0) {
            throw new Error("AI did not generate any modules.");
        }
        
        const courseRef = doc(db, 'courses', course.id);
        await updateDoc(courseRef, { 
            units: newUnits,
            userId: user.uid,
        });
        
        setActiveCourse({ ...course, units: newUnits });
        setSelectedCourseId(course.id);
        setCurrentModuleIndex(0);
        setCurrentChapterIndex(0);
        setIsCourseReadyDialogOpen(true);

    } catch (error) {
        console.error("Failed to generate course content:", error);
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create content for this course.' });
    } finally {
        setIsGenerating(false);
        setNewLabCourseId(null);
    }
  };

   const handleGenerateRoadmap = async (durationInMonths: number) => {
        if (!activeCourse || !user) return;
        
        setIsRoadmapGenerating(true);
        toast({ title: 'Generating Your Roadmap...', description: 'This should be quick!' });

        try {
            const roadmapResult = await generateRoadmap({
                courseName: activeCourse.name,
                durationInMonths: durationInMonths,
                courseDescription: `A comprehensive course on ${activeCourse.name}`,
            });
            
            const newRoadmap = {
                goals: roadmapResult.goals.map(g => ({ ...g, id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, icon: g.icon || 'Flag' })),
                milestones: roadmapResult.milestones.map(m => ({ ...m, id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, icon: m.icon || 'Calendar', completed: false }))
            };

            const roadmapsQuery = query(collection(db, 'roadmaps'), where('courseId', '==', activeCourse.id));
            const roadmapSnapshot = await getDocs(roadmapsQuery);
            if (!roadmapSnapshot.empty) {
                const roadmapDoc = roadmapSnapshot.docs[0];
                await updateDoc(roadmapDoc.ref, newRoadmap);
            } else {
                await addDoc(collection(db, 'roadmaps'), { ...newRoadmap, courseId: activeCourse.id, userId: user.uid });
            }

            toast({ title: 'Roadmap Updated!', description: 'Your study plan now reflects your chosen pace.'});

        } catch (error) {
            console.error('Roadmap generation failed:', error);
            toast({ variant: 'destructive', title: 'Roadmap Generation Failed' });
        } finally {
            setIsRoadmapGenerating(false);
        }
    };


  const handleStartModuleQuiz = async (module: Module) => {
    const moduleContent = module.chapters.map(c => `Chapter: ${c.title}\n${c.content}`).join('\n\n');
    setQuizDialogOpen(true);
    setQuizLoading(true);
    setGeneratedQuiz(null);
    setQuizAnswers([]);
    setQuizState('in-progress');
    setCurrentQuizQuestionIndex(0);
    setSelectedQuizAnswer(null);
    
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

  const handleStartMidtermExam = async () => {
    if (!activeCourse || !activeCourse.units) return;

    const middleModuleIndex = Math.floor(activeCourse.units.length / 2);
    const firstHalfContent = activeCourse.units
        .slice(0, middleModuleIndex)
        .flatMap(unit => unit.chapters)
        .map(c => `Chapter: ${c.title}\n${c.content}`)
        .join('\n\n');

    setQuizDialogOpen(true);
    setQuizLoading(true);
    setGeneratedQuiz(null);
    setQuizAnswers([]);
    setQuizState('in-progress');
    setCurrentQuizQuestionIndex(0);
    setSelectedQuizAnswer(null);
    
    try {
        const result = await generateMidtermExam({
            courseContent: firstHalfContent,
            learnerType: (learnerType as any) ?? 'Reading/Writing'
        });
        setGeneratedQuiz(result);
    } catch(error) {
        console.error("Failed to generate midterm:", error);
        toast({
            variant: 'destructive',
            title: 'Midterm Generation Failed',
            description: 'Could not generate a midterm for this course.',
        });
        setQuizDialogOpen(false);
    } finally {
        setQuizLoading(false);
    }
  };


  const handleSubmitQuizAnswer = async () => {
    if (!generatedQuiz || selectedQuizAnswer === null || !user || !currentModule) return;
        
    const currentQuestion = generatedQuiz.questions[currentQuizQuestionIndex];
    const isCorrect = selectedQuizAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();

    const answerFeedback: AnswerFeedback = {
        question: currentQuestion.question,
        answer: selectedQuizAnswer,
        correctAnswer: currentQuestion.answer,
        isCorrect: isCorrect,
    };
    
    const newQuizAnswers = [...quizAnswers, answerFeedback];
    setQuizAnswers(newQuizAnswers);
    setSelectedQuizAnswer(null);

    if (currentQuizQuestionIndex < generatedQuiz.questions.length - 1) {
        setCurrentQuizQuestionIndex(prev => prev + 1);
    } else {
        setQuizState('results');
        const correctCount = newQuizAnswers.filter(a => a.isCorrect).length;
        const totalQuestions = newQuizAnswers.length;
        
        let coinsEarned = correctCount * 10;
        if (isMidtermModule) coinsEarned *= 2; // Double coins for midterm

        for (const answer of newQuizAnswers) {
            if (!answer.isCorrect) {
                try {
                    await addDoc(collection(db, 'quizAttempts'), {
                        userId: user.uid,
                        courseId: selectedCourseId,
                        topic: currentModule.title,
                        question: answer.question,
                        userAnswer: answer.answer,
                        correctAnswer: answer.correctAnswer,
                        timestamp: serverTimestamp()
                    });
                } catch (error) {
                    console.error("Error saving incorrect answer:", error);
                }
            }
        }
        
        if (coinsEarned > 0) {
            showReward({ type: 'coins', amount: coinsEarned });
            try {
                await addCoins(user.uid, coinsEarned);
                toast({ title: "Quiz Complete!", description: `You earned ${coinsEarned} coins!` });

            } catch(e) {
                console.error("Error awarding coins:", e);
            }
        } else {
             toast({ title: "Quiz Complete!", description: `You earned 0 coins.` });
        }
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
  
  const handleGenerateChapterContent = async (moduleIndex: number, chapterIndex: number) => {
    if (!activeCourse || !user || !learnerType) return false;
    
    const module = activeCourse.units?.[moduleIndex];
    const chapter = module?.chapters?.[chapterIndex];

    if(!module || !chapter || chapter.content) {
        return true; // Already has content, or invalid state, just proceed
    }

    const chapterId = chapter.id;
    setChapterContentLoading(prev => ({ ...prev, [chapterId]: true }));

    try {
        const result = await generateChapterContent({
            courseName: activeCourse.name,
            moduleTitle: module.title,
            chapterTitle: chapter.title,
            learnerType: learnerType as any,
        });

        const updatedChapter = { ...chapter, ...result };
        
        const updatedUnits = activeCourse.units?.map((unit, mIdx) => {
            if (mIdx === moduleIndex) {
                return {
                    ...unit,
                    chapters: unit.chapters.map((chap, cIdx) => 
                        cIdx === chapterIndex ? updatedChapter : chap
                    ),
                };
            }
            return unit;
        });

        setActiveCourse(prev => prev ? { ...prev, units: updatedUnits } : null);

        const courseRef = doc(db, 'courses', activeCourse.id);
        await updateDoc(courseRef, { units: updatedUnits });
        return true;

    } catch (error) {
        console.error("Failed to generate chapter content:", error);
        toast({ variant: 'destructive', title: 'Content Generation Failed' });
        return false;
    } finally {
        setChapterContentLoading(prev => ({ ...prev, [chapterId]: false }));
    }
  };

  const handleCompleteAndContinue = async () => {
    if (!activeCourse || !user) return;
    const module = activeCourse.units?.[currentModuleIndex];
    if (!module) return;

    // Check if the current chapter is a quiz and if it has been completed
    if (currentChapter?.title === 'Module Quiz' && quizState !== 'results') {
        toast({
            variant: 'destructive',
            title: 'Quiz Required',
            description: 'You must complete the module quiz before continuing.',
        });
        return;
    }

    if (currentChapterIndex < module.chapters.length - 1) {
        const nextChapterIndex = currentChapterIndex + 1;
        setCurrentChapterIndex(nextChapterIndex); // Move to next chapter immediately
        const generated = await handleGenerateChapterContent(currentModuleIndex, nextChapterIndex);
        if (!generated) {
            setCurrentChapterIndex(currentChapterIndex); // Revert if generation fails
        }
    } else if (currentModuleIndex < (activeCourse.units?.length ?? 0) - 1) {
        const nextModuleIndex = currentModuleIndex + 1;
        setCurrentModuleIndex(nextModuleIndex);
        setCurrentChapterIndex(0);
        const generated = await handleGenerateChapterContent(nextModuleIndex, 0);
        if (generated) {
            toast({ title: "Module Complete!", description: "Moving to the next module." });
        } else {
             setCurrentModuleIndex(currentModuleIndex); // Revert
             setCurrentChapterIndex(currentChapterIndex);
        }
    } else {
        toast({ title: "Course Complete!", description: "Congratulations, you've finished the course!" });
        try {
            const courseRef = doc(db, 'courses', activeCourse.id);
            await updateDoc(courseRef, {
                labCompleted: true
            });
            await addCoins(user.uid, 500); // Award 500 coins for course completion
            showReward({ type: 'coins', amount: 500 });
        } catch (error) {
            console.error("Error completing course:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save course completion status.' });
        }
    }
  };
  
  const startNewCourse = () => {
    localStorage.removeItem(`learningLabState_${selectedCourseId}`);
    setSelectedCourseId(null);
    setActiveCourse(null);
    setCurrentModuleIndex(0);
    setCurrentChapterIndex(0);
    const url = new URL(window.location.href);
    url.searchParams.delete('courseId');
    window.history.pushState({}, '', url.toString());
  }

  const handleDeleteLab = async (courseId: string) => {
    if (!user) return;
    try {
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, {
            units: [] // Set units to an empty array
        });
        localStorage.removeItem(`learningLabState_${courseId}`);
        toast({ title: 'Learning Lab Deleted', description: 'The generated content for this course has been removed.' });
    } catch (error) {
        console.error("Error deleting lab:", error);
        toast({ variant: 'destructive', title: 'Deletion Failed' });
    }
  };
  
  const handleSendTutorMessage = async () => {
    if (!chatInput.trim() || !currentChapter || !currentChapter.content) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setIsTutorLoading(true);

    try {
        const response = await generateTutorResponse({
            chapterContext: currentChapter.content,
            question: chatInput,
        });
        const aiMessage: ChatMessage = { role: 'ai', content: response.answer };
        setChatHistory([...newHistory, aiMessage]);
    } catch (error) {
        console.error("Tutor chat error:", error);
        toast({ variant: 'destructive', title: 'AI Tutor Error', description: 'Could not get a response.'});
        setChatHistory(chatHistory);
    } finally {
        setIsTutorLoading(false);
    }
  }

  const toggleFocusMode = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFocusMode(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const startFirstChapter = async () => {
    setIsCourseReadyDialogOpen(false);
    await handleGenerateChapterContent(0, 0);
  }
  
  const chapterCount = activeCourse?.units?.reduce((acc, unit) => acc + (unit.chapters?.length ?? 0), 0) ?? 0;
  const progress = activeCourse && chapterCount > 0 ? (((currentModuleIndex * (currentModule?.chapters.length ?? 1)) + currentChapterIndex + 1) / chapterCount) * 100 : 0;
  
  if (isLoading) {
    return <Loading />;
  }

  if (!selectedCourseId || !activeCourse) {
      const coursesWithLabs = courses.filter(c => c.units && c.units.length > 0);
      return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Learning Lab</h1>
                    <p className="text-muted-foreground">Hands-on, interactive learning sessions for your courses.</p>
                </div>
                 <Dialog open={isStartLabDialogOpen} onOpenChange={setStartLabDialogOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={isGenerating}>
                            <Plus className="mr-2 h-4 w-4"/> Start a New Learning Lab
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Start a New Learning Lab</DialogTitle>
                            <DialogDescription>
                                Select a course to generate a new interactive learning lab. This will create a structured set of modules and chapters for you to work through.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <Label htmlFor="course-select">Select a Course</Label>
                            <Select onValueChange={setNewLabCourseId}>
                                <SelectTrigger id="course-select">
                                    <SelectValue placeholder="Choose a course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleGenerateCourse} disabled={!newLabCourseId || isGenerating}>
                                {isGenerating ? 'Generating...' : 'Generate & Start Lab'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            {coursesWithLabs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coursesWithLabs.map(course => {
                        const totalChapters = course.units?.reduce((acc, unit) => acc + (unit.chapters?.length ?? 0), 0) ?? 0;
                        const savedState = typeof window !== 'undefined' ? localStorage.getItem(`learningLabState_${course.id}`) : null;
                        let completedChapters = 0;
                        if(savedState){
                            const { moduleIndex, chapterIndex } = JSON.parse(savedState);
                            let chaptersCounted = 0;
                            for(let i=0; i<moduleIndex; i++) {
                                chaptersCounted += course.units?.[i].chapters.length ?? 0;
                            }
                            completedChapters = chaptersCounted + chapterIndex;
                        }
                        const courseProgress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
                        
                        return (
                        <Card key={course.id} className="hover:shadow-md transition-shadow flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{course.name}</CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Delete Lab
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will delete all generated modules and chapters for this lab. Your original course will not be affected.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteLab(course.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardDescription>{totalChapters} chapters</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{Math.round(courseProgress)}% Complete</p>
                                    <Progress value={courseProgress} className="h-2" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => setSelectedCourseId(course.id)}>
                                    Continue Learning
                                </Button>
                            </CardFooter>
                        </Card>
                    )})}
                </div>
            ) : (
                <Card className="text-center p-12">
                   <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">No Learning Labs Created Yet</h2>
                  <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                    Click "Start a New Learning Lab" to generate your first interactive course.
                  </p>
                </Card>
            )}
        </div>
    );
  }
  
  const isMidtermModule = activeCourse.units && currentModuleIndex === Math.floor(activeCourse.units.length / 2);

  if (currentChapter?.title === 'Module Quiz' && currentModule) {
    const score = quizAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = generatedQuiz?.questions.length ?? 0;
    const currentQuizQuestion = generatedQuiz?.questions[currentQuizQuestionIndex];
    const quizProgress = totalQuestions > 0 ? ((currentQuizQuestionIndex) / totalQuestions) * 100 : 0;
    
    return (
      <>
        {quizState === 'configuring' && (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
                <h2 className="text-2xl font-bold">{isMidtermModule ? 'Midterm Exam' : `Module Quiz: ${currentModule.title}`}</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                    {isMidtermModule 
                        ? "This is a 35-question exam covering all material from the first half of the course." 
                        : "Test your knowledge on the chapters you've just completed. A good score will earn you coins!"
                    }
                </p>
                <Button className="mt-6" onClick={isMidtermModule ? handleStartMidtermExam : () => handleStartModuleQuiz(currentModule)} disabled={isQuizLoading}>
                    {isQuizLoading ? 'Loading...' : `Start ${isMidtermModule ? 'Midterm Exam' : 'Quiz'}`}
                </Button>
            </div>
        )}

        {quizState === 'in-progress' && isQuizLoading && (
           <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
        )}
        
        {quizState === 'in-progress' && !isQuizLoading && currentQuizQuestion && (
            <div className="flex flex-col items-center">
                 <div className="text-center mb-10 w-full max-w-3xl">
                    <p className="text-muted-foreground mb-2">Question {currentQuizQuestionIndex + 1} of {totalQuestions}</p>
                    <Progress value={quizProgress} className="mb-4 h-2"/>
                    <h1 className="text-3xl font-bold mt-8">{currentQuizQuestion.question}</h1>
                </div>
                 <Card className="w-full max-w-3xl">
                    <CardContent className="p-8">
                         <RadioGroup value={selectedQuizAnswer ?? ''} onValueChange={setSelectedQuizAnswer}>
                            <div className="space-y-4">
                            {currentQuizQuestion.options?.map((option, index) => (
                                <Label key={index} htmlFor={`option-${index}`} className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                    "border-border hover:bg-muted",
                                    selectedQuizAnswer === option && "border-primary bg-primary/10"
                                )}>
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <span>{option}</span>
                                </Label>
                            ))}
                            </div>
                        </RadioGroup>
                         <div className="mt-8 flex justify-end">
                            <Button onClick={handleSubmitQuizAnswer} disabled={!selectedQuizAnswer}>
                                {currentQuizQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

        {quizState === 'results' && (
            <div className="flex flex-col items-center">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold">Quiz Results</h1>
                    <p className="text-muted-foreground mt-2">Here's how you did on the {isMidtermModule ? 'Midterm' : currentModule.title} quiz.</p>
                </div>
                 <Card className="w-full max-w-3xl">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-semibold">Your Score</h2>
                        <p className="text-6xl font-bold text-primary my-4">{score} / {totalQuestions}</p>
                        <p className="text-muted-foreground">You answered {totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(0) : 0}% of the questions correctly.</p>

                        <div className="mt-8 flex justify-center gap-4">
                            <Button onClick={() => setQuizState('configuring')}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Take Again
                            </Button>
                            <Button variant="outline" onClick={() => { setQuizDialogOpen(false); handleCompleteAndContinue(); }}>
                                Continue to Next Section <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
      </>
    )
  }

  return (
    <>
      <Dialog open={isCourseReadyDialogOpen} onOpenChange={setIsCourseReadyDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Your Learning Lab is Ready!</DialogTitle>
                <DialogDescription>
                    We've created a custom outline for your course. Are you ready to generate the first chapter and dive in?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCourseReadyDialogOpen(false)}>I'll start later</Button>
                <Button onClick={startFirstChapter}>
                    Let's Go!
                    <Wand2 className="ml-2 h-4 w-4"/>
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className={cn("flex h-full", isFocusMode && "bg-background")}>
        <aside className={cn(
            "h-full bg-card border-r transition-all duration-300",
            isSidebarOpen ? "w-80 p-4" : "w-0 p-0 overflow-hidden"
        )}>
             <div className="flex flex-col h-full">
                <div className="mb-4">
                    <h2 className="text-lg font-bold">{activeCourse?.name}</h2>
                    <p className="text-sm text-muted-foreground">{chapterCount} Chapters</p>
                    <Progress value={progress} className="mt-2 h-2" />
                </div>
                 <Accordion type="multiple" defaultValue={activeCourse?.units?.map(u => u.id)} className="w-full flex-1 overflow-y-auto">
                    {activeCourse?.units?.map((unit, mIndex) => (
                        <AccordionItem key={unit.id} value={unit.id}>
                            <AccordionTrigger className="text-md font-semibold">{unit.title}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-1 pl-4">
                                    {unit.chapters.map((chapter, cIndex) => {
                                        const isCurrent = currentModuleIndex === mIndex && currentChapterIndex === cIndex;
                                        const isCompleted = currentModuleIndex > mIndex || (currentModuleIndex === mIndex && currentChapterIndex > cIndex);
                                        const isLocked = !chapter.content && !isCurrent;
                                        
                                        return (
                                        <li key={chapter.id}>
                                            <button 
                                                onClick={() => {
                                                    if (isLocked) {
                                                        toast({ variant: 'destructive', description: "Complete the previous chapter to unlock this one." });
                                                    } else {
                                                        setCurrentModuleIndex(mIndex);
                                                        setCurrentChapterIndex(cIndex);
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full text-left p-2 rounded-md text-sm flex items-center gap-2",
                                                    isCurrent ? "bg-primary/10 text-primary font-semibold" : (isLocked ? "text-muted-foreground/50 cursor-not-allowed" : "hover:bg-muted")
                                                )}
                                                disabled={isLocked}
                                            >
                                                <CheckCircle size={14} className={cn(isCompleted ? "text-green-500" : "text-muted-foreground/50")} />
                                                {chapter.title}
                                            </button>
                                        </li>
                                    )})}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
                 <div className="mt-4 pt-4 border-t">
                     <Button variant="outline" className="w-full" onClick={startNewCourse}>Back to Labs Overview</Button>
                 </div>
             </div>
        </aside>
        
        <main className="flex-1 p-6 overflow-y-auto">
             <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <PanelLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={toggleFocusMode}>
                        {isFocusMode ? <Minimize className="mr-2 h-4 w-4"/> : <Maximize className="mr-2 h-4 w-4"/>}
                        {isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
                    </Button>
                    <Button onClick={handleCompleteAndContinue}>
                        {currentChapter?.title === 'Module Quiz' ? 'Continue' : 'Complete & Continue'} <ChevronRight className="ml-2 h-4 w-4"/>
                    </Button>
                </div>
            </div>

            {currentChapter && currentModule ? (
                 <div className="max-w-4xl mx-auto space-y-8">
                     <h1 className="text-4xl font-bold">{currentChapter.title}</h1>
                     
                      {isChapterContentLoading[currentChapter.id] ? (
                        <div className="space-y-4">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ) : currentChapter.content ? (
                         <div className='space-y-4'>
                            {currentChapter.imageUrl && (
                                <div className="mt-4 rounded-lg overflow-hidden border aspect-video relative">
                                    <Image src={currentChapter.imageUrl} alt={`Header for ${currentChapter.title}`} layout="fill" objectFit="cover" />
                                </div>
                            )}
                            <p className="text-muted-foreground text-lg whitespace-pre-wrap leading-relaxed">{currentChapter.content}</p>
                            {currentChapter.diagramUrl && (
                                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                    <h5 className="font-semibold text-sm mb-2 flex items-center gap-2"><ImageIcon size={16} /> Diagram</h5>
                                    <div className="rounded-lg overflow-hidden border aspect-video relative">
                                        <Image src={currentChapter.diagramUrl} alt={`Diagram for ${currentChapter.title}`} layout="fill" objectFit="contain" />
                                    </div>
                                </div>
                            )}
                                {currentChapter.videoUrl && (
                                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                    <h5 className="font-semibold text-sm mb-2 flex items-center gap-2"><Video size={16} /> Video Clip</h5>
                                    <div className="rounded-lg overflow-hidden border aspect-video bg-black">
                                        <video src={currentChapter.videoUrl} controls className="w-full h-full" />
                                    </div>
                                </div>
                            )}
                        </div>
                     ) : (
                         <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-semibold">This chapter's content hasn't been generated yet.</h3>
                            <p className="text-muted-foreground mt-1 mb-4">Click "Complete and Continue" on the previous chapter to unlock this one.</p>
                        </div>
                     )}
                     
                    {currentChapter.interactiveTool && (
                        <div className="p-6 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <h5 className="font-semibold flex items-center gap-2 text-blue-700">
                                <FlaskConical size={18} /> Interactive Tool
                            </h5>
                            <div className="mt-4 aspect-video">
                                <iframe
                                    src={currentChapter.interactiveTool}
                                    className="w-full h-full border-0 rounded-md"
                                    allowFullScreen
                                    title={`Interactive tool for ${currentChapter.title}`}
                                ></iframe>
                            </div>
                        </div>
                    )}


                     <div className="p-6 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <h5 className="font-semibold flex items-center gap-2 text-amber-700"><Lightbulb size={18}/> Suggested Activity</h5>
                        <div className="text-muted-foreground mt-2">
                             {isChapterContentLoading[currentChapter.id] && !currentChapter.activity ? <Skeleton className="h-4 w-1/2" /> : <p>{currentChapter.activity || 'Generate chapter content to see an activity.'}</p>}
                        </div>
                    </div>
                     
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Tutor</CardTitle>
                            <CardDescription>Have a question about this chapter? Ask away!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 h-64 overflow-y-auto p-4 bg-muted rounded-md mb-4">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                         {msg.role === 'ai' && <Avatar><AvatarFallback><Bot size={20}/></AvatarFallback></Avatar>}
                                         <div className={cn("rounded-lg p-3 max-w-lg", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border')}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                         </div>
                                         {msg.role === 'user' && <Avatar><AvatarFallback><User size={20}/></AvatarFallback></Avatar>}
                                    </div>
                                ))}
                                {isTutorLoading && (
                                     <div className="flex items-start gap-3">
                                        <Avatar><AvatarFallback><Bot size={20}/></AvatarFallback></Avatar>
                                        <div className="rounded-lg p-3 bg-background border animate-pulse">Thinking...</div>
                                     </div>
                                )}
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Input 
                                    placeholder="Ask a question about this chapter..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !isTutorLoading && handleSendTutorMessage()}
                                    disabled={isTutorLoading || !currentChapter.content}
                                />
                                <Button onClick={handleSendTutorMessage} disabled={isTutorLoading || !currentChapter.content}>
                                    <Send size={16}/>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">Select a chapter to begin.</p>
                </div>
            )}
        </main>
      </div>
    </>
  );
}

export default function LearningLabClientPage() {
    return (
        <Suspense fallback={<Loading />}>
            <LearningLabComponent />
        </Suspense>
    )
}
