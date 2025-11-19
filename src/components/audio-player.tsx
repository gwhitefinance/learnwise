
'use client';

import { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(textToPlay);
    
    utterance.onboundary = (event) => {
        onBoundary(event.charIndex);
    };

    utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        onEnd();
    };

    utteranceRef.current = utterance;

    return () => {
      synth.cancel();
    };
  }, [textToPlay, onBoundary, onEnd]);

  const handlePlayPause = () => {
    const synth = window.speechSynthesis;
    if (!utteranceRef.current) return;

    if (isPlaying) {
        if (isPaused) {
            synth.resume();
            setIsPaused(false);
        } else {
            synth.pause();
            setIsPaused(true);
        }
    } else {
        synth.speak(utteranceRef.current);
        setIsPlaying(true);
        setIsPaused(false);
    }
  };

  const handleReset = () => {
      const synth = window.speechSynthesis;
      synth.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      onEnd();
  }

  return (
    <div className="mb-4 flex items-center gap-2">
      <Button onClick={handlePlayPause} variant="outline" size="sm">
        {isPlaying && !isPaused ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
        {isPlaying && !isPaused ? 'Pause' : 'Listen'}
      </Button>
      <Button onClick={handleReset} variant="ghost" size="sm">
          <RotateCcw className="mr-2 h-4 w-4"/> Reset
      </Button>
    </div>
  );
}
