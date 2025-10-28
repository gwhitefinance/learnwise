'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { generateQuiz } from '@/ai/flows/quiz-flow';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Course = {
    id: string;
    name: string;
    description: string;
    userId?: string;
};

type Question = GenerateQuizOutput['questions'][0];

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type GameMode = 'Easy' | 'Medium' | 'Hard' | 'Adaptive';

const GRID_SIZE = 20;
const CANVAS_SIZE = 600;
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;

export default function SnakeClientPage() {
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
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [gameMode, setGameMode] = useState<GameMode>('Adaptive');
    const [countdown, setCountdown] = useState<number | null>(null);

    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);

    const gameState = useRef({
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        velocity: { x: 0, y: 0 },
        isPaused: false,
    });
    
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
        gameState.current.isPaused = true;
        try {
            const result = await generateQuiz({ 
                topics: course.name,
                questionType: 'Multiple Choice',
                difficulty: gameMode === 'Adaptive' ? difficulty : gameMode,
                numQuestions: 1,
            });
            if (result.questions && result.questions.length > 0) {
                setQuestion(result.questions[0]);
                setIsQuestionModalOpen(true);
            } else {
                throw new Error("No questions were generated.");
            }
        } catch (error) {
            console.error("Failed to generate question:", error);
            toast({ variant: 'destructive', title: 'Could not fetch a question.' });
            gameState.current.isPaused = false;
        } finally {
            setIsQuestionLoading(false);
        }
    }, [selectedCourseId, courses, toast, difficulty, gameMode]);

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        ctx.fillStyle = 'lime';
        gameState.current.snake.forEach(part => {
            ctx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
        });

        ctx.fillStyle = 'red';
        ctx.fillRect(gameState.current.food.x * GRID_SIZE, gameState.current.food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }, []);

    const gameLoop = useCallback(() => {
        if (gameState.current.isPaused || !gameStarted) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const head = { ...gameState.current.snake[0] };
        head.x += gameState.current.velocity.x;
        head.y += gameState.current.velocity.y;

        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
            setGameOver(true);
            setGameStarted(false);
            return;
        }

        for (let i = 1; i < gameState.current.snake.length; i++) {
            if (head.x === gameState.current.snake[i].x && head.y === gameState.current.snake[i].y) {
                setGameOver(true);
                setGameStarted(false);
                return;
            }
        }
        
        const newSnake = [head, ...gameState.current.snake];
        
        if (head.x === gameState.current.food.x && head.y === gameState.current.food.y) {
            setScore(s => s + 1);
            getNewQuestion();
            
            gameState.current.food = {
                x: Math.floor(Math.random() * TILE_COUNT),
                y: Math.floor(Math.random() * TILE_COUNT)
            };

        } else {
             newSnake.pop();
        }

        gameState.current.snake = newSnake;

        draw(ctx);
    }, [draw, gameStarted, getNewQuestion]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState.current.isPaused) return;

            switch (e.key) {
                case 'ArrowUp':
                    if (gameState.current.velocity.y === 0) gameState.current.velocity = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                    if (gameState.current.velocity.y === 0) gameState.current.velocity = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                    if (gameState.current.velocity.x === 0) gameState.current.velocity = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                    if (gameState.current.velocity.x === 0) gameState.current.velocity = { x: 1, y: 0 };
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const interval = setInterval(gameLoop, 100);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(interval);
        };
    }, [gameLoop]);

    useEffect(() => {
        if (countdown === null) return;
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCountdown(null);
            gameState.current.isPaused = false;
        }
    }, [countdown]);

    const resetGame = () => {
        gameState.current = {
            snake: [{ x: 10, y: 10 }],
            food: { x: 15, y: 15 },
            velocity: { x: 0, y: 0 },
            isPaused: false,
        };
        setScore(0);
        setGameOver(false);
        setDifficulty('Easy');
    };

    const startGame = () => {
        if (!selectedCourseId) {
            toast({ variant: 'destructive', title: 'Please select a course.'});
            return;
        }
        resetGame();
        setGameStarted(true);
    };
    
    const handleAnswerSubmit = () => {
        if (!question || !selectedAnswer || !question.options) return;

        const isCorrect = selectedAnswer === question.answer;
        setIsQuestionModalOpen(false);
        setSelectedAnswer(null);

        if (isCorrect) {
            toast({ title: "Correct!", description: "Get ready to move!" });
            if (gameMode === 'Adaptive') {
                if (difficulty === 'Easy') setDifficulty('Medium');
                else if (difficulty === 'Medium') setDifficulty('Hard');
            }
            setCountdown(3);
        } else {
            toast({ variant: 'destructive', title: "Incorrect!", description: `The correct answer was: ${question.answer}. Game Over.` });
            if (gameMode === 'Adaptive') setDifficulty('Easy');
            setGameOver(true);
            setGameStarted(false);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 relative">
            <h1 className="text-4xl font-bold mb-4">Study Snake</h1>

            {!gameStarted ? (
                <Card className="w-full max-w-md p-8 text-center">
                    <p className="text-muted-foreground mb-4">Answer questions to grow your snake!</p>
                     <div className="flex flex-col items-center gap-4">
                        <div className="w-full space-y-2 text-left">
                            <Label htmlFor="course-select">Select a Course</Label>
                            <Select onValueChange={setSelectedCourseId} value={selectedCourseId ?? ''} disabled={courses.length === 0}>
                                <SelectTrigger id="course-select" className="w-full">
                                    <SelectValue placeholder="Select a course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full space-y-2 text-left">
                           <Label htmlFor="difficulty-select">Difficulty</Label>
                           <Select onValueChange={(v) => setGameMode(v as GameMode)} defaultValue={gameMode}>
                                <SelectTrigger id="difficulty-select" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Adaptive">Adaptive</SelectItem>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={startGame} disabled={!selectedCourseId || authLoading} className="w-full">
                            {gameOver ? "Play Again" : "Start Game"}
                        </Button>
                    </div>
                     {gameOver && <p className="mt-8 text-2xl font-bold">Game Over! Final Score: {score}</p>}
                </Card>
            ) : (
                <p className="text-xl font-semibold mb-2">Score: {score}</p>
            )}
            
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="bg-black rounded-lg mt-4"
                />
                <AnimatePresence>
                    {countdown !== null && countdown > 0 && (
                        <motion.div
                            key={countdown}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <span className="text-9xl font-bold text-white" style={{ textShadow: '0 0 15px black' }}>
                                {countdown}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <Dialog open={isQuestionModalOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Question!</DialogTitle>
                        <DialogDescription>Answer correctly to continue.</DialogDescription>
                    </DialogHeader>
                    {isQuestionLoading || !question ? (
                        <div className="p-8 text-center">Loading question...</div>
                    ) : (
                        <div className="py-4">
                            <p className="font-semibold text-lg mb-4">{question.question}</p>
                            <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer}>
                                <div className="space-y-2">
                                    {question.options?.map((option, index) => (
                                         <Label key={index} htmlFor={`option-${index}`} className={cn("flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer", selectedAnswer === option ? "border-primary bg-primary/10" : "border-border hover:bg-muted")}>
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
