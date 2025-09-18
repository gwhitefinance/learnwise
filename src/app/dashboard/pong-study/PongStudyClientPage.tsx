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

type Course = {
    id: string;
    name: string;
    description: string;
    userId?: string;
};

type Question = GenerateQuizOutput['questions'][0];

// Game constants
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 10;

export default function PongStudyClientPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState({ player: 0, ai: 0 });
    const [question, setQuestion] = useState<Question | null>(null);
    const [isQuestionLoading, setIsQuestionLoading] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);

    // Game state refs
    const gameState = useRef({
        ballX: 400,
        ballY: 300,
        ballSpeedX: 5,
        ballSpeedY: 5,
        playerY: 250,
        aiY: 250,
    });
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
            setGameOver(true);
            setGameStarted(false);
        } finally {
            setIsQuestionLoading(false);
        }
    }, [selectedCourseId, courses, toast]);
    
    const pauseGame = () => {
        if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
        }
    };
    
    const resumeGame = () => {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    const resetBall = (playerScored: boolean) => {
        gameState.current.ballX = 400;
        gameState.current.ballY = 300;
        gameState.current.ballSpeedX = playerScored ? -5 : 5;
        gameState.current.ballSpeedY = Math.random() > 0.5 ? 5 : -5;
    };

    const endRound = (playerScored: boolean) => {
        pauseGame();
        if (playerScored) {
            getNewQuestion();
            setIsQuestionModalOpen(true);
        } else {
            setScore(s => ({ ...s, ai: s.ai + 1 }));
            resetBall(false);
            resumeGame();
        }
    };

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw middle line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.setLineDash([10, 10]);
        ctx.moveTo(ctx.canvas.width / 2, 0);
        ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);


        // Draw paddles
        ctx.fillStyle = 'white';
        ctx.fillRect(10, gameState.current.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillRect(ctx.canvas.width - 20, gameState.current.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

        // Draw ball
        ctx.beginPath();
        ctx.arc(gameState.current.ballX, gameState.current.ballY, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Draw score
        ctx.font = '50px Arial';
        ctx.fillText(`${score.player}`, ctx.canvas.width / 2 - 80, 60);
        ctx.fillText(`${score.ai}`, ctx.canvas.width / 2 + 50, 60);

    }, [score]);


    const gameLoop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { ballX, ballY, ballSpeedX, ballSpeedY, playerY, aiY } = gameState.current;

        // Move ball
        gameState.current.ballX += ballSpeedX;
        gameState.current.ballY += ballSpeedY;

        // Ball collision with top/bottom walls
        if (ballY + BALL_RADIUS > canvas.height || ballY - BALL_RADIUS < 0) {
            gameState.current.ballSpeedY *= -1;
        }

        // Ball collision with paddles
        // Player paddle
        if (
            ballX - BALL_RADIUS < 10 + PADDLE_WIDTH &&
            ballY > playerY &&
            ballY < playerY + PADDLE_HEIGHT
        ) {
            gameState.current.ballSpeedX *= -1;
        }

        // AI paddle
        if (
            ballX + BALL_RADIUS > canvas.width - 20 &&
            ballY > aiY &&
            ballY < aiY + PADDLE_HEIGHT
        ) {
            gameState.current.ballSpeedX *= -1;
        }

        // Score points
        if (ballX - BALL_RADIUS < 0) {
            // AI scores
            endRound(false);
        } else if (ballX + BALL_RADIUS > canvas.width) {
            // Player scores
            endRound(true);
        }

        // AI paddle movement
        const aiCenter = gameState.current.aiY + PADDLE_HEIGHT / 2;
        if (aiCenter < gameState.current.ballY - 35) {
            gameState.current.aiY += PADDLE_SPEED * 0.7; // Slower AI
        } else if (aiCenter > gameState.current.ballY + 35) {
            gameState.current.aiY -= PADDLE_SPEED * 0.7;
        }

        draw(ctx);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [draw]);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const newPlayerY = e.clientY - rect.top - PADDLE_HEIGHT / 2;
        gameState.current.playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, newPlayerY));
    };
    
    const resetGame = () => {
        setScore({ player: 0, ai: 0 });
        resetBall(true);
        setGameOver(false);
    };

    const startGame = () => {
        if (!selectedCourseId) {
            toast({ variant: 'destructive', title: 'Please select a course.'});
            return;
        }
        resetGame();
        setGameStarted(true);
        resumeGame();
    };
    
    const handleAnswerSubmit = () => {
        if (!question || !selectedAnswer || !question.options) return;

        const isCorrect = selectedAnswer === question.answer;
        setIsQuestionModalOpen(false);
        setSelectedAnswer(null);

        if(isCorrect) {
            toast({ title: "Correct!", description: "Point awarded!"});
            setScore(s => ({ ...s, player: s.player + 1 }));
            resetBall(true);
            resumeGame();
        } else {
            toast({ variant: 'destructive', title: "Incorrect!", description: `The correct answer was: ${question.answer}. Game Over.` });
            setGameOver(true);
            setGameStarted(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4">Study Pong</h1>
            
            {!gameStarted ? (
                <div className="text-center bg-card p-8 rounded-lg shadow-lg">
                    <p className="text-muted-foreground mb-4">Answer questions when you score to keep playing!</p>
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
                     {gameOver && <p className="mt-8 text-2xl font-bold">Game Over! Final Score: {score.player} - {score.ai}</p>}
                </div>
            ) : (
                <p className="text-muted-foreground mb-2">First to 10 points wins!</p>
            )}
            
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="bg-black rounded-lg mt-4 cursor-none"
                onMouseMove={handleMouseMove}
            />

            <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Point Challenge!</DialogTitle>
                        <DialogDescription>Answer correctly to score your point.</DialogDescription>
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
