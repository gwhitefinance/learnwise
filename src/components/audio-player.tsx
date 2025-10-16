
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, StopCircle, Loader2 } from 'lucide-react';
import { generateAudio } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  textToPlay: string;
}

export default function AudioPlayer({ textToPlay }: AudioPlayerProps) {
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const type = localStorage.getItem('learnerType');
    setLearnerType(type);
    
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', onEnded);
    
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      audioRef.current!.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    
    setIsLoading(true);
    setIsPlaying(true); // Optimistically set playing state

    try {
        const { audio } = await generateAudio({ text: textToPlay });
        if (audioRef.current) {
            audioRef.current.src = audio;
            await audioRef.current.play();
        }
    } catch(e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Could not play audio.' });
        setIsPlaying(false); // Revert on error
    } finally {
        setIsLoading(false);
    }
  };

  if (learnerType !== 'Auditory' || !textToPlay) {
    return null;
  }

  return (
    <div className="mb-2">
      <Button onClick={handlePlayPause} variant="outline" size="sm" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <StopCircle className="mr-2 h-4 w-4" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        {isLoading ? 'Preparing...' : (isPlaying ? 'Stop' : 'Listen')}
      </Button>
    </div>
  );
}
