
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { generateQuiz } from '@/ai/flows/quiz-flow';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

type Course = {
    id: string;
    name: string;
    description: string;
    userId?: string;
};

type Question = GenerateQuizOutput['questions'][0];

// Game constants
const BIRD_SIZE = 40;
const PIPE_WIDTH = 80;
const PIPE_GAP = 200;
const GRAVITY = 0.6;
const FLAP_STRENGTH = -10;
const PIPE_SPEED = 5;

const FlappyStudyPage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [question, setQuestion] = useState<Question | null>(null);
    const [isQuestionLoading, setIsQuestionLoading] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);

    // Game state refs
    const birdY = useRef(300);
    const birdVelocity = useRef(0);
    const pipes = useRef<{x: number, y: number, passed?: boolean}[]>([]);
    const frameCount = useRef(0);
    const gameLoopRef = useRef<number>();

    useEffect(() => {
        if (authLoading || !user) return;

        const q = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            if (userCourses.length > 0 && !selectedCourseId) {
                setSelectedCourseId(userCourses[0].id);
            }
        });

        return () => unsubscribe();
    }, [user, authLoading, selectedCourseId]);

    const getNewQuestion = useCallback(async () => {
        if (!selectedCourseId) return;
        const course = courses.find(c => c.id === selectedCourseId);
        if (!course) return;

        setIsQuestionLoading(true);
        try {
            const result = await generateQuiz({ 
                topics: course.name,
                questionType: 'Multiple Choice',
                difficulty: 'Medium',
                numQuestions: 1,
            });
            if (result.questions && result.questions.length > 0) {
                 setQuestion(result.questions[0]);
            } else {
                throw new Error("No questions were generated.");
            }
        } catch (error) {
            console.error("Failed to generate question:", error);
            toast({ variant: 'destructive', title: 'Could not fetch a question.' });
            // If question fails, just end the game for now.
            setGameOver(true);
            setGameStarted(false);
        } finally {
            setIsQuestionLoading(false);
        }
    }, [selectedCourseId, courses, toast]);

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw bird
        ctx.fillStyle = 'yellow';
        ctx.fillRect(100, birdY.current, BIRD_SIZE, BIRD_SIZE);

        // Draw pipes
        ctx.fillStyle = 'green';
        pipes.current.forEach(pipe => {
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y);
            ctx.fillRect(pipe.x, pipe.y + PIPE_GAP, PIPE_WIDTH, ctx.canvas.height - pipe.y - PIPE_GAP);
        });

        // Draw score
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText(`Score: ${score}`, 20, 40);

    }, [score]);

    const endRound = () => {
        if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
        }
        setIsQuestionModalOpen(true);
        getNewQuestion();
    };

    const gameLoop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Bird physics
        birdVelocity.current += GRAVITY;
        birdY.current += birdVelocity.current;

        // Pipe generation
        if (frameCount.current % 90 === 0) {
            const pipeY = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
            pipes.current.push({ x: canvas.width, y: pipeY });
        }

        // Move pipes and check score
        pipes.current.forEach(pipe => {
            pipe.x -= PIPE_SPEED;
            if (pipe.x + PIPE_WIDTH < 100 && !pipe.passed) {
                setScore(s => s + 1);
                pipe.passed = true;
            }
        });
        pipes.current = pipes.current.filter(p => p.x + PIPE_WIDTH > 0);


        // Collision detection
        const birdBottom = birdY.current + BIRD_SIZE;
        if (birdBottom > canvas.height || birdY.current < 0) {
            endRound();
            return;
        }

        for (const pipe of pipes.current) {
            if (
                100 < pipe.x + PIPE_WIDTH &&
                100 + BIRD_SIZE > pipe.x &&
                (birdY.current < pipe.y || birdBottom > pipe.y + PIPE_GAP)
            ) {
                endRound();
                return;
            }
        }
        
        draw(ctx);
        frameCount.current++;
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [draw]);
    
    const handleFlap = useCallback(() => {
        if (!gameOver && gameStarted) {
            birdVelocity.current = FLAP_STRENGTH;
        }
    }, [gameOver, gameStarted]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleFlap();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleFlap]);
    
    const resetGame = (continueGame = false) => {
        birdY.current = 300;
        birdVelocity.current = 0;
        if (!continueGame) {
            setScore(0);
            pipes.current = [];
        }
        frameCount.current = 0;
        setGameOver(false);
    };

    const startGame = () => {
        if (!selectedCourseId) {
            toast({ variant: 'destructive', title: 'Please select a course.'});
            return;
        }
        resetGame();
        setGameStarted(true);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    const handleAnswerSubmit = () => {
        if (!question || !selectedAnswer || !question.options) return;

        const isCorrect = selectedAnswer === question.answer;
        setIsQuestionModalOpen(false);
        setSelectedAnswer(null);

        if(isCorrect) {
            toast({ title: "Correct!", description: "You get to continue!"});
            resetGame(true); // Continue game
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        } else {
            toast({ variant: 'destructive', title: "Incorrect!", description: `The correct answer was: ${question.answer}` });
            setGameOver(true);
            setGameStarted(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4">Flappy Study</h1>
            
            {!gameStarted ? (
                <div className="text-center bg-card p-8 rounded-lg shadow-lg">
                    <p className="text-muted-foreground mb-4">Select a course to get quizzed on as you play!</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Select onValueChange={setSelectedCourseId} value={selectedCourseId ?? ''} disabled={courses.length === 0}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select a course..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.length > 0 ? courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                )) : <div className="p-2 text-sm text-muted-foreground">No courses found.</div>}
                            </SelectContent>
                        </Select>
                        <Button onClick={startGame} disabled={!selectedCourseId || authLoading}>
                            {gameOver ? "Play Again" : "Start Game"}
                        </Button>
                    </div>
                     {gameOver && <p className="mt-8 text-2xl font-bold">Game Over! Your final score was: {score}</p>}
                </div>
            ) : (
                <p className="text-muted-foreground mb-2">Press Space or Click to Flap</p>
            )}
            
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="bg-sky-500 rounded-lg mt-4"
                onClick={handleFlap}
            />

            <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Question Time!</DialogTitle>
                        <DialogDescription>Answer correctly to continue your flight.</DialogDescription>
                    </DialogHeader>
                    {isQuestionLoading || !question ? (
                        <div className="p-8 text-center">Loading question...</div>
                    ) : (
                        <div className="py-4">
                            <p className="font-semibold text-lg mb-4">{question.question}</p>
                            <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer}>
                                <div className="space-y-2">
                                    {question.options?.map((option, index) => (
                                         <Label key={index} htmlFor={`option-${index}`} className={cn(
                                            "flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer",
                                            selectedAnswer === option ? "border-primary bg-primary/10" : "border-border hover:bg-muted",
                                        )}>
                                            <RadioGroupItem value={option} id={`option-${index}`} />
                                            <span>{option}</span>
                                        </Label>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                     <DialogFooter>
                        <Button onClick={handleAnswerSubmit} disabled={isQuestionLoading || !selectedAnswer}>Submit Answer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default dynamic(() => Promise.resolve(FlappyStudyPage), { ssr: false });

    