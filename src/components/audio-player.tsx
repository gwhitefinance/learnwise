
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle, Loader2 } from 'lucide-react';
import { generateAudio } from '@/lib/actions';

interface AudioPlayerProps {
  textToPlay: string;
}

export default function AudioPlayer({ textToPlay }: AudioPlayerProps) {
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const type = localStorage.getItem('learnerType');
    setLearnerType(type);

    return () => {
      // Cleanup: stop audio when component unmounts
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const handlePlay = async () => {
    setIsLoading(true);
    try {
      const result = await generateAudio({ text: textToPlay });
      const newAudio = new Audio(result.audioDataUri);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
      newAudio.onended = () => {
        setIsPlaying(false);
        setAudio(null);
      };
    } catch (error) {
      console.error('Error generating or playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setAudio(null);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying && audio) {
      handleStop();
    } else if (!isPlaying && !audio) {
      handlePlay();
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
        {isLoading ? 'Preparing...' : isPlaying ? 'Stop' : 'Listen'}
      </Button>
    </div>
  );
}
