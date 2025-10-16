
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';

export const useSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({ variant: 'destructive', title: 'Speech not supported.' });
      return;
    }
    
    // Stop any currently playing speech before starting a new one
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };
    
    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      toast({ variant: 'destructive', title: 'Audio Error' });
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [toast]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Interval check to handle cases where onend doesn't fire
  useEffect(() => {
      const interval = setInterval(() => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              if (!window.speechSynthesis.speaking && isPlaying) {
                  setIsPlaying(false);
                  setIsPaused(false);
              }
          }
      }, 500);

      return () => clearInterval(interval);
  }, [isPlaying]);

  return { isPlaying, isPaused, speak, stop };
};
