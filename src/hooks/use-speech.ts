
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
            toast({ variant: 'destructive', title: 'TTS not supported' });
            return;
        }

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };
        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };
        utterance.onpause = () => {
            setIsPlaying(false);
            setIsPaused(true);
        };
        utterance.onresume = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };
        utterance.onerror = (e) => {
            console.error('Speech synthesis error', e);
            toast({ variant: 'destructive', title: 'Audio Error' });
            setIsPlaying(false);
            setIsPaused(false);
        };
        
        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
    }, [toast]);

    const pause = useCallback(() => {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
        }
    }, []);
    
    const resume = useCallback(() => {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
        }
    }, []);

    const stop = useCallback(() => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    }, []);

    useEffect(() => {
        const handleStateChange = () => {
            setIsPlaying(speechSynthesis.speaking && !speechSynthesis.paused);
            setIsPaused(speechSynthesis.paused);
        };

        const speech = window.speechSynthesis;
        const interval = setInterval(handleStateChange, 100);

        return () => {
            clearInterval(interval);
            if (speech.speaking) {
                speech.cancel();
            }
        };
    }, []);

    return { speak, stop, pause, resume, isPlaying, isPaused };
};
