
'use client';

import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, ChevronLeft, ChevronRight, Wand2, FlaskConical, Lightbulb, Copy, RefreshCw, Check, Star, CheckCircle, Send, Bot, User, GitMerge } from 'lucide-react';
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
import { addXp, generateMiniCourse, generateQuizFromModule, generateFlashcardsFromModule, generateTutorResponse } from '@/lib/actions';
import { RewardContext } from '@/context/RewardContext';
import { Roadmap, Milestone } from '@/app/dashboard/roadmaps/page';

type Course = {
    id: string;
    name: string;
    description: string;
    url?: string;
    userId?: string;
};

type Module = {
    id: string; // Corresponds to milestone.id
    title: string;
    chapters: Chapter[];
};

type Chapter = {
    id: string;
    title: string;
    content: string;
    activity: string;
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
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [courseContent, setCourseContent] = useState<Record<string, Module>>({}); // Maps milestone.id to Module
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCourseComplete, setIsCourseComplete] = useState(false);
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const { showReward } = useContext(RewardContext);
  const searchParams = useSearchParams();

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

  // Tutor Chat states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);


  useEffect(() => {
    if (authLoading || !user) return;

    const q = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
        const courseIdFromUrl = searchParams.get('courseId');
        if (courseIdFromUrl && userCourses.some(c => c.id === courseIdFromUrl)) {
            setSelectedCourseId(courseIdFromUrl);
        }
    });

    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');

    return () => unsubscribe();
  }, [user, authLoading, searchParams]);
  
  // Effect to load roadmap and content when selectedCourseId changes
  useEffect(() => {
    const loadRoadmap = async () => {
        if (!user || !selectedCourseId) {
            setRoadmap(null);
            setCourseContent({});
            return;
        };

        setIsLoading(true);
        const roadmapsQuery = query(collection(db, 'roadmaps'), where('userId', '==', user.uid), where('courseId', '==', selectedCourseId));
        const roadmapsSnap = await getDocs(roadmapsQuery);

        if (!roadmapsSnap.empty) {
            const roadmapData = { id: roadmapsSnap.docs[0].id, ...roadmapsSnap.docs[0].data() } as Roadmap;
            setRoadmap(roadmapData);

            // If a milestone title is in the URL, find its index and set the state
            const milestoneTitle = searchParams.get('milestone');
            if (milestoneTitle) {
                const decodedTitle = decodeURIComponent(milestoneTitle);
                const moduleIndex = roadmapData.milestones.findIndex(m => m.title === decodedTitle);
                if (moduleIndex !== -1) {
                    setCurrentModuleIndex(moduleIndex);
                    setCurrentChapterIndex(0);
                }
            }

        } else {
            setRoadmap(null);
        }
        
        // Load existing course content from Firestore
        const courseRef = doc(db, 'courses', selectedCourseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
            setCourseContent(courseSnap.data()?.content || {});
        }

        setIsLoading(false);
    }
    loadRoadmap();
  }, [selectedCourseId, user]);
  
  useEffect(() => {
    // Reset chat when chapter or module changes
    setChatHistory([]);
    setChatInput('');
  }, [currentChapterIndex, currentModuleIndex]);

  const handleGenerateModuleContent = async (milestone: Milestone) => {
    if (!milestone || !selectedCourseId || !user) return;
    
    // Don't regenerate if content already exists
    if (courseContent[milestone.id]) return;

    setIsLoading(true);
    toast({ title: 'Generating Module...', description: `The AI is crafting content for "${milestone.title}".` });

    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) {
        toast({ variant: 'destructive', title: 'Course not found.'});
        setIsLoading(false);
        return;
    }

    try {
        // Here we adapt generateMiniCourse to act like it's generating a single module.
        // The prompt asks for an in-depth course, so we use the milestone as the course topic.
        const result = await generateMiniCourse({
            courseName: milestone.title,
            courseDescription: `An in-depth module about ${milestone.description} as part of the larger course on ${course.name}.`,
            learnerType: (learnerType as any) ?? 'Reading/Writing'
        });

        // We take the first generated module as our new content.
        const newModule: Module = {
            id: milestone.id,
            title: milestone.title,
            chapters: result.modules[0]?.chapters.map(c => ({...c, id: crypto.randomUUID()})) || []
        };
        
        if (newModule.chapters.length === 0) {
            throw new Error("AI did not generate any chapters for this module.");
        }
        
        const updatedContent = { ...courseContent, [milestone.id]: newModule };
        setCourseContent(updatedContent);

        // Save the new content to Firestore
        const courseRef = doc(db, 'courses', selectedCourseId);
        await updateDoc(courseRef, { content: updatedContent });

        toast({ title: 'Module Ready!', description: 'Your new learning module has been generated.'});
    } catch (error) {
        console.error("Failed to generate module content:", error);
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create content for this module.' });
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

  const handleMarkModuleComplete = async (moduleIndex: number) => {
    if (!roadmap || !user) return;

    const milestone = roadmap.milestones[moduleIndex];
    if (milestone.completed) return;
    
    // Optimistically update UI
    const updatedMilestones = roadmap.milestones.map((m, i) => i === moduleIndex ? {...m, completed: true} : m);
    setRoadmap({...roadmap, milestones: updatedMilestones});

    try {
      const roadmapRef = doc(db, 'roadmaps', roadmap.id);
      await updateDoc(roadmapRef, { milestones: updatedMilestones });
      
      const xpToAward = 50;
      const { levelUp, newLevel, newCoins } = await addXp(user.uid, xpToAward);
      
      if (levelUp) {
        showReward({ type: 'levelUp', level: newLevel, coins: newCoins });
      } else {
        showReward({ type: 'xp', amount: xpToAward });
      }

      toast({ title: 'Milestone Complete!', description: "Great job! Keep up the momentum." });

    } catch (error) {
      console.error("Error updating milestone/XP:", error);
      toast({ variant: 'destructive', title: 'Error', description: "Could not mark module as complete."})
       // Revert optimistic update
       setRoadmap(roadmap);
    }

    if (updatedMilestones.every(m => m.completed)) {
        setIsCourseComplete(true);
    } else if (moduleIndex < roadmap.milestones.length - 1) {
        setCurrentModuleIndex(moduleIndex + 1);
        setCurrentChapterIndex(0);
    }
  }

  const startNewCourse = () => {
    setSelectedCourseId(null);
    setRoadmap(null);
    setCourseContent({});
    setIsCourseComplete(false);
  }
  
  const handleNextChapter = () => {
    if (!currentModule) return;
    if (currentChapterIndex < currentModule.chapters.length - 1) {
        setCurrentChapterIndex(prev => prev + 1);
    }
  };
  
  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
        setCurrentChapterIndex(prev => prev - 1);
    } else if (currentModuleIndex > 0) {
        const prevModuleIndex = currentModuleIndex - 1;
        setCurrentModuleIndex(prevModuleIndex);
        
        const prevModuleMilestone = roadmap?.milestones[prevModuleIndex];
        const prevModuleContent = prevModuleMilestone ? courseContent[prevModuleMilestone.id] : undefined;
        setCurrentChapterIndex(prevModuleContent ? prevModuleContent.chapters.length - 1 : 0);
    }
  };
  
  const handleSendTutorMessage = async () => {
    if (!chatInput.trim() || !currentChapter) return;

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

  const currentMilestone = roadmap?.milestones[currentModuleIndex];
  const currentModule = currentMilestone ? courseContent[currentMilestone.id] : null;
  const currentChapter = currentModule?.chapters[currentChapterIndex];
  const isLastChapterInModule = currentModule ? currentChapterIndex === currentModule.chapters.length - 1 : false;
  
  const progress = roadmap ? (roadmap.milestones.filter(m => m.completed).length / roadmap.milestones.length) * 100 : 0;
  
  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Lab</h1>
        <p className="text-muted-foreground">
          Your personalized learning environment, generated by AI.
        </p>
      </div>

       {!selectedCourseId && !isLoading && (
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
      )}
      
      {selectedCourseId && !roadmap && !isLoading && (
         <Card className="text-center p-12">
           <GitMerge className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">No Roadmap Found</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            This course doesn't have a study roadmap yet. Generate one to create your learning lab.
          </p>
          <Link href="/dashboard/roadmaps">
            <Button><GitMerge className="mr-2 h-4 w-4"/> Go to Roadmaps</Button>
          </Link>
        </Card>
      )}

      {(isLoading || roadmap) && (
          <>
            <Card>
                <CardHeader>
                <CardTitle>Now Learning: {courses.find(c => c.id === selectedCourseId)?.name ?? <Skeleton className="h-6 w-2/3"/>}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-medium">
                        <span>Overall Progress ({roadmap?.milestones.filter(m => m.completed).length ?? 0} / {roadmap?.milestones.length ?? 0})</span>
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
            ) : isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="md:col-span-2"> <Skeleton className="h-96 w-full" /> </div>
                    <div className="space-y-4"> <Skeleton className="h-64 w-full" /> </div>
                </div>
            ) : roadmap && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-6">
                    {currentModule ? (
                        currentChapter ? (
                        <Card>
                            <CardHeader>
                                <CardTitle> Chapter {currentChapterIndex + 1}: {currentChapter.title} </CardTitle>
                                <CardDescription> Module {currentModuleIndex + 1}: {currentModule?.title} </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                     <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        <AudioPlayer textToPlay={currentChapter.content} />
                                        <p>{currentChapter.content}</p>
                                     </div>
                                    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                        <h5 className="font-semibold flex items-center gap-2 text-amber-700 text-sm"><Lightbulb size={16}/> Suggested Activity</h5>
                                        <div className="text-muted-foreground mt-1 text-sm">
                                            <AudioPlayer textToPlay={currentChapter.activity} />
                                            <p>{currentChapter.activity}</p>
                                        </div>
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
                                                 {!currentMilestone?.completed && (
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
                     ) : <p>No chapter data found.</p>
                     ) : (
                        <Card className="text-center p-12">
                             <h2 className="text-xl font-semibold">Generate Module Content</h2>
                             <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">Click the button below to generate an in-depth learning module for this milestone.</p>
                             <Button onClick={() => handleGenerateModuleContent(currentMilestone!)} disabled={isLoading}>
                                <Wand2 className="mr-2 h-4 w-4" /> Generate with AI
                            </Button>
                        </Card>
                     )}

                     {currentChapter && (
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Tutor</CardTitle>
                                <CardDescription>Have a question about this chapter? Ask away!</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {chatHistory.map((msg, index) => (
                                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                             {msg.role === 'ai' && <Avatar><AvatarFallback><Bot size={20}/></AvatarFallback></Avatar>}
                                             <div className={cn("rounded-lg p-3 max-w-lg", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                             </div>
                                             {msg.role === 'user' && <Avatar><AvatarFallback><User size={20}/></AvatarFallback></Avatar>}
                                        </div>
                                    ))}
                                    {isTutorLoading && (
                                         <div className="flex items-start gap-3">
                                            <Avatar><AvatarFallback><Bot size={20}/></AvatarFallback></Avatar>
                                            <div className="rounded-lg p-3 bg-muted animate-pulse">Thinking...</div>
                                         </div>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Input 
                                        placeholder="Ask a question about this chapter..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isTutorLoading && handleSendTutorMessage()}
                                        disabled={isTutorLoading}
                                    />
                                    <Button onClick={handleSendTutorMessage} disabled={isTutorLoading}>
                                        <Send size={16}/>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                     )}

                     <div className="mt-4 flex justify-between">
                          <Button variant="outline" onClick={handlePrevChapter} disabled={(currentModuleIndex === 0 && currentChapterIndex === 0) || !currentModule}>
                            <ChevronLeft className="mr-2 h-4 w-4"/> Previous
                          </Button>
                          <Button onClick={handleNextChapter} disabled={isLastChapterInModule || !currentModule}>
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
                                {roadmap?.milestones.map((milestone, mIndex) => (
                                    <li key={mIndex}>
                                        <button
                                            className={cn(
                                                "w-full text-left p-2 rounded-md font-semibold flex items-center gap-3",
                                                mIndex === currentModuleIndex ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                            )}
                                            onClick={() => {setCurrentModuleIndex(mIndex); setCurrentChapterIndex(0);}}
                                        >
                                           {milestone.completed ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <div className="h-5 w-5 rounded-full border-2 border-primary flex-shrink-0" />}
                                           <span>{milestone.title}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
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
                                  <div>
                                    <AudioPlayer textToPlay={isFlipped ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front} />
                                    <p className="text-xl font-semibold">
                                        {isFlipped ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front}
                                    </p>
                                  </div>
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
