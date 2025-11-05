

'use client';

import { useState, useEffect, useContext, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, ChevronLeft, ChevronRight, Wand2, FlaskConical, Lightbulb, Copy, RefreshCw, Check, Star, CheckCircle, Send, Bot, User, GitMerge, PanelLeft, Minimize, Maximize, Loader2, Plus, Trash2, MoreVertical, XCircle, ArrowRight, RotateCcw, Video, Image as ImageIcon, BookCopy, Link as LinkIcon, Headphones, Underline, Highlighter, Rabbit, Snail, Turtle, Book, Mic, Bookmark, Brain, KeySquare, ArrowLeft, Phone, Presentation } from 'lucide-react';
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
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, onSnapshot, serverTimestamp, increment, arrayUnion, arrayRemove, getDoc, Timestamp } from 'firebase/firestore';
import AudioPlayer from '@/components/audio-player';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateInitialCourseAndRoadmap, generateQuizFromModule, generateTutorResponse, generateChapterContent, generateMidtermExam, generateRoadmap, generateCourseFromUrl, generateSummary, generateVideo, generateImage } from '@/lib/actions';
import { RewardContext } from '@/context/RewardContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Loading from './loading';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import GeneratingCourse from './GeneratingCourse';
import { CallContext } from '@/context/CallContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import AIBuddy from '@/components/ai-buddy';


type ContentBlock = {
    type: 'text' | 'question';
    content?: string;
    question?: string;
    options?: string[];
    correctAnswer?: string;
};

type Course = {
    id: string;
    name: string;
    description?: string;
    url?: string;
    userId?: string;
    units?: Module[];
    completedChapters?: string[];
    instructor?: string;
    credits?: number;
    isNewTopic?: boolean;
    labCompleted?: boolean;
};

type Module = {
    id: string;
    title: string;
    chapters: Chapter[];
};

type Chapter = {
    id: string;
    title: string;
    content?: ContentBlock[] | string;
    activity?: string;
    imageUrl?: string;
};

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

type AnswerFeedback = { question: string; answer: string; correctAnswer: string; isCorrect: boolean; explanation?: string; };

type QuizState = 'configuring' | 'in-progress' | 'results';

const paces = [
  { value: "6", label: "Casual", description: "A relaxed pace for exploring.", icon: <Snail className="h-6 w-6" /> },
  { value: "3", label: "Steady", description: "A balanced pace for consistent learning.", icon: <Turtle className="h-6 w-6" /> },
  { value: "1", label: "Intense", description: "A fast-paced schedule for quick mastery.", icon: <Rabbit className="h-6 w-6" /> },
];

type QuizResult = {
    score: number;
    totalQuestions: number;
    answers: AnswerFeedback[];
    timestamp: any;
};

type InlineQuizState = {
    selectedAnswer?: string;
    feedback?: 'correct' | 'incorrect' | null;
};

