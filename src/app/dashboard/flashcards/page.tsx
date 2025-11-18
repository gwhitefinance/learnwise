
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Flashcard = {
    front: string;
    back: string;
};

export default function FlashcardsPage() {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedFlashcards = localStorage.getItem('generatedFlashcards');
        if (storedFlashcards) {
            try {
                setFlashcards(JSON.parse(storedFlashcards));
            } catch (e) {
                console.error("Failed to parse flashcards from storage", e);
                // Handle error, maybe redirect back
            }
        }
    }, []);

    useEffect(() => {
        setIsFlipped(false);
    }, [currentCardIndex]);

    if (flashcards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 <p className="text-muted-foreground mb-4">No flashcards found. Please generate some from a course page.</p>
                 <Button onClick={() => router.push('/dashboard/courses')}>Go to Courses</Button>
            </div>
        );
    }
    
    const currentCard = flashcards[currentCardIndex];

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 h-full flex flex-col items-center justify-center">
             <Button variant="ghost" onClick={() => router.back()} className="absolute top-4 left-4">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back
            </Button>
            <div className="w-full">
                <div className="text-center text-sm text-muted-foreground mb-4">
                    Card {currentCardIndex + 1} of {flashcards.length}
                </div>
                 <div
                    className="relative w-full aspect-[5/3] cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ perspective: '1000px' }}
                >
                    <AnimatePresence>
                        <motion.div
                            key={isFlipped ? 'back' : 'front'}
                            initial={{ rotateY: isFlipped ? 180 : 0 }}
                            animate={{ rotateY: 0 }}
                            exit={{ rotateY: isFlipped ? 0 : -180 }}
                            transition={{ duration: 0.5 }}
                            className="absolute w-full h-full p-8 flex items-center justify-center text-center rounded-xl border bg-card text-card-foreground shadow-xl"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <p className="text-3xl font-semibold">
                                {isFlipped ? currentCard.back : currentCard.front}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button variant="outline" size="lg" onClick={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))} disabled={currentCardIndex === 0}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button onClick={() => setIsFlipped(!isFlipped)} size="lg" className="px-10 py-6 text-base">
                        <RefreshCw className="mr-2 h-5 w-5"/> Flip Card
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1))} disabled={currentCardIndex === flashcards.length - 1}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

