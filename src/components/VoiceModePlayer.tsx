
'use client';

import { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { Hand, Pause, Play, X, Loader2, Mic, MicOff } from 'lucide-react';
import AnimatedOrb from './AnimatedOrb';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { studyPlannerFlow, generateAudio } from '@/lib/actions';
import { FloatingChatContext } from '@/components/floating-chat';


interface VoiceModePlayerProps {
    initialContent: string;
    onClose: () => void;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function VoiceModePlayer({ initialContent, onClose }: VoiceModePlayerProps) {
    const [history, setHistory] = useState<Message[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recognitionRef = useRef<any>(null);
    const nodeRef = useRef(null);

    const { toast } = useToast();
    const floatingChatContext = useContext(FloatingChatContext);

    const speak = useCallback(async (text: string) => {
        if (!text) return;
        setIsLoading(true);
        try {
            const response = await generateAudio({ text });
            const audio = new Audio(response.audioDataUri);
            audioRef.current = audio;
            audio.play();
            setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
            };
        } catch (error) {
            console.error("Audio generation failed:", error);
            toast({ variant: 'destructive', title: 'Could not generate audio.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    // Start reading the initial content when the component mounts
    useEffect(() => {
        setHistory([{ role: 'ai', content: initialContent }]);
        speak(initialContent);
        
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [initialContent, speak]);

    const handlePauseResume = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };
    
    const handleRaiseHand = () => {
        if (floatingChatContext?.activateVoiceInput) {
            onClose();
            floatingChatContext.activateVoiceInput();
        } else {
             // Fallback if context is not available
            if (audioRef.current && isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
            
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                toast({ variant: 'destructive', title: 'Voice input not supported.' });
                return;
            }
            
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onresult = async (event: any) => {
                const userQuery = event.results[0][0].transcript;
                const userMessage = { role: 'user', content: userQuery };
                const newHistory = [...history, userMessage];
                setHistory(newHistory);
                setIsLoading(true);

                const response = await studyPlannerFlow({
                    history: newHistory
                });
                
                const aiMessage = { role: 'ai', content: response };
                setHistory(prev => [...prev, aiMessage]);
                speak(response);
            };
            recognitionRef.current.start();
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
                        {isLoading ? "Thinking..." : isListening ? "Listening..." : (isPlaying ? "Speaking..." : "Voice Mode")}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center h-10 px-4">
                        {isListening ? "What's your question?" : "Now reading the current chapter. Raise your hand to interrupt and ask a question."}
                    </p>
                    
                    <div className="flex items-center justify-center gap-4 mt-6 w-full">
                        <Button 
                            size="lg" 
                            className="rounded-full h-16 w-16" 
                            onClick={handlePauseResume}
                            disabled={isLoading || isListening}
                        >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className={cn("rounded-full h-16 w-16 transition-colors", isListening && "bg-destructive/20 border-destructive text-destructive")}
                            onClick={handleRaiseHand}
                        >
                            {isListening ? <MicOff className="h-6 w-6" /> : <Hand className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </Draggable>
    );
}
