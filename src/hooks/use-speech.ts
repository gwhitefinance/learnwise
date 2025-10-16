
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
        
        // Cancel any ongoing speech before starting a new one.
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
            utteranceRef.current = null;
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
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
                console.error('Speech synthesis error', e);
                toast({ variant: 'destructive', title: 'Audio Error' });
            }
            setIsPlaying(false);
            setIsPaused(false);
        };
        
        utteranceRef.current = utterance;
        
        // A small delay can help prevent race conditions in some browsers
        setTimeout(() => {
            speechSynthesis.speak(utterance);
        }, 100);

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
        // Cleanup function to cancel speech when the component unmounts
        return () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
        };
    }, []);

    return { speak, stop, pause, resume, isPlaying, isPaused };
};
