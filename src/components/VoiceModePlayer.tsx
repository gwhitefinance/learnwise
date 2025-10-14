
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { Hand, Pause, Play, X, Loader2, Mic, MicOff, Settings } from 'lucide-react';
import AnimatedOrb from './AnimatedOrb';
import { useToast } from '@/hooks/use-toast';
import { studyPlannerFlow } from '@/lib/actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface VoiceModePlayerProps {
    initialContent: string;
    onClose: () => void;
}

export default function VoiceModePlayer({ initialContent, onClose }: VoiceModePlayerProps) {
    const [user] = useAuthState(auth);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [chatHistory, setChatHistory] = useState<Message[]>([{ role: 'ai', content: initialContent }]);
    
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const recognitionRef = useRef<any>(null);
    const nodeRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                const englishVoices = availableVoices.filter(v => v.lang.startsWith('en-US'));
                setVoices(englishVoices);

                if (!selectedVoice) {
                    const defaultMaleVoice = englishVoices.find(voice => voice.name.includes('Google') && voice.name.includes('Male')) || englishVoices.find(voice => voice.name.includes('Male')) || englishVoices.find(voice => voice.name === 'Google US English');
                    setSelectedVoice(defaultMaleVoice || englishVoices[0]);
                }
            }
        };

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            loadVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                 window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    }, [selectedVoice]);

    const speak = useCallback((text: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window) || !selectedVoice) {
            toast({ variant: 'destructive', title: 'Text-to-speech not supported or no voice selected.' });
            return;
        }
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utteranceRef.current = utterance;

        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
            setIsThinking(false);
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
    }, [toast, selectedVoice]);
    
    useEffect(() => {
        // Speak initial content only once when component mounts and voice is ready
        if (initialContent && selectedVoice) {
            speak(initialContent);
        }

        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedVoice]); // Run only when selectedVoice is ready

    const activateVoiceInput = useCallback(() => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast({ variant: 'destructive', title: 'Voice input not supported.' });
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            setIsThinking(true);
            
            const userMessage: Message = { role: 'user', content: transcript };
            const newHistory = [...chatHistory, userMessage];
            setChatHistory(newHistory);

            try {
                // Prepend the initial chapter content as system context for the AI
                const historyWithContext = [
                    { role: 'ai', content: `CONTEXT: ${initialContent}` },
                    ...newHistory
                ] as Message[];

                const aiResponse = await studyPlannerFlow({
                    history: historyWithContext,
                    userName: user?.displayName || undefined,
                });
                const aiMessage: Message = { role: 'ai', content: aiResponse };
                setChatHistory(prev => [...prev, aiMessage]);
                speak(aiResponse);
            } catch (error) {
                console.error("AI response error:", error);
                const errorMessage = "Sorry, I ran into a problem. Please try again.";
                setChatHistory(prev => [...prev, { role: 'ai', content: errorMessage }]);
                speak(errorMessage);
            } finally {
                setIsThinking(false);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isListening, chatHistory, user, speak, toast, initialContent]);


    const handlePlayPause = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        if (isPlaying) {
            speechSynthesis.pause();
        } else if (isPaused) {
            speechSynthesis.resume();
        } else {
            const lastAiMessage = [...chatHistory].reverse().find(m => m.role === 'ai');
            if (lastAiMessage) {
                speak(lastAiMessage.content);
            }
        }
    };
    
    const handleRaiseHand = () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && speechSynthesis.speaking) {
            speechSynthesis.cancel(); // Stop speaking immediately
            setIsPlaying(false);
            setIsPaused(false);
        }
        activateVoiceInput();
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
                    <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => setShowSettings(s => !s)}>
                        <Settings className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <div className="w-12 h-1.5 bg-muted rounded-full"></div>
                     <Button variant="ghost" size="icon" className="cursor-pointer" onClick={onClose}>
                        <X className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>

                <AnimatePresence mode="wait">
                    {showSettings ? (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full space-y-4"
                        >
                            <h3 className="text-lg font-semibold text-center">Voice Settings</h3>
                            <Select
                                value={selectedVoice?.name}
                                onValueChange={(voiceName) => {
                                    const voice = voices.find(v => v.name === voiceName);
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
                            <Button className="w-full" onClick={() => setShowSettings(false)}>Done</Button>
                        </motion.div>
                    ) : (
                         <motion.div
                            key="player"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full flex flex-col items-center"
                        >
                            <AnimatedOrb isPlaying={isPlaying || isListening || isThinking} />
                            
                            <h3 className="font-semibold text-lg mt-6">
                                {isListening ? "Listening..." : isThinking ? "Thinking..." : isPlaying ? "Speaking..." : "Voice Mode"}
                            </h3>
                            <p className="text-sm text-muted-foreground text-center h-4">
                                {isListening ? "Ask me anything." : ""}
                            </p>

                            <div className="flex items-center justify-center gap-4 mt-6 w-full">
                                <Button size="icon" className="rounded-full h-16 w-16" onClick={handlePlayPause}>
                                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-full flex-1" onClick={handleRaiseHand}>
                                    {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Hand className="mr-2 h-4 w-4" />}
                                    {isListening ? "Stop" : "Talk"}
                                </Button>
                            </div>
                         </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </Draggable>
    );
}
