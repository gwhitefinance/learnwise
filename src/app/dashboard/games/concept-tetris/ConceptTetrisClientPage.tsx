
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = [
    '#000000', // Empty
    '#FFADAD', // I
    '#FFD6A5', // L
    '#FDFFB6', // J
    '#CAFFBF', // O
    '#9BF6FF', // S
    '#A0C4FF', // Z
    '#BDB2FF', // T
];

const SHAPES = [
    [], // Empty
    [[1, 1, 1, 1]], // I
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
    [[1, 1], [1, 1]],   // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 0], [1, 1, 1]], // T
];

type Piece = {
    x: number;
    y: number;
    shape: number[][];
    color: string;
};

const createEmptyBoard = (): number[][] => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const getRandomPiece = (): Piece => {
    const rand = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    return {
        x: Math.floor(COLS / 2) - 1,
        y: 0,
        shape: SHAPES[rand],
        color: COLORS[rand],
    };
};

export default function ConceptTetrisClientPage() {
    const [board, setBoard] = useState(createEmptyBoard);
    const [currentPiece, setCurrentPiece] = useState<Piece>(getRandomPiece);
    const [nextPiece, setNextPiece] = useState<Piece>(getRandomPiece);
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const gameLoopRef = useRef<NodeJS.Timeout>();

    const isValidMove = (piece: Piece, board: number[][]): boolean => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x;
                    const newY = piece.y + y;
                    if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const drop = useCallback(() => {
        if (isPaused || gameOver) return;
        
        setCurrentPiece(prev => {
            const newPiece = { ...prev, y: prev.y + 1 };
            if (isValidMove(newPiece, board)) {
                return newPiece;
            }
            
            // Lock piece and check for line clears
            const newBoard = board.map(row => [...row]);
            prev.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const boardY = prev.y + y;
                        const boardX = prev.x + x;
                        if(boardY >= 0) {
                            newBoard[boardY][boardX] = COLORS.indexOf(prev.color);
                        }
                    }
                });
            });

            // Clear lines
            let linesCleared = 0;
            for(let y = newBoard.length - 1; y >= 0; y--) {
                if(newBoard[y].every(cell => cell > 0)) {
                    newBoard.splice(y, 1);
                    newBoard.unshift(Array(COLS).fill(0));
                    linesCleared++;
                    y++; // re-check the same row index
                }
            }
            
            if(linesCleared > 0) {
                setLines(l => l + linesCleared);
                setScore(s => s + [0, 40, 100, 300, 1200][linesCleared] * level);
            }

            setBoard(newBoard);
            
            // Check for game over
            const next = nextPiece;
            if(!isValidMove(next, newBoard)) {
                setGameOver(true);
            }
            
            setNextPiece(getRandomPiece());
            return next;
        });
    }, [board, gameOver, isPaused, nextPiece, level]);
    
    useEffect(() => {
        if (!gameOver && !isPaused) {
            const gameSpeed = 1000 / level;
            gameLoopRef.current = setInterval(drop, gameSpeed);
        }
        return () => {
            if(gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [drop, gameOver, isPaused, level]);
    
    const move = (dx: number) => {
        if (isPaused || gameOver) return;
        setCurrentPiece(prev => {
            const newPiece = { ...prev, x: prev.x + dx };
            return isValidMove(newPiece, board) ? newPiece : prev;
        });
    };

    const rotate = () => {
        if (isPaused || gameOver) return;
        setCurrentPiece(prev => {
            const shape = prev.shape[0].map((_, colIndex) => prev.shape.map(row => row[colIndex]).reverse());
            const newPiece = { ...prev, shape };
            return isValidMove(newPiece, board) ? newPiece : prev;
        });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver) return;
            switch (e.key) {
                case 'ArrowLeft': move(-1); break;
                case 'ArrowRight': move(1); break;
                case 'ArrowDown': drop(); break;
                case 'ArrowUp': rotate(); break;
                case ' ': setIsPaused(p => !p); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [board, gameOver, drop]);

    const startGame = () => {
        setBoard(createEmptyBoard());
        setCurrentPiece(getRandomPiece());
        setNextPiece(getRandomPiece());
        setScore(0);
        setLines(0);
        setLevel(1);
        setGameOver(false);
        setIsPaused(false);
    };

    const renderBoard = () => {
        const tempBoard = board.map(row => [...row]);
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = currentPiece.y + y;
                    const boardX = currentPiece.x + x;
                    if(boardY >= 0) {
                       tempBoard[boardY][boardX] = COLORS.indexOf(currentPiece.color);
                    }
                }
            });
        });

        return tempBoard.map((row, y) => (
            <div key={y} style={{ display: 'flex' }}>
                {row.map((cell, x) => (
                    <div key={x} style={{
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                        backgroundColor: COLORS[cell],
                        border: '1px solid #333',
                    }} />
                ))}
            </div>
        ));
    };

    const renderNextPiece = () => {
        return nextPiece.shape.map((row, y) => (
            <div key={y} style={{ display: 'flex' }}>
                {row.map((cell, x) => (
                    <div key={x} style={{
                        width: BLOCK_SIZE / 2,
                        height: BLOCK_SIZE / 2,
                        backgroundColor: cell ? nextPiece.color : 'transparent'
                    }}/>
                ))}
            </div>
        ));
    }

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-4xl font-bold mb-4">Concept Tetris</h1>
            <div className="flex gap-8 items-start">
                <div style={{ position: 'relative', border: '2px solid #fff' }}>
                    {renderBoard()}
                    {gameOver && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                            <h2 className="text-4xl font-bold">Game Over</h2>
                            <Button onClick={startGame} className="mt-4">Play Again</Button>
                        </div>
                    )}
                     {isPaused && !gameOver && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                            <h2 className="text-4xl font-bold">Paused</h2>
                             <Button onClick={() => setIsPaused(false)} className="mt-4">Resume</Button>
                        </div>
                    )}
                </div>
                <div className="w-48 space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Score</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">{score}</CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Lines</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">{lines}</CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Level</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">{level}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Next</CardTitle></CardHeader>
                        <CardContent className="flex items-center justify-center p-2">
                           {renderNextPiece()}
                        </CardContent>
                    </Card>
                    <Button onClick={startGame} className="w-full">
                        {gameOver ? 'Play Again' : 'New Game'}
                    </Button>
                </div>
            </div>
            <div className="mt-8 flex gap-4">
                <Button variant="outline" size="icon" onClick={() => move(-1)}><ArrowLeft/></Button>
                <Button variant="outline" size="icon" onClick={() => move(1)}><ArrowRight/></Button>
                <Button variant="outline" size="icon" onClick={() => drop()}><ArrowDown/></Button>
                <Button variant="outline" size="icon" onClick={() => rotate()}><RotateCw/></Button>
            </div>
        </div>
    );
}
