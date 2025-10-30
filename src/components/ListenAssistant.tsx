
'use client';

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Button } from './ui/button';
import { Headphones, Play, Pause, X, Mic, Hand, StopCircle, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import AIBuddy from './ai-buddy';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingChatContext } from './floating-chat';


interface ListenAssistantProps {
  chapterContent: string;
  onClose: () => void;
}

const ListenAssistant: React.FC<ListenAssistantProps> = ({ chapterContent, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();
  const draggableRef = useRef(null);
  const { openChatWithPrompt } = useContext(FloatingChatContext);


  useEffect(() => {
    setIsMounted(true);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(chapterContent);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        // Let's try to find a high-quality voice
        const preferredVoice = voices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('en')) || voices.find(voice => voice.lang.startsWith('en-US'));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
      
      // Voices are loaded asynchronously
      if(window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = setVoice;
      }

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (e) => {
        console.error('SpeechSynthesis Error', e);
        toast({ variant: 'destructive', title: 'Could not play audio.' });
        setIsPlaying(false);
      };
      utteranceRef.current = utterance;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [chapterContent, toast]);

  const handlePlayPause = () => {
    if (!utteranceRef.current) {
        toast({ variant: 'destructive', title: 'Text-to-speech not supported or initialized.' });
        return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause(); // Use pause instead of cancel
      setIsPlaying(false);
    } else {
        if(window.speechSynthesis.paused) {
             window.speechSynthesis.resume();
        } else {
             window.speechSynthesis.speak(utteranceRef.current);
        }
      setIsPlaying(true);
    }
  };

  const handleRaiseHand = () => {
    if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
    }
    openChatWithPrompt(`I have a question about this: "${chapterContent.substring(0, 150)}..."`);
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
            isStatic={!isPlaying}
        />
        
        <AnimatePresence mode="wait">
            <motion.div
                key={isPlaying ? 'speaking' : 'idle'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-10 flex items-center justify-center"
            >
                <p className="text-xl font-bold">
                   {isPlaying ? "Reading Aloud..." : "Listen Assistant"}
                </p>
            </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 mt-6">
            <Button onClick={handlePlayPause} variant="outline" size="lg" className="rounded-full">
                {isPlaying ? <Pause /> : <Play />}
                <span className="ml-2">{isPlaying ? 'Pause' : 'Play'}</span>
            </Button>
             <Button onClick={handleRaiseHand} variant="secondary" size="lg" className="rounded-full">
                <Hand/>
                <span className="ml-2">Raise Hand</span>
            </Button>
        </div>
      </motion.div>
    </Draggable>
  );
};

export default ListenAssistant;
