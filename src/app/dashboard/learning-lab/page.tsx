
'use client';

import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, ChevronLeft, ChevronRight, Wand2, FlaskConical, Lightbulb, Copy, RefreshCw, Check, Star, CheckCircle, Send, Bot, User, GitMerge, PanelLeft, Minimize, Maximize, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import AudioPlayer from '@/components/audio-player';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { addXp, generateMiniCourse, generateQuizFromModule, generateFlashcardsFromModule, generateTutorResponse, generateChapterContent } from '@/lib/actions';
import { RewardContext } from '@/context/RewardContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

export default function LearningLabPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [learnerType, setLearnerType] = useState<string | null>(null);
  
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChapterContentLoading, setChapterContentLoading] = useState(false);


  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const { showReward } = useContext(RewardContext);
  const searchParams = useSearchParams();

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  
  const [isQuizDialogOpen, setQuizDialogOpen] = useState(false);
  const [isQuizLoading, setQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  
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
    
    const savedState = localStorage.getItem('learningLabState');
    const courseIdFromUrl = searchParams.get('courseId');

    if (courseIdFromUrl) {
        setSelectedCourseId(courseIdFromUrl);
    } else if (savedState) {
        const { courseId, moduleIndex, chapterIndex } = JSON.parse(savedState);
        setSelectedCourseId(courseId);
        setCurrentModuleIndex(moduleIndex);
        setCurrentChapterIndex(chapterIndex);
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
            setActiveCourse({ id: courseSnap.id, ...courseSnap.data() } as Course);
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
              courseId: selectedCourseId,
              moduleIndex: currentModuleIndex,
              chapterIndex: currentChapterIndex,
          };
          localStorage.setItem('learningLabState', JSON.stringify(stateToSave));
      }
  }, [selectedCourseId, currentModuleIndex, currentChapterIndex]);


  useEffect(() => {
    setChatHistory([]);
    setChatInput('');
  }, [currentChapterIndex, currentModuleIndex]);

  const handleGenerateCourse = async () => {
    if (!selectedCourseId || !user) return;
    
    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) {
        toast({ variant: 'destructive', title: 'Course not found.' });
        return;
    }

    setIsGenerating(true);
    toast({ title: 'Generating Course Outline...', description: `This might take a minute...` });

    try {
        const result = await generateMiniCourse({
            courseName: course.name,
            courseDescription: course.description || `An in-depth course on ${course.name}`,
            learnerType: (learnerType as any) ?? 'Reading/Writing'
        });

        const newUnits = result.modules.map(module => ({
            id: crypto.randomUUID(),
            name: module.title,
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
            userId: user.uid, // Ensure userId is included in the update
        });

        setActiveCourse(prev => prev ? { ...prev, units: newUnits } : null);
        setCurrentModuleIndex(0);
        setCurrentChapterIndex(0);

        toast({ title: 'Course Outline Ready!', description: 'Your new learning lab structure has been generated.'});
    } catch (error) {
        console.error("Failed to generate course content:", error);
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create content for this course.' });
    } finally {
        setIsGenerating(false);
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

  const handleCompleteAndContinue = async () => {
    const module = activeCourse?.units?.[currentModuleIndex];
    if (!module) return;

    if (currentChapterIndex < module.chapters.length - 1) {
        setCurrentChapterIndex(prev => prev + 1);
    } else if (currentModuleIndex < (activeCourse?.units?.length ?? 0) - 1) {
        setCurrentModuleIndex(prev => prev + 1);
        setCurrentChapterIndex(0);
        toast({ title: "Module Complete!", description: "Moving to the next module." });
    } else {
        toast({ title: "Course Complete!", description: "Congratulations, you've finished the course!" });
    }
  };
  
  const startNewCourse = () => {
    localStorage.removeItem('learningLabState');
    setSelectedCourseId(null);
    setActiveCourse(null);
    setCurrentModuleIndex(0);
    setCurrentChapterIndex(0);
  }
  
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
        setChatHistory(chatHistory); // Revert on error
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

  const handleGenerateChapterContent = async () => {
    if (!activeCourse || !currentModule || !currentChapter || !user) return;
    
    setChapterContentLoading(true);
    try {
        const result = await generateChapterContent({
            courseName: activeCourse.name,
            moduleTitle: currentModule.title,
            chapterTitle: currentChapter.title,
            learnerType: (learnerType as any) ?? 'Reading/Writing',
        });

        const updatedChapter = { ...currentChapter, ...result };
        
        const updatedUnits = activeCourse.units?.map((unit, mIndex) => {
            if (mIndex === currentModuleIndex) {
                return {
                    ...unit,
                    chapters: unit.chapters.map((chap, cIndex) => 
                        cIndex === currentChapterIndex ? updatedChapter : chap
                    ),
                };
            }
            return unit;
        });

        setActiveCourse(prev => prev ? { ...prev, units: updatedUnits } : null);

        const courseRef = doc(db, 'courses', activeCourse.id);
        await updateDoc(courseRef, { units: updatedUnits });

    } catch (error) {
        console.error("Failed to generate chapter content:", error);
        toast({ variant: 'destructive', title: 'Content Generation Failed' });
    } finally {
        setChapterContentLoading(false);
    }
  };

  const currentModule = activeCourse?.units?.[currentModuleIndex];
  const currentChapter = currentModule?.chapters[currentChapterIndex];
  
  const chapterCount = activeCourse?.units?.reduce((acc, unit) => acc + (unit.chapters?.length ?? 0), 0) ?? 0;
  const progress = activeCourse ? (((currentModuleIndex * (currentModule?.chapters.length ?? 1)) + currentChapterIndex + 1) / chapterCount) * 100 : 0;
  
  if (isLoading) {
    return <Loading />;
  }

  if (!selectedCourseId) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Learning Lab</h1>
            <Card className="text-center p-12">
               <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold">Select a Course to Begin</h2>
              <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                Choose one of your courses to start your learning journey.
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
               </div>
            </Card>
        </div>
    );
  }

  if (!activeCourse?.units || activeCourse.units.length === 0) {
      return (
          <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Learning Lab: {activeCourse?.name}</h1>
              <Card className="text-center p-12">
                  <Wand2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">Generate Your Course Curriculum</h2>
                  <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                      Click the button below to have AI create a full, in-depth course structure with modules and chapters.
                  </p>
                  <Button onClick={handleGenerateCourse} disabled={isGenerating}>
                      {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : <><Wand2 className="mr-2 h-4 w-4"/> Generate with AI</>}
                  </Button>
                   <div className="mt-8">
                     <Button variant="link" onClick={startNewCourse}>Or select a different course</Button>
                   </div>
              </Card>
          </div>
      )
  }

  return (
    <>
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
                                    {unit.chapters.map((chapter, cIndex) => (
                                        <li key={chapter.id}>
                                            <button 
                                                onClick={() => { setCurrentModuleIndex(mIndex); setCurrentChapterIndex(cIndex); }}
                                                className={cn(
                                                    "w-full text-left p-2 rounded-md text-sm flex items-center gap-2",
                                                    currentModuleIndex === mIndex && currentChapterIndex === cIndex ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"
                                                )}
                                            >
                                                <CheckCircle size={14} className={cn(currentModuleIndex > mIndex || (currentModuleIndex === mIndex && currentChapterIndex > cIndex) ? "text-green-500" : "text-muted-foreground/50")} />
                                                {chapter.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
                 <div className="mt-4 pt-4 border-t">
                     <Button variant="outline" className="w-full" onClick={startNewCourse}>Start a New Course</Button>
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
                        Complete and Continue <ChevronRight className="ml-2 h-4 w-4"/>
                    </Button>
                </div>
            </div>

            {currentChapter ? (
                 <div className="max-w-4xl mx-auto space-y-8">
                     <h1 className="text-4xl font-bold">{currentChapter.title}</h1>
                     
                     {currentChapter.content ? (
                        <p className="text-muted-foreground text-lg whitespace-pre-wrap leading-relaxed">{currentChapter.content}</p>
                     ) : isChapterContentLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                     ) : (
                         <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-semibold">This chapter is empty.</h3>
                            <p className="text-muted-foreground mt-1 mb-4">Let our AI generate the content for you.</p>
                            <Button onClick={handleGenerateChapterContent}>
                                <Wand2 className="mr-2 h-4 w-4" /> Generate Chapter Content
                            </Button>
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
                             {isChapterContentLoading && !currentChapter.activity ? <Skeleton className="h-4 w-1/2" /> : <p>{currentChapter.activity || 'Generate chapter content to see an activity.'}</p>}
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

const Loading = () => (
    <div className="space-y-6">
        <div>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="text-center p-12">
            <Skeleton className="mx-auto h-12 w-12 rounded-full mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
            <Skeleton className="h-4 w-2/3 mx-auto mb-6" />
            <div className="flex justify-center gap-4">
                <Skeleton className="h-10 w-48" />
            </div>
        </div>
    </div>
);
