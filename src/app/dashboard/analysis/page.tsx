
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Pause, Play } from 'lucide-react';
import dynamic from 'next/dynamic';


const classicalPlaylist = [
    "https://cdn.pixabay.com/audio/2024/05/25/audio_24944d1835.mp3", // Emotional Cinematic Music
    "https://cdn.pixabay.com/audio/2024/05/09/audio_2ef13b0649.mp3", // Cinematic Epic
    "https://cdn.pixabay.com/audio/2023/10/11/audio_a2f2670758.mp3", // Hans Zimmer Style
    "https://cdn.pixabay.com/audio/2022/11/17/audio_88f002b12e.mp3", // Inspiring Cinematic
    "https://cdn.pixabay.com/audio/2024/02/08/audio_17316a1c89.mp3", // The Last Piano
];

function AnalysisPage() {
  const [learnerType, setLearnerType] = useState('Visual');
  const [complexity, setComplexity] = useState('Medium');
  const [studyTime, setStudyTime] = useState('4 hours');
  const [progress, setProgress] = useState(60);

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
      setLearnerType(storedLearnerType);
    }
    // In a real app, complexity, studyTime, and progress would be calculated
    // based on user data, courses, notes, etc.
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }

        if (isFocusMode) {
          if (!audioRef.current.src) {
            const randomSong = classicalPlaylist[Math.floor(Math.random() * classicalPlaylist.length)];
            audioRef.current.src = randomSong;
          }
          audioRef.current.play();
          setIsPlaying(true);
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
        }

        return () => {
          audioRef.current?.pause();
        }
    }
  }, [isFocusMode]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Analysis Dashboard</h1>
          <p className="text-muted-foreground">Personalized insights and tools to enhance your study sessions.</p>
        </div>
        <div className="flex items-center space-x-2">
            <Switch id="focus-mode" checked={isFocusMode} onCheckedChange={setIsFocusMode} />
            <Label htmlFor="focus-mode">Focus Mode</Label>
             {isFocusMode && (
                <Button onClick={togglePlay} variant="outline" size="icon">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
            )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Key Insights</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Your Learner Type</CardDescription>
              <CardTitle className="text-4xl">{learnerType}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Study Material Complexity</CardDescription>
              <CardTitle className="text-4xl">{complexity}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Estimated Weekly Study Time</CardDescription>
              <CardTitle className="text-4xl">{studyTime}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Personalized Study Recommendations</h2>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="max-w-xl">
                <h3 className="text-xl font-semibold mb-2">Visual Aids</h3>
                <p className="text-muted-foreground mb-4">
                  Use diagrams, charts, and mind maps to understand complex concepts. Focus on visual representations of information.
                </p>
                <Link href="/dashboard/notes">
                  <Button>Explore Visual Aids</Button>
                </Link>
              </div>
              <Image 
                src="https://picsum.photos/400/300"
                alt="Visual Aids representation"
                width={200}
                height={150}
                className="rounded-lg object-cover"
                data-ai-hint="diagram chart"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="max-w-xl">
                <h3 className="text-xl font-semibold mb-2">Interactive Exercises</h3>
                <p className="text-muted-foreground mb-4">
                  Engage with interactive quizzes and simulations to reinforce your understanding. Practice applying concepts through hands-on activities.
                </p>
                <Link href="/dashboard/practice-quiz">
                    <Button>Start Exercises</Button>
                </Link>
              </div>
               <Image 
                src="https://picsum.photos/400/301"
                alt="Interactive Exercises representation"
                width={200}
                height={150}
                className="rounded-lg object-cover"
                data-ai-hint="person studying"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Progress Tracker</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                        <span className="text-sm font-medium">{progress}% Complete</span>
                    </div>
                    <Progress value={progress} />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-4">
                        <CardDescription>Study Material Coverage</CardDescription>
                        <div className="flex items-baseline gap-2">
                             <CardTitle className="text-4xl">{progress}%</CardTitle>
                             <span className="text-sm font-semibold text-green-500">Overall +10%</span>
                        </div>
                    </Card>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default AnalysisPage;
