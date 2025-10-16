
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Headphones, Play, Pause, X, Mic, Hand, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTutorResponse } from '@/lib/actions';
import { cn } from '@/lib/utils';
import AIBuddy from './ai-buddy';
import { useSpeech } from '@/hooks/use-speech';

interface ListenAssistantProps {
  chapterContent: string;
  onClose: () => void;
}

const ListenAssistant: React.FC<ListenAssistantProps> = ({ chapterContent, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const { speak, stop, isPlaying, isPaused } = useSpeech();
  
  const recognitionRef = useRef<any>(null);
  const draggableRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const userSpeech = event.results[0][0].transcript;
        setTranscript(userSpeech);
        handleAiResponse(userSpeech);
      };
      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted') {
            console.error('Speech recognition error', event.error);
            toast({ variant: 'destructive', title: 'Voice recognition error.' });
        }
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      stop();
      recognitionRef.current?.abort();
    };
  }, [toast, stop]);

  const handleAiResponse = async (text: string) => {
    if (!chapterContent) return;

    setTranscript('');
    try {
      const tutorResponse = await generateTutorResponse({ chapterContext: chapterContent, question: text });
      speak(tutorResponse.answer);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not get a spoken response.' });
    }
  };

  const handleListen = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(chapterContent);
    }
  };

  const toggleListenForQuestion = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stop(); // Stop any playback before listening
      recognitionRef.current?.start();
    }
  };

  if (!isMounted) return null;

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
            isStatic={!isPlaying && !isListening}
        />
        
        <AnimatePresence mode="wait">
            <motion.div
                key={transcript ? 'transcript' : 'title'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-10"
            >
                {transcript ? (
                    <p className="text-lg font-semibold italic">"{transcript}"</p>
                ) : (
                    <h3 className="text-xl font-bold">Tutorin Voice Agent</h3>
                )}
            </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 mt-6">
            <Button onClick={handleListen} variant="outline" size="lg" className="rounded-full">
                {isPlaying ? <StopCircle /> : <Headphones />}
                <span className="ml-2">{isPlaying ? 'Stop' : 'Listen'}</span>
            </Button>
            <Button
                onClick={toggleListenForQuestion}
                size="icon"
                className={cn("rounded-full h-14 w-14 transition-all duration-300", isListening ? 'bg-red-500 scale-110' : 'bg-primary')}
            >
                {isListening ? <Hand className="text-white" /> : <Mic className="text-white" />}
            </Button>
        </div>
      </motion.div>
    </Draggable>
  );
};

export default ListenAssistant;
