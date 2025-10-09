
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
import { generatePodcast } from '@/lib/actions';
import Loading from './loading';
import { Slider } from '@/components/ui/slider';

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

export default function PodcastsClientPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [duration, setDuration] = useState('10');
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Playlist state
    const [audioUrls, setAudioUrls] = useState<string[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackProgress, setPlaybackProgress] = useState(0);

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
        if (audioRef.current) {
            audioRef.current.src = audioUrls[currentTrackIndex];
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Audio play error:", e));
            }
        }
    }, [currentTrackIndex, audioUrls]);

    const handleGeneratePodcast = async () => {
        if (!selectedCourseId) {
            toast({ variant: 'destructive', title: 'Please select a course.' });
            return;
        }

        const course = courses.find(c => c.id === selectedCourseId);
        if (!course) return;

        let content = '';
        let podcastTopic = course.name;

        if (selectedUnitId && selectedUnitId !== 'all') {
            const unit = course.units?.find(u => u.id === selectedUnitId);
            if (unit) {
                podcastTopic = `${course.name}: ${unit.title}`;
                content = unit.chapters.map(c => `Chapter: ${c.title}\n${c.content || ''}`).join('\n\n');
            }
        } else {
            content = course.units?.flatMap(u => u.chapters).map(c => `Chapter: ${c.title}\n${c.content || ''}`).join('\n\n') || '';
        }

        if (!content.trim()) {
            toast({ variant: 'destructive', title: 'No content available', description: 'Please make sure the selected course/unit has generated content.' });
            return;
        }
        
        setIsGenerating(true);
        setAudioUrls([]);
        if (audioRef.current) audioRef.current.pause();
        toast({ title: 'Generating your podcast...', description: 'This may take a few minutes depending on the length.' });

        try {
            const result = await generatePodcast({
                courseName: podcastTopic,
                content: content,
                duration: parseInt(duration),
            });
            setAudioUrls(result.audioDataUris);
            setCurrentTrackIndex(0);
            setIsPlaying(true);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create the podcast audio.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Audio play error:", e));
        }
        setIsPlaying(!isPlaying);
    };

    const handleNextTrack = () => {
        if (currentTrackIndex < audioUrls.length - 1) {
            setCurrentTrackIndex(prev => prev + 1);
        }
    };

    const handlePrevTrack = () => {
        if (currentTrackIndex > 0) {
            setCurrentTrackIndex(prev => prev - 1);
        }
    };
    
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setPlaybackProgress(isNaN(progress) ? 0 : progress);
        }
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = (value[0] / 100) * audioRef.current.duration;
        }
    };
    
    const handleTrackEnd = () => {
        if (currentTrackIndex < audioUrls.length - 1) {
            handleNextTrack();
        } else {
            setIsPlaying(false);
        }
    };

    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Podcast Generator</h1>
                <p className="text-muted-foreground">Turn your course materials into on-the-go audio lessons.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Create a New Podcast</CardTitle>
                    <CardDescription>Select a course, unit (optional), and desired length to generate your audio lesson.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Course</label>
                            <Select value={selectedCourseId ?? ''} onValueChange={(val) => { setSelectedCourseId(val); setSelectedUnitId(null); }}>
                                <SelectTrigger><SelectValue placeholder="Select a course..." /></SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                             <label className="text-sm font-medium">Unit (Optional)</label>
                            <Select value={selectedUnitId ?? 'all'} onValueChange={setSelectedUnitId} disabled={!selectedCourse || !selectedCourse.units || selectedCourse.units.length === 0}>
                                <SelectTrigger><SelectValue placeholder="Select a unit..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Entire Course</SelectItem>
                                    {selectedCourse?.units?.map(unit => (
                                        <SelectItem key={unit.id} value={unit.id}>{unit.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Duration</label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 minutes</SelectItem>
                                    <SelectItem value="10">10 minutes</SelectItem>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="flex justify-end pt-4">
                        <Button onClick={handleGeneratePodcast} disabled={isGenerating || !selectedCourseId}>
                            {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate Podcast</>}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {(isGenerating || audioUrls.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Podcast</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground">Your podcast is being generated. This might take a few moments...</p>
                            </>
                        ) : audioUrls.length > 0 ? (
                            <>
                                <Podcast className="h-12 w-12 text-primary mb-4" />
                                <h3 className="text-xl font-semibold">{selectedCourse?.name}</h3>
                                {selectedUnitId && selectedUnitId !== 'all' && (
                                    <p className="text-muted-foreground">{selectedCourse?.units?.find(u => u.id === selectedUnitId)?.title}</p>
                                )}
                                <div className="mt-6 w-full max-w-sm space-y-4">
                                    <p className="text-sm text-muted-foreground">Segment {currentTrackIndex + 1} of {audioUrls.length}</p>
                                    <Slider
                                        value={[playbackProgress]}
                                        onValueChange={handleSeek}
                                        max={100}
                                        step={1}
                                    />
                                    <div className="flex items-center justify-center gap-4">
                                        <Button onClick={handlePrevTrack} variant="ghost" size="icon" disabled={currentTrackIndex === 0}>
                                            <SkipBack />
                                        </Button>
                                        <Button onClick={togglePlay} size="lg" className="rounded-full w-20 h-20">
                                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                                        </Button>
                                        <Button onClick={handleNextTrack} variant="ghost" size="icon" disabled={currentTrackIndex === audioUrls.length - 1}>
                                            <SkipForward />
                                        </Button>
                                    </div>
                                </div>
                                <audio 
                                    ref={audioRef} 
                                    onTimeUpdate={handleTimeUpdate} 
                                    onEnded={handleTrackEnd} 
                                    src={audioUrls.length > 0 ? audioUrls[currentTrackIndex] : ''}
                                />
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
