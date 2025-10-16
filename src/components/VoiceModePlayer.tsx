
'use client';

import { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { Hand, Pause, Play, X } from 'lucide-react';
import AnimatedOrb from './AnimatedOrb';
import { useToast } from '@/hooks/use-toast';
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

    const stopPlayback = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                if (utteranceRef.current) {
                    utteranceRef.current.onend = () => {
                        utteranceRef.current = null;
                        resolve();
                    };
                }
                window.speechSynthesis.cancel();
                setIsPlaying(false);
                setIsPaused(false);
                // If not speaking, resolve immediately
                if (!window.speechSynthesis.speaking) {
                    resolve();
                }
            } else {
                resolve();
            }
        });
    }, []);

    const handlePlay = useCallback(async () => {
      if (typeof window === 'undefined' || !window.speechSynthesis || !selectedVoice) {
          toast({ variant: 'destructive', title: 'TTS not supported or no voice selected.' });
          return;
      }
      
      await stopPlayback();

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
    
    const handleRaiseHand = async () => {
        await stopPlayback();
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

                <div className="flex flex-col items-center justify-center text-center">
                    <AnimatedOrb isPlaying={isPlaying} />
                    <h1 className="text-3xl font-bold text-foreground mt-8 mb-2">Voice Mode</h1>
                    <p className="text-muted-foreground mb-8 text-sm max-w-xs">
                        Now reading the current chapter. Raise your hand to interrupt and ask a question.
                    </p>
                    <div className="w-full mb-8">
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
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={handleRaiseHand}
                            className="flex flex-col items-center justify-center w-24 h-24 bg-primary text-primary-foreground rounded-full shadow-lg transform transition-transform hover:scale-105"
                        >
                            <Hand className="w-9 h-9"/>
                            <span className="text-sm mt-1">Raise Hand</span>
                        </button>
                        <button 
                            onClick={handlePauseResume}
                            className="flex flex-col items-center justify-center w-24 h-24 bg-muted text-muted-foreground rounded-full shadow-lg transform transition-transform hover:scale-105"
                        >
                            {isPlaying ? <Pause className="w-9 h-9"/> : <Play className="w-9 h-9"/>}
                            <span className="text-sm mt-1">{isPlaying ? 'Pause' : 'Play'}</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </Draggable>
    );
}
