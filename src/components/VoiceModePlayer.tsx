
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { Hand, Pause, Play, X, Loader2, Settings, MicOff } from 'lucide-react';
import AnimatedOrb from './AnimatedOrb';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface VoiceModePlayerProps {
    initialContent: string;
    onClose: () => void;
}

export default function VoiceModePlayer({ initialContent, onClose }: VoiceModePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const nodeRef = useRef(null);
    const { toast } = useToast();

    const populateVoiceList = useCallback(() => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
            // Try to find a high-quality default voice
            const googleVoice = availableVoices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
            const microsoftVoice = availableVoices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('en'));
            const defaultVoice = googleVoice || microsoftVoice || availableVoices.find(v => v.lang.startsWith('en-US')) || availableVoices[0];
            setSelectedVoice(defaultVoice);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            populateVoiceList();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = populateVoiceList;
            }
        } else {
             toast({ variant: 'destructive', title: 'TTS Not Supported', description: 'Your browser does not support text-to-speech.' });
        }
    }, [populateVoiceList, toast]);

    const handlePlay = useCallback(() => {
        if (!initialContent || !selectedVoice) return;
        
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(initialContent);
        
        utterance.voice = selectedVoice;
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
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            toast({ variant: 'destructive', title: 'Audio Error' });
        }

        speechSynthesis.speak(utterance);

    }, [initialContent, selectedVoice, toast]);
    
    useEffect(() => {
        // Only start playing once a voice has been selected.
        if (selectedVoice) {
            handlePlay();
        }
        
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window && speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
        }
    }, [selectedVoice, handlePlay]);


    const handlePause = () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && speechSynthesis.speaking) {
            speechSynthesis.pause();
        }
    };
    
    const handleResume = () => {
         if (typeof window !== 'undefined' && 'speechSynthesis' in window && speechSynthesis.paused) {
            speechSynthesis.resume();
        }
    }
    
    const handleTogglePlay = () => {
        if (isPlaying) handlePause();
        else if (isPaused) handleResume();
        else handlePlay();
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
                <div className="drag-handle w-full flex justify-between items-center pb-4">
                    <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                        <Settings className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <div className="w-12 h-1.5 bg-muted rounded-full"></div>
                    <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={onClose}>
                        <X className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>

                <div className="w-full flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        {isSettingsOpen ? (
                             <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full h-[232px] flex flex-col justify-center space-y-4 px-4"
                            >
                                <h3 className="text-center font-semibold">Voice Selection</h3>
                                <Select
                                    value={selectedVoice?.name}
                                    onValueChange={(name) => setSelectedVoice(voices.find(v => v.name === name) || null)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a voice" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {voices.map(voice => (
                                            <SelectItem key={voice.name} value={voice.name}>
                                                {voice.name} ({voice.lang})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        ) : (
                             <motion.div
                                key="player"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center"
                            >
                                <AnimatedOrb isPlaying={isPlaying} />
                                <h3 className="font-semibold text-lg mt-6">
                                    {isPlaying ? "Speaking..." : isPaused ? "Paused" : "Voice Mode"}
                                </h3>
                                <p className="text-sm text-muted-foreground text-center h-4">
                                    Now reading the current chapter.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div className="flex items-center justify-center gap-4 mt-6 w-full">
                        <Button size="icon" className="rounded-full h-16 w-16" onClick={handleTogglePlay}>
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </Draggable>
    );
}
