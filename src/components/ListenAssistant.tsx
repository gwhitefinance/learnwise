
'use client';

import React, { useEffect, useRef, useState, useCallback, useContext } from 'react';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { X, Hand, Play, Pause, Mic, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import AnimatedOrb from './AnimatedOrb';
import { FloatingChatContext } from './floating-chat';

interface ListenAssistantProps {
  contentToRead: string;
  onClose: () => void;
}

const ListenAssistant: React.FC<ListenAssistantProps> = ({ contentToRead, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>(undefined);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const nodeRef = React.useRef(null);
  const { toast } = useToast();
  const { openChatAndListen } = useContext(FloatingChatContext);

  const stopPlayback = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (speechSynthesis.speaking) {
          // If it's already speaking, attach an event listener
          // that resolves the promise once the current utterance has ended.
          if (utteranceRef.current) {
            utteranceRef.current.onend = () => {
              utteranceRef.current = null;
              resolve();
            };
          }
          speechSynthesis.cancel();
        } else {
          // If not speaking, resolve immediately.
          resolve();
        }
      } else {
        resolve();
      }
    });
  }, []);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      await stopPlayback();
      const utterance = new SpeechSynthesisUtterance(contentToRead);
      utteranceRef.current = utterance;

      const voice = voices.find(v => v.voiceURI === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };
      utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        toast({ variant: 'destructive', title: 'Audio Error', description: 'Could not play audio.' });
        setIsPlaying(false);
        setIsPaused(false);
      };

      speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, [isPlaying, isPaused, contentToRead, selectedVoice, voices, stopPlayback, toast]);
  
  const handleRaiseHand = async () => {
    await stopPlayback();
    setIsPlaying(false);
    setIsPaused(false);
    openChatAndListen();
  };

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        const englishVoice = availableVoices.find(v => v.lang.startsWith('en-US')) || availableVoices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          setSelectedVoice(englishVoice.voiceURI);
        }
      }
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);


  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle">
      <div ref={nodeRef} className="fixed bottom-24 right-6 w-full max-w-sm z-[60] cursor-grab">
        <div className="bg-background/80 dark:bg-black/80 backdrop-blur-lg border border-border dark:border-white/20 rounded-2xl shadow-2xl p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>

          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-48 h-48 mb-6 drag-handle">
              <AnimatedOrb isPlaying={isPlaying} />
            </div>
            
            <h1 className="text-2xl font-bold mb-1">Voice Mode</h1>
            <p className="text-muted-foreground text-sm mb-6">
                Now reading the current chapter. Raise your hand to interrupt and ask a question.
            </p>

            <div className="w-full mb-6">
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                      <SelectValue placeholder="Select a voice..." />
                  </SelectTrigger>
                  <SelectContent>
                      {voices.filter(v => v.lang.startsWith('en')).map(v => (
                          <SelectItem key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-6">
                <div className="flex flex-col items-center gap-2">
                    <Button onClick={handleRaiseHand} variant="outline" className="w-20 h-20 rounded-full flex-col gap-1 border-2">
                        <Hand size={28} />
                    </Button>
                     <span className="text-xs font-medium">Raise Hand</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Button onClick={handlePlay} className="w-20 h-20 rounded-full flex-col gap-1 text-white bg-primary hover:bg-primary/90">
                        {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                    </Button>
                    <span className="text-xs font-medium">{isPlaying ? "Pause" : isPaused ? "Resume" : "Play"}</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default ListenAssistant;
