
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { Hand, Pause, Play, X, Loader2 } from 'lucide-react';
import AnimatedOrb from './AnimatedOrb';

interface VoiceModePlayerProps {
    textToPlay: string;
    onClose: () => void;
    onRaiseHand: () => void;
}

export default function VoiceModePlayer({ textToPlay, onClose, onRaiseHand }: VoiceModePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const nodeRef = useRef(null);
    
    useEffect(() => {
        const handlePlay = () => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(textToPlay);
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => voice.name === 'Google US English') || voices.find(voice => voice.lang.startsWith('en-US'));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            utteranceRef.current = utterance;

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

            speechSynthesis.speak(utterance);
        };
        
        handlePlay();

        // Cleanup function for speech synthesis
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window && speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
        };
    }, [textToPlay]);

    const handlePlayPause = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        if (isPlaying) {
            speechSynthesis.pause();
        } else if (isPaused) {
            speechSynthesis.resume();
        } else {
             // Re-create and play if it ended
            const utterance = new SpeechSynthesisUtterance(textToPlay);
            utteranceRef.current = utterance;
            utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
            speechSynthesis.speak(utterance);
        }
    };
    
    const handleStopAndRaiseHand = () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        onRaiseHand();
    };

    return (
        <Draggable nodeRef={nodeRef} handle=".drag-handle">
            <motion.div
                ref={nodeRef}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed bottom-8 right-8 z-[100] w-96 bg-background/80 backdrop-blur-lg border rounded-2xl shadow-2xl flex flex-col items-center p-6 cursor-grab"
            >
                <div className="drag-handle w-full flex justify-center pb-4">
                    <div className="w-12 h-1.5 bg-muted rounded-full"></div>
                </div>

                <AnimatedOrb isPlaying={isPlaying} />
                
                <h3 className="font-semibold text-lg mt-6">Voice Mode</h3>
                <p className="text-sm text-muted-foreground text-center">Listening to the current chapter.</p>

                <div className="flex items-center justify-center gap-4 mt-6 w-full">
                    <Button variant="outline" size="lg" className="rounded-full flex-1" onClick={handleStopAndRaiseHand}>
                        <Hand className="mr-2 h-4 w-4" /> Raise Hand
                    </Button>
                    <Button size="icon" className="rounded-full h-16 w-16" onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full flex-1 text-muted-foreground" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </motion.div>
        </Draggable>
    );
}
