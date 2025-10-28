

'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Eraser, Palette, Brush, Type } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import Draggable from 'react-draggable';


export default function WhiteboardClientPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pen' | 'text'>('pen');

  const [textBox, setTextBox] = useState<{x: number, y: number, value: string, isEditing: boolean} | null>(null);

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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'text') {
        if (textBox && textBox.isEditing) {
            drawTextOnCanvas(textBox);
            setTextBox(null);
        } else {
            setTextBox({
                x: e.nativeEvent.offsetX,
                y: e.nativeEvent.offsetY,
                value: '',
                isEditing: true
            });
        }
    }
  };

  const drawTextOnCanvas = (box: {x: number, y: number, value: string}) => {
    const canvas = canvasRef.current;
    if (!canvas || !box.value) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = color;
    context.font = `${brushSize * 4}px sans-serif`;
    context.fillText(box.value, box.x, box.y);
  };

  const colors = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold mb-4">Whiteboard</h1>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Digital Whiteboard</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>Use this space for brainstorming, drawing diagrams, and taking notes.</span>
            <div className="flex items-center gap-2">
               <Button variant={tool === 'pen' ? 'secondary' : 'outline'} size="icon" onClick={() => setTool('pen')}>
                  <Brush />
              </Button>
               <Button variant={tool === 'text' ? 'secondary' : 'outline'} size="icon" onClick={() => setTool('text')}>
                <Type />
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

              <Button variant="destructive" size="icon" onClick={clearCanvas}>
                <Eraser />
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 relative">
          <div className="aspect-video bg-muted rounded-lg border border-dashed h-full">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onClick={handleCanvasClick}
            />
            {textBox && textBox.isEditing && (
              <Draggable
                nodeRef={textRef}
                defaultPosition={{x: textBox.x, y: textBox.y}}
                onStop={(_, data) => setTextBox(t => t ? {...t, x: data.x, y: data.y} : null)}
              >
                  <textarea
                      ref={textRef}
                      autoFocus
                      value={textBox.value}
                      onChange={(e) => setTextBox(t => t ? {...t, value: e.target.value} : null)}
                      onBlur={() => {
                          if (textBox) drawTextOnCanvas(textBox);
                          setTextBox(null);
                      }}
                      style={{
                          position: 'absolute',
                          top: 0, 
                          left: 0,
                          color: color,
                          fontSize: `${brushSize * 4}px`,
                          background: 'transparent',
                          border: '1px dashed grey',
                          outline: 'none',
                          resize: 'none',
                          lineHeight: 1,
                      }}
                      className="p-1"
                  />
              </Draggable>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
