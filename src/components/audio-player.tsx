
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
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

    const handleUtteranceEnd = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onEnd();
    };

    const handleUtteranceError = (event: SpeechSynthesisErrorEvent) => {
      // Ignore 'interrupted' and 'canceled' as they are expected on re-render or stop
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.error("Speech synthesis error:", event.error);
        toast({ variant: 'destructive', title: 'Audio Error', description: `Could not play audio. Error: ${event.error}` });
      }
      // Ensure state is reset
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        onBoundary(event.charIndex);
      }
    };
    utterance.onend = handleUtteranceEnd;
    utterance.onerror = handleUtteranceError;
    
    utteranceRef.current = utterance;

    // Cleanup on component unmount or when text changes
    return () => {
      onEnd(); // Reset highlights
      synth.cancel();
    };
  }, [textToPlay, onBoundary, onEnd, toast]);

  const handlePlayPause = () => {
    const synth = window.speechSynthesis;
    if (!utteranceRef.current) return;

    if (synth.speaking) {
        if (synth.paused) {
            synth.resume();
            setIsPaused(false);
        } else {
            synth.pause();
            setIsPaused(true);
        }
    } else {
        // If not speaking, start fresh
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
