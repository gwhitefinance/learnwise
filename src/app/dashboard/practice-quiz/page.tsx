

'use client';

import React, { useState, useEffect, useRef, useContext, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Award, BookOpen, Brush, CheckCircle, CheckSquare, ChevronLeft, ChevronRight, Clock, Eraser, FileText, GraduationCap, HelpCircle, Lightbulb, Loader2, Maximize, Minimize, Palette, PenSquare, RefreshCw, RotateCcw, Star, XCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateQuizInput, GenerateQuizOutput, QuizQuestion } from '@/ai/schemas/quiz-schema';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { generateExplanation, generateHint, generateFlashcardsFromNote, generateCrunchTimeStudyGuide } from '@/lib/actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import AudioPlayer from '@/components/audio-player';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { generateQuizAction } from '@/lib/actions';
import { RewardContext } from '@/context/RewardContext';
import Loading from './loading';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import type { CrunchTimeOutput } from '@/ai/schemas/crunch-time-schema';
import { Checkbox } from '@/components/ui/checkbox';
import TazCoinIcon from '@/components/TazCoinIcon';

export const dynamic = "force-dynamic";

type Course = {
    id: string;
    name: string;
    description: string;
};

type QuizState = 'start' | 'source-selection' | 'topic-selection' | 'configuring' | 'pre-quiz' | 'in-progress' | 'results' | 'ap-hub';
type AnswerState = 'unanswered' | 'answered';
type AnswerFeedback = { question: string; answer: string; correctAnswer: string; isCorrect: boolean; explanation?: string; };
type QuizResult = {
    id: string;
    mode: 'practice' | 'ap';
    topic: string;
    score: number;
    totalQuestions: number;
    timestamp: number;
};

type Flashcard = {
    front: string;
    back: string;
};


const examSpecificTypes = {
    'Med School': ['NCLEX', 'USMLE Step 1', 'USMLE Step 2', 'MCAT Biology', 'MCAT Chemistry', 'MCAT Physics', 'MCAT Psychology', 'PANCE', 'PANRE'],
    'Finance': ['Series 7', 'Series 63', 'Series 65', 'Series 66', 'CFA Level I', 'CFA Level II', 'CFA Level III', 'CFP'],
    'Law School': ['LSAT', 'Bar Exam (MBE)', 'MPRE'],
};

const apExams = [
    'AP Art History', 'AP Biology', 'AP Calculus AB', 'AP Calculus BC', 'AP Chemistry', 'AP Chinese Language', 'AP Comparative Government', 'AP Computer Science A', 'AP Computer Science Principles',
    'AP English Language', 'AP English Literature', 'AP Environmental Science', 'AP European History', 'AP French Language', 'AP German Language', 'AP Human Geography',
    'AP Italian Language', 'AP Japanese Language', 'AP Latin', 'AP Macroeconomics', 'AP Microeconomics', 'AP Music Theory', 'AP Physics 1', 'AP Physics 2', 'AP Physics C: E&M',
    'AP Physics C: Mechanics', 'AP Psychology', 'AP Spanish Language', 'AP Spanish Literature', 'AP Statistics', 'AP US Government', 'AP US History', 'AP World History'
];


type QuestionCounts = {
    [key: string]: number;
};

