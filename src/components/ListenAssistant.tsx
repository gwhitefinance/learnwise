
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Headphones, Play, Pause, X, Mic, Hand, StopCircle, Square, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTutorResponse, generateAudio } from '@/lib/actions';
import { cn } from '@/lib/utils';
import AIBuddy from './ai-buddy';

interface ListenAssistantProps {
  chapterContent: string;
  onClose: () => void;
}

const ListenAssistant: React.FC<ListenAssistantProps> = ({ chapterContent, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const draggableRef = useRef(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    audioRef.current = new Audio();

    const audio = audioRef.current;
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => setIsPlaying(false);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
             setTranscript(event.results[i][0].transcript);
          }
        }
        if (finalTranscript) {
          handleAiResponse(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
            console.error('Speech recognition error', event.error);
            toast({ variant: 'destructive', title: 'Voice recognition error.' });
        }
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }
  }, [toast]);
  
  const speak = useCallback(async (text: string) => {
    if (audioRef.current?.Hl) {
        audioRef.current.pause();
    }
    try {
        const { audio } = await generateAudio({ text });
        if (audioRef.current) {
            audioRef.current.src = audio;
            audioRef.current.play();
        }
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Could not play audio.' });
    }
  }, [toast]);
  
  const stop = useCallback(() => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
  }, []);

  const handleAiResponse = async (text: string) => {
    if (!chapterContent || !text.trim()) return;
    setTranscript('');
    setIsThinking(true);
    try {
      const tutorResponse = await generateTutorResponse({ chapterContext: chapterContent, question: text });
      setIsThinking(false);
      speak(tutorResponse.answer);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not get a spoken response.' });
      setIsThinking(false);
    }
  };

  const handleListen = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(chapterContent);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        toast({ variant: 'destructive', title: 'Voice input not supported in this browser.' });
        return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stop(); // Stop any playback before listening
      try {
        setTranscript('');
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
         console.error('Could not start recognition:', error);
         setIsListening(false);
      }
    }
  };

  if (!isMounted) return null;

  const getStatusText = () => {
    if (isListening) return "Listening...";
    if (transcript) return `"${transcript}"`;
    if (isThinking) return "Thinking...";
    if (isPlaying) return "Speaking...";
    return "Tutorin Voice Agent";
  }

  return (
    <Draggable nodeRef={draggableRef} handle=".drag-handle">
      <motion.div
        ref={draggableRef}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-24 right-8 z-50 w-80 bg-background/80 backdrop-blur-lg border rounded-2xl shadow-2xl flex flex-col items-center p-6 text-center"
      >
        <div className="drag-handle cursor-move absolute top-0 left-0 right-0 h-8" />
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={onClose}><X size={16}/></Button>
        
        <AIBuddy
            className="w-32 h-32 mb-4"
            isStatic={!isPlaying && !isListening && !isThinking}
        />
        
        <AnimatePresence mode="wait">
            <motion.div
                key={getStatusText()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-10 flex items-center justify-center"
            >
                <p className={cn("text-xl font-bold", (transcript || isThinking) && "italic text-muted-foreground")}>
                   {getStatusText()}
                </p>
            </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 mt-6">
            <Button onClick={handleListen} variant="outline" size="lg" className="rounded-full">
                {isPlaying ? <StopCircle /> : <Headphones />}
                <span className="ml-2">{isPlaying ? 'Stop' : 'Listen'}</span>
            </Button>
            <Button
                onClick={toggleListening}
                size="icon"
                className={cn("rounded-full h-14 w-14 transition-all duration-300", isListening ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-primary hover:bg-primary/90')}
            >
                {isListening ? <Square className="text-white" /> : <Hand className="text-white" />}
            </Button>
        </div>
      </motion.div>
    </Draggable>
  );
};

export default ListenAssistant;
