
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { generateQuiz } from '@/ai/flows/quiz-flow';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { Label } from '@/components/ui/label';

type Course = {
    id: string;
    name: string;
    description: string;
    userId?: string;
};

type Question = GenerateQuizOutput['questions'][0];

type Asteroid = {
    x: number;
    y: number;
    text: string;
    width: number;
    isCorrect: boolean;
};

type Bullet = {
    x: number;
    y: number;
};

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type GameMode = 'Easy' | 'Medium' | 'Hard' | 'Adaptive';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SHIP_WIDTH = 40;
const SHIP_HEIGHT = 20;
const ASTEROID_HEIGHT = 40;
const PADDING = 20;

export default function TriviaBlasterClientPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [question, setQuestion] = useState<Question | null>(null);
    const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
    const [bullets, setBullets] = useState<Bullet[]>([]);
    const [shipX, setShipX] = useState(CANVAS_WIDTH / 2);
    const [isLoading, setIsLoading] = useState(false);
    
    const [gameMode, setGameMode] = useState<GameMode>('Adaptive');
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');

    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);

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

        setIsLoading(true);
        try {
            const result = await generateQuiz({
                topics: `${course.name} ${Math.random()}`,
                questionType: 'Multiple Choice',
                difficulty: gameMode === 'Adaptive' ? difficulty : gameMode,
                numQuestions: 1,
            });
            if (result.questions && result.questions.length > 0 && result.questions[0].options) {
                const q = result.questions[0];
                setQuestion(q);
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.font = '16px Arial';

                const newAsteroids = (q.options ?? []).map(option => ({
                    x: Math.random() * (CANVAS_WIDTH - 150),
                    y: -50 - Math.random() * 300,
                    text: option,
                    width: ctx.measureText(option).width + PADDING,
                    isCorrect: option === q.answer,
                }));
                setAsteroids(newAsteroids);
            } else {
                throw new Error("Generated question is invalid.");
            }
        } catch (error) {
            console.error("Failed to generate question:", error);
            toast({ variant: 'destructive', title: 'Could not fetch a question.' });
            setGameStarted(false);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCourseId, courses, toast, difficulty, gameMode]);

    const resetGame = () => {
        setScore(0);
        setGameOver(false);
        setBullets([]);
        setAsteroids([]);
        setQuestion(null);
        setDifficulty('Easy');
    };

    const startGame = () => {
        if (!selectedCourseId) {
            toast({ variant: 'destructive', title: 'Please select a course.' });
            return;
        }
        resetGame();
        setGameStarted(true);
        getNewQuestion();
    };

    const gameLoop = useCallback(() => {
        if (!gameStarted || gameOver || isLoading) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(shipX, CANVAS_HEIGHT - 30);
        ctx.lineTo(shipX - SHIP_WIDTH / 2, CANVAS_HEIGHT - 10);
        ctx.lineTo(shipX + SHIP_WIDTH / 2, CANVAS_HEIGHT - 10);
        ctx.closePath();
        ctx.fill();

        const newBullets = bullets.map(b => ({ ...b, y: b.y - 10 })).filter(b => b.y > 0);
        ctx.fillStyle = 'yellow';
        newBullets.forEach(b => {
            ctx.fillRect(b.x - 2, b.y, 4, 10);
        });

        const newAsteroids = asteroids.map(a => ({ ...a, y: a.y + 2 }));
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        newAsteroids.forEach(a => {
            ctx.beginPath();
            ctx.roundRect(a.x, a.y, a.width, ASTEROID_HEIGHT, 15);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.fillText(a.text, a.x + a.width / 2, a.y + ASTEROID_HEIGHT / 2);
            ctx.fillStyle = '#6b7280';
        });
        
        let bulletsToRemove: number[] = [];
        let asteroidsToRemove: number[] = [];

        newBullets.forEach((bullet, bIndex) => {
            newAsteroids.forEach((asteroid, aIndex) => {
                if(
                    bullet.x > asteroid.x && bullet.x < asteroid.x + asteroid.width &&
                    bullet.y > asteroid.y && bullet.y < asteroid.y + ASTEROID_HEIGHT
                ) {
                    bulletsToRemove.push(bIndex);
                    asteroidsToRemove.push(aIndex);

                    if (asteroid.isCorrect) {
                        toast({ title: "Correct!" });
                        setScore(s => s + 10);
                        if(gameMode === 'Adaptive') {
                            if(difficulty === 'Easy') setDifficulty('Medium');
                            else if(difficulty === 'Medium') setDifficulty('Hard');
                        }
                        getNewQuestion();
                    } else {
                        toast({ variant: 'destructive', title: "Wrong Answer!", description: `The correct answer was: ${question?.answer}` });
                        if(gameMode === 'Adaptive') setDifficulty('Easy');
                        setGameOver(true);
                        setGameStarted(false);
                    }
                }
            });
        });
        
        newAsteroids.forEach(a => {
            if (a.y > CANVAS_HEIGHT) {
                if (a.isCorrect) {
                     toast({ variant: 'destructive', title: "Missed the correct answer!" });
                     setGameOver(true);
                     setGameStarted(false);
                }
            }
        });

        const finalBullets = newBullets.filter((_, i) => !bulletsToRemove.includes(i));
        const finalAsteroids = newAsteroids.filter((a, i) => !asteroidsToRemove.includes(i) && a.y < CANVAS_HEIGHT + 50);

        setBullets(finalBullets);
        setAsteroids(finalAsteroids);

    }, [gameStarted, gameOver, isLoading, shipX, bullets, asteroids, getNewQuestion, toast, difficulty, question, gameMode]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!gameStarted) return;
            if (e.key === 'ArrowLeft') {
                setShipX(x => Math.max(SHIP_WIDTH / 2, x - 20));
            } else if (e.key === 'ArrowRight') {
                setShipX(x => Math.min(CANVAS_WIDTH - SHIP_WIDTH / 2, x + 20));
            } else if (e.key === ' ') {
                e.preventDefault();
                setBullets(b => [...b, { x: shipX, y: CANVAS_HEIGHT - 30 }]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const intervalId = setInterval(gameLoop, 1000 / 60);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(intervalId);
        };
    }, [gameStarted, gameLoop, shipX]);


    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-4xl font-bold mb-4">Trivia Blaster</h1>

            {!gameStarted ? (
                <Card className="w-full max-w-md p-8 text-center">
                    <p className="text-muted-foreground mb-4">Shoot the correct answer to score points!</p>
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
                <Card className="w-full max-w-4xl p-4 text-center mb-4">
                     <p className="text-xl font-semibold mb-2">Score: {score}</p>
                    {isLoading && <p className="text-muted-foreground animate-pulse">Loading next question...</p>}
                    {question && !isLoading && <p className="text-lg font-bold">{question.question}</p>}
                </Card>
            )}

            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="bg-black rounded-lg mt-4"
            />
        </div>
    );
};
