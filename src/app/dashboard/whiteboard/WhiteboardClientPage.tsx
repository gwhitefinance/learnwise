
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Eraser, Palette, Brush, StickyNote, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import Draggable from 'react-draggable';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

type StickyNoteType = {
    id: number;
    x: number;
    y: number;
    value: string;
    isEditing: boolean;
};

export default function WhiteboardClientPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pen' | 'text'>('pen');
  const [notes, setNotes] = useState<StickyNoteType[]>([]);
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const nodeRefs = useRef<{[key: number]: React.RefObject<HTMLDivElement>}>({});

  notes.forEach((note) => {
    if (!nodeRefs.current[note.id]) {
      nodeRefs.current[note.id] = React.createRef<HTMLDivElement>();
    }
  });

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'pen') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'pen') return;
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
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    }
  }, []);

  const addNote = () => {
      const newNote: StickyNoteType = {
          id: Date.now(),
          x: 100,
          y: 100,
          value: 'New Note',
          isEditing: true, // Start editing immediately
      };
      setNotes(prev => [...prev, newNote]);
  }
  
  const updateNoteText = (id: number, newValue: string) => {
      setNotes(prev => prev.map(note => note.id === id ? {...note, value: newValue} : note));
  }

  const handleNoteDoubleClick = (id: number) => {
      setNotes(prev => prev.map(note => note.id === id ? {...note, isEditing: true} : note));
  }
  
  const handleNoteBlur = (id: number) => {
       setNotes(prev => prev.map(note => note.id === id ? {...note, isEditing: false} : note));
  }
  
  const handleSaveAsNote = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to save notes.'});
        return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas to merge drawings and notes
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return;

    // Draw the background
    tempCtx.fillStyle = '#f3f4f6'; // Muted background color
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the existing canvas content (drawings)
    tempCtx.drawImage(canvas, 0, 0);

    // Draw each sticky note
    notes.forEach(note => {
        tempCtx.fillStyle = '#fefce8'; // yellow-50
        tempCtx.shadowColor = 'rgba(0,0,0,0.1)';
        tempCtx.shadowBlur = 10;
        tempCtx.shadowOffsetY = 4;
        
        const noteElement = nodeRefs.current[note.id]?.current;
        if (noteElement) {
            const transform = noteElement.style.transform;
            const translateMatch = transform.match(/translate\((\d+)px, (\d+)px\)/);
            let x = note.x;
            let y = note.y;
            if (translateMatch) {
                x = parseInt(translateMatch[1], 10);
                y = parseInt(translateMatch[2], 10);
            }
            tempCtx.fillRect(x, y, 200, 100);
            tempCtx.shadowColor = 'transparent';

            tempCtx.fillStyle = '#333';
            tempCtx.font = '16px sans-serif';
            const lines = note.value.split('\\n');
            lines.forEach((line, i) => {
                tempCtx.fillText(line, x + 10, y + 20 + (i * 20));
            });
        }
    });

    const imageDataUrl = tempCanvas.toDataURL('image/png');

    try {
        await addDoc(collection(db, "notes"), {
            title: `Whiteboard - ${new Date().toLocaleString()}`,
            content: `Whiteboard content saved as an image.`,
            imageUrl: imageDataUrl, // Storing image as a data URL
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


  const colors = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  return (
    <div className="flex flex-col h-full space-y-4">
      <h1 className="text-3xl font-bold">Whiteboard</h1>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Digital Whiteboard</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>Use this space for brainstorming, drawing diagrams, and taking notes.</span>
            <div className="flex items-center gap-2">
                <Button variant={tool === 'pen' ? 'secondary' : 'outline'} size="icon" onClick={() => setTool('pen')}>
                    <Brush />
                </Button>
                <Button variant={'outline'} size="icon" onClick={addNote}>
                    <StickyNote />
                </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon"><Palette /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="flex gap-1">
                    {colors.map(c => (
                      <button 
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-primary' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

               <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon"><Brush /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2">
                   <Slider
                      defaultValue={[brushSize]}
                      max={30}
                      min={1}
                      step={1}
                      onValueChange={(value) => setBrushSize(value[0])}
                    />
                </PopoverContent>
              </Popover>
               <Button variant="outline" size="icon" onClick={handleSaveAsNote}>
                  <Save />
              </Button>
              <Button variant="destructive" size="icon" onClick={clearCanvas}>
                <Eraser />
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 relative">
          <div className="absolute inset-0 bg-muted rounded-lg border border-dashed">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 z-0"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
             <div className="absolute inset-0 z-10 pointer-events-none">
                {notes.map((note) => (
                    <Draggable 
                        key={note.id}
                        nodeRef={nodeRefs.current[note.id]} 
                        defaultPosition={{x: note.x, y: note.y}} 
                        bounds="parent"
                    >
                         <div 
                            ref={nodeRefs.current[note.id]}
                            className="w-48 h-24 bg-yellow-200 shadow-lg p-2 flex flex-col pointer-events-auto"
                            onDoubleClick={() => handleNoteDoubleClick(note.id)}
                        >
                            <textarea 
                                value={note.value}
                                onChange={(e) => updateNoteText(note.id, e.target.value)}
                                onBlur={() => handleNoteBlur(note.id)}
                                className="w-full h-full bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                autoFocus={note.isEditing}
                            />
                        </div>
                    </Draggable>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
