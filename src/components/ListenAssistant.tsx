
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { X, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import AIBuddy from './ai-buddy';
import { generateTutorResponse, generateAudio } from '@/lib/actions';

interface ListenAssistantProps {
  chapterContent: string;
  onClose: () => void;
}

const ListenAssistant: React.FC<ListenAssistantProps> = ({ chapterContent, onClose }) => {
  const nodeRef = React.useRef(null);
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }
    setIsSpeaking(false);
  }, []);
  
  const handleAiResponse = useCallback(async (text: string) => {
    setTranscript('');
    try {
        const tutorResponse = await generateTutorResponse({ chapterContext: chapterContent, question: text });
        setIsSpeaking(true);
        const audioResponse = await generateAudio({ text: tutorResponse.answer });
        
        const newAudio = new Audio(audioResponse.audioDataUri);
        audioRef.current = newAudio;
        newAudio.play();
        newAudio.onended = () => {
            setIsSpeaking(false);
        };
    } catch(e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not get AI response.'});
        setIsSpeaking(false);
    }
  }, [chapterContent, toast]);

  const toggleListen = useCallback(() => {
    if (isSpeaking) {
        stopPlayback();
        return;
    }
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
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast({ variant: 'destructive', title: 'Voice recognition error.' });
        setIsListening(false);
    };

    recognition.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');
        setTranscript(currentTranscript);

        if (event.results[0].isFinal) {
            recognition.stop();
            handleAiResponse(currentTranscript);
        }
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, isSpeaking, toast, handleAiResponse, stopPlayback]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      recognitionRef.current?.stop();
      stopPlayback();
    };
  }, [stopPlayback]);
  
  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle">
      <div ref={nodeRef} className="fixed bottom-24 right-6 w-full max-w-sm z-[60] cursor-grab">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background/80 dark:bg-black/80 backdrop-blur-lg border border-border dark:border-white/20 rounded-2xl shadow-2xl p-6"
        >
          <div className="drag-handle h-8 w-full absolute top-0 left-0" />
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>

          <div className="flex flex-col items-center justify-center text-center">
             <div className="relative w-48 h-48 mb-6">
               <AIBuddy isStatic={!isSpeaking && !isListening} />
            </div>
            
            <h1 className="text-2xl font-bold mb-1">AI Voice Agent</h1>
            <p className="text-muted-foreground text-sm h-10">
                {isListening ? (transcript || 'Listening...') : isSpeaking ? 'Thinking...' : 'Ask me anything about this chapter.'}
            </p>

            <div className="flex items-center space-x-6 mt-6">
                <Button onClick={toggleListen} className={cn("w-20 h-20 rounded-full flex-col gap-1 text-white transition-colors", isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90')}>
                    <Mic size={28} />
                </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </Draggable>
  );
};

export default ListenAssistant;
