
'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Eraser, Palette, Brush } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

  const colors = ['#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold mb-4">Whiteboard</h1>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Digital Whiteboard</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>Use this space for brainstorming, drawing diagrams, and taking notes.</span>
            <div className="flex items-center gap-2">
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
        <CardContent className="flex-1">
          <div className="aspect-video bg-muted rounded-lg border border-dashed h-full">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
