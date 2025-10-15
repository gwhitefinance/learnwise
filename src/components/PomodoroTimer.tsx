'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const WORK_MINUTES = 25;
const SHORT_BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeRemaining, setTimeRemaining] = useState(WORK_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  const getMinutesForMode = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'work':
        return WORK_MINUTES;
      case 'shortBreak':
        return SHORT_BREAK_MINUTES;
      case 'longBreak':
        return LONG_BREAK_MINUTES;
      default:
        return WORK_MINUTES;
    }
  };

  const switchMode = useCallback((nextMode: TimerMode) => {
    setIsActive(false);
    setMode(nextMode);
    setTimeRemaining(getMinutesForMode(nextMode) * 60);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      if (mode === 'work') {
        const newCycles = cycles + 1;
        setCycles(newCycles);
        if (newCycles % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode('work');
      }
      // Play a notification sound
      new Audio('/sounds/notification.mp3').play().catch(e => console.error("Error playing sound:", e));
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining, mode, cycles, switchMode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(getMinutesForMode(mode) * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-white/10 border-white/20 text-white w-64 text-center backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex justify-center gap-2 mb-4">
          <Button size="sm" variant={mode === 'work' ? 'secondary' : 'ghost'} onClick={() => switchMode('work')} className="rounded-full">Work</Button>
          <Button size="sm" variant={mode === 'shortBreak' ? 'secondary' : 'ghost'} onClick={() => switchMode('shortBreak')} className="rounded-full">Short Break</Button>
          <Button size="sm" variant={mode === 'longBreak' ? 'secondary' : 'ghost'} onClick={() => switchMode('longBreak')} className="rounded-full">Long Break</Button>
        </div>
        <div className="text-6xl font-bold font-mono my-4">
          {formatTime(timeRemaining)}
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={toggleTimer} size="lg" className="rounded-full w-24">
            {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg" className="rounded-full w-24 bg-transparent hover:bg-white/20">
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