function PracticeQuizComponent() {
    const searchParams = useSearchParams();
    const initialTopic = searchParams.get('topic');
    const router = useRouter();

    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [topics, setTopics] = useState(initialTopic || '');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [language, setLanguage] = useState('English');
    
    const [questionCounts, setQuestionCounts] = useState<QuestionCounts>({
        'Multiple Choice': 10,
        'Short Answer': 0,
        'Free Response (FRQ)': 0,
        'True/False': 0,
        'Fill in the Blank': 0,
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [quizState, setQuizState] = useState<QuizState>('start');
    const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
    const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [answers, setAnswers] = useState<AnswerFeedback[]>([]);
    const [learnerType, setLearnerType] = useState<string | null>(null);
    const [quizMode, setQuizMode] = useState<'practice' | 'ap' | null>(null);
    const [creationSource, setCreationSource] = useState<'course' | 'prompt' | null>(null);
    
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);
    const { showReward } = useContext(RewardContext);

    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showFocusModeDialog, setShowFocusModeDialog] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [whiteboardData, setWhiteboardData] = useState<Record<number, string>>({});

    const [userCoins, setUserCoins] = useState(0);
    const [isHintLoading, setIsHintLoading] = useState(false);
    const [hint, setHint] = useState<string | null>(null);

    const [pastQuizzes, setPastQuizzes] = useState<QuizResult[]>([]);

    // State for post-quiz tools
    const [isFlashcardDialogOpen, setFlashcardDialogOpen] = useState(false);
    const [isFlashcardLoading, setFlashcardLoading] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const [isStudyGuideDialogOpen, setStudyGuideDialogOpen] = useState(false);
    const [isStudyGuideLoading, setStudyGuideLoading] = useState(false);
    const [studyGuide, setStudyGuide] = useState<CrunchTimeOutput | null>(null);
    const [isSavingGuide, setIsSavingGuide] = useState(false);


    useEffect(() => {
        const savedQuizzes = localStorage.getItem('pastQuizzes');
        if (savedQuizzes) {
            try {
                setPastQuizzes(JSON.parse(savedQuizzes));
            } catch(e) {
                console.error("Failed to parse past quizzes:", e);
                localStorage.removeItem('pastQuizzes');
            }
        }
    }, []);

    const saveQuizResult = (score: number, totalQuestions: number) => {
        if (!quizMode) return;
        const newResult: QuizResult = {
            id: crypto.randomUUID(),
            mode: quizMode,
            topic: topics,
            score: (score / totalQuestions) * 100,
            totalQuestions,
            timestamp: Date.now(),
        };
        const updatedQuizzes = [newResult, ...pastQuizzes];
        setPastQuizzes(updatedQuizzes);
        localStorage.setItem('pastQuizzes', JSON.stringify(updatedQuizzes));
    }


     useEffect(() => {
        const urlTopic = searchParams.get('topic');
        if (urlTopic) {
            setTopics(urlTopic);
            setQuizMode('practice');
            setCreationSource('prompt');
            setQuizState('topic-selection');
        }
    }, [searchParams]);

    useEffect(() => {
        if (!authLoading && user) {
            const q = query(collection(db, "courses"), where("userId", "==", user.uid));
            const unsubscribeCourses = onSnapshot(q, (querySnapshot) => {
                const userCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(userCourses);
                const matchingCourse = userCourses.find(c => c.name.toLowerCase() === (initialTopic || '').toLowerCase());
                if (matchingCourse) {
                    setSelectedCourseId(matchingCourse.id);
                }
            });

            const userDocRef = doc(db, 'users', user.uid);
            const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setUserCoins(doc.data().coins || 0);
                }
            });

            return () => {
                unsubscribeCourses();
                unsubscribeUser();
            };
        }
    }, [user, authLoading, initialTopic]);


    useEffect(() => {
        const storedLearnerType = localStorage.getItem('learnerType');
        setLearnerType(storedLearnerType ?? 'Unknown');

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFocusMode(false);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const enterFocusMode = () => {
        document.documentElement.requestFullscreen().then(() => {
            setIsFocusMode(true);
            setQuizState('in-progress');
        }).catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            setIsFocusMode(false);
            setQuizState('in-progress');
        });
        setShowFocusModeDialog(false);
    };

    const exitFocusMode = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setIsFocusMode(false);
    };
    
    const handleQuestionCountChange = (type: string, value: string) => {
        const count = parseInt(value, 10);
        if (!isNaN(count) && count >= 0) {
            setQuestionCounts(prev => ({...prev, [type]: count}));
        } else if (value === '') {
             setQuestionCounts(prev => ({...prev, [type]: 0}));
        }
    };


    const handleGenerateQuiz = async () => {
        let finalTopics = topics;
        if (creationSource === 'course' && selectedCourseId) {
            const course = courses.find(c => c.id === selectedCourseId);
            finalTopics = course?.name || topics;
        }

        if (!finalTopics.trim()) {
            toast({
                variant: 'destructive',
                title: 'Course or Topics are required',
                description: 'Please select a course or enter some topics for your quiz.',
            });
            return;
        }
        
        const totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);
        if (totalQuestions === 0) {
            toast({ variant: 'destructive', title: 'No questions selected.'});
            return;
        }

        setIsLoading(true);
        try {
            const generatedQuiz: GenerateQuizOutput = { questions: [] };

            const standardQuestionTypes = ['Multiple Choice', 'Short Answer', 'True/False', 'Fill in the Blank', 'Free Response (FRQ)'];

            for (const [type, count] of Object.entries(questionCounts)) {
                if (count > 0) {
                    const isStandard = standardQuestionTypes.includes(type);
                     const input: GenerateQuizInput = {
                        topics: isStandard ? finalTopics : `${finalTopics} - ${type}`,
                        questionType: isStandard ? type as any : 'Multiple Choice',
                        difficulty: difficulty, 
                        numQuestions: count,
                    };
                    const result = await generateQuizAction(input);
                    // Manually add the type to each question object
                    const questionsWithType = result.questions.map(q => ({...q, type }));
                    generatedQuiz.questions.push(...questionsWithType);
                }
            }

            setQuiz(generatedQuiz);
            setTopics(finalTopics);
            setQuizState('pre-quiz');
             toast({
                title: 'Quiz Generated!',
                description: 'Your quiz is ready.',
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate quiz. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const startQuiz = () => {
        if (showFocusModeDialog) {
            setShowFocusModeDialog(false);
        }
        setQuizState('in-progress');
    }
    
    const handleSubmitAnswer = async () => {
        if (!quiz || selectedAnswer === null || !user) return;
        
        const currentQuestion = quiz.questions[currentQuestionIndex] as QuizQuestion & { type?: string };
        let isCorrect = false;

        const cleanAndSplit = (text: string) => text.toLowerCase().replace(/[^A-Za-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

        if (currentQuestion.type === 'Free Response (FRQ)') {
            const answerKeywords = cleanAndSplit(currentQuestion.answer);
            const userKeywords = cleanAndSplit(selectedAnswer);
            const matchingKeywords = userKeywords.filter(uk => answerKeywords.some(ak => uk.includes(ak) || ak.includes(uk))).length;
            isCorrect = matchingKeywords >= 3;
        } else if (currentQuestion.type === 'Fill in the Blank') {
            const similarity = (s1: string, s2: string) => {
                let longer = s1.toLowerCase();
                let shorter = s2.toLowerCase();
                if (s1.length < s2.length) { longer = s2; shorter = s1; }
                const longerLength = longer.length;
                if (longerLength === 0) return 1.0;
                const editDistance = (s1: string, s2: string) => {
                    const costs: number[] = [];
                    for (let i = 0; i <= s1.length; i++) {
                        let lastValue = i;
                        for (let j = 0; j <= s2.length; j++) {
                            if (i === 0) costs[j] = j;
                            else if (j > 0) {
                                let newValue = costs[j - 1];
                                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j] ?? Infinity) + 1;
                                costs[j - 1] = lastValue; lastValue = newValue;
                            }
                        }
                        if (i > 0) costs[s2.length] = lastValue;
                    }
                    return costs[s2.length];
                };
                return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString());
            };
            isCorrect = similarity(selectedAnswer, currentQuestion.answer) >= 0.8;
        } else {
            isCorrect = selectedAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();
        }

        const answerFeedback: AnswerFeedback = {
            question: currentQuestion.question,
            answer: selectedAnswer,
            correctAnswer: currentQuestion.answer,
            isCorrect: isCorrect,
        };
        
        setAnswerState('answered');
        setFeedback(answerFeedback);
        setAnswers(prev => [...prev, answerFeedback]);
        
        if (!isCorrect) {
            try {
                await addDoc(collection(db, 'quizAttempts'), {
                    userId: user.uid,
                    question: currentQuestion.question,
                    userAnswer: selectedAnswer,
                    correctAnswer: currentQuestion.answer,
                    topic: topics,
                    courseId: selectedCourseId,
                    timestamp: serverTimestamp()
                });
            } catch (error) {
                console.error("Error saving incorrect answer:", error);
            }
            
            setIsExplanationLoading(true);
            setExplanation(null);
            try {
                const explanationResult = await generateExplanation({
                    question: currentQuestion.question,
                    userAnswer: selectedAnswer,
                    correctAnswer: currentQuestion.answer,
                    learnerType: (learnerType as 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading/Writing' | 'Unknown') ?? 'Unknown',
                    provideFullExplanation: true,
                });
                setExplanation(explanationResult.explanation);
            } catch (error) {
                console.error(error);
                setExplanation("Sorry, I couldn't generate an explanation for this question.");
            } finally {
                setIsExplanationLoading(false);
            }
        } else {
            // Award points for correct answer
             try {
                const xpEarned = difficulty === 'Hard' ? 15 : difficulty === 'Medium' ? 10 : 5;
                const coinsEarned = xpEarned * 2;
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    xp: increment(xpEarned),
                    coins: increment(coinsEarned),
                });
                showReward({ type: 'coins_and_xp', amount: coinsEarned, xp: xpEarned });
            } catch (e) {
                console.error("Error awarding points:", e);
            }
        }
    };

    const handleNextQuestion = async () => {
        if (!quiz || !user) return;
        setFeedback(null);
        setExplanation(null);
        setSelectedAnswer(null);
        setAnswerState('unanswered');
        setIsWhiteboardOpen(false);
        setHint(null);
        
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            const correctAnswers = answers.filter(a => a.isCorrect).length;
            
            saveQuizResult(correctAnswers, quiz.questions.length);

            if (correctAnswers > 0) {
                let coinsEarned = correctAnswers * 5;
                let xpEarned = correctAnswers * 10;
                
                try {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        coins: increment(coinsEarned),
                        xp: increment(xpEarned)
                    });
                    showReward({ type: 'coins_and_xp', amount: coinsEarned, xp: xpEarned });
                    toast({ title: "Quiz Complete!", description: `You earned ${coinsEarned} coins and ${xpEarned} XP!`});

                } catch(e) {
                    console.error("Error awarding coins:", e);
                    toast({
                        variant: 'destructive',
                        title: "Reward Award Failed",
                        description: "There was an issue awarding your rewards. Please try again."
                    })
                }
            }
            if (isFocusMode) exitFocusMode();
            setQuizState('results');
        }
    };
    
    const handleStartNewQuiz = () => {
        if (isFocusMode) exitFocusMode();
        setQuizState('start');
        setQuiz(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setTopics('');
        setSelectedCourseId(null);
        setFeedback(null);
        setAnswerState('unanswered');
        setWhiteboardData({});
        setIsWhiteboardOpen(false);
        setHint(null);
        setCreationSource(null);
        setQuestionCounts({
            'Multiple Choice': 10,
            'Short Answer': 0,
            'Free Response (FRQ)': 0,
            'True/False': 0,
            'Fill in the Blank': 0,
        });
    }

    const handleGetHint = async () => {
        if (!quiz || !user) return;
        if (userCoins < 10) {
            toast({ variant: 'destructive', title: "Not enough coins!", description: "You need 10 coins to get a hint."});
            return;
        }

        setIsHintLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { coins: increment(-10) });

            const currentQuestion = quiz.questions[currentQuestionIndex];
            const { hint } = await generateHint({
                question: currentQuestion.question,
                options: currentQuestion.options || [],
                correctAnswer: currentQuestion.answer
            });
            
            setHint(hint);

        } catch (error) {
            console.error("Failed to get hint:", error);
            toast({ variant: 'destructive', title: 'Could not get a hint.' });
             const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { coins: increment(10) });

        } finally {
            setIsHintLoading(false);
        }
    };

    const handleGenerateFlashcards = async () => {
        if (!quiz) return;
        setFlashcardDialogOpen(true);
        setFlashcardLoading(true);
        setFlashcards([]);
        const quizContent = quiz.questions.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n');
        try {
            const result = await generateFlashcardsFromNote({
                noteContent: quizContent,
                learnerType: (learnerType as any) ?? 'Reading/Writing'
            });
            setFlashcards(result.flashcards);
        } catch (error) {
            console.error("Failed to generate flashcards:", error);
            toast({ variant: 'destructive', title: 'Flashcard Generation Failed' });
            setFlashcardDialogOpen(false);
        } finally {
            setFlashcardLoading(false);
        }
    };

    const handleGenerateStudyGuide = async () => {
        if (!quiz) return;
        setStudyGuideDialogOpen(true);
        setStudyGuideLoading(true);
        setStudyGuide(null);
        const content = `A quiz on the following topics: ${topics}. The questions covered were: ${quiz.questions.map(q => q.question).join(', ')}`;
        try {
            const result = await generateCrunchTimeStudyGuide({
                inputType: 'text',
                content: content,
                learnerType: (learnerType as any) ?? 'Reading/Writing'
            });
            setStudyGuide(result);
        } catch (error) {
            console.error("Failed to generate study guide:", error);
            toast({ variant: 'destructive', title: 'Study Guide Generation Failed' });
            setStudyGuideDialogOpen(false);
        } finally {
            setStudyGuideLoading(false);
        }
    }
    
    const handleSaveStudyGuide = async () => {
        if (!studyGuide || !user) return;
        
        setIsSavingGuide(true);
        try {
            await addDoc(collection(db, 'studyGuides'), {
                userId: user.uid,
                courseId: selectedCourseId,
                title: studyGuide.title,
                summary: studyGuide.summary,
                keyConcepts: studyGuide.keyConcepts,
                studyPlan: studyGuide.studyPlan,
                createdAt: serverTimestamp(),
            });
            toast({ title: "Study Guide Saved!", description: "You can find it in the 'Study Guides' tab on your course page." });
            setStudyGuideDialogOpen(false);
        } catch (error) {
            console.error("Error saving study guide:", error);
            toast({ variant: 'destructive', title: 'Save Failed' });
        } finally {
            setIsSavingGuide(false);
        }
    };

    const handleExportStudyGuide = () => {
        if (!studyGuide) return;
        
        let content = `Title: ${studyGuide.title}\n\n`;
        content += `Summary:\n${studyGuide.summary}\n\n`;
        content += `Key Concepts:\n`;
        studyGuide.keyConcepts.forEach(c => {
            content += `- ${c.term}: ${c.definition}\n`;
        });
        content += `\nStudy Plan:\n`;
        studyGuide.studyPlan.forEach((s, i) => {
            content += `${i + 1}. ${s.step}: ${s.description}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${studyGuide.title.replace(/\s+/g, '_')}_Study_Guide.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas || !isDrawing) return;
        const context = canvas.getContext('2d');
        if (context) {
            context.closePath();
            setWhiteboardData(prev => ({
                ...prev,
                [currentQuestionIndex]: canvas.toDataURL()
            }));
        }
        setIsDrawing(false);
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        setWhiteboardData(prev => ({
            ...prev,
            [currentQuestionIndex]: ''
        }));
    };
    
    const onWhiteboardOpenChange = (open: boolean) => {
        setIsWhiteboardOpen(open);
        if (open) {
             setTimeout(() => {
                const canvas = canvasRef.current;
                if (canvas) {
                    const parent = canvas.parentElement;
                    if (parent) {
                        canvas.width = parent.clientWidth;
                        canvas.height = 300;
                        
                        const context = canvas.getContext('2d');
                        if (context && whiteboardData[currentQuestionIndex]) {
                            const img = new Image();
                            img.onload = () => {
                                context.drawImage(img, 0, 0);
                            };
                            img.src = whiteboardData[currentQuestionIndex];
                        }
                    }
                }
            }, 0);
        }
    };

    const whiteboardColors = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

    const score = answers.filter(a => a.isCorrect).length;
    const totalQuestions = quiz?.questions.length ?? 0;

    if (quizState === 'start') {
        return (
             <div className="flex flex-col items-center">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold">Choose an Option to Start Studying</h1>
                </div>
                 <div className="w-full max-w-4xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={() => { setQuizMode('practice'); setQuizState('source-selection');}} className="p-8 rounded-lg text-left transition-all bg-green-500/10 border-2 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50">
                            <CheckSquare className="h-8 w-8 text-green-500 mb-2"/>
                            <h3 className="text-xl font-bold">Take a Practice Test</h3>
                            <p className="text-sm text-muted-foreground">Generate a practice test from your course content and get ready for your test.</p>
                        </button>
                        <button onClick={() => { setQuizMode('ap'); setQuizState('ap-hub'); }} className="p-8 rounded-lg text-left transition-all bg-blue-500/10 border-2 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50">
                            <GraduationCap className="h-8 w-8 text-blue-500 mb-2"/>
                            <h3 className="text-xl font-bold">AP Hub</h3>
                            <p className="text-sm text-muted-foreground">Choose from any of the 35 AP courses and take exam-style tests.</p>
                        </button>
                    </div>
                 </div>
                 {pastQuizzes.length > 0 ? (
                    <div className="w-full max-w-4xl mt-12">
                        <Tabs defaultValue="tests" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="tests">Tests</TabsTrigger>
                                <TabsTrigger value="ap">AP Hub</TabsTrigger>
                            </TabsList>
                            <TabsContent value="tests" className="mt-4">
                                <div className="space-y-2">
                                    {pastQuizzes.filter(q => q.mode === 'practice').map(q => (
                                        <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{q.topic}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(q.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={q.score > 70 ? 'default' : 'secondary'}>{q.score.toFixed(0)}%</Badge>
                                                <Button variant="ghost" size="sm">Review</Button>
                                            </div>
                                        </div>
                                    ))}
                                    {pastQuizzes.filter(q => q.mode === 'practice').length === 0 && (
                                        <p className="text-center py-8 text-muted-foreground">You haven't taken any practice tests yet.</p>
                                    )}
                                </div>
                            </TabsContent>
                             <TabsContent value="ap" className="mt-4">
                                <div className="space-y-2">
                                    {pastQuizzes.filter(q => q.mode === 'ap').map(q => (
                                        <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{q.topic}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(q.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={q.score > 70 ? 'default' : 'secondary'}>{q.score.toFixed(0)}%</Badge>
                                                <Button variant="ghost" size="sm">Review</Button>
                                            </div>
                                        </div>
                                    ))}
                                    {pastQuizzes.filter(q => q.mode === 'ap').length === 0 && (
                                        <p className="text-center py-8 text-muted-foreground">You haven't taken any AP tests yet.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl mt-12 text-center text-muted-foreground">
                        <p>You haven't started a test yet.</p>
                    </div>
                )}
             </div>
        )
    }

     if (quizState === 'ap-hub') {
        return (
            <div className="flex flex-col items-center">
                <div className="text-center mb-10 w-full max-w-2xl">
                    <h1 className="text-4xl font-bold">AP Hub</h1>
                    <p className="text-muted-foreground mt-2">Select an AP exam to start a practice test.</p>
                </div>
                <Card className="w-full max-w-4xl">
                    <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {apExams.map(exam => (
                            <Button
                                key={exam}
                                variant="outline"
                                className="justify-start"
                                onClick={() => {
                                    setTopics(exam);
                                    setQuizMode('ap');
                                    setQuizState('configuring');
                                }}
                            >
                                {exam}
                            </Button>
                        ))}
                    </CardContent>
                    <CardFooter className="bg-muted/50 border-t p-4">
                        <Button variant="ghost" onClick={() => setQuizState('start')}>Back</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (quizState === 'source-selection') {
        return (
            <div className="flex flex-col items-center max-w-2xl mx-auto">
                <div className="w-full text-left mb-10">
                    <h1 className="text-4xl font-bold">Create a Test</h1>
                    <p className="text-muted-foreground mt-2">Generate a practice test from your study set, and get ready for your test.</p>
                </div>
                <div className="w-full space-y-6">
                    <h2 className="text-xl font-semibold text-left">How would you like to create your test?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => {setCreationSource('course'); setQuizState('topic-selection');}} className={cn("p-6 rounded-lg text-left transition-all border-2", creationSource === 'course' ? 'border-primary bg-primary/10' : 'bg-muted/50 border-transparent hover:border-primary/50')}>
                            <div className="mb-4 bg-background p-2 rounded-md inline-block border"><BookOpen className="h-6 w-6 text-primary"/></div>
                            <h3 className="font-semibold">From Course</h3>
                            <p className="text-sm text-muted-foreground">Create a test from your course materials.</p>
                        </button>
                        <button onClick={() => {setCreationSource('prompt'); setQuizState('topic-selection');}} className={cn("p-6 rounded-lg text-left transition-all border-2", creationSource === 'prompt' ? 'border-primary bg-primary/10' : 'bg-muted/50 border-transparent hover:border-primary/50')}>
                            <div className="mb-4 bg-background p-2 rounded-md inline-block border"><FileText className="h-6 w-6 text-primary"/></div>
                            <h3 className="font-semibold">From Prompt</h3>
                            <p className="text-sm text-muted-foreground">Create a test from a topic or prompt.</p>
                        </button>
                    </div>
                </div>
                <div className="w-full flex justify-between items-center mt-8">
                    <Button variant="ghost" onClick={() => setQuizState('start')}>Back</Button>
                </div>
            </div>
        )
    }
    
    if (quizState === 'topic-selection') {
        return (
            <div className="flex flex-col items-center">
                <div className="text-center mb-10 w-full max-w-2xl">
                    <h1 className="text-4xl font-bold">Test Details</h1>
                    <p className="text-muted-foreground mt-2">Select a source and specify the details for your test.</p>
                </div>
                <Card className="w-full max-w-2xl">
                    <CardContent className="p-6 space-y-6">
                        {creationSource === 'course' ? (
                            <div className="space-y-2">
                                <Label htmlFor="course">Course</Label>
                                <Select onValueChange={setSelectedCourseId} value={selectedCourseId ?? ''} disabled={courses.length === 0}>
                                    <SelectTrigger id="course">
                                        <SelectValue placeholder={courses.length > 0 ? "Select a course..." : "No courses found"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(course => (
                                            <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                             <div className="space-y-2">
                                <Label htmlFor="topics">Topic(s)</Label>
                                <Input
                                    id="topics"
                                    placeholder="e.g., The Cell Cycle, American Revolution"
                                    value={topics}
                                    onChange={(e) => setTopics(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger id="language"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="English">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="difficulty">Difficulty Level</Label>
                             <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                                <SelectTrigger id="difficulty"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-6 bg-muted/50 border-t">
                        <Button variant="ghost" onClick={() => setQuizState(quizMode === 'practice' ? 'source-selection' : 'start')}>Back</Button>
                        <Button onClick={() => setQuizState('configuring')} disabled={creationSource === 'course' && !selectedCourseId}>Next</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (quizState === 'configuring') {
        return (
            <div className="flex flex-col items-center">
                 <div className="text-center mb-10 w-full max-w-2xl">
                    <h1 className="text-4xl font-bold">Select Question Types</h1>
                    <p className="text-muted-foreground mt-2">Choose the types and number of questions for your test</p>
                </div>
                 <Card className="w-full max-w-2xl">
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {Object.entries(questionCounts).filter(([type]) => ['Multiple Choice', 'Short Answer', 'True/False', 'Fill in the Blank', 'Free Response (FRQ)'].includes(type)).map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between">
                                    <Label htmlFor={type} className="text-base">{type}</Label>
                                    <Input 
                                        id={type} 
                                        type="number" 
                                        className="w-20 h-10 text-center" 
                                        value={count} 
                                        onChange={(e) => handleQuestionCountChange(type, e.target.value)}
                                        min={0}
                                    />
                                </div>
                            ))}
                        </div>

                         {quizMode === 'practice' && (
                             <Accordion type="single" collapsible>
                                <AccordionItem value="exam-specific">
                                    <AccordionTrigger>Exam-Specific Question Types</AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                        {Object.entries(examSpecificTypes).map(([category, exams]) => (
                                            <div key={category}>
                                                <h4 className="font-semibold text-md mb-2">{category}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {exams.map(exam => (
                                                         <div key={exam} className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                                                            <Checkbox id={exam} onCheckedChange={(checked) => handleQuestionCountChange(exam, checked ? '5' : '0')} />
                                                            <Label htmlFor={exam} className="text-sm font-medium">{exam}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                         )}
                     </CardContent>
                     <CardFooter className="flex justify-between p-6 bg-muted/50 border-t">
                         <Button variant="ghost" onClick={() => setQuizState('topic-selection')}>Back</Button>
                         <Button onClick={handleGenerateQuiz} disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create'}
                        </Button>
                     </CardFooter>
                </Card>
            </div>
        )
    }

    if (quizState === 'pre-quiz') {
        return (
             <div className="flex flex-col items-center justify-center min-h-[60vh]">
                 <Card className="w-full max-w-lg text-center p-8">
                     <CardHeader>
                        <h2 className="text-3xl font-bold">Ready for your test?</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg grid grid-cols-3 divide-x">
                            <div className="px-2"><p className="text-sm text-muted-foreground">Questions</p><p className="font-bold text-lg">{quiz?.questions.length}</p></div>
                            <div className="px-2"><p className="text-sm text-muted-foreground">Difficulty</p><p className="font-bold text-lg">{difficulty}</p></div>
                            <div className="px-2"><p className="text-sm text-muted-foreground">Topic</p><p className="font-bold text-lg truncate">{topics}</p></div>
                        </div>
                        <p className="text-muted-foreground">Would you like to enter Focus Mode for a distraction-free experience?</p>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-4">
                        <Button className="w-full" size="lg" onClick={enterFocusMode}><Maximize className="mr-2 h-4 w-4"/> Start in Focus Mode</Button>
                        <Button className="w-full" size="lg" variant="outline" onClick={startQuiz}>Start Quiz</Button>
                    </CardFooter>
                 </Card>
            </div>
        )
    }

    if (quizState === 'in-progress' && quiz) {
        const currentQuestion = quiz.questions[currentQuestionIndex] as QuizQuestion & { type?: string };
        const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

        return (
             <div className="flex flex-col items-center">
                {isFocusMode && (
                    <Button onClick={exitFocusMode} variant="outline" className="fixed top-4 right-4 z-50">
                        <Minimize className="mr-2 h-4 w-4"/> Exit Focus Mode
                    </Button>
                )}
                <div className="text-center mb-10 w-full max-w-3xl">
                    <p className="text-muted-foreground mb-2">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                    <Progress value={progress} className="mb-4 h-2"/>
                    <h1 className="text-3xl font-bold mt-8">{currentQuestion.question}</h1>
                </div>

                <Card className="w-full max-w-3xl">
                    <CardContent className="p-8">
                         {currentQuestion.options && currentQuestion.options.length > 0 ? (
                            <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} disabled={answerState === 'answered'}>
                                <div className="space-y-4">
                                {currentQuestion.options?.map((option, index) => (
                                    <Label key={index} htmlFor={`option-${index}`} className={cn(
                                        "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                        answerState === 'unanswered' && (selectedAnswer === option ? "border-primary bg-primary/10" : "border-border hover:bg-muted"),
                                        answerState === 'answered' && option === currentQuestion.answer && "border-green-500 bg-green-500/10",
                                        answerState === 'answered' && selectedAnswer === option && option !== currentQuestion.answer && "border-red-500 bg-red-500/10",
                                    )}>
                                        <RadioGroupItem value={option} id={`option-${index}`} />
                                        <span>{option}</span>
                                    </Label>
                                ))}
                                </div>
                            </RadioGroup>
                        ) : (
                            <Textarea 
                                placeholder="Type your answer here..."
                                value={selectedAnswer || ''}
                                onChange={(e) => setSelectedAnswer(e.target.value)}
                                disabled={answerState === 'answered'}
                                className={cn(
                                    "min-h-[150px] text-base",
                                    answerState === 'answered' && feedback?.isCorrect && "bg-green-500/10 border-green-500",
                                    answerState === 'answered' && !feedback?.isCorrect && "bg-red-500/10 border-red-500"
                                )}
                            />
                        )}
                         <div className="mt-8 flex justify-between items-center">
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => onWhiteboardOpenChange(!isWhiteboardOpen)}><PenSquare className="mr-2 h-4 w-4"/> Whiteboard</Button>
                                <Button variant="outline" onClick={handleGetHint} disabled={isHintLoading || answerState === 'answered'}>
                                    {isHintLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <TazCoinIcon className="mr-2 h-4 w-4"/>}
                                    Hint (10 Coins)
                                </Button>
                            </div>
                            {answerState === 'unanswered' ? (
                                <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
                                    Submit
                                </Button>
                            ) : (
                                <Button onClick={handleNextQuestion}>
                                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <Collapsible open={isWhiteboardOpen} onOpenChange={onWhiteboardOpenChange}>
                             <CollapsibleContent>
                                <div className="mt-4 p-4 border rounded-lg">
                                    <div className="flex justify-end items-center gap-2 mb-2">
                                         <Popover>
                                            <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon"><Palette /></Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-2">
                                            <div className="flex gap-1">
                                                {whiteboardColors.map(c => (
                                                <button 
                                                    key={c}
                                                    onClick={() => setColor(c)}
                                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-primary' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                                ))}
                                            </div>
                                            </PopoverContent>
                                        </Popover>
                                         <Popover>
                                            <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon"><Brush /></Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-40 p-2">
                                            <Slider
                                                defaultValue={[brushSize]}
                                                max={30}
                                                min={1}
                                                step={1}
                                                onValueChange={(value) => setBrushSize(value[0])}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                         <Button variant="destructive" size="icon" onClick={clearCanvas}>
                                            <Eraser />
                                        </Button>
                                    </div>
                                    <canvas
                                        ref={canvasRef}
                                        className="w-full h-[300px] bg-muted rounded-md border border-dashed"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                    />
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </CardContent>
                </Card>
                
                 <Dialog open={!!hint} onOpenChange={(open) => !open && setHint(null)}>
                    <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-200 to-yellow-300">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-amber-900">
                                <HelpCircle /> Here's a Hint!
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 text-amber-800 font-medium">
                            {hint}
                        </div>
                         <DialogFooter>
                            <Button onClick={() => setHint(null)} className="bg-amber-800 hover:bg-amber-900 text-white">Got it</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={answerState === 'answered' && !feedback?.isCorrect} onOpenChange={(open) => !open && handleNextQuestion()}>
                    <DialogContent>
                        <DialogHeader>
                             <div className="flex items-center gap-2 text-red-600">
                                <XCircle className="h-8 w-8"/>
                                <DialogTitle className="text-2xl">Not Quite...</DialogTitle>
                            </div>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                            <div>
                                <h4 className="font-semibold">Your Answer:</h4>
                                <p className="text-muted-foreground">{feedback?.answer}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold">Correct Answer:</h4>
                                <p className="text-muted-foreground">{feedback?.correctAnswer}</p>
                            </div>
                            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <h4 className="font-semibold flex items-center gap-2 text-amber-700"><Lightbulb/> Explanation</h4>
                                {isExplanationLoading ? (
                                    <p className="animate-pulse text-muted-foreground mt-2">Generating personalized feedback...</p>
                                ) : (
                                    <div className="text-muted-foreground mt-2">
                                        {explanation && <AudioPlayer textToPlay={explanation} />}
                                        <p>{explanation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                             <Button onClick={handleNextQuestion} disabled={isExplanationLoading}>
                               {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                               <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    if (quizState === 'results') {
        const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">You did it! Quiz complete.</h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card><CardHeader><CardTitle>Score</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold">{score}/{totalQuestions}</p></CardContent></Card>
                    <Card><CardHeader><CardTitle>Accuracy</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold">{accuracy.toFixed(0)}%</p></CardContent></Card>
                    <Card>
                        <CardHeader><CardTitle>Breakdown</CardTitle></CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <div className="flex justify-between"><span>Right</span><span>{score}</span></div>
                            <div className="flex justify-between"><span>Wrong</span><span>{totalQuestions - score}</span></div>
                            <div className="flex justify-between"><span>Skipped</span><span>0</span></div>
                        </CardContent>
                    </Card>
                </div>
                 <Card className="bg-muted/50">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary"><Zap className="h-8 w-8" /></div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-semibold text-lg">Strengths and Growth Areas</h3>
                            <p className="text-muted-foreground text-sm">Get a summary of your key strengths and discover areas where you can focus your studies.</p>
                        </div>
                        <Button>Analyze my performance</Button>
                    </CardContent>
                </Card>
                 <div>
                    <h2 className="text-2xl font-bold mb-4">Keep Learning</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Dialog open={isFlashcardDialogOpen} onOpenChange={setFlashcardDialogOpen}>
                            <DialogTrigger asChild>
                                 <Card className="cursor-pointer hover:bg-muted transition-colors" onClick={handleGenerateFlashcards}>
                                    <CardContent className="p-6 flex items-start gap-4">
                                        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500"><Star className="h-8 w-8"/></div>
                                        <div>
                                            <h3 className="font-semibold">Flashcards</h3>
                                            <p className="text-sm text-muted-foreground">Create a complete set of flashcards from all your quiz material. Good for quick review and mastering key concepts.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                             <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">Flashcards</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    {isFlashcardLoading ? (
                                        <div className="flex items-center justify-center h-52"><Loader2 className="w-8 h-8 animate-spin" /></div>
                                    ) : flashcards.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="text-center text-sm text-muted-foreground">Card {currentFlashcardIndex + 1} of {flashcards.length}</div>
                                            <div className="relative w-full h-64 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                                                <AnimatePresence>
                                                    <motion.div key={isFlipped ? 'back' : 'front'} initial={{ rotateY: isFlipped ? 180 : 0 }} animate={{ rotateY: 0 }} exit={{ rotateY: isFlipped ? 0 : -180 }} transition={{ duration: 0.5 }} style={{ backfaceVisibility: 'hidden' }} className="absolute w-full h-full p-6 flex items-center justify-center text-center rounded-lg border bg-card shadow-sm">
                                                        <p className="text-xl font-semibold">{isFlipped ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front}</p>
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>
                                            <div className="flex justify-center items-center gap-4">
                                                <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.max(0, prev - 1))}} disabled={currentFlashcardIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
                                                <Button onClick={() => setIsFlipped(!isFlipped)}><RefreshCw className="mr-2 h-4 w-4"/> Flip Card</Button>
                                                <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.min(flashcards.length - 1, prev + 1))}} disabled={currentFlashcardIndex === flashcards.length - 1}><ChevronRight className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    ) : (<div className="flex items-center justify-center h-52"><p>No flashcards were generated.</p></div>)}
                                </div>
                                <DialogFooter><DialogClose asChild><Button>Close</Button></DialogClose></DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isStudyGuideDialogOpen} onOpenChange={setStudyGuideDialogOpen}>
                             <DialogTrigger asChild>
                                <Card className="cursor-pointer hover:bg-muted transition-colors" onClick={handleGenerateStudyGuide}>
                                    <CardContent className="p-6 flex items-start gap-4">
                                        <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><BookOpen className="h-8 w-8"/></div>
                                        <div>
                                            <h3 className="font-semibold">Study guide</h3>
                                            <p className="text-sm text-muted-foreground">Generate a comprehensive study guide based on the materials you are studying. Good for in-depth review.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                             <DialogContent className="max-w-2xl">
                                <DialogHeader><DialogTitle>Your Study Guide for "{topics}"</DialogTitle></DialogHeader>
                                <div className="py-4 max-h-[70vh] overflow-y-auto">
                                    {isStudyGuideLoading ? (
                                        <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin"/></div>
                                    ) : studyGuide ? (
                                         <div className="space-y-6">
                                            <div className="p-4 border rounded-lg">
                                                <h4 className="font-semibold">Summary</h4>
                                                <p className="text-sm text-muted-foreground">{studyGuide.summary}</p>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <h4 className="font-semibold">Key Concepts</h4>
                                                <ul className="list-disc list-inside mt-2 space-y-2">
                                                    {studyGuide.keyConcepts.map(c => <li key={c.term}><span className="font-semibold">{c.term}:</span> {c.definition}</li>)}
                                                </ul>
                                            </div>
                                             <div className="p-4 border rounded-lg">
                                                <h4 className="font-semibold">Study Plan</h4>
                                                <ol className="list-decimal list-inside mt-2 space-y-2">
                                                     {studyGuide.studyPlan.map(s => <li key={s.step}><span className="font-semibold">{s.step}:</span> {s.description}</li>)}
                                                </ol>
                                            </div>
                                        </div>
                                    ) : <p>Could not generate study guide.</p>}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={handleExportStudyGuide}>Export as .txt</Button>
                                    <Button onClick={handleSaveStudyGuide} disabled={isSavingGuide}>
                                        {isSavingGuide ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        Save to Study Guides
                                    </Button>
                                    <DialogClose asChild><Button>Close</Button></DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                 <div className="flex justify-end gap-4">
                    <Button variant="ghost">Review quiz</Button>
                    <Button onClick={handleStartNewQuiz}>More questions</Button>
                </div>
            </div>
        )
    }

    return <div>Something went wrong. Please start a new quiz.</div>
}

export default function PracticeQuizPage() {
    return (
        <Suspense fallback={<Loading />}>
            <PracticeQuizComponent />
        </Suspense>
    )
}
    
    
    

    














