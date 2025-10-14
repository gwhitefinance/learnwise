
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { Hand, Pause, Play, X, Loader2, Mic, MicOff } from 'lucide-react';
import AnimatedOrb from './AnimatedOrb';
import { useToast } from '@/hooks/use-toast';
import { studyPlannerFlow } from '@/lib/actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

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
    
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const recognitionRef = useRef<any>(null);
    const nodeRef = useRef(null);
    const { toast } = useToast();

    const speak = useCallback((text: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            toast({ variant: 'destructive', title: 'Text-to-speech not supported.' });
            return;
        }
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.name === 'Google US English') || voices.find(voice => voice.lang.startsWith('en-US'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
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
    }, [toast]);
    
    useEffect(() => {
        speak(initialContent);

        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
        };
    }, [initialContent, speak]);

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
                const aiResponse = await studyPlannerFlow({
                    history: newHistory,
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
    }, [isListening, chatHistory, user, speak, toast]);


    const handlePlayPause = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        if (isPlaying) {
            speechSynthesis.pause();
        } else if (isPaused) {
            speechSynthesis.resume();
        } else if (utteranceRef.current) {
            speechSynthesis.speak(utteranceRef.current);
        } else {
            // Replay the last AI message if nothing is playing
            const lastAiMessage = [...chatHistory].reverse().find(m => m.role === 'ai');
            if (lastAiMessage) {
                speak(lastAiMessage.content);
            }
        }
    };
    
    const handleRaiseHand = () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && speechSynthesis.speaking) {
            speechSynthesis.pause();
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
                <div className="drag-handle w-full flex justify-center pb-4">
                    <div className="w-12 h-1.5 bg-muted rounded-full"></div>
                </div>

                <AnimatedOrb isPlaying={isPlaying || isListening || isThinking} />
                
                <h3 className="font-semibold text-lg mt-6">
                    {isListening ? "Listening..." : isThinking ? "Thinking..." : isPlaying ? "Speaking..." : "Voice Mode"}
                </h3>
                <p className="text-sm text-muted-foreground text-center h-4">
                    {isListening ? "Ask me anything." : ""}
                </p>

                <div className="flex items-center justify-center gap-4 mt-6 w-full">
                    <Button variant="ghost" size="icon" className="rounded-full flex-1 text-muted-foreground" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="rounded-full h-16 w-16" onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-full flex-1" onClick={handleRaiseHand}>
                        {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Hand className="mr-2 h-4 w-4" />}
                        {isListening ? "Stop" : "Talk"}
                    </Button>
                </div>
            </motion.div>
        </Draggable>
    );
}
