
'use client';

import { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { Hand, Pause, Play, X, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import AnimatedOrb from './AnimatedOrb';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FloatingChatContext } from '@/components/floating-chat';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface VoiceModePlayerProps {
    initialContent: string;
    onClose: () => void;
}

export default function VoiceModePlayer({ initialContent, onClose }: VoiceModePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const nodeRef = useRef(null);

    const { toast } = useToast();
    const floatingChatContext = useContext(FloatingChatContext);
    
    const populateVoiceList = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                if (!selectedVoice) {
                    const defaultVoice = availableVoices.find(voice => voice.name === 'Google US English') || availableVoices.find(voice => voice.lang.startsWith('en-US')) || availableVoices[0];
                    setSelectedVoice(defaultVoice);
                }
            }
        }
    }, [selectedVoice]);

    useEffect(() => {
        populateVoiceList();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = populateVoiceList;
        }
    }, [populateVoiceList]);

    const stopPlayback = useCallback(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
      }
    }, []);

    const handlePlay = useCallback(() => {
      if (typeof window === 'undefined' || !window.speechSynthesis || !selectedVoice) {
          toast({ variant: 'destructive', title: 'TTS not supported or no voice selected.' });
          return;
      }
      
      stopPlayback();

      const utterance = new SpeechSynthesisUtterance(initialContent);
      utteranceRef.current = utterance;
      utterance.voice = selectedVoice;

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
    }, [initialContent, toast, stopPlayback, selectedVoice]);
    
    useEffect(() => {
        if (selectedVoice) {
            handlePlay();
        }
        
        return () => {
            stopPlayback();
        };
    }, [handlePlay, selectedVoice, stopPlayback]);

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
                    
                    <div className="mt-4 w-full">
                         <Select 
                            value={selectedVoice?.name}
                            onValueChange={(name) => {
                                const voice = voices.find(v => v.name === name);
                                if (voice) setSelectedVoice(voice);
                            }}
                         >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a voice..." />
                            </SelectTrigger>
                            <SelectContent>
                                {voices.map(voice => (
                                    <SelectItem key={voice.name} value={voice.name}>
                                        {voice.name} ({voice.lang})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

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
