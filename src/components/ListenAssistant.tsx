
'use client';

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Button } from './ui/button';
import { Headphones, Play, Pause, X, Mic, Hand, StopCircle, Square, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import AIBuddy from './ai-buddy';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingChatContext } from './floating-chat';
import { studyPlannerFlow } from '@/lib/actions';

interface ListenAssistantProps {
  chapterContent: string;
  onClose: () => void;
}

type AssistantState = 'idle' | 'speaking_chapter' | 'listening_question' | 'processing_question' | 'speaking_answer';

const ListenAssistant: React.FC<ListenAssistantProps> = ({ chapterContent, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const draggableRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(chapterContent);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('en')) || voices.find(voice => voice.lang.startsWith('en-US'));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
      
      if(window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = setVoice;
      }

      utterance.onend = () => setAssistantState('idle');
      utterance.onerror = (e) => {
        console.error('SpeechSynthesis Error', e);
        toast({ variant: 'destructive', title: 'Could not play audio.' });
        setAssistantState('idle');
      };
      utteranceRef.current = utterance;
    }

    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const userQuestion = event.results[0][0].transcript;
        setAssistantState('processing_question');
        handleAIResponse(userQuestion);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
             toast({ variant: 'destructive', title: 'Voice recognition error.' });
        }
        setAssistantState('idle');
      };
      
       recognitionRef.current.onend = () => {
         if (assistantState === 'listening_question') {
            setAssistantState('idle');
         }
      };
    }


    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [chapterContent, toast]);

  const handlePlayPause = () => {
    if (!utteranceRef.current) {
        toast({ variant: 'destructive', title: 'Text-to-speech not supported or initialized.' });
        return;
    }

    if (assistantState === 'speaking_chapter') {
      window.speechSynthesis.pause(); 
      setAssistantState('idle');
    } else {
        if(window.speechSynthesis.paused) {
             window.speechSynthesis.resume();
        } else {
             window.speechSynthesis.speak(utteranceRef.current);
        }
      setAssistantState('speaking_chapter');
    }
  };

  const handleRaiseHand = () => {
    if (assistantState === 'speaking_chapter') {
        window.speechSynthesis.pause();
    }
    setAssistantState('listening_question');
    if (recognitionRef.current) {
        recognitionRef.current.start();
    } else {
        toast({ variant: 'destructive', title: 'Voice input not supported in this browser.' });
        setAssistantState('idle');
    }
  };

  const handleAIResponse = async (question: string) => {
    try {
        const response = await studyPlannerFlow({
            history: [{role: 'user', content: `In the context of the following text: "${chapterContent.substring(0, 500)}...", the user asked: ${question}`}],
        });
        
        const answerUtterance = new SpeechSynthesisUtterance(response);
        answerUtterance.lang = 'en-US';
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('en')) || voices.find(voice => voice.lang.startsWith('en-US'));
        if (preferredVoice) {
            answerUtterance.voice = preferredVoice;
        }
        answerUtterance.onstart = () => setAssistantState('speaking_answer');
        answerUtterance.onend = () => setAssistantState('idle');
        window.speechSynthesis.speak(answerUtterance);
        
    } catch(error) {
        console.error("AI response error:", error);
        toast({ variant: 'destructive', title: 'Could not get an answer from the AI.'});
        setAssistantState('idle');
    }
  };
  
  if (!isMounted) return null;

  const getStatusText = () => {
    switch (assistantState) {
      case 'speaking_chapter': return "Reading Aloud...";
      case 'listening_question': return "Listening...";
      case 'processing_question': return "Thinking...";
      case 'speaking_answer': return "Answering...";
      default: return "Listen Assistant";
    }
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
            isStatic={assistantState === 'idle'}
        />
        
        <AnimatePresence mode="wait">
            <motion.div
                key={assistantState}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-10 flex items-center justify-center"
            >
                <p className="text-xl font-bold flex items-center gap-2">
                   {getStatusText()}
                   {(assistantState === 'listening_question' || assistantState === 'processing_question') && <Loader2 className="h-5 w-5 animate-spin" />}
                </p>
            </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 mt-6">
            <Button onClick={handlePlayPause} variant="outline" size="lg" className="rounded-full">
                {assistantState === 'speaking_chapter' ? <Pause /> : <Play />}
                <span className="ml-2">{assistantState === 'speaking_chapter' ? 'Pause' : 'Play'}</span>
            </Button>
             <Button onClick={handleRaiseHand} variant="secondary" size="lg" className="rounded-full" disabled={assistantState !== 'idle' && assistantState !== 'speaking_chapter'}>
                <Hand/>
                <span className="ml-2">Question</span>
            </Button>
        </div>
      </motion.div>
    </Draggable>
  );
};

export default ListenAssistant;
