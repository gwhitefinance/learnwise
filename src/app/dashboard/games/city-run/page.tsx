
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, RotateCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { generateQuizAction } from '@/lib/actions';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { motion, AnimatePresence } from 'framer-motion';
import AIBuddy from '@/components/ai-buddy';

import dynamic from 'next/dynamic';
const Spline = dynamic(() => import('@splinetool/react-spline').then((mod) => mod.default), { ssr: false });


type Question = GenerateQuizOutput['questions'][0];

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
                className="absolute top-4 inset-x-4 max-w-2xl mx-auto bg-black/60 text-white p-4 rounded-xl text-center"
            >
                <h2 className="text-xl font-bold">{question.question}</h2>
                <p className="text-sm">Run into the correct answer!</p>
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
                setGameState('gameOver');
            }
        };
        fetchQuestions();
    }, [topic, toast]);

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore(s => s + 100);
            toast({ title: 'Correct!', description: '+100 points!' });
        } else {
            setLives(l => l - 1);
            toast({ variant: 'destructive', title: 'Incorrect!' });
            if (lives - 1 <= 0) {
                setGameState('gameOver');
            }
        }
        setCurrentQuestionIndex(i => (i + 1) % questions.length);
    };
    
    // In a real game, this would be triggered by collision events from the 3D scene
    // For this example, we'll simulate it with buttons.
    const simulateAnswer = (answerType: 'correct' | 'incorrect' | 'obstacle') => {
        if (answerType === 'obstacle') {
            setLives(l => l - 1);
            if (lives - 1 <= 0) setGameState('gameOver');
        } else {
            handleAnswer(answerType === 'correct');
        }
    };

    return (
        <div className="w-full h-[80vh] bg-gray-800 relative rounded-lg overflow-hidden">
            <Spline scene="https://prod.spline.design/V7-kG-v2aV5xZ33I/scene.splinecode" />
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

             {/* Mock controls for demonstration */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                <Button onClick={() => simulateAnswer('correct')}>Simulate Correct</Button>
                <Button onClick={() => simulateAnswer('incorrect')}>Simulate Incorrect</Button>
                <Button onClick={() => simulateAnswer('obstacle')}>Simulate Obstacle</Button>
            </div>
        </div>
    );
};

export default function CityRunPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [topic, setTopic] = useState<string | null>(null);

    useEffect(() => {
        const topicFromUrl = searchParams.get('topic');
        setTopic(topicFromUrl);
    }, [searchParams]);

    return (
        <div className="p-4">
             <Button variant="ghost" onClick={() => router.push('/dashboard/games')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Arcade
            </Button>
            {topic ? (
                <CityRunGame topic={topic} />
            ) : (
                <Card className="w-full max-w-lg mx-auto mt-20">
                    <CardHeader>
                        <CardTitle className="text-3xl">City Run</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center">Please select a topic from the Arcade page to start the game.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
