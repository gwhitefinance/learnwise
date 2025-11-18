
'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, RotateCcw, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import confetti from 'canvas-confetti';

const FlashcardApp = () => {
  const [cards, setCards] = useState([
    {
      id: 1,
      question: "What is the capital of France?",
      answer: "Paris",
      mastered: false
    },
    {
      id: 2,
      question: "What is the chemical symbol for gold?",
      answer: "Au (from the Latin word 'Aurum')",
      mastered: false
    },
    {
      id: 3,
      question: "Who painted the Mona Lisa?",
      answer: "Leonardo da Vinci",
      mastered: false
    },
    {
      id: 4,
      question: "What is the largest planet in our solar system?",
      answer: "Jupiter",
      mastered: false
    },
    {
      id: 5,
      question: "What year did World War II end?",
      answer: "1945",
      mastered: false
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStatuses, setCardStatuses] = useState<Record<number, 'mastered' | 'reviewing'>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = Object.values(cardStatuses).filter(s => s === 'mastered').length;

  useEffect(() => {
      const storedFlashcards = localStorage.getItem('generatedFlashcards');
      if (storedFlashcards) {
          try {
              const parsedCards = JSON.parse(storedFlashcards).map((card: {front: string; back: string}, index: number) => ({
                  id: index,
                  question: card.front,
                  answer: card.back,
                  mastered: false,
              }));
              if (parsedCards.length > 0) {
                setCards(parsedCards);
              }
          } catch(e) {
              console.error("Failed to parse flashcards");
          }
      }
  }, []);

  useEffect(() => {
    if (progress === cards.length && progress > 0) {
      setShowConfetti(true);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [progress, cards.length]);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const markCard = (status: 'mastered' | 'reviewing') => {
    setCardStatuses(prev => ({
      ...prev,
      [currentCard.id]: status
    }));
    
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        nextCard();
      }
    }, 300);
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

  const shuffleCards = () => {
    const newCards = [...cards];
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    setCards(newCards);
    resetAll();
  };

  const cardStatus = cardStatuses[currentCard.id];

  return (
    <div className="min-h-screen bg-background p-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-foreground mb-2">Flashcard Master</h1>
          <p className="text-muted-foreground text-lg">Click the card to flip it!</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-2xl mb-6 border">
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
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${(progress / cards.length) * 100}%` }}
            />
          </div>

          <div
            onClick={flipCard}
            className="relative min-h-[24rem] cursor-pointer perspective-1000 mb-6"
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
                    <p className="text-2xl font-bold text-white">{currentCard.question}</p>
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
              <button
                onClick={() => markCard('reviewing')}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold shadow-lg"
              >
                <RotateCcw size={20} />
                Need Review
              </button>
              <button
                onClick={() => markCard('mastered')}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-lg"
              >
                <Check size={20} />
                Mastered!
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="flex gap-2">
              <button
                onClick={shuffleCards}
                className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent transition-colors"
                title="Shuffle cards"
              >
                <Shuffle size={20} />
              </button>
              <button
                onClick={resetAll}
                className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent transition-colors"
                title="Reset all progress"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            <button
              onClick={nextCard}
              disabled={currentIndex === cards.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => {
                setCurrentIndex(idx);
                setIsFlipped(false);
              }}
              className={`h-12 rounded-lg font-semibold transition-all ${
                idx === currentIndex
                  ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                  : cardStatuses[card.id] === 'mastered'
                  ? 'bg-green-500 text-white'
                  : cardStatuses[card.id] === 'reviewing'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default FlashcardApp;
