
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw } from 'lucide-react';

const GRID_SIZE = 10;
const BLOCK_SIZE = 35;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  L: [[1, 0, 0], [1, 1, 1]],
  J: [[0, 0, 1], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  Dot: [[1]],
  SmallL: [[1,0],[1,1]],
  SmallI2: [[1,1]],
  SmallI3: [[1],[1],[1]],
  Corner: [[1,1],[1,0]]
};

type Shape = keyof typeof SHAPES;

const createEmptyBoard = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

const getRandomShape = (): Shape => {
  const shapeKeys = Object.keys(SHAPES) as Shape[];
  return shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
};

export default function BlockPuzzleClientPage() {
    const [board, setBoard] = useState(createEmptyBoard);
    const [pieces, setPieces] = useState<Shape[]>([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [draggedPiece, setDraggedPiece] = useState<{ shape: Shape; index: number } | null>(null);

    const generateNewPieces = useCallback(() => {
        setPieces([getRandomShape(), getRandomShape(), getRandomShape()]);
    }, []);

    useEffect(() => {
        generateNewPieces();
    }, [generateNewPieces]);

    const isValidMove = (boardState: number[][], shape: number[][], row: number, col: number) => {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const boardRow = row + r;
                    const boardCol = col + c;
                    if (
                        boardRow < 0 || boardRow >= GRID_SIZE ||
                        boardCol < 0 || boardCol >= GRID_SIZE ||
                        boardState[boardRow][boardCol]
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    
    const checkForGameOver = useCallback((currentBoard: number[][], currentPieces: Shape[]) => {
        if (currentPieces.length === 0) return false;
        for (const pieceShape of currentPieces) {
            const shapeMatrix = SHAPES[pieceShape];
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (isValidMove(currentBoard, shapeMatrix, r, c)) {
                        return false; // Found a valid move
                    }
                }
            }
        }
        return true; // No valid moves for any available piece
    }, []);


    const placePiece = (shape: Shape, row: number, col: number) => {
        const shapeMatrix = SHAPES[shape];
        if (!isValidMove(board, shapeMatrix, row, col)) {
            return false;
        }

        let newBoard = board.map(r => [...r]);
        let pieceScore = 0;
        shapeMatrix.forEach((r, r_idx) => {
            r.forEach((cell, c_idx) => {
                if (cell) {
                    newBoard[row + r_idx][col + c_idx] = 1;
                    pieceScore += 1;
                }
            });
        });

        // Check for and clear completed lines
        let rowsToClear: number[] = [];
        let colsToClear: number[] = [];
        
        for (let r = 0; r < GRID_SIZE; r++) {
            if (newBoard[r].every(cell => cell === 1)) {
                rowsToClear.push(r);
            }
        }
        for (let c = 0; c < GRID_SIZE; c++) {
            if (newBoard.every(row => row[c] === 1)) {
                colsToClear.push(c);
            }
        }

        let linesCleared = rowsToClear.length + colsToClear.length;
        if (linesCleared > 0) {
            rowsToClear.forEach(r => {
                for (let c = 0; c < GRID_SIZE; c++) newBoard[r][c] = 0;
            });
            colsToClear.forEach(c => {
                for (let r = 0; r < GRID_SIZE; r++) newBoard[r][c] = 0;
            });
        }
        
        const lineBonus = [0, 10, 30, 60, 100, 150, 200, 250, 300, 400, 500]; // Bonus for clearing lines
        const comboBonus = linesCleared > 1 ? (linesCleared - 1) * 10 : 0;
        setScore(prev => prev + pieceScore + (lineBonus[linesCleared] || 0) + comboBonus);
        
        const remainingPieces = pieces.filter((_, i) => i !== draggedPiece!.index);
        
        if (checkForGameOver(newBoard, remainingPieces)) {
            setGameOver(true);
        }

        setBoard(newBoard);
        setPieces(remainingPieces);
        
        return true;
    };

    useEffect(() => {
        if (pieces.length === 0 && !gameOver) {
            generateNewPieces();
        }
    }, [pieces, gameOver, generateNewPieces]);

    useEffect(() => {
        if(pieces.length > 0 && checkForGameOver(board, pieces)){
            setGameOver(true);
        }
    }, [board, pieces, checkForGameOver]);

    const handleDrop = (row: number, col: number) => {
        if (draggedPiece) {
            placePiece(draggedPiece.shape, row, col);
            setDraggedPiece(null);
        }
    };

    const handleDragStart = (shape: Shape, index: number) => {
        setDraggedPiece({ shape, index });
    };

    const newGame = () => {
        setBoard(createEmptyBoard());
        setScore(0);
        setGameOver(false);
        generateNewPieces();
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-4xl font-bold mb-4">Puzzle Blocks</h1>
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div 
                    className="grid bg-muted p-2 rounded-lg" 
                    style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${BLOCK_SIZE}px)` }}
                >
                    {board.map((row, r_idx) => 
                        row.map((cell, c_idx) => (
                            <div
                                key={`${r_idx}-${c_idx}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(r_idx, c_idx)}
                                style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }}
                                className={`border border-black/10 ${cell ? 'bg-primary' : ''}`}
                            ></div>
                        ))
                    )}
                </div>

                <div className="w-full md:w-56 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{score}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pieces</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-row md:flex-col items-center justify-center gap-4">
                            {pieces.map((shapeKey, index) => {
                                const shapeMatrix = SHAPES[shapeKey];
                                return (
                                    <div
                                        key={index}
                                        draggable
                                        onDragStart={() => handleDragStart(shapeKey, index)}
                                        className="cursor-grab active:cursor-grabbing p-2"
                                    >
                                        <div className="flex flex-col items-center">
                                            {shapeMatrix.map((row, r_idx) => (
                                                <div key={r_idx} className="flex">
                                                    {row.map((cell, c_idx) => (
                                                        <div
                                                            key={c_idx}
                                                            style={{ width: BLOCK_SIZE/2, height: BLOCK_SIZE/2 }}
                                                            className={cell ? 'bg-secondary-foreground rounded-sm' : ''}
                                                        ></div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <Button onClick={newGame} className="w-full">
                        <RotateCw className="mr-2 h-4 w-4" />
                        New Game
                    </Button>
                </div>
            </div>
             <AnimatePresence>
                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-10"
                    >
                        <h2 className="text-5xl font-bold">Game Over</h2>
                        <p className="text-2xl mt-2">Final Score: {score}</p>
                        <Button onClick={newGame} className="mt-8">
                            <RotateCw className="mr-2 h-4 w-4" />
                            Play Again
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

