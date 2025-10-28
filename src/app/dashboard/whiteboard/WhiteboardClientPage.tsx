
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Eraser, Palette, Brush, StickyNote, Save, Shapes, LayoutTemplate, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import Draggable from 'react-draggable';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, Timestamp, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type StickyNoteType = {
    id: number;
    x: number;
    y: number;
    value: string;
};

type SavedWhiteboard = {
    id: string;
    title: string;
    imageUrl: string;
    date: Date;
}

type FirestoreSavedWhiteboard = Omit<SavedWhiteboard, 'date'> & {
    date: Timestamp;
}

export default function WhiteboardClientPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [notes, setNotes] = useState<StickyNoteType[]>([]);
    const [savedWhiteboards, setSavedWhiteboards] = useState<SavedWhiteboard[]>([]);
    const [isLoadingSaved, setIsLoadingSaved] = useState(true);
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    const nodeRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>({});

    notes.forEach((note) => {
        if (!nodeRefs.current[note.id]) {
            nodeRefs.current[note.id] = React.createRef<HTMLDivElement>();
        }
    });

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notes"), 
            where("userId", "==", user.uid),
            where("isWhiteboardNote", "==", true),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedNotes = querySnapshot.docs.map(doc => {
                const data = doc.data() as FirestoreSavedWhiteboard;
                return {
                    id: doc.id,
                    title: data.title,
                    imageUrl: data.imageUrl,
                    date: data.date.toDate(),
                }
            });
            setSavedWhiteboards(fetchedNotes);
            setIsLoadingSaved(false);
        });

        return () => unsubscribe();
    }, [user]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.strokeStyle = tool === 'pen' ? color : '#f3f4f6'; // Muted background color
        context.lineWidth = brushSize;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (context) {
            context.closePath();
        }
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        setNotes([]);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const parent = canvas.parentElement;
            if (parent) {
                // Delay resizing to allow parent to render
                setTimeout(() => {
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                }, 0);
            }
        }
    }, []);

    const addNote = () => {
        const newNote: StickyNoteType = {
            id: Date.now(),
            x: 150,
            y: 150,
            value: 'New Note',
        };
        setNotes(prev => [...prev, newNote]);
    };

    const updateNoteText = (id: number, newValue: string) => {
        setNotes(prev => prev.map(note => note.id === id ? { ...note, value: newValue } : note));
    };

    const handleSaveAsNote = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in to save notes.' });
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.fillStyle = '#f3f4f6';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);

        notes.forEach(note => {
            const noteElement = nodeRefs.current[note.id]?.current;
            if (noteElement) {
                const transform = noteElement.style.transform;
                const match = transform.match(/translate\((\d+(?:\.\d*)?)px, (\d+(?:\.\d*)?)px\)/);
                let x = note.x;
                let y = note.y;
                if (match) {
                    x = parseFloat(match[1]);
                    y = parseFloat(match[2]);
                }
                
                tempCtx.shadowColor = 'rgba(0,0,0,0.1)';
                tempCtx.shadowBlur = 10;
                tempCtx.shadowOffsetY = 4;
                tempCtx.fillStyle = '#fef3c7';
                tempCtx.fillRect(x, y, 200, 150);
                tempCtx.shadowColor = 'transparent';

                tempCtx.fillStyle = '#333';
                tempCtx.font = '14px sans-serif';
                const lines = note.value.split('\n');
                lines.forEach((line, i) => {
                    tempCtx.fillText(line, x + 10, y + 25 + (i * 20));
                });
            }
        });
        
        const imageDataUrl = tempCanvas.toDataURL('image/png');

        try {
            await addDoc(collection(db, "notes"), {
                title: `Whiteboard - ${new Date().toLocaleString()}`,
                content: `Whiteboard content saved as an image.`,
                imageUrl: imageDataUrl,
                isWhiteboardNote: true, // Add this flag
                date: Timestamp.now(),
                color: 'bg-indigo-100 dark:bg-indigo-900/20',
                isImportant: false,
                isCompleted: false,
                userId: user.uid,
            });
            toast({ title: "Whiteboard Saved!", description: "A new note has been created with your whiteboard content." });
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Error", description: "Could not save whiteboard as a note." });
        }
    };
    
     const handleDeleteSavedWhiteboard = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'notes', id));
            toast({ title: 'Whiteboard deleted' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Could not delete whiteboard' });
        }
    };

    const colors = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

    return (
        <div className="h-full flex flex-col">
            <header className="flex justify-between items-center pb-4">
                <div>
                    <h1 className="text-3xl font-bold">Whiteboard</h1>
                    <p className="text-muted-foreground">Brainstorm, draw, and take visual notes.</p>
                </div>
            </header>
            <Tabs defaultValue="current" className="flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="current">Current Session</TabsTrigger>
                        <TabsTrigger value="saved">Saved Whiteboards</TabsTrigger>
                    </TabsList>
                     <Button onClick={handleSaveAsNote}><Save className="mr-2 h-4 w-4" /> Save as Note</Button>
                </div>
                <TabsContent value="current" className="flex-1 mt-4 relative">
                    <aside className="absolute top-4 left-4 z-20">
                        <Card className="p-2 space-y-2">
                            <Button variant={tool === 'pen' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('pen')}><Brush /></Button>
                            <Popover>
                                <PopoverTrigger asChild><Button variant="ghost" size="icon"><Palette /></Button></PopoverTrigger>
                                <PopoverContent side="right" className="w-auto p-2"><div className="flex gap-1">{colors.map(c => (<button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-primary' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}</div></PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild><Button variant="ghost" size="icon"><Brush /></Button></PopoverTrigger>
                                <PopoverContent side="right" className="w-40 p-2"><Slider defaultValue={[brushSize]} max={50} min={1} step={1} onValueChange={(value) => setBrushSize(value[0])} /></PopoverContent>
                            </Popover>
                            <Button variant={tool === 'eraser' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('eraser')}><Eraser /></Button>
                            <Button variant="ghost" size="icon" onClick={addNote}><StickyNote /></Button>
                        </Card>
                    </aside>
                    <main className="h-full w-full bg-muted rounded-lg border border-dashed relative overflow-hidden">
                        <canvas ref={canvasRef} className="absolute inset-0 z-0" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} />
                        {notes.map((note) => (
                            <Draggable key={note.id} nodeRef={nodeRefs.current[note.id]} defaultPosition={{ x: note.x, y: note.y }} bounds="parent" handle=".drag-handle">
                                <div ref={nodeRefs.current[note.id]} className="absolute w-52 h-36 bg-yellow-100 shadow-lg flex flex-col rounded-lg overflow-hidden">
                                    <div className="drag-handle cursor-move bg-yellow-200 h-6 w-full flex items-center justify-center"><div className="h-1 w-8 bg-gray-400 rounded-full"></div></div>
                                    <textarea value={note.value} onChange={(e) => updateNoteText(note.id, e.target.value)} className="w-full h-full bg-transparent resize-none focus:outline-none p-2 text-sm" />
                                </div>
                            </Draggable>
                        ))}
                    </main>
                </TabsContent>
                <TabsContent value="saved" className="flex-1 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Saved Whiteboards</CardTitle>
                            <CardDescription>Your collection of saved whiteboard sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isLoadingSaved ? (
                                <p>Loading saved whiteboards...</p>
                            ) : savedWhiteboards.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {savedWhiteboards.map(wb => (
                                        <Card key={wb.id} className="overflow-hidden group">
                                            <div className="aspect-video bg-muted flex items-center justify-center relative">
                                                <Image src={wb.imageUrl} alt={wb.title} layout="fill" objectFit="cover" />
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="icon" className="h-8 w-8">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete this saved whiteboard.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteSavedWhiteboard(wb.id)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <p className="font-semibold truncate">{wb.title}</p>
                                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(wb.date, { addSuffix: true })}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-muted-foreground">You haven't saved any whiteboards yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
