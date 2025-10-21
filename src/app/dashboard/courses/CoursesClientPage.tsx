
'use client';

import { useState, useEffect, useContext, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, ChevronLeft, ChevronRight, Wand2, FlaskConical, Lightbulb, Copy, RefreshCw, Check, Star, CheckCircle, Send, Bot, User, GitMerge, PanelLeft, Minimize, Maximize, Loader2, Plus, Trash2, MoreVertical, XCircle, ArrowRight, RotateCcw, Video, Image as ImageIcon, BookCopy, Link as LinkIcon, Headphones, Underline, Highlighter, Rabbit, Snail, Turtle, Book, Mic, Bookmark, Brain } from 'lucide-react';
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
import { generateInitialCourseAndRoadmap, generateQuizFromModule, generateFlashcardsFromNote, generateTutorResponse, generateChapterContent, generateMidtermExam, generateRoadmap, generateCourseFromUrl, generateSummary, generateConceptExplanation } from '@/lib/actions';
import { RewardContext } from '@/context/RewardContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Loading from './loading';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import GeneratingCourse from './GeneratingCourse';
import ListenAssistant from '@/components/ListenAssistant';
import { ScrollArea } from '@/components/ui/scroll-area';


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
    distractors?: string[];
    isRevealed?: boolean;
    isMastered?: boolean;
    userInput?: string;
    isCorrect?: boolean;
    options?: string[]; // For multiple choice
};

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

type AnswerFeedback = { question: string; answer: string; correctAnswer: string; isCorrect: boolean; explanation?: string; };

type QuizState = 'configuring' | 'in-progress' | 'results';
type AnswerState = 'unanswered' | 'answered';

type QuizResult = {
    score: number;
    totalQuestions: number;
    answers: AnswerFeedback[];
    timestamp: any;
}

const paces = [
  { value: "6", label: "Casual", description: "A relaxed pace for exploring.", icon: <Snail className="h-6 w-6" /> },
  { value: "3", label: "Steady", description: "A balanced pace for consistent learning.", icon: <Turtle className="h-6 w-6" /> },
  { value: "1", label: "Intense", description: "A fast-paced schedule for quick mastery.", icon: <Rabbit className="h-6 w-6" /> },
];

type CardType = 'input' | 'choice' | 'definition';

