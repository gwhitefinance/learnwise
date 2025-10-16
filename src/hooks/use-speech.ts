
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';

export const useSpeech = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const { toast } = useToast();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const stop = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            toast({ variant: 'destructive', title: 'TTS not supported' });
            return;
        }

        // Ensure any previous speech is stopped before starting a new one.
        stop();
        
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
            // "interrupted" is a common event when stop() is called, not a true error.
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
                console.error('Speech synthesis error', e);
                toast({ variant: 'destructive', title: 'Audio Error' });
            }
            setIsPlaying(false);
            setIsPaused(false);
        };
        
        utteranceRef.current = utterance;
        
        // Use a tiny timeout to ensure the previous cancel() has time to fire its onend event.
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 100);

    }, [toast, stop]);

    const pause = useCallback(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
        }
    }, []);
    
    const resume = useCallback(() => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }, []);

    useEffect(() => {
        // Cleanup function to stop speech when the component unmounts
        const handleBeforeUnload = () => {
            stop();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            stop();
        };
    }, [stop]);

    return { speak, stop, pause, resume, isPlaying, isPaused };
};
