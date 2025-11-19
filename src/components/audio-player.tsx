
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
    // Cancel any ongoing speech when text changes or component unmounts
    const handleUnload = () => synth.cancel();
    window.addEventListener('beforeunload', handleUnload);

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
        console.error("Speech synthesis error:", event.error);
        toast({ variant: 'destructive', title: 'Audio Error', description: `Could not play audio. Error: ${event.error}` });
        setIsPlaying(false);
        setIsPaused(false);
    }

    utteranceRef.current = utterance;

    return () => {
      synth.cancel();
      window.removeEventListener('beforeunload', handleUnload);
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
        // A fix for some browsers that require a fresh utterance object
        if (utteranceRef.current.text !== textToPlay) {
            utteranceRef.current.text = textToPlay;
        }
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
        {isPlaying && !isPaused ? 'Pause' : 'Listen'}
      </Button>
      <Button onClick={handleReset} variant="ghost" size="sm">
          <RotateCcw className="mr-2 h-4 w-4"/> Reset
      </Button>
    </div>
  );
}
