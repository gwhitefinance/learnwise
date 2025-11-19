
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, StopCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSpeechFlow } from '@/lib/actions';

interface AudioPlayerProps {
  textToPlay: string;
}

export default function AudioPlayer({ textToPlay }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Clean up the audio element when the component unmounts or text changes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [textToPlay, audioUrl]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }
    
    if (audioUrl && audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
    }

    setIsLoading(true);
    try {
      const { audioUrl: newAudioUrl } = await generateSpeechFlow({ text: textToPlay });
      if (newAudioUrl) {
        setAudioUrl(newAudioUrl);
        const audio = new Audio(newAudioUrl);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => setIsPlaying(false);
        setIsPlaying(true);
      } else {
        throw new Error("Audio URL was not generated.");
      }
    } catch (error) {
      console.error('Speech generation or playback error', error);
      toast({ variant: 'destructive', title: 'Could not play audio.' });
    } finally {
        setIsLoading(false);
    }
  };

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
        {isLoading ? 'Generating...' : isPlaying ? 'Stop' : 'Listen'}
      </Button>
    </div>
  );
}
