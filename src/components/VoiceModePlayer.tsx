
'use client';

import { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { Hand, Pause, Play, X } from 'lucide-react';
import AnimatedOrb from './AnimatedOrb';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FloatingChatContext } from '@/components/floating-chat';


interface VoiceModePlayerProps {
    initialContent: string;
    onClose: () => void;
}

export default function VoiceModePlayer({ initialContent, onClose }: VoiceModePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const nodeRef = useRef(null);

    const { toast } = useToast();
    const floatingChatContext = useContext(FloatingChatContext);
    
    const stopPlayback = useCallback(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
      }
    }, []);

    const handlePlay = useCallback(() => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
          toast({ variant: 'destructive', title: 'TTS not supported in this browser.' });
          return;
      }
      
      stopPlayback();

      const utterance = new SpeechSynthesisUtterance(initialContent);
      utteranceRef.current = utterance;

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
          console.error("Speech synthesis error", e);
          toast({ variant: 'destructive', title: 'Audio Error' });
      };

      window.speechSynthesis.speak(utterance);
    }, [initialContent, toast, stopPlayback]);
    
    // Start reading the initial content when the component mounts
    useEffect(() => {
        handlePlay();
        
        return () => {
            stopPlayback();
        };
    }, [handlePlay, stopPlayback]);

    const handlePauseResume = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        if (isPlaying) {
            window.speechSynthesis.pause();
        } else if (isPaused) {
            window.speechSynthesis.resume();
        } else {
            handlePlay();
        }
    };
    
    const handleRaiseHand = () => {
        stopPlayback();
        if (floatingChatContext?.activateVoiceInput) {
            onClose();
            floatingChatContext.activateVoiceInput();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Voice input context not available.' });
        }
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
                 <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5"/>
                </button>

                <div className="w-full flex flex-col items-center">
                    <AnimatedOrb isPlaying={isPlaying} />
                    <h3 className="font-semibold text-lg mt-6">
                        {isPlaying ? "Speaking..." : (isPaused ? "Paused" : "Voice Mode")}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center h-10 px-4">
                        Now reading the current chapter. Raise your hand to interrupt and ask a question.
                    </p>
                    
                    <div className="flex items-center justify-center gap-4 mt-6 w-full">
                        <Button 
                            size="lg" 
                            className="rounded-full h-16 w-16" 
                            onClick={handlePauseResume}
                        >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full h-16 w-16"
                            onClick={handleRaiseHand}
                        >
                            <Hand className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </Draggable>
    );
}
