
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, StopCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  textToPlay: string;
}

export default function AudioPlayer({ textToPlay }: AudioPlayerProps) {
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const type = localStorage.getItem('learnerType');
    setLearnerType(type);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToPlay);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;

      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.name === 'Google US English' && voice.lang === 'en-US');
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = setVoice;
      }
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (e) => {
        console.error('SpeechSynthesis Error', e);
        toast({ variant: 'destructive', title: 'Could not play audio.' });
        setIsPlaying(false);
      };
      utteranceRef.current = utterance;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [textToPlay, toast]);

  const handlePlayPause = () => {
    if (!utteranceRef.current) {
        toast({ variant: 'destructive', title: 'Text-to-speech not supported or initialized.' });
        return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.speak(utteranceRef.current);
      setIsPlaying(true);
    }
  };

  if (learnerType !== 'Auditory' || !textToPlay) {
    return null;
  }

  return (
    <div className="mb-2">
      <Button onClick={handlePlayPause} variant="outline" size="sm">
        {isPlaying ? (
          <StopCircle className="mr-2 h-4 w-4" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        {isPlaying ? 'Stop' : 'Listen'}
      </Button>
    </div>
  );
}
