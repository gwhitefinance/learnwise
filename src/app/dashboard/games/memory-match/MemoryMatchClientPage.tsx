'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { generateFlashcardsFromNote } from '@/ai/flows/note-to-flashcard-flow';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Course = {
    id: string;
    name: string;
    description: string;
    userId?: string;
};

type Flashcard = {
    front: string;
    back: string;
};

type Card = {
    id: number;
    content: string;
    type: 'front' | 'back';
    pairId: number;
    isFlipped: boolean;
    isMatched: boolean;
};

export default function MemoryMatchClientPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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

    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const startGame = async () => {
        if (!selectedCourseId) {
            toast({ variant: 'destructive', title: 'Please select a course.' });
            return;
        }
        const course = courses.find(c => c.id === selectedCourseId);
        if (!course) return;

        setIsLoading(true);
        setGameStarted(true);
        setGameOver(false);
        setMoves(0);
        setCards([]);

        try {
            const result = await generateFlashcardsFromNote({
                noteContent: `Generate 8 pairs of terms and definitions for a memory game based on the topic: ${course.name}.`,
                learnerType: 'Reading/Writing'
            });

            if (result.flashcards.length < 4) {
                 toast({ variant: 'destructive', title: 'Not enough content to start the game.' });
                 setIsLoading(false);
                 setGameStarted(false);
                 return;
            }

            const gameFlashcards = result.flashcards.slice(0, 8);

            const gameCards: Card[] = [];
            gameFlashcards.forEach((flashcard, index) => {
                gameCards.push({ id: index * 2, content: flashcard.front, type: 'front', pairId: index, isFlipped: false, isMatched: false });
                gameCards.push({ id: index * 2 + 1, content: flashcard.back, type: 'back', pairId: index, isFlipped: false, isMatched: false });
            });

            setCards(shuffleArray(gameCards));
        } catch (error) {
            console.error("Failed to generate cards:", error);
            toast({ variant: 'destructive', title: 'Could not start the game.' });
            setGameStarted(false);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCardClick = (index: number) => {
        if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
            return;
        }

        const newFlippedCards = [...flippedCards, index];
        const newCards = cards.map((card, i) => i === index ? { ...card, isFlipped: true } : card);
        setCards(newCards);
        setFlippedCards(newFlippedCards);
    };

    useEffect(() => {
        if (flippedCards.length === 2) {
            setMoves(moves + 1);
            const [firstIndex, secondIndex] = flippedCards;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.pairId === secondCard.pairId) {
                // Match
                const newCards = cards.map(card => 
                    card.pairId === firstCard.pairId ? { ...card, isMatched: true } : card
                );
                setCards(newCards);
                setFlippedCards([]);
                if (newCards.every(c => c.isMatched)) {
                    setGameOver(true);
                    toast({ title: "Congratulations!", description: `You completed the game in ${moves + 1} moves!`});
                }
            } else {
                // No match
                setTimeout(() => {
                    const newCards = cards.map((card, i) => 
                        i === firstIndex || i === secondIndex ? { ...card, isFlipped: false } : card
                    );
                    setCards(newCards);
                    setFlippedCards([]);
                }, 1000);
            }
        }
    }, [flippedCards, cards, moves, toast]);

    const restartGame = () => {
        setGameStarted(false);
        setGameOver(false);
    }

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-4xl font-bold mb-4">Memory Match</h1>

            {!gameStarted ? (
                <Card className="w-full max-w-md p-8 text-center">
                    <p className="text-muted-foreground mb-4">Select a course to test your memory skills!</p>
                    <div className="flex flex-col items-center gap-4">
                         <Select onValueChange={setSelectedCourseId} value={selectedCourseId ?? ''} disabled={courses.length === 0}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select a course..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={startGame} disabled={!selectedCourseId || isLoading}>
                            {isLoading ? "Generating Cards..." : "Start Game"}
                        </Button>
                    </div>
                </Card>
            ) : isLoading ? (
                <div className="text-lg animate-pulse">Generating your game board...</div>
            ) : (
                <div className="w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-xl font-semibold">Moves: {moves}</p>
                        <Button onClick={restartGame} variant="outline">New Game</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {cards.map((card, index) => (
                            <div key={card.id} className="perspective-1000" onClick={() => handleCardClick(index)}>
                                <motion.div 
                                    className="relative w-full h-32 transform-style-3d"
                                    animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className={cn(
                                        "absolute w-full h-full backface-hidden rounded-lg flex items-center justify-center p-2 text-center cursor-pointer",
                                        "bg-primary text-primary-foreground"
                                    )}>
                                    </div>
                                     <div className={cn(
                                        "absolute w-full h-full backface-hidden rounded-lg flex items-center justify-center p-2 text-center cursor-pointer transform-rotate-y-180",
                                        card.isMatched ? "bg-green-500/20 border-2 border-green-500" : "bg-card border"
                                    )}>
                                        <p className="text-sm font-medium">{card.content}</p>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                     {gameOver && (
                        <div className="text-center mt-8">
                            <h2 className="text-2xl font-bold">You Win!</h2>
                             <Button onClick={restartGame} className="mt-4">Play Again</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper CSS for 3D transform
const style = document.createElement('style');
style.innerHTML = `
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.transform-rotate-y-180 { transform: rotateY(180deg); }
`;
if (typeof document !== 'undefined') {
    document.head.appendChild(style);
}