const ChapterImage = ({ course, module, chapter }: { course: Course, module: Module, chapter: Chapter }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(chapter.imageUrl || null);
    const [isLoading, setIsLoading] = useState(!chapter.imageUrl);

    useEffect(() => {
        if (!chapter.imageUrl) {
            setIsLoading(true);
            generateImage({ prompt: `Create a clear, simple, and professional-looking diagram, infographic, or 3D render that visually explains the following academic concept. The image MUST directly illustrate the concept provided. For abstract subjects like Math, Science, or Programming, you MUST prioritize finding a clear, simple diagram, chart, or infographic. For other subjects, you can find a high-quality photo. Do NOT generate images of computer code, abstract art, or people unless they are directly relevant to illustrating the concept. Concept: "${chapter.title}"` })
                .then(async (result) => {
                    if (result.imageUrl) {
                        setImageUrl(result.imageUrl);

                        // Save the URL to Firestore
                        const courseRef = doc(db, 'courses', course.id);
                        const updatedUnits = course.units!.map(m => {
                            if (m.id === module.id) {
                                return {
                                    ...m,
                                    chapters: m.chapters.map(c => 
                                        c.id === chapter.id ? { ...c, imageUrl: result.imageUrl } : c
                                    )
                                };
                            }
                            return m;
                        });
                        await updateDoc(courseRef, { units: updatedUnits });
                    }
                })
                .catch(error => {
                    console.error("Failed to generate image for chapter:", error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [chapter.title, chapter.imageUrl, course, module, chapter.id]);

    if (isLoading) {
        return <Skeleton className="h-full w-full bg-muted" />;
    }

    if (!imageUrl) {
        return null;
    }

    return (
        <div className="relative w-full h-full">
            <Image 
                src={imageUrl} 
                alt={chapter.title || 'Chapter image'} 
                fill
                className="rounded-lg object-contain" 
            />
        </div>
    );
};


function CoursesComponent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [learnerType, setLearnerType] = useState<string | null>(null);
  
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCourseName, setGeneratingCourseName] = useState('');
  const [isChapterContentLoading, setChapterContentLoading] = useState<Record<string, boolean>>({});

  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const { showReward } = useContext(RewardContext);
  const { startCall } = useContext(CallContext);

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  
  const [isQuizDialogOpen, setQuizDialogOpen] = useState(false);
  const [isQuizLoading, setQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  
  const [quizState, setQuizState] = useState<QuizState>('configuring');
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<AnswerFeedback[]>([]);

  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({});
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  const [isCourseReadyDialogOpen, setIsCourseReadyDialogOpen] = useState(false);

  const [newCourse, setNewCourse] = useState({ name: '', instructor: '', credits: '', url: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [addCourseStep, setAddCourseStep] = useState(1);
  const [isNewTopic, setIsNewTopic] = useState<boolean | null>(null);
  const [learningPace, setLearningPace] = useState<string>("3");
  const [isRoadmapGenerating, setIsRoadmapGenerating] = useState(false);

  // Manual unit creation state
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [isAddUnitFromUrlOpen, setIsAddUnitFromUrlOpen] = useState(false);
  const [newUnitsUrl, setNewUnitsUrl] = useState('');

  // Highlighting and note-taking state
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [isNoteFromHighlightOpen, setIsNoteFromHighlightOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Summary dialog state
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [summaryForPopup, setSummaryForPopup] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [nextChapterProgress, setNextChapterProgress] = useState(0);

  const [inlineQuizStates, setInlineQuizStates] = useState<Record<string, InlineQuizState>>({});

  // Video generation state
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoForChapter, setVideoForChapter] = useState<string | null>(null);
  const [chapterVideos, setChapterVideos] = useState<Record<string, string>>({});
  
  const [isSlideshowMode, setIsSlideshowMode] = useState(false);
  const [slideshowChapterIndex, setSlideshowChapterIndex] = useState(0);


  const currentModule = activeCourse?.units?.[currentModuleIndex];
  const currentChapter = currentModule?.chapters[currentChapterIndex];
  const currentChapterIsQuiz = currentChapter?.title.toLowerCase().includes('quiz');
  const existingQuizResult = currentModule ? quizResults[currentModule.id] : undefined;

  useEffect(() => {
    if (currentChapterIsQuiz && currentModule && !existingQuizResult) {
        handleStartModuleQuiz(currentModule, true);
    }
  }, [currentChapterIsQuiz, currentModule, existingQuizResult]);
  
  useEffect(() => {
    if (authLoading || !user) return;

    const q = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
        setIsLoading(false);
    });

    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');
    const storedGradeLevel = localStorage.getItem('onboardingGradeLevel');
    setGradeLevel(storedGradeLevel);
    
    const courseIdFromUrl = searchParams.get('courseId');

    if (courseIdFromUrl) {
        setSelectedCourseId(courseIdFromUrl);
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

            if (courseData.units && courseData.units.length > 0) {
                // Find first uncompleted chapter
                let found = false;
                for (let mIdx = 0; mIdx < courseData.units.length; mIdx++) {
                    const unit = courseData.units[mIdx];
                    for (let cIdx = 0; cIdx < unit.chapters.length; cIdx++) {
                        const chapter = unit.chapters[cIdx];
                        if (!courseData.completedChapters?.includes(chapter.id)) {
                            setCurrentModuleIndex(mIdx);
                            setCurrentChapterIndex(cIdx);
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                if (!found) { // All chapters completed
                    const lastModuleIndex = courseData.units.length - 1;
                    const lastChapterIndex = courseData.units[lastModuleIndex].chapters.length - 1;
                    setCurrentModuleIndex(lastModuleIndex);
                    setCurrentChapterIndex(lastChapterIndex);
                }
            }


        } else {
             setActiveCourse(null);
             toast({ variant: 'destructive', title: 'Course not found.' });
        }
        setIsLoading(false);
    }
    if (selectedCourseId) {
        loadCourseData();
    }
  }, [selectedCourseId, user, toast]);
  

    useEffect(() => {
        if (!user || !activeCourse) return;

        const resultsRef = collection(db, 'quizResults');
        const q = query(resultsRef, where("userId", "==", user.uid), where("courseId", "==", activeCourse.id));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const results: Record<string, QuizResult> = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                results[data.moduleId] = data as QuizResult;
            });
            setQuizResults(results);
        });

        return () => unsubscribe();
    }, [user, activeCourse]);


  useEffect(() => {
    setChatHistory([]);
    setChatInput('');
    setInlineQuizStates({});
  }, [currentChapterIndex, currentModuleIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (popoverPosition && contentRef.current && !contentRef.current.contains(event.target as Node)) {
            const popoverEl = document.getElementById('text-selection-popover');
            if (popoverEl && !popoverEl.contains(event.target as Node)) {
                setPopoverPosition(null);
            }
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popoverPosition]);


  const handleGenerateCourse = async () => {
    if (!user || !newCourse.name || isNewTopic === null || !learnerType) return;
    
    setAddCourseOpen(false);
    setIsGenerating(true);
    setGeneratingCourseName(newCourse.name);
    
    try {
        const result = await generateInitialCourseAndRoadmap({
            courseName: newCourse.name,
            courseDescription: newCourse.description || `An in-depth course on ${newCourse.name}`,
            learnerType: learnerType as any,
            durationInMonths: parseInt(learningPace, 10),
        });

        const { courseOutline, firstChapterContent, roadmap } = result;

        const newUnits = courseOutline.modules.map((module, mIdx) => ({
            id: crypto.randomUUID(),
            title: module.title,
            chapters: module.chapters.map((chapter, cIdx) => ({
                id: crypto.randomUUID(),
                title: chapter.title,
                ...(mIdx === 0 && cIdx === 0 ? { ...firstChapterContent, content: firstChapterContent.content as any } : {}),
            }))
        }));

        const courseData = {
            name: newCourse.name,
            description: newCourse.description || `An in-depth course on ${newCourse.name}`,
            url: newCourse.url,
            userId: user.uid,
            units: newUnits,
            isNewTopic: true,
            completedChapters: [],
            progress: 0,
        };

        const courseDocRef = await addDoc(collection(db, "courses"), courseData);
        
        const newRoadmap = {
            goals: roadmap.goals.map(g => ({ ...g, id: crypto.randomUUID(), icon: g.icon || 'Flag' })),
            milestones: roadmap.milestones.map(m => ({ ...m, id: crypto.randomUUID(), icon: m.icon || 'Calendar', completed: false }))
        };
        await addDoc(collection(db, 'roadmaps'), { ...newRoadmap, courseId: courseDocRef.id, userId: user.uid });
        
        toast({ title: 'Course & Roadmap Generated!', description: 'Your new learning lab is ready.' });
        setSelectedCourseId(courseDocRef.id);
        
    } catch (error) {
        console.error("Failed to generate course and roadmap:", error);
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create the full course content.' });
    } finally {
        setIsGenerating(false);
        resetAddCourseDialog();
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


  const handleStartModuleQuiz = async (module: Module, autoStart: boolean = false) => {
    if (!autoStart) {
        setQuizState('in-progress');
    }
    
    setQuizLoading(true);
    setGeneratedQuiz(null);
    setQuizAnswers([]);
    setCurrentQuizQuestionIndex(0);
    setSelectedQuizAnswer(null);

    const moduleContent = module.chapters
        .filter(c => !c.title.toLowerCase().includes('quiz'))
        .map(c => {
            if (typeof c.content === 'string') return `Chapter: ${c.title}\n${c.content}`;
            return `Chapter: ${c.title}\n${(c.content?.map(block => block.content || '').join('\n') || '')}`;
        })
        .join('\n\n');


    try {
        const result = await generateQuizFromModule({
            moduleContent,
            learnerType: (learnerType as any) ?? 'Reading/Writing'
        });
        setGeneratedQuiz(result);
        if (autoStart) {
            setQuizState('in-progress');
        }
    } catch (error) {
        console.error("Failed to generate quiz:", error);
        toast({
            variant: 'destructive',
            title: 'Quiz Generation Failed',
            description: 'Could not generate a quiz for this module.',
        });
        setQuizState('configuring'); // Revert state on failure
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
        .map(c => {
            if (typeof c.content === 'string') return `Chapter: ${c.title}\n${c.content}`;
            return `Chapter: ${c.title}\n${(c.content?.map(block => block.content || '').join('\n') || '')}`;
        })
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
    
    if (!isCorrect) {
        try {
            await addDoc(collection(db, 'quizAttempts'), {
                userId: user.uid,
                courseId: activeCourse?.id,
                topic: currentModule.title,
                question: currentQuestion.question,
                userAnswer: selectedQuizAnswer,
                correctAnswer: currentQuestion.answer,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving incorrect answer:", error);
        }
    }

    const newQuizAnswers = [...quizAnswers, answerFeedback];
    setQuizAnswers(newQuizAnswers);
    setSelectedQuizAnswer(null);

    if (currentQuizQuestionIndex < generatedQuiz.questions.length - 1) {
        setCurrentQuizQuestionIndex(prev => prev + 1);
    } else {
        const score = newQuizAnswers.filter(a => a.isCorrect).length;
        const total = newQuizAnswers.length;
        
        try {
            await addDoc(collection(db, 'quizResults'), {
                userId: user.uid,
                courseId: activeCourse?.id,
                moduleId: currentModule.id,
                score,
                totalQuestions: total,
                answers: newQuizAnswers,
                timestamp: serverTimestamp()
            });

            if (score > 0) {
                const coinsEarned = score * 10;
                await updateDoc(doc(db, 'users', user.uid), { coins: increment(coinsEarned) });
                showReward({ type: 'coins', amount: coinsEarned });
            }
            toast({ title: "Quiz Complete!", description: `You scored ${score}/${total}.` });
            setQuizState('results');

        } catch (error) {
            console.error("Error saving quiz results:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save your quiz results.' });
        }
    }
  };
  
  const handleGenerateChapterContent = async (moduleIndex: number, chapterIndex: number, course = activeCourse) => {
    if (!course || !user || !learnerType) return false;
    
    const module = course.units?.[moduleIndex];
    const chapter = module?.chapters?.[chapterIndex];

    if(!module || !chapter || chapter.content) {
        return true; // Already has content, or invalid state, just proceed
    }

    const chapterId = chapter.id;
    setChapterContentLoading(prev => ({ ...prev, [chapterId]: true }));

    try {
        const result = await generateChapterContent({
            courseName: course.name,
            moduleTitle: module.title,
            chapterTitle: chapter.title,
            learnerType: learnerType as any,
        });

        const updatedChapter = { ...chapter, ...result };
        
        const updatedUnits = course.units?.map((unit, mIdx) => {
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

        const courseRef = doc(db, 'courses', course.id);
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

  const handleProceedToNextChapter = () => {
    if (!activeCourse || !currentModule) return;
    
    setIsSummaryDialogOpen(false);

    let nextModuleIndex = currentModuleIndex;
    let nextChapterIndex = currentChapterIndex + 1;

    if (nextChapterIndex >= currentModule.chapters.length) {
        nextModuleIndex++;
        nextChapterIndex = 0;
    }

    if (nextModuleIndex >= (activeCourse.units?.length ?? 0)) {
        toast({ title: "Course Complete!", description: "Congratulations, you've finished the course!" });
        const courseRef = doc(db, 'courses', activeCourse.id);
        updateDoc(courseRef, { labCompleted: true });
        if(user) {
            updateDoc(doc(db, 'users', user.uid), { coins: increment(500) });
            showReward({ type: 'coins', amount: 500 });
        }
    } else {
        setCurrentModuleIndex(nextModuleIndex);
        setCurrentChapterIndex(nextChapterIndex);
        setQuizState('configuring'); // Reset quiz state for the next module
    }
  };

  const handleCompleteAndContinue = async () => {
    if (!activeCourse || !user || !currentChapter || !currentModule) return;
    
    // Mark current chapter as complete
    const courseRef = doc(db, 'courses', activeCourse.id);
    await updateDoc(courseRef, { completedChapters: arrayUnion(currentChapter.id) });
    setActiveCourse(prev => prev ? { ...prev, completedChapters: [...(prev.completedChapters || []), currentChapter.id]} : null);

    // --- Check if next chapter is a quiz ---
    let nextModuleIndex = currentModuleIndex;
    let nextChapterIndex = currentChapterIndex + 1;
    let isLastChapterOfCourse = false;

    if (nextChapterIndex >= (currentModule.chapters.length ?? 0)) {
        nextModuleIndex++;
        nextChapterIndex = 0;
    }
    if (nextModuleIndex >= (activeCourse.units?.length ?? 0)) {
        isLastChapterOfCourse = true;
    }

    const nextChapter = !isLastChapterOfCourse ? activeCourse.units![nextModuleIndex].chapters[nextChapterIndex] : null;
    const isNextChapterQuiz = nextChapter?.title.toLowerCase().includes('quiz');

    if (isNextChapterQuiz) {
        handleProceedToNextChapter(); // Bypass summary dialog and go to quiz intro screen
        return;
    }

    // --- Normal flow: Show summary dialog and pre-load next chapter ---
    setIsSummaryDialogOpen(true);
    setIsSummaryLoading(true);
    setNextChapterProgress(0);
    
    // 1. Generate summary for the current chapter
    const currentChapterContent = Array.isArray(currentChapter.content)
      ? currentChapter.content.map(block => block.content || '').join('\n')
      : currentChapter.content || '';
      
    if (currentChapterContent) {
        generateSummary({ noteContent: currentChapterContent })
            .then(result => {
                setSummaryForPopup(result.summary);
            })
            .catch(error => {
                console.error("Summary generation failed:", error);
                setSummaryForPopup("Could not generate a summary for this chapter.");
            })
            .finally(() => {
                setIsSummaryLoading(false);
            });
    } else {
        setSummaryForPopup("This chapter didn't have content to summarize.");
        setIsSummaryLoading(false);
    }
    
    // 2. Generate content for the next chapter
    if (!isLastChapterOfCourse) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 98) { // Don't let it hit 100 on its own
                clearInterval(interval);
            } else {
                setNextChapterProgress(progress);
            }
        }, 300);

        handleGenerateChapterContent(nextModuleIndex, nextChapterIndex)
            .then(success => {
                clearInterval(interval);
                setNextChapterProgress(100);
                if (success) {
                    setTimeout(() => {
                        handleProceedToNextChapter();
                    }, 500); // Give user a moment to see 100%
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not load the next chapter.'});
                    setIsSummaryDialogOpen(false);
                }
            });
    } else {
        setNextChapterProgress(100);
        setTimeout(() => {
            handleProceedToNextChapter();
        }, 500);
    }
  };
  
  const startNewCourse = () => {
    setSelectedCourseId(null);
    setActiveCourse(null);
    setCurrentModuleIndex(0);
    setCurrentChapterIndex(0);
    const url = new URL(window.location.href);
    url.searchParams.delete('courseId');
    window.history.pushState({}, '', url.toString());
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, 'courses', courseId));
        toast({ title: 'Course Deleted', description: 'The course has been removed.' });
        if(selectedCourseId === courseId) {
            startNewCourse();
        }
    } catch (error) {
        console.error("Error deleting course:", error);
        toast({ variant: 'destructive', title: 'Deletion Failed' });
    }
  };
  
  const handleSendTutorMessage = async () => {
    const currentChapterContent = Array.isArray(currentChapter?.content)
      ? currentChapter!.content.map(block => block.content || '').join('\n')
      : currentChapter?.content || '';
      
    if (!chatInput.trim() || !currentChapter || !currentChapterContent) return;


    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setIsTutorLoading(true);

    try {
        const response = await generateTutorResponse({
            studyContext: currentChapterContent,
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
            alert(`Error attempting to enable full-screen mode: ${'${err.message}'} (${'${err.name}'})`);
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
  
  const handleStartTutorin = () => {
    setIsCourseReadyDialogOpen(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const resetAddCourseDialog = () => {
    setAddCourseStep(1);
    setIsNewTopic(null);
    setNewCourse({ name: '', instructor: '', credits: '', url: '', description: '' });
    setLearningPace("3");
  };
  
  const handleAddExistingCourse = async () => {
    if (!newCourse.name) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please enter a course name.' });
        return;
    }
    if (!user) return;

    setIsSaving(true);

    const courseData = {
        name: newCourse.name,
        instructor: newCourse.instructor || 'N/A',
        credits: parseInt(newCourse.credits, 10) || 0,
        url: newCourse.url,
        description: newCourse.description || `An in-depth course on ${newCourse.name}`,
        userId: user.uid,
        isNewTopic: false,
        units: [],
        completedChapters: [],
        progress: 0,
        files: 0,
    };

    try {
        await addDoc(collection(db, "courses"), courseData);
        toast({ title: 'Course Added!' });
        setAddCourseOpen(false);
        resetAddCourseDialog();
    } catch(error) {
        console.error("Error adding course: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add course.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleManualAddUnit = async () => {
    if (!newUnitTitle.trim() || !activeCourse) return;
    
    const newUnit: Module = {
        id: crypto.randomUUID(),
        title: newUnitTitle,
        chapters: []
    };

    const updatedUnits = [...(activeCourse.units || []), newUnit];
    const courseRef = doc(db, 'courses', activeCourse.id);

    try {
        await updateDoc(courseRef, { units: updatedUnits });
        setActiveCourse(prev => prev ? {...prev, units: updatedUnits} : null);
        toast({ title: 'Unit Added!' });
        setNewUnitTitle('');
        setIsAddUnitOpen(false);
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error adding unit.'});
    }
  };

  const handleAddUnitsFromUrl = async () => {
    if (!newUnitsUrl.trim() || !activeCourse || !user) return;
    setIsGenerating(true);
    setIsAddUnitFromUrlOpen(false);
    toast({ title: "Generating units from URL...", description: "This might take a moment." });

    try {
      const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
      const result = await generateCourseFromUrl({
        courseName: activeCourse.name,
        courseDescription: activeCourse.description,
        courseUrl: newUnitsUrl,
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

      const updatedUnits = [...(activeCourse.units || []), ...newUnits];
      const courseRef = doc(db, 'courses', activeCourse.id);
      await updateDoc(courseRef, { units: updatedUnits });
      
      setActiveCourse(prev => prev ? {...prev, units: updatedUnits} : null);
      toast({ title: 'Units Added Successfully!' });

    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed to generate units from URL.'});
    } finally {
      setIsGenerating(false);
      setNewUnitsUrl('');
    }
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && contentRef.current?.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        setSelectedRange(range.cloneRange());
        const rect = range.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        
        setPopoverPosition({
            top: rect.top - contentRect.top - 50,
            left: rect.left - contentRect.left + rect.width / 2,
        });
    } else {
        setPopoverPosition(null);
    }
  };
  
  const applyStyle = (style: string) => {
    if (!selectedRange) return;

    try {
        const mark = document.createElement('mark');
        mark.className = style;
        selectedRange.surroundContents(mark);
    } catch (e) {
        console.error("Could not apply style directly:", e);
        toast({ variant: "destructive", title: "Highlight Failed", description: "Could not apply highlight to this selection." });
    }

    setPopoverPosition(null);
    setSelectedRange(null);
    window.getSelection()?.removeAllRanges();
  };

  const saveAsNote = () => {
    if (!selectedRange) return;
    setNoteContent(selectedRange.toString());
    setIsNoteFromHighlightOpen(true);
    
    setPopoverPosition(null);
    setSelectedRange(null);
    window.getSelection()?.removeAllRanges();
  };
  
  const handleSaveNoteFromHighlight = async () => {
      if(!user || !activeCourse || !currentModule || !noteContent) return;
      try {
        await addDoc(collection(db, "notes"), {
            title: `Note from ${currentChapter?.title}`,
            content: noteContent,
            date: Timestamp.now(),
            color: 'bg-indigo-100 dark:bg-indigo-900/20',
            isImportant: false,
            isCompleted: false,
            userId: user.uid,
            courseId: activeCourse.id,
            unitId: currentModule.id,
        });
        toast({ title: "Note Saved!", description: "A new note was created from your highlight." });
        setIsNoteFromHighlightOpen(false);
        setNoteContent('');
      } catch (e) {
          console.error(e);
          toast({ variant: "destructive", title: "Error", description: "Could not save the note." });
      }
  }


  const handleCheckInlineAnswer = (blockIndex: number, questionBlock: ContentBlock) => {
    const key = `${currentChapter?.id}-${blockIndex}`;
    const currentState = inlineQuizStates[key];
    if (!currentState?.selectedAnswer) return;

    const isCorrect = currentState.selectedAnswer === questionBlock.correctAnswer;
    setInlineQuizStates(prev => ({
        ...prev,
        [key]: { ...prev[key], feedback: isCorrect ? 'correct' : 'incorrect' }
    }));
  };

  const handleInlineAnswerChange = (blockIndex: number, answer: string) => {
    const key = `${currentChapter?.id}-${blockIndex}`;
    setInlineQuizStates(prev => ({
        ...prev,
        [key]: { ...prev[key], selectedAnswer: answer }
    }));
  };

  const handleGenerateVideoForChapter = async () => {
      if (!activeCourse || !currentChapter) return;
      
      const content = Array.isArray(currentChapter.content) ? currentChapter.content.map(c => c.content).join(' ') : currentChapter.content;
      if (!content) {
          toast({ variant: 'destructive', title: 'No content to generate video from.' });
          return;
      }
      
      setVideoForChapter(currentChapter.title);
      setIsVideoDialogOpen(true);
      
      const existingUrl = chapterVideos[currentChapter.id];
      if (existingUrl) {
          setGeneratedVideoUrl(existingUrl);
          setIsVideoGenerating(false);
          return;
      }
      
      setIsVideoGenerating(true);
      setGeneratedVideoUrl(null);
      
      try {
        const result = await generateVideo({
            episodeContent: content,
        });
        
        if (result && result.videoUrl) {
            setGeneratedVideoUrl(result.videoUrl);
            setChapterVideos(prev => ({ ...prev, [currentChapter!.id]: result.videoUrl }));
        } else {
             throw new Error('No video URL was returned from the operation.');
        }

      } catch(e: any) {
          toast({ variant: 'destructive', title: 'Video Generation Failed', description: e.message });
          setGeneratedVideoUrl(null);
      } finally {
          setIsVideoGenerating(false);
      }
  }
  
  const handleStartTutorCall = () => {
    const aiParticipant = {
        uid: 'tutorin-ai',
        displayName: 'Tutorin',
        status: 'Online',
    };
    startCall([aiParticipant]);
  };
  
  const handleOpenSlideshow = () => {
    if (!currentChapter) return;
    setSlideshowChapterIndex(currentChapterIndex);
    setIsSlideshowMode(true);
  };

  const chapterCount = activeCourse?.units?.reduce((acc, unit) => acc + (unit.chapters?.length ?? 0), 0) ?? 0;
  const completedChaptersCount = activeCourse?.completedChapters?.length ?? 0;
  const progress = chapterCount > 0 ? (completedChaptersCount / chapterCount) * 100 : 0;

  if (isGenerating) {
    return <GeneratingCourse courseName={generatingCourseName} />;
  }
  
  if (isLoading) {
    return <Loading />;
  }

  if (!selectedCourseId || !activeCourse) {
      return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
                    <p className="text-muted-foreground">Manage your courses and generate interactive learning labs.</p>
                </div>
                <div className="flex gap-2">
                     <Button variant="outline" asChild>
                        <Link href="/dashboard/key-concepts"><KeySquare className="mr-2 h-4 w-4"/> Key Concepts</Link>
                    </Button>
                    <Dialog open={addCourseOpen} onOpenChange={(open) => { if (!open) resetAddCourseDialog(); setAddCourseOpen(open); }}>
                        <DialogTrigger asChild>
                            <Button disabled={isSaving}>
                                <Plus className="mr-2 h-4 w-4"/> Add Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add a New Course</DialogTitle>
                                <DialogDescription>
                                    {addCourseStep === 1 ? 'First, provide some details about your course.' : 'How quickly do you want to learn?'}
                                </DialogDescription>
                            </DialogHeader>
                            {addCourseStep === 1 ? (
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Course Name</Label>
                                        <Input id="name" name="name" value={newCourse.name} onChange={handleInputChange} placeholder="e.g., Introduction to AI"/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Textarea id="description" name="description" value={newCourse.description} onChange={handleInputChange} placeholder="A brief summary of the course"/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="url">Course URL (Optional)</Label>
                                        <Input id="url" name="url" value={newCourse.url} onChange={handleInputChange} placeholder="https://example.com/course-link"/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="is-new-topic">Are you currently in this course?</Label>
                                        <Select onValueChange={(value) => setIsNewTopic(value === 'true')}>
                                            <SelectTrigger id="is-new-topic">
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="false">Yes, I am</SelectItem>
                                                <SelectItem value="true">No, I'm learning something new</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <RadioGroup value={learningPace} onValueChange={setLearningPace} className="space-y-4">
                                        {paces.map(pace => (
                                            <Label key={pace.value} htmlFor={`pace-${pace.value}`} className={cn("flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer", learningPace === pace.value && "border-primary bg-primary/10 ring-2 ring-primary")}>
                                                <RadioGroupItem value={pace.value} id={`pace-${pace.value}`} className="mt-1" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        {pace.icon}
                                                        <span className="font-semibold text-lg">{pace.label}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{pace.description}</p>
                                                </div>
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}
                            <DialogFooter>
                                {addCourseStep === 1 ? (
                                    <>
                                        <Button variant="ghost" onClick={() => { setAddCourseOpen(false); resetAddCourseDialog();}}>Cancel</Button>
                                        {isNewTopic === true ? (
                                            <Button onClick={() => setAddCourseStep(2)} disabled={isSaving || isNewTopic === null || !newCourse.name}>
                                                Next
                                            </Button>
                                        ) : (
                                            <Button onClick={handleAddExistingCourse} disabled={isSaving || isNewTopic === null || !newCourse.name}>
                                                Add Course
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Button variant="ghost" onClick={() => setAddCourseStep(1)}>Back</Button>
                                        <Button onClick={handleGenerateCourse} disabled={isSaving || isGenerating}>
                                            {isGenerating ? 'Generating...' : 'Generate Course & Plan'}
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => {
                        const totalChapters = course.units?.reduce((acc, unit) => acc + (unit.chapters?.length ?? 0), 0) ?? 0;
                        const completedCount = course.completedChapters?.length ?? 0;
                        const courseProgress = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;
                        
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
                                                        <Trash2 className="mr-2 h-4 w-4"/> Delete Course
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete this course and all its associated content.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardDescription>{course.description || (totalChapters > 0 ? `${totalChapters} chapters` : 'No content generated')}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                {totalChapters > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">{Math.round(courseProgress)}% Complete</p>
                                        <Progress value={courseProgress} className="h-2" />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row gap-2">
                                {(course.units && course.units.length > 0) ? (
                                    <Button className="w-full" onClick={() => setSelectedCourseId(course.id)}>
                                        {courseProgress > 0 ? 'Continue Learning' : 'Start Learning!'}
                                    </Button>
                                ) : (
                                    <Button className="w-full" onClick={() => {
                                        setGeneratingCourseName(course.name);
                                        setNewCourse({
                                            name: course.name,
                                            instructor: course.instructor || '',
                                            credits: String(course.credits || ''),
                                            url: course.url || '',
                                            description: course.description || '',
                                        });
                                        setIsNewTopic(true);
                                        setAddCourseStep(2);
                                        setAddCourseOpen(true);
                                    }} disabled={isGenerating}>
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        {isGenerating ? 'Generating...' : 'Generate Lab'}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )})}
                </div>
            ) : (
                <Card className="text-center p-12">
                   <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">No Courses Created Yet</h2>
                  <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                    Click "Add Course" to create your first course and generate an interactive learning lab.
                  </p>
                </Card>
            )}
        </div>
    );
  }
  
  const isMidtermModule = activeCourse.units && currentModuleIndex === Math.floor(activeCourse.units.length / 2);
  
    if (currentChapterIsQuiz && currentModule) {
        if (isQuizLoading && !existingQuizResult) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="relative mb-8">
                        <AIBuddy className="w-32 h-32" isStatic={false} />
                    </div>
                    <h2 className="text-2xl font-bold animate-pulse">Preparing your quiz...</h2>
                    <p className="text-muted-foreground mt-2">Good luck!</p>
                    <div className="mt-8 flex gap-4">
                        {currentModule.chapters.slice(0, -1).map((chapter, index) => (
                            <Button key={chapter.id} variant="outline" onClick={() => {
                                setCurrentModuleIndex(currentModuleIndex);
                                setCurrentChapterIndex(index);
                            }}>
                                Review Chapter {index + 1}
                            </Button>
                        ))}
                    </div>
                </div>
            );
        }

        if (quizState === 'configuring' && !existingQuizResult) {
             return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="mb-10 w-full max-w-3xl">
                        <h1 className="text-4xl font-bold">{currentModule.title}</h1>
                        <p className="text-muted-foreground mt-2">
                            This quiz will cover the material from the previous chapters in this module.
                        </p>
                        <p className="text-muted-foreground mt-1">Review the content to prepare yourself for the assessment.</p>
                    </div>
                    <Button size="lg" onClick={() => handleStartModuleQuiz(currentModule)}>
                        Start Quiz
                    </Button>
                </div>
            )
        } else if (existingQuizResult && quizState !== 'in-progress') {
             const scorePercentage = Math.round((existingQuizResult.score / existingQuizResult.totalQuestions) * 100);
             return (
                <div className="flex flex-col items-center">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold">Quiz Results</h1>
                        <p className="text-muted-foreground mt-2">Here's how you did on the {currentModule.title} quiz.</p>
                    </div>
                    <Card className="w-full max-w-3xl">
                        <CardContent className="p-8 text-center">
                            <h2 className="text-2xl font-semibold">Your Score</h2>
                            <p className={cn("text-6xl font-bold my-4", scorePercentage > 80 ? 'text-green-500' : scorePercentage > 60 ? 'text-yellow-500' : 'text-red-500')}>{scorePercentage}%</p>
                            <p className="text-muted-foreground">You answered {existingQuizResult.score} out of {existingQuizResult.totalQuestions} questions correctly.</p>

                            <div className="mt-8 flex justify-center gap-4">
                                <Button variant="outline" onClick={handleCompleteAndContinue}>
                                    Continue to Next Section <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    
        const score = quizAnswers.filter(a => a.isCorrect).length;
        const totalQuestions = generatedQuiz?.questions.length ?? 0;
        const currentQuizQuestion = generatedQuiz?.questions[currentQuizQuestionIndex];
        const quizProgress = totalQuestions > 0 ? ((currentQuizQuestionIndex) / totalQuestions) * 100 : 0;
        
        return (
          <>
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
                                {currentQuizQuestion.options?.map((option, index) => {
                                    return(
                                         <Label key={`${currentQuizQuestion.question}-${index}`} htmlFor={`pq-${currentQuizQuestion.question}-${index}`} className="flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer text-sm">
                                            <RadioGroupItem value={option} id={`pq-${currentQuizQuestion.question}-${index}`} />
                                            <span>{option}</span>
                                        </Label>
                                    )
                                })}
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
                            <p className="text-muted-foreground">You answered {totalQuestions > 0 ? `${((score / totalQuestions) * 100).toFixed(0)}%` : '0%'} of the questions correctly.</p>
                            <div className="mt-8 flex justify-center gap-4">
                                <Button variant="outline" onClick={handleCompleteAndContinue}>
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

  const TextSelectionMenu = () => {
    if (!popoverPosition) return null;

    const popoverStyle = {
      position: 'absolute' as const,
      top: `${popoverPosition.top}px`,
      left: `${popoverPosition.left}px`,
      transform: 'translateX(-50%)',
    };

    return (
        <div
            id="text-selection-popover"
            style={popoverStyle}
            className="z-10 bg-card p-1 rounded-lg shadow-lg border flex gap-1 items-center"
        >
            <button onClick={() => applyStyle('highlight-yellow')} className="h-6 w-6 rounded-full bg-yellow-300 border-2 border-transparent hover:border-primary"></button>
            <button onClick={() => applyStyle('highlight-blue')} className="h-6 w-6 rounded-full bg-blue-300 border-2 border-transparent hover:border-primary"></button>
            <button onClick={() => applyStyle('highlight-pink')} className="h-6 w-6 rounded-full bg-pink-300 border-2 border-transparent hover:border-primary"></button>
            <div className="w-px h-6 bg-border mx-1"></div>
            <button onClick={saveAsNote} className="p-1 rounded-md hover:bg-muted"><Plus className="h-5 w-5" /></button>
        </div>
    );
  };


  return (
    <>
      <AnimatePresence>
        {isSlideshowMode && activeCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50 flex flex-col p-4"
          >
             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                <div className="relative h-full bg-muted rounded-lg flex items-center justify-center p-4">
                    {currentModule && <ChapterImage course={activeCourse} module={currentModule} chapter={currentModule.chapters[slideshowChapterIndex]} />}
                </div>
                <div className="h-full flex flex-col">
                    <h2 className="text-3xl font-bold mb-4 flex-shrink-0">{activeCourse.units?.[currentModuleIndex]?.chapters[slideshowChapterIndex]?.title}</h2>
                    <ScrollArea className="flex-1 pr-4">
                        <div className="text-muted-foreground leading-relaxed space-y-4 whitespace-pre-wrap">
                            {(() => {
                                const chapterContent = activeCourse.units?.[currentModuleIndex]?.chapters[slideshowChapterIndex]?.content;
                                if (Array.isArray(chapterContent)) {
                                    return chapterContent.map((block, index) => {
                                        if (block.type === 'text') return <p key={index}>{block.content}</p>;
                                        return null;
                                    });
                                }
                                return <p>{chapterContent}</p>;
                            })()}
                        </div>
                    </ScrollArea>
                </div>
            </div>
             <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex justify-center items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setSlideshowChapterIndex(p => Math.max(0, p - 1))} disabled={slideshowChapterIndex === 0}>
                <ChevronLeft />
              </Button>
              <p className="text-sm text-muted-foreground">{slideshowChapterIndex + 1} / {currentModule?.chapters.length || 0}</p>
              <Button variant="outline" size="icon" onClick={() => setSlideshowChapterIndex(p => Math.min((currentModule?.chapters.length || 1) - 1, p + 1))} disabled={!currentModule || slideshowChapterIndex >= currentModule.chapters.length - 1}>
                <ChevronRight />
              </Button>
            </div>
             <Button variant="ghost" onClick={() => setIsSlideshowMode(false)} className="absolute top-4 right-4">
                Exit Slideshow
              </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><Book className="h-5 w-5 text-primary"/>Chapter Summary</DialogTitle>
                  <DialogDescription>A quick recap of what you just learned.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                   <p className="text-muted-foreground">{summaryForPopup}</p>
                  <div className="pt-4">
                      <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground mb-1">Preparing next chapter...</p>
                          <span className="text-xs font-semibold">{Math.round(nextChapterProgress)}%</span>
                      </div>
                      <Progress value={nextChapterProgress} className="h-2"/>
                  </div>
              </div>
          </DialogContent>
      </Dialog>
      <Dialog open={isVideoDialogOpen} onOpenChange={(open) => { if (!open) { setVideoForChapter(null); } setIsVideoDialogOpen(open); }}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI Video for "{videoForChapter}"</DialogTitle>
                <DialogDescription>A short animated video to help visualize the chapter content.</DialogDescription>
              </DialogHeader>
               <div className="py-4">
                {isVideoGenerating ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Generating your video. This can take up to a minute...</p>
                    </div>
                ) : generatedVideoUrl ? (
                     <video controls src={generatedVideoUrl} className="w-full rounded-lg aspect-video"></video>
                ) : (
                    <p className="text-center text-muted-foreground">Video could not be generated.</p>
                )}
            </div>
          </DialogContent>
      </Dialog>

      <Dialog open={isNoteFromHighlightOpen} onOpenChange={setIsNoteFromHighlightOpen}>
       <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Highlight as Note</DialogTitle>
            <DialogDescription>Your highlighted text will be saved as a new note.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea value={noteContent} readOnly className="h-32 bg-muted"/>
            <p className="text-sm text-muted-foreground">This note will be saved under the current course: <strong>{activeCourse?.name}</strong>.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsNoteFromHighlightOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNoteFromHighlight}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isCourseReadyDialogOpen} onOpenChange={setIsCourseReadyDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Your Learning Lab is Ready!</DialogTitle>
                <DialogDescription>
                    We've created a custom outline for your course. Are you ready to dive in?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCourseReadyDialogOpen(false)}>I'll start later</Button>
                <Button onClick={handleStartTutorin}>
                    Start Tutorin
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
                    <div className="flex items-center justify-between">
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startNewCourse}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 overflow-hidden text-center">
                            <h2 className="text-lg font-bold truncate">{activeCourse?.name}</h2>
                            <p className="text-sm text-muted-foreground">{chapterCount > 0 ? `${chapterCount} Chapters` : 'No units created'}</p>
                        </div>
                        <div className="h-8 w-8 flex-shrink-0">
                            {!activeCourse?.isNewTopic && (
                                <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><Plus/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsAddUnitOpen(true);}}>
                                                    <BookCopy className="mr-2 h-4 w-4"/> Add Unit Manually
                                                </DropdownMenuItem>
                                            </DialogTrigger>
                                            <DialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsAddUnitFromUrlOpen(true);}}>
                                                    <LinkIcon className="mr-2 h-4 w-4"/> Add from URL
                                                </DropdownMenuItem>
                                            </DialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </Dialog>
                            )}
                        </div>
                    </div>
                    
                    {chapterCount > 0 && <Progress value={progress} className="mt-2 h-2" />}
                </div>
                 <Accordion type="multiple" defaultValue={activeCourse?.units?.map(u => u.id)} className="w-full flex-1 overflow-y-auto">
                    {activeCourse?.units?.map((unit, mIndex) => {
                        const arePreviousModulesComplete = activeCourse.units!.slice(0, mIndex).every(prevModule => 
                            prevModule.chapters.every(chap => activeCourse.completedChapters?.includes(chap.id))
                        );

                        return (
                        <AccordionItem key={unit.id} value={unit.id}>
                            <AccordionTrigger className="text-md font-semibold">{unit.title}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-1 pl-4">
                                    {unit.chapters.map((chapter, cIndex) => {
                                        const isCurrent = currentModuleIndex === mIndex && currentChapterIndex === cIndex;
                                        const isCompleted = activeCourse.completedChapters?.includes(chapter.id) ?? false;
                                        const chapterIsQuiz = chapter.title.toLowerCase().includes('quiz');
                                        const quizResultForChapter = chapterIsQuiz ? quizResults[unit.id] : undefined;
                                        
                                        const isPreviousChapterCompleted = cIndex === 0
                                            ? arePreviousModulesComplete
                                            : unit.chapters.slice(0, cIndex).every(c => activeCourse.completedChapters?.includes(c.id));
                                        
                                        const isLocked = activeCourse.isNewTopic && !isCompleted && !isPreviousChapterCompleted && !(mIndex === 0 && cIndex === 0);

                                        return (
                                        <li key={chapter.id}>
                                            <button 
                                                onClick={() => {
                                                    setCurrentModuleIndex(mIndex);
                                                    setCurrentChapterIndex(cIndex);
                                                }}
                                                disabled={isLocked}
                                                className={cn(
                                                    "w-full text-left p-2 rounded-md text-sm flex items-center gap-2",
                                                    isCurrent ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted",
                                                    isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                )}
                                            >
                                                <CheckCircle size={14} className={cn(isCompleted ? "text-green-500" : "text-muted-foreground/50")} />
                                                <span className="flex-1">{chapter.title}</span>
                                                {quizResultForChapter && (
                                                    <span className={cn(
                                                        "text-xs font-semibold",
                                                        (quizResultForChapter.score / quizResultForChapter.totalQuestions) * 100 > 80 ? 'text-green-500' : 'text-yellow-500'
                                                    )}>
                                                        {Math.round((quizResultForChapter.score / quizResultForChapter.totalQuestions) * 100)}%
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    )})}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    )})}
                 </Accordion>
                 <div className="mt-4 pt-4 border-t">
                     <Button variant="outline" className="w-full" onClick={startNewCourse}>Back to Courses Overview</Button>
                 </div>
            </div>
        </aside>
        
        <main className="flex-1 p-6 overflow-y-auto relative">
             <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <PanelLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleOpenSlideshow}>
                        <Presentation className="mr-2 h-4 w-4"/> Slideshow Mode
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleStartTutorCall}>
                        <Phone className="mr-2 h-4 w-4"/> Start Tutorin Session
                    </Button>
                    <Button variant="outline" onClick={toggleFocusMode}>
                        {isFocusMode ? <Minimize className="mr-2 h-4 w-4"/> : <Maximize className="mr-2 h-4 w-4"/>}
                        {isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
                    </Button>
                     {activeCourse.isNewTopic && (
                        <Button onClick={handleCompleteAndContinue}>
                            {currentChapter?.title.includes('Quiz') ? 'Continue' : 'Complete & Continue'} <ChevronRight className="ml-2 h-4 w-4"/>
                        </Button>
                    )}
                </div>
            </div>

            {currentChapter && currentModule ? (
                 <div className="max-w-4xl mx-auto space-y-8 relative">
                     {popoverPosition && <TextSelectionMenu />}
                     <h1 className="text-4xl font-bold">{currentChapter.title}</h1>
                     
                      <div className="relative w-full aspect-video mb-6">
                        <ChapterImage course={activeCourse} module={currentModule} chapter={currentChapter} />
                    </div>
                     
                      {isChapterContentLoading[currentChapter.id] ? (
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                      ) : currentChapter.content ? (
                         <div 
                            ref={contentRef}
                            onMouseUp={handleMouseUp}
                            className="text-muted-foreground text-lg whitespace-pre-wrap leading-relaxed space-y-6"
                         >
                            {Array.isArray(currentChapter.content) ? (
                                currentChapter.content.map((block, index) => {
                                    if (block.type === 'text') {
                                        return <p key={index}>{block.content}</p>;
                                    }
                                    if (block.type === 'question' && block.question && block.options) {
                                        const key = `${currentChapter.id}-${index}`;
                                        const state = inlineQuizStates[key] || {};
                                        return (
                                            <Card key={key} className="bg-muted/50 my-8">
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-2"><Lightbulb size={18}/> Check Your Understanding</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="font-semibold mb-4">{block.question}</p>
                                                    <RadioGroup 
                                                        value={state.selectedAnswer} 
                                                        onValueChange={(val) => handleInlineAnswerChange(index, val)}
                                                        disabled={!!state.feedback}
                                                    >
                                                        <div className="space-y-2">
                                                            {block.options.map((opt, i) => {
                                                                const isCorrect = opt === block.correctAnswer;
                                                                const isSelected = opt === state.selectedAnswer;
                                                                return (
                                                                    <Label key={i} htmlFor={`check-${index}-${i}`} className={cn(
                                                                        "flex items-center gap-4 p-3 rounded-lg border transition-all",
                                                                        state.feedback === null && (isSelected ? "border-primary bg-primary/10" : "border-border hover:bg-muted cursor-pointer"),
                                                                        state.feedback && isCorrect && "border-green-500 bg-green-500/10",
                                                                        state.feedback && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                                                                    )}>
                                                                        <RadioGroupItem value={opt} id={`check-${index}-${i}`} />
                                                                        <span>{opt}</span>
                                                                        {state.feedback && isCorrect && <CheckCircle className="h-5 w-5 text-green-500 ml-auto"/>}
                                                                        {state.feedback && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto"/>}
                                                                    </Label>
                                                                )
                                                            })}
                                                        </div>
                                                    </RadioGroup>
                                                    <div className="mt-4 flex justify-end">
                                                        {state.feedback ? (
                                                            <p className={cn("text-sm font-semibold", state.feedback === 'correct' ? 'text-green-600' : 'text-red-600')}>
                                                                {state.feedback === 'correct' ? 'Correct!' : `Not quite. The correct answer is: ${block.correctAnswer}`}
                                                            </p>
                                                        ) : (
                                                            <Button size="sm" onClick={() => handleCheckInlineAnswer(index, block)} disabled={!state.selectedAnswer}>
                                                                Check Answer
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    }
                                    return null;
                                })
                            ) : (
                                <p>{currentChapter.content}</p>
                            )}
                        </div>
                       ) : (
                         <div className="text-center p-8 border-2 border-dashed rounded-lg">
                             <h3 className="text-lg font-semibold">This chapter's content hasn't been generated yet.</h3>
                              {activeCourse.isNewTopic && <p className="text-muted-foreground mt-1 mb-4">Click "Complete and Continue" on the previous chapter to unlock this one.</p>}
                         </div>
                       )}
                     
                    <div className="space-y-4 pt-8">
                         <div className="p-6 bg-amber-500/10 rounded-lg border border-amber-500/20">
                             <h5 className="font-semibold flex items-center gap-2 text-amber-700"><Lightbulb size={18}/> Suggested Activity</h5>
                             <div className="text-muted-foreground mt-2">
                                 {isChapterContentLoading[currentChapter.id] && !currentChapter.activity ? <Skeleton className="h-4 w-1/2" /> : <p>{currentChapter.activity || 'Generate chapter content to see an activity.'}</p>}
                             </div>
                         </div>
                          <div className="p-6 bg-blue-500/10 rounded-lg border border-blue-500/20">
                             <h5 className="font-semibold flex items-center gap-2 text-blue-700"><Video size={18}/> AI Video</h5>
                             <div className="text-muted-foreground mt-2 flex items-center justify-between">
                                 <p>Bring this chapter to life with a short AI-generated video.</p>
                                 <Button size="sm" onClick={handleGenerateVideoForChapter}>
                                    {chapterVideos[currentChapter.id] ? 'Watch Video Again' : 'Generate Video'}
                                </Button>
                             </div>
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
                                    <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : '')}>
                                         {msg.role === 'ai' && <Avatar><AvatarFallback><Bot size={20}/></AvatarFallback></Avatar>}
                                         <div className={cn("rounded-lg p-3 max-w-lg", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border')}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                         {msg.role === 'user' && <Avatar><AvatarFallback><User size={20}/></AvatarFallback></Avatar>}
                                    </div>
                                ))}
                                {isTutorLoading && (
                                     <div className="flex items-start gap-3">
                                        <Avatar><AvatarFallback><Bot size={20}/></AvatarFallback>
                                        </Avatar>
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
                    {activeCourse.isNewTopic ? (
                        <p className="text-muted-foreground">Select a chapter to begin.</p>
                    ) : (
                        <Card className="max-w-md mx-auto p-8">
                            <CardTitle>Manage Your Course</CardTitle>
                            <CardDescription className="mt-2 mb-6">This is an existing course. You can add units manually or generate them from a URL.</CardDescription>
                            <div className="flex flex-col gap-4">
                                <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
                                    <DialogTrigger asChild><Button><BookCopy className="mr-2 h-4 w-4"/> Add Unit Manually</Button></DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add a New Unit</DialogTitle>
                                            <DialogDescription>Create a new unit for your course.</DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label htmlFor="unit-title">Unit Title</Label>
                                            <Input id="unit-title" value={newUnitTitle} onChange={(e) => setNewUnitTitle(e.target.value)} placeholder="e.g., Unit 1: Introduction"/>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                            <Button onClick={handleManualAddUnit}>Add Unit</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                 <Dialog open={isAddUnitFromUrlOpen} onOpenChange={setIsAddUnitFromUrlOpen}>
                                    <DialogTrigger asChild><Button variant="outline"><LinkIcon className="mr-2 h-4 w-4"/> Add Units from URL</Button></DialogTrigger>
                                     <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Generate Units from URL</DialogTitle>
                                            <DialogDescription>Paste a URL (e.g., article, syllabus) to automatically generate units.</DialogDescription>
                                        </DialogHeader>
                                         <div className="py-4">
                                            <Label htmlFor="units-url">Content URL</Label>
                                            <Input id="units-url" value={newUnitsUrl} onChange={(e) => setNewUnitsUrl(e.target.value)} placeholder="https://example.com/course-syllabus"/>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                            <Button onClick={handleAddUnitsFromUrl} disabled={isGenerating}>
                                                {isGenerating ? "Generating..." : "Generate Units"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </main>
      </div>
    </>
  );
}

export default function CoursesClientPage() {
    return (
        <Suspense fallback={<Loading />} >
            <CoursesComponent />
        </Suspense>
    )
}

    
