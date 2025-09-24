'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAudio } from '@/lib/actions';

interface AudioPlayerProps {
  textToPlay: string;
}

export default function AudioPlayer({ textToPlay }: AudioPlayerProps) {
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const type = localStorage.getItem('learnerType');
    setLearnerType(type);
  }, []);
  
  useEffect(() => {
    // Cleanup audio on component unmount
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);

  const handlePlay = async () => {
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
      const response = await generateAudio({ text: textToPlay });
      const newAudio = new Audio(response.audioDataUri);
      newAudio.play();
      
      newAudio.onended = () => {
        setIsPlaying(false);
      };
      
      setAudio(newAudio);
      setIsPlaying(true);
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
  };

  if (learnerType !== 'Auditory' || !textToPlay) {
    return null;
  }

  return (
    <div className="mb-2">
      <Button onClick={handlePlay} variant="outline" size="sm" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="mr-2 h-4 w-4" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        {isPlaying ? 'Pause' : 'Listen'}
      </Button>
    </div>
  );
}
