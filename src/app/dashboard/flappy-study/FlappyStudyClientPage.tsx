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
const GRAVITY = 0.5;
const FLAP = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const PIPE_SPEED = 2;


const PongStudyPage = () => {
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
    const gameState = useRef({
        birdY: 300,
        birdV: 0,
        pipes: [] as {x: number, y: number}[],
        frame: 0
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
                 setIsQuestionModalOpen(true);
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

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw bird
        ctx.fillStyle = 'yellow';
        ctx.fillRect(50, gameState.current.birdY, 30, 30);

        // Draw pipes
        ctx.fillStyle = 'green';
        gameState.current.pipes.forEach(pipe => {
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y);
            ctx.fillRect(pipe.x, pipe.y + PIPE_GAP, PIPE_WIDTH, ctx.canvas.height - pipe.y - PIPE_GAP);
        });


        // Draw score
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText(`${score}`, ctx.canvas.width / 2, 50);

    }, [score]);


    const gameLoop = useCallback(() => {
        if (!gameStarted || isQuestionModalOpen) {
            if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Bird physics
        gameState.current.birdV += GRAVITY;
        gameState.current.birdY += gameState.current.birdV;

        // Pipe logic
        if(gameState.current.frame % 150 === 0) {
            const pipeY = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
            gameState.current.pipes.push({ x: canvas.width, y: pipeY });
        }

        gameState.current.pipes.forEach(pipe => {
            pipe.x -= PIPE_SPEED;
            if(pipe.x + PIPE_WIDTH < 0) {
                setScore(s => s + 1);
            }
        });
        gameState.current.pipes = gameState.current.pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);

        // Collision detection
        const bird = {x: 50, y: gameState.current.birdY, width: 30, height: 30};
        if(bird.y < 0 || bird.y + bird.height > canvas.height) {
            setGameOver(true);
            setGameStarted(false);
        }

        gameState.current.pipes.forEach(pipe => {
            if(
                bird.x < pipe.x + PIPE_WIDTH &&
                bird.x + bird.width > pipe.x &&
                (bird.y < pipe.y || bird.y + bird.height > pipe.y + PIPE_GAP)
            ) {
                getNewQuestion();
                gameState.current.pipes = gameState.current.pipes.filter(p => p !== pipe);
            }
        });
        
        gameState.current.frame++;
        draw(ctx);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [draw, gameStarted, isQuestionModalOpen, getNewQuestion]);
    
    const handleFlap = () => {
        if(!gameStarted || isQuestionModalOpen) return;
        gameState.current.birdV = FLAP;
    };
    
    const resetGame = () => {
        setScore(0);
        gameState.current.birdY = 300;
        gameState.current.birdV = 0;
        gameState.current.pipes = [];
        gameState.current.frame = 0;
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
            toast({ title: "Correct!", description: "You saved yourself!"});
            resumeGame();
        } else {
            toast({ variant: 'destructive', title: "Incorrect!", description: `The correct answer was: ${question.answer}. Game Over.` });
            setGameOver(true);
            setGameStarted(false);
        }
    };
    
    useEffect(() => {
        if(gameStarted) {
            window.addEventListener('keydown', (e) => e.code === 'Space' && handleFlap());
            canvasRef.current?.addEventListener('click', handleFlap);
        }
        return () => {
             window.removeEventListener('keydown', (e) => e.code === 'Space' && handleFlap());
             canvasRef.current?.removeEventListener('click', handleFlap);
        }
    }, [gameStarted]);
    
     useEffect(() => {
        if (gameStarted) {
            resumeGame();
        } else if (gameLoopRef.current){
            cancelAnimationFrame(gameLoopRef.current);
        }
    }, [gameStarted, gameLoop]);


    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4">Flappy Study</h1>
            
            {!gameStarted ? (
                <div className="text-center bg-card p-8 rounded-lg shadow-lg">
                    <p className="text-muted-foreground mb-4">Dodge pipes and answer questions to survive!</p>
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
                     {gameOver && <p className="mt-8 text-2xl font-bold">Game Over! Final Score: {score}</p>}
                </div>
            ) : (
                <p className="text-muted-foreground mb-2">Score: {score}</p>
            )}
            
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="bg-sky-400 rounded-lg mt-4 cursor-pointer"
            />

            <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Quick Question!</DialogTitle>
                        <DialogDescription>Answer correctly to pass through the pipe.</DialogDescription>
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

export default PongStudyPage;
