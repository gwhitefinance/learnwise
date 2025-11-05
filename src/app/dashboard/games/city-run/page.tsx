
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuizAction } from '@/lib/actions';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { motion, AnimatePresence } from 'framer-motion';
import AIBuddy from '@/components/ai-buddy';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type Question = GenerateQuizOutput['questions'][0];

const LANES = [-1, 0, 1]; // -1: Left, 0: Center, 1: Right
const LANE_WIDTH = 120; // width of a lane in pixels

const GameUI = ({ score, lives, question }: { score: number, lives: number, question: Question | null }) => (
    <>
        <div className="absolute top-4 left-4 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
                <Heart key={i} className={`w-8 h-8 transition-colors ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-500 fill-gray-500'}`} />
            ))}
        </div>
         <div className="absolute top-4 right-4 text-white bg-black/50 px-4 py-2 rounded-lg">
            <p className="font-bold text-2xl">Score: {score}</p>
        </div>
        {question && (
            <motion.div 
                key={question.question}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-16 inset-x-4 max-w-2xl mx-auto bg-black/60 text-white p-4 rounded-xl text-center"
            >
                <h2 className="text-xl font-bold">{question.question}</h2>
            </motion.div>
        )}
    </>
);

const CityRunGame = ({ topic }: { topic: string }) => {
    const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const { toast } = useToast();
    const router = useRouter();

    const [playerLane, setPlayerLane] = useState(0);
    const [items, setItems] = useState<any[]>([]);

    const prevScore = usePrevious(score);
    const prevLives = usePrevious(lives);
    
    // Custom hook to get the previous value of a prop or state
    function usePrevious<T>(value: T) {
      const ref = React.useRef<T>();
      useEffect(() => {
        ref.current = value;
      });
      return ref.current;
    }

    // Fetch questions
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const quiz = await generateQuizAction({
                    topics: topic,
                    questionType: 'Multiple Choice',
                    difficulty: 'Medium',
                    numQuestions: 10,
                });
                if (quiz.questions && quiz.questions.length > 0) {
                    setQuestions(quiz.questions);
                } else {
                    throw new Error("No questions generated.");
                }
            } catch (e) {
                toast({ variant: 'destructive', title: 'Failed to start game.', description: 'Could not generate questions.' });
                router.push('/dashboard/games');
            }
        };
        fetchQuestions();
    }, [topic, toast, router]);

    // Spawn new items when question changes
    useEffect(() => {
        if (questions.length === 0) return;
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion || !currentQuestion.options) return;

        const options = [...currentQuestion.options];
        const correctOption = currentQuestion.answer;
        const assignedLanes = shuffle([...LANES]);

        const newItems = options.map((opt, i) => ({
            id: `${currentQuestionIndex}-${i}`,
            type: opt === correctOption ? 'correct' : 'incorrect',
            lane: assignedLanes[i % LANES.length],
            y: -100 - (i * 150),
            text: opt,
        }));
        
        // Add some obstacles
        for(let i = 0; i < 3; i++) {
            newItems.push({
                id: `obstacle-${currentQuestionIndex}-${i}`,
                type: 'obstacle',
                lane: LANES[Math.floor(Math.random() * LANES.length)],
                y: -200 - (i * 200),
            });
        }
        setItems(newItems);
    }, [currentQuestionIndex, questions]);


    const gameLoop = useCallback(() => {
        if (gameState !== 'playing') return;

        setItems(prevItems => {
            const newItems = prevItems.map(item => ({...item, y: item.y + 1})).filter(item => item.y < 600);
            
            newItems.forEach(item => {
                // Collision detection
                if (item.y > 450 && item.y < 550 && item.lane === playerLane) {
                    if (item.type === 'correct') {
                        setScore(s => s + 100);
                        setCurrentQuestionIndex(i => (i + 1) % questions.length);
                    } else if (item.type === 'incorrect') {
                        setLives(l => l > 0 ? l - 1 : 0);
                    } else if (item.type === 'obstacle') {
                       setLives(l => l > 0 ? l - 1 : 0);
                    }
                     // Mark item for removal
                    item.y = 1000;
                }
            });

            return newItems;
        });

        requestAnimationFrame(gameLoop);
    }, [gameState, playerLane, questions.length]);

    useEffect(() => {
        if (lives === 0) {
            setGameState('gameOver');
        }
    }, [lives]);

     useEffect(() => {
        if (prevScore !== undefined && score > prevScore) {
            toast({ title: "Correct!" });
        }
        if (prevLives !== undefined && lives < prevLives) {
            toast({ variant: 'destructive', title: "Ouch!" });
        }
    }, [score, lives, prevScore, prevLives, toast]);

    useEffect(() => {
        if (gameState === 'playing' && questions.length > 0) {
            const animationFrameId = requestAnimationFrame(gameLoop);
            return () => cancelAnimationFrame(animationFrameId);
        }
    }, [gameState, gameLoop, questions]);
    
    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                setPlayerLane(l => Math.max(-1, l - 1));
            } else if (e.key === 'ArrowRight') {
                setPlayerLane(l => Math.min(1, l + 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);
    
    if (questions.length === 0) {
        return <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg"><p className="text-white">Generating questions...</p></div>
    }

    return (
        <div className="w-full h-full bg-gray-800 relative rounded-lg overflow-hidden flex justify-center items-center">
            {/* Game Background */}
            <div className="absolute inset-0 bg-gray-700">
                <div className="absolute h-full w-[360px] left-1/2 -translate-x-1/2 bg-gray-600">
                    {[-1, 1].map(offset => (
                         <div key={offset} className="absolute top-0 h-full w-2 bg-yellow-400" style={{ left: `calc(50% + ${offset * (LANE_WIDTH / 2)}px - 4px)` }} />
                    ))}
                </div>
            </div>

            {/* Game Items */}
            <div className="absolute h-full w-[360px] left-1/2 -translate-x-1/2">
                {items.map(item => (
                    <motion.div
                        key={item.id}
                        animate={{ y: item.y, x: item.lane * LANE_WIDTH }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                        className="absolute left-1/2 -translate-x-1/2"
                    >
                        {item.type === 'obstacle' ? (
                            <div className="w-20 h-10 bg-red-500 rounded-md" />
                        ) : (
                            <div className="w-28 bg-blue-500 text-white text-center p-2 rounded-lg border-2 border-blue-300">
                                {item.text}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Player */}
            <motion.div
                className="absolute bottom-10"
                animate={{ x: playerLane * LANE_WIDTH }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                <div className="w-20 h-20">
                    <AIBuddy />
                </div>
            </motion.div>

            {/* UI */}
            <GameUI score={score} lives={lives} question={questions[currentQuestionIndex]} />
             
            <AnimatePresence>
            {gameState === 'gameOver' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-10"
                >
                    <h2 className="text-5xl font-bold">Game Over</h2>
                    <p className="text-2xl mt-2">Final Score: {score}</p>
                    <Button onClick={() => window.location.reload()} className="mt-8">
                        <RotateCw className="mr-2 h-4 w-4" />
                        Play Again
                    </Button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

function CityRunPageWrapper() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');

    if (!topic) {
        return (
             <div className="flex flex-col items-center justify-center h-full p-4">
                <Card className="w-full max-w-lg mx-auto mt-20 text-center">
                    <CardHeader>
                        <CardTitle className="text-3xl">City Run</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Please select a topic from the Arcade page to start the game.</p>
                        <Button onClick={() => router.push('/dashboard/games')}>
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Arcade
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
             <Button variant="ghost" onClick={() => router.push('/dashboard/games')} className="absolute top-4 left-4 z-20 bg-black/20 hover:bg-black/40 text-white hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Arcade
            </Button>
            <CityRunGame topic={topic} />
        </div>
    )
}

export default function CityRunPage() {
    return (
        <Suspense fallback={<Skeleton className="w-full h-full bg-gray-800 rounded-lg"/>}>
            <CityRunPageWrapper />
        </Suspense>
    )
}
