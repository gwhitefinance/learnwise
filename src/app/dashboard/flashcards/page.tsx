
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, X, RotateCcw, ChevronLeft, ChevronRight, Shuffle, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import Loading from './loading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Flashcard = {
    id: string; // Use front as a unique ID
    front: string;
    answer: string;
};

type FlashcardSession = {
    id: string;
    name: string;
    cards: { front: string; back: string }[];
    mastered: string[]; // Store array of mastered card IDs (fronts)
    timestamp: string;
};

function FlashcardGame() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session');
    
    const [session, setSession] = useState<FlashcardSession | null>(null);
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [cardStatuses, setCardStatuses] = useState<Record<string, 'mastered' | 'reviewing'>>({});
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (!sessionId) {
            router.push('/dashboard/key-concepts');
            return;
        }

        const allSessions: Record<string, FlashcardSession> = JSON.parse(localStorage.getItem('flashcardSessions') || '{}');
        const currentSession = allSessions[sessionId];

        if (currentSession) {
            setSession(currentSession);
            setCards(currentSession.cards.map(c => ({ id: c.front, front: c.front, answer: c.back })));
            const initialStatuses: Record<string, 'mastered' | 'reviewing'> = {};
            currentSession.mastered.forEach(id => {
                initialStatuses[id] = 'mastered';
            });
            setCardStatuses(initialStatuses);
        } else {
            router.push('/dashboard/key-concepts');
        }
    }, [sessionId, router]);
    
    useEffect(() => {
        if (session) {
            const allSessions = JSON.parse(localStorage.getItem('flashcardSessions') || '{}');
            const masteredIds = Object.entries(cardStatuses).filter(([, status]) => status === 'mastered').map(([id]) => id);
            allSessions[session.id].mastered = masteredIds;
            localStorage.setItem('flashcardSessions', JSON.stringify(allSessions));
        }
    }, [cardStatuses, session]);

    const progress = Object.values(cardStatuses).filter(s => s === 'mastered').length;

    useEffect(() => {
        if (cards.length > 0 && progress === cards.length) {
            setShowConfetti(true);
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 }
            });
            setTimeout(() => setShowConfetti(false), 3000);
        }
    }, [progress, cards.length]);

    const flipCard = () => setIsFlipped(!isFlipped);

    const markCard = (status: 'mastered' | 'reviewing') => {
        const currentCard = cards[currentIndex];
        if (!currentCard) return;
        setCardStatuses(prev => ({ ...prev, [currentCard.id]: status }));
        setTimeout(nextCard, 300);
    };

    const nextCard = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    const resetAll = () => {
        setCardStatuses({});
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const shuffleCards = useCallback(() => {
        setCards(prev => shuffleArray([...prev]));
        resetAll();
    }, []);
    
    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };


    if (!session || cards.length === 0) {
        return <Loading />;
    }

    const currentCard = cards[currentIndex];
    const cardStatus = cardStatuses[currentCard.id];

    return (
        <div className="min-h-screen bg-background p-8 relative overflow-hidden">
            <Button variant="ghost" onClick={() => router.push('/dashboard/key-concepts')} className="absolute top-4 left-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Hub
            </Button>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-foreground mb-2">{session.name}</h1>
                    <p className="text-muted-foreground text-lg">Click the card to flip it!</p>
                </div>
                <Card className="p-6 shadow-2xl mb-6 border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-semibold text-muted-foreground">
                            Card {currentIndex + 1} of {cards.length}
                        </div>
                        <div className="text-sm font-semibold text-primary">
                            Mastered: {progress}/{cards.length}
                        </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 mb-6">
                        <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(progress / cards.length) * 100}%` }}
                        />
                    </div>
                    <div
                        onClick={flipCard}
                        className="relative h-96 w-full cursor-pointer perspective-1000 mb-6"
                    >
                        <div
                            className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                                isFlipped ? 'rotate-y-180' : ''
                            }`}
                        >
                             <div className="absolute w-full h-full backface-hidden">
                                <div className={`w-full h-full rounded-2xl shadow-xl flex items-center justify-center p-8 ${
                                cardStatus === 'mastered' ? 'bg-gradient-to-br from-green-400 to-green-500' :
                                cardStatus === 'reviewing' ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                                'bg-gradient-to-br from-blue-400 to-purple-500'
                                }`}>
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-white mb-4 opacity-80">QUESTION</div>
                                    <p className="text-2xl font-bold text-white">{currentCard.front}</p>
                                </div>
                                </div>
                            </div>

                            <div className="absolute w-full h-full backface-hidden rotate-y-180">
                                <div className={`w-full h-full rounded-2xl shadow-xl flex items-center justify-center p-8 ${
                                cardStatus === 'mastered' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                cardStatus === 'reviewing' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-br from-purple-500 to-pink-500'
                                }`}>
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-white mb-4 opacity-80">ANSWER</div>
                                    <p className="text-2xl font-bold text-white">{currentCard.answer}</p>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {isFlipped && (
                        <div className="flex gap-4 justify-center mb-6 animate-fade-in">
                            <Button
                                onClick={() => markCard('reviewing')}
                                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold shadow-lg"
                            >
                                <RotateCcw size={20} />
                                Need Review
                            </Button>
                            <Button
                                onClick={() => markCard('mastered')}
                                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-lg"
                            >
                                <Check size={20} />
                                Mastered!
                            </Button>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <Button
                            onClick={prevCard}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2"
                            variant="outline"
                        >
                            <ChevronLeft size={20} /> Previous
                        </Button>
                        <div className="flex gap-2">
                             <Button
                                onClick={shuffleCards}
                                variant="outline"
                                size="icon"
                                title="Shuffle cards"
                            >
                                <Shuffle size={20} />
                            </Button>
                            <Button
                                onClick={resetAll}
                                variant="outline"
                                size="icon"
                                title="Reset all progress"
                            >
                                <RotateCcw size={20} />
                            </Button>
                            <Button variant="destructive" onClick={() => router.push('/dashboard/key-concepts')}>End Session</Button>
                        </div>
                        <Button
                            onClick={nextCard}
                            disabled={currentIndex === cards.length - 1}
                            className="flex items-center gap-2"
                             variant="outline"
                        >
                            Next <ChevronRight size={20} />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default function FlashcardPage() {
    return (
        <Suspense fallback={<Loading/>}>
            <FlashcardGame/>
        </Suspense>
    )
}
