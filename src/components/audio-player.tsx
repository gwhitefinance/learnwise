
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  textToPlay: string;
}

export default function AudioPlayer({ textToPlay }: AudioPlayerProps) {
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const { toast } = useToast();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const type = localStorage.getItem('learnerType');
    setLearnerType(type);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsAvailable(true);
    }

    const handleBeforeUnload = () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Cleanup on unmount
    };
  }, []);

  const handlePlayPause = () => {
    if (!isAvailable) {
      toast({ variant: 'destructive', title: 'Text-to-speech is not supported in your browser.' });
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(textToPlay);
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        toast({ variant: 'destructive', title: 'Audio Error' });
        setIsPlaying(false);
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (learnerType !== 'Auditory' || !textToPlay) {
    return null;
  }
  
  if (!isAvailable) {
      return null;
  }

  return (
    <div className="mb-2">
      <Button onClick={handlePlayPause} variant="outline" size="sm">
        {isPlaying ? (
          <Pause className="mr-2 h-4 w-4" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        {isPlaying ? 'Stop' : 'Listen'}
      </Button>
    </div>
  );
}
