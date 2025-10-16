
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle } from 'lucide-react';
import { useSpeech } from '@/hooks/use-speech';

interface AudioPlayerProps {
  textToPlay: string;
}

export default function AudioPlayer({ textToPlay }: AudioPlayerProps) {
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const { speak, stop, isPlaying } = useSpeech();

  useEffect(() => {
    const type = localStorage.getItem('learnerType');
    setLearnerType(type);
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(textToPlay);
    }
  };

  if (learnerType !== 'Auditory' || !textToPlay) {
    return null;
  }

  return (
    <div className="mb-2">
      <Button onClick={handlePlayPause} variant="outline" size="sm">
        {isPlaying ? (
          <StopCircle className="mr-2 h-4 w-4" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        {isPlaying ? 'Stop' : 'Listen'}
      </Button>
    </div>
  );
}
