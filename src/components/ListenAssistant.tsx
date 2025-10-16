
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Headphones, Play, Pause, X, Mic, Hand, StopCircle, Square } from 'lucide-react';
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
  
  const { speak, stop, isPlaying } = useSpeech();
  
  const recognitionRef = useRef<any>(null);
  const draggableRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            handleAiResponse(event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(interimTranscript);
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
        setTranscript('');
      };

    }

    return () => {
      stop();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast, stop]);

  const handleAiResponse = async (text: string) => {
    if (!chapterContent || !text.trim()) return;

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
