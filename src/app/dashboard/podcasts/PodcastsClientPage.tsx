
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Podcast, Wand2, Loader2, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { generatePodcastEpisode } from '@/lib/actions';
import Loading from './loading';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Course = {
    id: string;
    name: string;
    units?: {
        id: string;
        title: string;
        chapters: {
            id: string;
            title: string;
            content?: string;
        }[];
    }[];
};

type EpisodePlayerState = {
    audioUrls: string[];
    currentTrackIndex: number;
    isPlaying: boolean;
    playbackProgress: number;
};

export default function PodcastsClientPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [generatingEpisodeId, setGeneratingEpisodeId] = useState<string | null>(null);
    
    // Player State
    const [playerState, setPlayerState] = useState<Record<string, EpisodePlayerState>>({});

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);
    
    useEffect(() => {
        if (authLoading || !user) return;
        
        const q = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);
    
     useEffect(() => {
        const activeEpisodeId = Object.keys(playerState).find(id => playerState[id]?.isPlaying);
        if (audioRef.current && activeEpisodeId) {
            const episode = playerState[activeEpisodeId];
            if (episode) {
                audioRef.current.src = episode.audioUrls[episode.currentTrackIndex];
                if (episode.isPlaying) {
                    audioRef.current.play().catch(e => console.error("Audio play error:", e));
                }
            }
        }
    }, [playerState]);


    const handleGenerateEpisode = async (course: Course, unitId: string) => {
        const unit = course.units?.find(u => u.id === unitId);
        if (!unit) return;

        const content = unit.chapters.map(c => `Chapter: ${c.title}\n${c.content || ''}`).join('\n\n');

        if (!content.trim()) {
            toast({ variant: 'destructive', title: 'No content available', description: 'Please make sure the selected unit has generated chapter content.' });
            return;
        }
        
        setGeneratingEpisodeId(unitId);
        toast({ title: `Generating Episode: ${unit.title}`, description: 'This may take a moment...' });

        try {
            const result = await generatePodcastEpisode({
                courseName: course.name,
                episodeTitle: unit.title,
                episodeContent: content,
            });

            setPlayerState(prev => ({
                ...prev,
                [unitId]: {
                    audioUrls: result.audioDataUris,
                    currentTrackIndex: 0,
                    isPlaying: true,
                    playbackProgress: 0,
                }
            }));

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create the podcast episode.' });
        } finally {
            setGeneratingEpisodeId(null);
        }
    };
    
    const updatePlayerState = (unitId: string, updates: Partial<EpisodePlayerState>) => {
        setPlayerState(prev => ({
            ...prev,
            [unitId]: {
                ...prev[unitId],
                ...updates,
            }
        }));
    };

    const togglePlay = (unitId: string) => {
        const episode = playerState[unitId];
        if (!audioRef.current || !episode) return;
        
        const isCurrentlyPlaying = episode.isPlaying;

        // Pause all other episodes
        const newState = { ...playerState };
        Object.keys(newState).forEach(id => {
            if (id !== unitId) {
                newState[id].isPlaying = false;
            }
        });
        
        if (isCurrentlyPlaying) {
            audioRef.current.pause();
            newState[unitId].isPlaying = false;
        } else {
            audioRef.current.src = episode.audioUrls[episode.currentTrackIndex];
            audioRef.current.play().catch(e => console.error("Audio play error:", e));
            newState[unitId].isPlaying = true;
        }
        setPlayerState(newState);
    };

    const handleNextTrack = (unitId: string) => {
        const episode = playerState[unitId];
        if (episode && episode.currentTrackIndex < episode.audioUrls.length - 1) {
            updatePlayerState(unitId, { currentTrackIndex: episode.currentTrackIndex + 1 });
        }
    };

    const handlePrevTrack = (unitId: string) => {
        const episode = playerState[unitId];
        if (episode && episode.currentTrackIndex > 0) {
            updatePlayerState(unitId, { currentTrackIndex: episode.currentTrackIndex - 1 });
        }
    };
    
    const handleTimeUpdate = () => {
        const activeEpisodeId = Object.keys(playerState).find(id => playerState[id]?.isPlaying);
        if (audioRef.current && activeEpisodeId) {
            const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            updatePlayerState(activeEpisodeId, { playbackProgress: isNaN(progress) ? 0 : progress });
        }
    };

    const handleSeek = (unitId: string, value: number[]) => {
        const episode = playerState[unitId];
        if (audioRef.current && episode) {
            audioRef.current.currentTime = (value[0] / 100) * audioRef.current.duration;
        }
    };
    
    const handleTrackEnd = () => {
        const activeEpisodeId = Object.keys(playerState).find(id => playerState[id]?.isPlaying);
        if (activeEpisodeId) {
            const episode = playerState[activeEpisodeId];
            if (episode.currentTrackIndex < episode.audioUrls.length - 1) {
                handleNextTrack(activeEpisodeId);
            } else {
                updatePlayerState(activeEpisodeId, { isPlaying: false });
            }
        }
    };

    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            <audio 
                ref={audioRef} 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={handleTrackEnd} 
            />
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Podcast Generator</h1>
                <p className="text-muted-foreground">Turn your course materials into on-the-go audio episodes.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Start a Podcast Show</CardTitle>
                    <CardDescription>Select one of your courses to see its available episodes (units).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select value={selectedCourseId ?? ''} onValueChange={setSelectedCourseId}>
                        <SelectTrigger><SelectValue placeholder="Select a course to start a show..." /></SelectTrigger>
                        <SelectContent>
                            {courses.map(course => (
                                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedCourse && (
                <Card>
                    <CardHeader>
                        <CardTitle>Episodes for: {selectedCourse.name}</CardTitle>
                        <CardDescription>Generate and listen to individual episodes based on your course units.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedCourse.units && selectedCourse.units.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full">
                                {selectedCourse.units.map(unit => {
                                    const episode = playerState[unit.id];
                                    const isGenerating = generatingEpisodeId === unit.id;
                                    
                                    return (
                                        <AccordionItem key={unit.id} value={unit.id}>
                                            <AccordionTrigger>
                                                <div className="flex items-center gap-4">
                                                    <Podcast className="h-5 w-5 text-primary"/>
                                                    <span className="font-semibold">{unit.title}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="p-4 space-y-4">
                                                {!episode ? (
                                                    <div className="flex flex-col items-center justify-center text-center p-8 bg-muted rounded-lg">
                                                        <p className="mb-4 text-muted-foreground">This episode hasn't been generated yet.</p>
                                                        <Button onClick={() => handleGenerateEpisode(selectedCourse, unit.id)} disabled={isGenerating}>
                                                            {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Episode...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate Episode</>}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-lg">
                                                        <p className="text-sm text-muted-foreground">Segment {episode.currentTrackIndex + 1} of {episode.audioUrls.length}</p>
                                                         <Slider
                                                            value={[episode.playbackProgress]}
                                                            onValueChange={(val) => handleSeek(unit.id, val)}
                                                            max={100}
                                                            step={1}
                                                        />
                                                        <div className="flex items-center justify-center gap-4">
                                                            <Button onClick={() => handlePrevTrack(unit.id)} variant="ghost" size="icon" disabled={episode.currentTrackIndex === 0}>
                                                                <SkipBack />
                                                            </Button>
                                                            <Button onClick={() => togglePlay(unit.id)} size="lg" className="rounded-full w-16 h-16">
                                                                {episode.isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                                                            </Button>
                                                            <Button onClick={() => handleNextTrack(unit.id)} variant="ghost" size="icon" disabled={episode.currentTrackIndex === episode.audioUrls.length - 1}>
                                                                <SkipForward />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>
                        ) : (
                            <div className="text-center text-muted-foreground p-8">
                                This course has no units with content. Please generate content in the Learning Lab first.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
