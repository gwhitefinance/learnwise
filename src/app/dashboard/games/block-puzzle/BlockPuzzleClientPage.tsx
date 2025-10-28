
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { generateQuiz } from '@/ai/flows/quiz-flow';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const GRID_SIZE = 10;
const BLOCK_SIZE = 35;

type Course = {
    id: string;
    name: string;
    description: string;
    userId?: string;
};

type Question = GenerateQuizOutput['questions'][0];

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

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type GameMode = 'Easy' | 'Medium' | 'Hard' | 'Adaptive';

const createEmptyBoard = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

const getRandomShape = (): Shape => {
  const shapeKeys = Object.keys(SHAPES) as Shape[];
  return shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
};

function PiecePreview({ shapeKey }: { shapeKey: Shape }) {
    const shapeMatrix = SHAPES[shapeKey];
    return (
        <div className="flex flex-col items-center">
            {shapeMatrix.map((row, r_idx) => (
                <div key={r_idx} className="flex">
                    {row.map((cell, c_idx) => (
                        <div
                            key={c_idx}
                            style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }}
                            className={cell ? 'bg-secondary-foreground rounded-sm' : 'opacity-0'}
                        ></div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default function BlockPuzzleClientPage() {
    const [board, setBoard] = useState(createEmptyBoard);
    const [pieces, setPieces] = useState<Shape[]>([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [draggedPieceInfo, setDraggedPieceInfo] = useState<{ shape: Shape; index: number; } | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    
    const [question, setQuestion] = useState<Question | null>(null);
    const [isQuestionLoading, setIsQuestionLoading] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    
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

    const generateNewPieces = useCallback(() => {
        setPieces([getRandomShape(), getRandomShape(), getRandomShape()]);
    }, []);

    const getNewQuestion = useCallback(async () => {
        if (!selectedCourseId) return;
        const course = courses.find(c => c.id === selectedCourseId);
        if (!course) return;

        setIsQuestionLoading(true);
        setIsQuestionModalOpen(true);
        try {
            const result = await generateQuiz({ 
                topics: `${course.name} ${Math.random()}`,
                questionType: 'Multiple Choice',
                difficulty: gameMode === 'Adaptive' ? difficulty : gameMode,
                numQuestions: 1,
            });
            if (result.questions && result.questions.length > 0) {
                setQuestion(result.questions[0]);
            } else {
                throw new Error("No questions were generated.");
            }
        } catch (error) {
            console.error("Failed to generate question:", error);
            toast({ variant: 'destructive', title: 'Could not fetch a question.' });
            setIsQuestionModalOpen(false);
        } finally {
            setIsQuestionLoading(false);
        }
    }, [selectedCourseId, courses, toast, difficulty, gameMode]);


    useEffect(() => {
        if(gameStarted) {
            generateNewPieces();
        }
    }, [gameStarted, generateNewPieces]);

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
            if (pieceShape) { 
                const shapeMatrix = SHAPES[pieceShape];
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        if (isValidMove(currentBoard, shapeMatrix, r, c)) {
                            return false; 
                        }
                    }
                }
            }
        }
        return true; 
    }, []);


    const placePiece = (shape: Shape, row: number, col: number, pieceIndex: number) => {
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
            getNewQuestion();
        }
        
        const lineBonus = [0, 10, 30, 60, 100, 150, 200, 250, 300, 400, 500];
        const comboBonus = linesCleared > 1 ? (linesCleared - 1) * 10 : 0;
        setScore(prev => prev + pieceScore + (lineBonus[linesCleared] || 0) + comboBonus);
        
        const remainingPieces = pieces.map((p, i) => i === pieceIndex ? null : p).filter(Boolean) as Shape[];
        
        setBoard(newBoard);
        setPieces(remainingPieces);
        
        return true;
    };

    useEffect(() => {
        if (pieces.length === 0 && !gameOver && gameStarted) {
            generateNewPieces();
        }
    }, [pieces, gameOver, generateNewPieces, gameStarted]);

    useEffect(() => {
        if(gameStarted && pieces.length > 0 && checkForGameOver(board, pieces)){
            setGameOver(true);
        }
    }, [board, pieces, checkForGameOver, gameStarted]);
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, shape: Shape, index: number) => {
        setDraggedPieceInfo({ shape, index });
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        setDragPosition({ x: e.clientX, y: e.clientY });
    };


    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggedPieceInfo && gridRef.current) {
            const gridRect = gridRef.current.getBoundingClientRect();
            const x = e.clientX - gridRect.left;
            const y = e.clientY - gridRect.top;
            
            const shapeMatrix = SHAPES[draggedPieceInfo.shape];
            const shapeHeight = shapeMatrix.length;
            const shapeWidth = shapeMatrix[0].length;

            const row = Math.round(y / BLOCK_SIZE - shapeHeight / 2);
            const col = Math.round(x / BLOCK_SIZE - shapeWidth / 2);

            placePiece(draggedPieceInfo.shape, row, col, draggedPieceInfo.index);
        }
        setDraggedPieceInfo(null);
        setDragPosition(null);
    };

    const handleDragEnd = () => {
        setDraggedPieceInfo(null);
        setDragPosition(null);
    };

    const newGame = () => {
        setBoard(createEmptyBoard());
        setScore(0);
        setGameOver(false);
        setGameStarted(false);
        setSelectedCourseId(courses.length > 0 ? courses[0].id : null);
        setDifficulty('Easy');
    };

    const startGame = () => {
        if (!selectedCourseId) {
            toast({ variant: 'destructive', title: 'Please select a course.'});
            return;
        }
        setBoard(createEmptyBoard());
        setScore(0);
        setGameOver(false);
        setGameStarted(true);
        setDifficulty('Easy');
    }
    
    const handleAnswerSubmit = () => {
        if (!question || !selectedAnswer) return;

        const isCorrect = selectedAnswer === question.answer;
        
        if (isCorrect) {
            toast({ title: "Correct!", description: "+100 bonus points!" });
            setScore(s => s + 100);
            if (gameMode === 'Adaptive') {
                if (difficulty === 'Easy') setDifficulty('Medium');
                else if (difficulty === 'Medium') setDifficulty('Hard');
            }
        } else {
            toast({ variant: 'destructive', title: "Incorrect!", description: `The correct answer was: ${question.answer}` });
            if (gameMode === 'Adaptive') setDifficulty('Easy');
        }
        setIsQuestionModalOpen(false);
        setSelectedAnswer(null);
        setQuestion(null);
        if (checkForGameOver(board, pieces)) {
            setGameOver(true);
        }
    };


    if (!gameStarted) {
        return (
            <div className="flex flex-col items-center p-4">
                <h1 className="text-4xl font-bold mb-4">Puzzle Blocks</h1>
                <Card className="w-full max-w-md p-8 text-center">
                    <p className="text-muted-foreground mb-4">Select a course to start the game!</p>
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
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center p-4">
            {draggedPieceInfo && dragPosition && (
                <div 
                    className="pointer-events-none fixed z-50 opacity-70"
                    style={{
                        left: dragPosition.x - (SHAPES[draggedPieceInfo.shape][0].length * BLOCK_SIZE / 2),
                        top: dragPosition.y - (SHAPES[draggedPieceInfo.shape].length * BLOCK_SIZE / 2)
                    }}
                >
                    <PiecePreview shapeKey={draggedPieceInfo.shape} />
                </div>
            )}
            <h1 className="text-4xl font-bold mb-4">Puzzle Blocks</h1>
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div 
                    ref={gridRef}
                    className="grid bg-muted p-2 rounded-lg" 
                    style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${BLOCK_SIZE}px)` }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {board.map((row, r_idx) => 
                        row.map((cell, c_idx) => (
                            <div
                                key={`${r_idx}-${c_idx}`}
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
                                        draggable={!isQuestionModalOpen}
                                        onDragStart={(e) => handleDragStart(e, shapeKey, index)}
                                        onDrag={handleDrag}
                                        onDragEnd={handleDragEnd}
                                        className={cn(
                                            "cursor-grab active:cursor-grabbing p-2",
                                            draggedPieceInfo?.index === index && "opacity-50"
                                        )}
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

            <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Bonus Question!</DialogTitle>
                        <DialogDescription>Answer correctly for bonus points.</DialogDescription>
                    </DialogHeader>
                    {isQuestionLoading || !question ? (
                        <div className="p-8 text-center">Loading question...</div>
                    ) : (
                        <div className="py-4">
                            <p className="font-semibold text-lg mb-4">{question.question}</p>
                            <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer}>
                                <div className="space-y-2">
                                    {question.options?.map((option, index) => (
                                         <Label key={index} htmlFor={`option-${index}`} className={cn("flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer", selectedAnswer === option ? "border-primary bg-primary/10" : "border-border hover:bg-muted")}>
                                            <RadioGroupItem value={option} id={`option-${index}`} />
                                            <span>{option}</span>
                                        </Label>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                     <DialogFooter>
                        <Button onClick={handleAnswerSubmit} disabled={isQuestionLoading || !selectedAnswer}>Submit Answer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
