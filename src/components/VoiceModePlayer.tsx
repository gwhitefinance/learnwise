
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { Hand, Pause, Play, X, Loader2, Settings } from 'lucide-react';
import AnimatedOrb from './AnimatedOrb';
import { useToast } from '@/hooks/use-toast';
import { generateAudio } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface VoiceModePlayerProps {
    initialContent: string;
    onClose: () => void;
}

export default function VoiceModePlayer({ initialContent, onClose }: VoiceModePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const nodeRef = useRef(null);
    const { toast } = useToast();

    const handlePlay = useCallback(async () => {
        if (isPlaying && audio) {
            audio.pause();
            setIsPlaying(false);
            return;
        }

        if (audio) {
            audio.play();
            setIsPlaying(true);
            return;
        }

        setIsLoading(true);
        try {
            const response = await generateAudio({ text: initialContent });
            const newAudio = new Audio(response.audioDataUri);
            
            newAudio.onplay = () => setIsPlaying(true);
            newAudio.onpause = () => setIsPlaying(false);
            newAudio.onended = () => {
                setIsPlaying(false);
                setAudio(null); // Reset for next play
            };
            
            newAudio.play();
            setAudio(newAudio);

        } catch (error) {
            console.error('Failed to generate or play audio:', error);
            toast({
                variant: 'destructive',
                title: 'Audio Error',
                description: 'Could not play the audio for this section.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [isPlaying, audio, initialContent, toast]);

    // Automatically play when the component mounts with content
    useEffect(() => {
        if (initialContent) {
            handlePlay();
        }

        // Cleanup on unmount
        return () => {
            if (audio) {
                audio.pause();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialContent]);


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
                     <div className="w-8 h-8"></div>
                    <div className="w-12 h-1.5 bg-muted rounded-full"></div>
                     <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={onClose}>
                        <X className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>

                <div className="w-full flex flex-col items-center">
                    <AnimatedOrb isPlaying={isPlaying || isLoading} />
                    
                    <h3 className="font-semibold text-lg mt-6">
                        {isLoading ? "Generating Audio..." : isPlaying ? "Speaking..." : "Voice Mode"}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center h-4">
                        Now reading the current chapter.
                    </p>

                    <div className="flex items-center justify-center gap-4 mt-6 w-full">
                        <Button size="icon" className="rounded-full h-16 w-16" onClick={handlePlay} disabled={isLoading}>
                             {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </Draggable>
    );
}