function CoursesComponent() {
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

  const [isListenAssistantVisible, setIsListenAssistantVisible] = useState(false);
  
  // Key Concepts Dialog State
  const [isConceptsOpen, setConceptsOpen] = useState(false);
  const [selectedConceptCourse, setSelectedConceptCourse] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [cardType, setCardType] = useState<CardType>('input');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExplanationDialogOpen, setExplanationDialogOpen] = useState(false);
  const [explanationTerm, setExplanationTerm] = useState<Flashcard | null>(null);
  const [explanation, setExplanation] = useState<any>({}); // Using 'any' for simplicity
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [knownTerms, setKnownTerms] = useState<Record<string, Flashcard[]>>({});
  

  useEffect(() => {
    if (authLoading || !user) return;

    const q = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
        setIsLoading(false);
        if (userCourses.length > 0 && !selectedConceptCourse) {
            setSelectedConceptCourse(userCourses[0].id);
        }
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

     const savedTerms = localStorage.getItem(`knownTerms_${user.uid}`);
    if (savedTerms) {
        setKnownTerms(JSON.parse(savedTerms));
    }


    return () => unsubscribe();
  }, [user, authLoading, searchParams, selectedConceptCourse]);
  
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
                            await handleGenerateChapterContent(mIdx, cIdx, courseData);
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
    loadCourseData();
  }, [selectedCourseId, user]);
  

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
  
  const currentModule = activeCourse?.units?.[currentModuleIndex];
  const currentChapter = currentModule?.chapters[currentChapterIndex];

  const handleGenerateCourse = async () => {
    if (!user || !newCourse.name || isNewTopic === null || !learnerType) return;
    
    setAddCourseOpen(false);
    setIsGenerating(true);
    
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
                ...(mIdx === 0 && cIdx === 0 ? firstChapterContent : {}),
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
    }
  };

  const handleCompleteAndContinue = async () => {
    if (!activeCourse || !user || !currentChapter || !currentModule) return;
    
    // Mark current chapter as complete
    const courseRef = doc(db, 'courses', activeCourse.id);
    await updateDoc(courseRef, { completedChapters: arrayUnion(currentChapter.id) });
    setActiveCourse(prev => prev ? { ...prev, completedChapters: [...(prev.completedChapters || []), currentChapter.id]} : null);

    // Open summary dialog
    setIsSummaryDialogOpen(true);
    setIsSummaryLoading(true);
    setNextChapterProgress(0);
    setSummaryForPopup('');

    // --- Start parallel AI calls ---
    
    // 1. Generate summary for the current chapter
    if (currentChapter.content) {
        generateSummary({ noteContent: currentChapter.content })
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
    let nextModuleIndex = currentModuleIndex;
    let nextChapterIndex = currentChapterIndex + 1;
    let isLastChapter = false;

    if (nextChapterIndex >= (currentModule.chapters.length ?? 0)) {
        nextModuleIndex++;
        nextChapterIndex = 0;
        if (nextModuleIndex >= (activeCourse.units?.length ?? 0)) {
            isLastChapter = true; 
        }
    }

    if (!isLastChapter) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 95) { // Don't let it hit 100 on its own
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

  // Key Concepts Dialog Functions
    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const handleGenerateFlashcards = useCallback(async () => {
        const course = courses.find(c => c.id === selectedConceptCourse);
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
    }, [courses, selectedConceptCourse, toast]);
    
    useEffect(() => {
        setIsFlipped(false); // Reset flip state when card or type changes
    }, [currentFlashcardIndex, cardType]);


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
            isCorrect = userInput === correctAnswer;
        }

        newFlashcards[index] = { ...card, isRevealed: true, isCorrect };
        setFlashcards(newFlashcards);
    };

    const handleExplainTerm = async (card: Flashcard) => {
        setExplanationTerm(card);
        setExplanation({});
        setExplanationDialogOpen(true);
        setIsExplanationLoading(true);
        const courseContext = courses.find(c => c.id === selectedConceptCourse)?.name || '';

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
        
        if (!newKnownTerms[selectedConceptCourse]) {
            newKnownTerms[selectedConceptCourse] = [];
        }

        if (!newKnownTerms[selectedConceptCourse].some(t => t.front === card.front)) {
            newKnownTerms[selectedConceptCourse].push(card);
            setKnownTerms(newKnownTerms);
            localStorage.setItem(`knownTerms_${user.uid}`, JSON.stringify(newKnownTerms));
            toast({ title: "Term Saved!", description: `"${card.front}" was added to your mastery list.`});
        } else {
            toast({ title: "Already Saved", description: `"${card.front}" is already in your mastery list.`});
        }
    };

  const chapterCount = activeCourse?.units?.reduce((acc, unit) => acc + (unit.chapters?.length ?? 0), 0) ?? 0;
  const completedChaptersCount = activeCourse?.completedChapters?.length ?? 0;
  const progress = chapterCount > 0 ? (completedChaptersCount / chapterCount) * 100 : 0;
  
  if (isGenerating) {
    return <GeneratingCourse courseName={newCourse.name} />;
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
                    <Button variant="outline" onClick={() => setConceptsOpen(true)}>
                        <Copy className="mr-2 h-4 w-4"/> Key Concepts
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
                                {(course.units && course.units.length > 0) || !course.isNewTopic ? (
                                    <Button className="w-full" onClick={() => setSelectedCourseId(course.id)}>
                                        Continue Learning
                                    </Button>
                                ) : (
                                    <Button className="w-full" onClick={() => {
                                        setNewCourse(course);
                                        setIsNewTopic(true); // Trigger "learning something new" flow
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
            
            <Dialog open={isConceptsOpen} onOpenChange={setConceptsOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Key Concepts Hub</DialogTitle>
                        <DialogDescription>
                            Master essential vocabulary with interactive flashcards and AI-powered explanations.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="flex-1 overflow-hidden grid grid-cols-3 gap-6">
                        <aside className="col-span-1 h-full bg-card border rounded-lg p-4 flex flex-col">
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
                         <main className="col-span-2 flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <Select value={selectedConceptCourse} onValueChange={setSelectedConceptCourse} disabled={isLoadingContent}>
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
                              {flashcards.length > 0 ? (
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
                                                            <p className="text-xl font-semibold">{flashcards[currentFlashcardIndex].front}</p>
                                                        </motion.div>
                                                        <motion.div
                                                            className="absolute w-full h-full p-6 flex items-center justify-center text-center rounded-lg border bg-muted text-card-foreground shadow-sm"
                                                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                                            initial={false}
                                                            animate={{ rotateY: isFlipped ? 0 : -180 }}
                                                            transition={{ duration: 0.6 }}
                                                        >
                                                            <p className="text-lg">{flashcards[currentFlashcardIndex].back}</p>
                                                        </motion.div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <CardTitle className="text-2xl mb-8 text-center">{flashcards[currentFlashcardIndex].front}</CardTitle>
                                                        {flashcards[currentFlashcardIndex].isRevealed ? (
                                                            <div className="space-y-4">
                                                                <p className={cn("p-3 rounded-md text-sm", flashcards[currentFlashcardIndex].isCorrect ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300")}>
                                                                    <strong>Your Answer:</strong> {flashcards[currentFlashcardIndex].userInput || "No answer"}
                                                                </p>
                                                                <p className="p-3 rounded-md bg-muted text-sm">
                                                                    <strong>Correct Answer:</strong> {flashcards[currentFlashcardIndex].back}
                                                                </p>
                                                            </div>
                                                        ) : cardType === 'input' ? (
                                                            <Input 
                                                                placeholder="Type the definition here..."
                                                                value={flashcards[currentFlashcardIndex].userInput || ''}
                                                                onChange={(e) => {
                                                                    const newFlashcards = [...flashcards];
                                                                    newFlashcards[currentFlashcardIndex].userInput = e.target.value;
                                                                    setFlashcards(newFlashcards);
                                                                }}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer(currentFlashcardIndex)}
                                                            />
                                                        ) : cardType === 'choice' && flashcards[currentFlashcardIndex].options ? (
                                                            <RadioGroup
                                                                value={flashcards[currentFlashcardIndex].userInput}
                                                                onValueChange={(value) => {
                                                                    const newFlashcards = [...flashcards];
                                                                    newFlashcards[currentFlashcardIndex].userInput = value;
                                                                    setFlashcards(newFlashcards);
                                                                }}
                                                            >
                                                                <div className="space-y-2">
                                                                {flashcards[currentFlashcardIndex].options?.map((option, i) => (
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
                                                    <Button variant="outline" onClick={() => handleExplainTerm(flashcards[currentFlashcardIndex])}>
                                                        <Wand2 className="mr-2 h-4 w-4"/> AI Explain It
                                                    </Button>
                                                    <Button variant="secondary" onClick={() => handleKnowTerm(flashcards[currentFlashcardIndex])}>
                                                        <Check className="mr-2 h-4 w-4" /> I Know This
                                                    </Button>
                                                </div>
                                                {cardType !== 'definition' ? (
                                                    flashcards[currentFlashcardIndex].isRevealed ? (
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
                                <Card className="text-center p-12 h-full flex flex-col justify-center items-center">
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
                                            <Button onClick={handleGenerateFlashcards} disabled={!selectedConceptCourse || isLoadingContent}>
                                                <Wand2 className="mr-2 h-4 w-4" /> Generate Flashcards for "{courses.find(c => c.id === selectedConceptCourse)?.name || '...'}"
                                            </Button>
                                        </>
                                    )}
                                </Card>
                            )}
                         </main>
                     </div>
                </DialogContent>
            </Dialog>
        </div>
    );
  }
  
  const isMidtermModule = activeCourse.units && currentModuleIndex === Math.floor(activeCourse.units.length / 2);
  const existingQuizResult = currentModule ? quizResults[currentModule.id] : undefined;

  if (currentChapter?.title.includes('Quiz') && currentModule) {
    
    if (existingQuizResult) {
        return (
            <div className="flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold">Quiz Results</h1>
                    <p className="text-muted-foreground mt-2">Here's how you did on the {currentModule.title} quiz.</p>
                </div>
                <Card className="w-full max-w-3xl">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-semibold">Your Score</h2>
                        <p className="text-6xl font-bold text-primary my-4">{existingQuizResult.score} / {existingQuizResult.totalQuestions}</p>
                        <p className="text-muted-foreground">You answered {((existingQuizResult.score / existingQuizResult.totalQuestions) * 100).toFixed(0)}% of the questions correctly.</p>

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
      {isListenAssistantVisible && currentChapter?.content && (
        <ListenAssistant 
            chapterContent={currentChapter.content}
            onClose={() => setIsListenAssistantVisible(false)}
        />
      )}
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><Book className="h-5 w-5 text-primary"/>Chapter Summary</DialogTitle>
                  <DialogDescription>
                      Here's a quick recap. The next chapter is being prepared.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                  {isSummaryLoading ? (
                      <div className="space-y-2">
                          <Skeleton className="h-4 w-full"/>
                          <Skeleton className="h-4 w-full"/>
                          <Skeleton className="h-4 w-2/3"/>
                      </div>
                  ) : (
                      <p className="text-sm text-muted-foreground max-h-32 overflow-y-auto">{summaryForPopup}</p>
                  )}
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

      <Dialog open={isNoteFromHighlightOpen} onOpenChange={setIsNoteFromHighlightOpen}>
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Save Highlight as Note</DialogTitle>
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
                        <div className="flex-1 overflow-hidden">
                             <h2 className="text-lg font-bold truncate">{activeCourse?.name}</h2>
                            <p className="text-sm text-muted-foreground">{chapterCount > 0 ? `${chapterCount} Chapters` : 'No units created'}</p>
                        </div>
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
                    
                    {chapterCount > 0 && <Progress value={progress} className="mt-2 h-2" />}
                </div>
                 <Accordion type="multiple" defaultValue={activeCourse?.units?.map(u => u.id)} className="w-full flex-1 overflow-y-auto">
                    {activeCourse?.units?.map((unit, mIndex) => {
                        let lastCompletedChapterIndex = -1;
                        unit.chapters.forEach((chap, cIdx) => {
                            if (activeCourse.completedChapters?.includes(chap.id)) {
                                lastCompletedChapterIndex = cIdx;
                            }
                        });

                        return (
                        <AccordionItem key={unit.id} value={unit.id}>
                            <AccordionTrigger className="text-md font-semibold">{unit.title}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-1 pl-4">
                                    {unit.chapters.map((chapter, cIndex) => {
                                        const isCurrent = currentModuleIndex === mIndex && currentChapterIndex === cIndex;
                                        const isCompleted = activeCourse.completedChapters?.includes(chapter.id) ?? false;
                                        const isLocked = activeCourse.isNewTopic && cIndex > lastCompletedChapterIndex + 1;
                                        
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
                                                {chapter.title}
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
                    <Button variant="outline" size="sm" onClick={() => setIsListenAssistantVisible(true)}>
                      <Headphones className="mr-2 h-4 w-4"/> Listen to Chapter
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
                                    <Image src={currentChapter.imageUrl} alt={`Header for ${currentChapter.title}`} fill objectFit="cover" />
                                </div>
                            )}
                             <div 
                                ref={contentRef}
                                onMouseUp={handleMouseUp}
                                className="text-muted-foreground text-lg whitespace-pre-wrap leading-relaxed" 
                             >{currentChapter.content}</div>
                            {currentChapter.diagramUrl && (
                                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                    <h5 className="font-semibold text-sm mb-2 flex items-center gap-2"><ImageIcon size={16} /> Diagram</h5>
                                    <div className="rounded-lg overflow-hidden border aspect-video relative">
                                        <Image src={currentChapter.diagramUrl} alt={`Diagram for ${currentChapter.title}`} fill objectFit="contain" />
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
                             {activeCourse.isNewTopic && <p className="text-muted-foreground mt-1 mb-4">Click "Complete and Continue" on the previous chapter to unlock this one.</p>}
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
                                            <Label htmlFor="unit-title">Unit Title</Label>
                                            <Input id="unit-title" value={newUnitTitle} onChange={(e) => setNewUnitTitle(e.target.value)} placeholder="e.g., Unit 1: Introduction"/>
                                        </DialogHeader>
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
                                            <Label htmlFor="units-url">Content URL</Label>
                                            <Input id="units-url" value={newUnitsUrl} onChange={(e) => setNewUnitsUrl(e.target.value)} placeholder="https://example.com/course-syllabus"/>
                                        </DialogHeader>
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
        <Suspense fallback={<Loading />}>
            <CoursesComponent />
        </Suspense>
    )
}
