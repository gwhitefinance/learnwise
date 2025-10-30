
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import AIBuddy from './ai-buddy';
import { Button } from './ui/button';
import { RotateCw } from 'lucide-react';
import shopItems from '@/lib/shop-items.json';

const allOutfits: { hat?: string, shirt?: string }[] = [
    { hat: 'Top Hat', shirt: 'Tuxedo' },
    { hat: 'Cowboy Hat', shirt: 'Vest' },
    { hat: 'Wizard Hat', shirt: 'Superhero Cape' },
    { hat: 'Chef\'s Hat', shirt: 'Lab Coat' },
    { hat: 'Propeller Hat', shirt: 'Striped Shirt' },
    { hat: 'Crown', shirt: 'Polka Dot Shirt' },
    { hat: 'Beanie', shirt: 'Hoodie' },
    { hat: 'Detective Hat', shirt: 'Sweater' },
];

type Card = {
    id: number;
    outfit: { hat?: string, shirt?: string };
    isFlipped: boolean;
    isMatched: boolean;
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function MemoryMatchGame() {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);

    const setupGame = () => {
        const selectedOutfits = shuffleArray([...allOutfits]).slice(0, 8);
        const gameCards: Card[] = [];
        selectedOutfits.forEach((outfit, index) => {
            gameCards.push({ id: index * 2, outfit, isFlipped: false, isMatched: false });
            gameCards.push({ id: index * 2 + 1, outfit, isFlipped: false, isMatched: false });
        });
        setCards(shuffleArray(gameCards));
        setFlippedCards([]);
        setMoves(0);
        setIsWon(false);
    };

    useEffect(() => {
        setupGame();
    }, []);

    useEffect(() => {
        if (flippedCards.length === 2) {
            setMoves(m => m + 1);
            const [firstIndex, secondIndex] = flippedCards;
            if (JSON.stringify(cards[firstIndex].outfit) === JSON.stringify(cards[secondIndex].outfit)) {
                setCards(prev => prev.map(card => 
                    card.outfit === cards[firstIndex].outfit ? { ...card, isMatched: true } : card
                ));
                setFlippedCards([]);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map((card, index) => 
                        index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card
                    ));
                    setFlippedCards([]);
                }, 1000);
            }
        }
    }, [flippedCards, cards]);

    useEffect(() => {
        if (cards.length > 0 && cards.every(card => card.isMatched)) {
            setIsWon(true);
        }
    }, [cards]);

    const handleCardClick = (index: number) => {
        if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
            return;
        }
        setFlippedCards(prev => [...prev, index]);
        setCards(prev => prev.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <p className="font-semibold">Moves: {moves}</p>
                <Button onClick={setupGame} variant="outline" size="sm">
                    <RotateCw className="mr-2 h-4 w-4"/> Restart
                </Button>
            </div>
            {isWon ? (
                 <div className="flex flex-col items-center justify-center h-64 text-center">
                    <h3 className="text-2xl font-bold">You Win!</h3>
                    <p className="text-muted-foreground">You matched all the buddies in {moves} moves.</p>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {cards.map((card, index) => (
                        <div key={card.id} className="perspective-1000 aspect-square" onClick={() => handleCardClick(index)}>
                            <motion.div 
                                className="relative w-full h-full transform-style-3d"
                                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="absolute w-full h-full backface-hidden rounded-lg flex items-center justify-center p-2 text-center cursor-pointer bg-primary"></div>
                                <div className={cn(
                                    "absolute w-full h-full backface-hidden rounded-lg flex items-center justify-center p-2 text-center cursor-pointer transform-rotate-y-180",
                                    card.isMatched ? "bg-green-500/20 border-2 border-green-500" : "bg-card border"
                                )}>
                                    <AIBuddy {...card.outfit} isStatic={true} className="w-16 h-16" />
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Helper CSS needed for 3D transform, ensuring it's available
const style = document.createElement('style');
style.innerHTML = `
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.transform-rotate-y-180 { transform: rotateY(180deg); }
`;
if (typeof document !== 'undefined' && !document.getElementById('3d-transform-styles')) {
    style.id = '3d-transform-styles';
    document.head.appendChild(style);
}
