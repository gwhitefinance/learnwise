
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  textToPlay: string;
  onBoundary: (charIndex: number) => void;
  onEnd: () => void;
}

export default function AudioPlayer({ textToPlay, onBoundary, onEnd }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const cleanup = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    onEnd();
  }, [onEnd]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    
    // Cleanup on component unmount
    return () => {
      synth.cancel();
    };
  }, []);

  const handlePlayPause = () => {
    const synth = window.speechSynthesis;

    if (isPlaying) {
      if (isPaused) {
        synth.resume();
        setIsPaused(false);
      } else {
        synth.pause();
        setIsPaused(true);
      }
    } else {
      // Start new speech
      cleanup(); // Clean up any previous state
      
      const utterance = new SpeechSynthesisUtterance(textToPlay);
      
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          onBoundary(event.charIndex);
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        onEnd();
      };
      
      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          toast({ variant: 'destructive', title: 'Audio Error', description: `Could not play audio. Error: ${event.error}` });
        }
        setIsPlaying(false);
        setIsPaused(false);
        onEnd();
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleReset = () => {
    cleanup();
  };

  return (
    <div className="mb-4 flex items-center gap-2 not-prose">
      <Button onClick={handlePlayPause} variant="outline" size="sm">
        {isPlaying && !isPaused ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
        {isPaused ? 'Resume' : isPlaying ? 'Pause' : 'Listen'}
      </Button>
      <Button onClick={handleReset} variant="ghost" size="sm">
          <RotateCcw className="mr-2 h-4 w-4"/> Reset
      </Button>
    </div>
  );
}
