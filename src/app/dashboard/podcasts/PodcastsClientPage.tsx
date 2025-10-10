
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Podcast, Wand2, Loader2, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { generatePodcastEpisode, generateAudio } from '@/lib/actions';
import Loading from './loading';
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

type EpisodeState = {
    textSegments: string[];
    currentlyPlayingSegment: number | null;
};

const SegmentPlayer = ({ segment, onPlay, isPlaying, isLoading }: { segment: string; onPlay: () => void; isPlaying: boolean; isLoading: boolean }) => {
    return (
        <div className="p-3 rounded-lg bg-background border flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground flex-1">{segment}</p>
            <Button onClick={onPlay} variant="outline" size="icon" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                ) : (
                    <Play className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}

export default function PodcastsClientPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [generatingEpisodeId, setGeneratingEpisodeId] = useState<string | null>(null);
    
    // Player State
    const [episodes, setEpisodes] = useState<Record<string, EpisodeState>>({});
    const [activeAudio, setActiveAudio] = useState<{ audio: HTMLAudioElement; unitId: string; segmentIndex: number } | null>(null);
    const [loadingSegment, setLoadingSegment] = useState<{ unitId: string; segmentIndex: number } | null>(null);

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
        // Cleanup audio on component unmount
        return () => {
          activeAudio?.audio.pause();
        };
      }, [activeAudio]);


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

            setEpisodes(prev => ({
                ...prev,
                [unitId]: {
                    textSegments: result.textSegments,
                    currentlyPlayingSegment: null,
                }
            }));

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create the podcast episode.' });
        } finally {
            setGeneratingEpisodeId(null);
        }
    };
    
    const playSegment = async (unitId: string, segmentIndex: number) => {
        // If another segment is playing, stop it.
        if (activeAudio) {
            activeAudio.audio.pause();
            if (activeAudio.unitId === unitId && activeAudio.segmentIndex === segmentIndex) {
                 // It's the same button, so we just pause and return.
                 setActiveAudio(null);
                 setEpisodes(prev => ({ ...prev, [unitId]: { ...prev[unitId], currentlyPlayingSegment: null } }));
                 return;
            }
            // It's a different segment, so we stop the old one and continue to play the new one.
             setEpisodes(prev => ({ ...prev, [activeAudio.unitId]: { ...prev[activeAudio.unitId], currentlyPlayingSegment: null } }));
        }

        setLoadingSegment({ unitId, segmentIndex });

        try {
            const segmentText = episodes[unitId].textSegments[segmentIndex];
            const audioResult = await generateAudio({ text: segmentText });
            const newAudio = new Audio(audioResult.audioDataUri);
            
            newAudio.onended = () => {
                setEpisodes(prev => ({ ...prev, [unitId]: { ...prev[unitId], currentlyPlayingSegment: null } }));
                setActiveAudio(null);
            };

            newAudio.play();
            setActiveAudio({ audio: newAudio, unitId, segmentIndex });
            setEpisodes(prev => ({ ...prev, [unitId]: { ...prev[unitId], currentlyPlayingSegment: segmentIndex } }));

        } catch (e) {
            toast({ variant: 'destructive', title: 'Audio Error', description: 'Could not play audio.' });
        } finally {
            setLoadingSegment(null);
        }
    }


    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
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
                                    const episode = episodes[unit.id];
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
                                                    <div className="space-y-2">
                                                        {episode.textSegments.map((segment, index) => (
                                                            <SegmentPlayer
                                                                key={index}
                                                                segment={segment}
                                                                onPlay={() => playSegment(unit.id, index)}
                                                                isPlaying={episode.currentlyPlayingSegment === index}
                                                                isLoading={loadingSegment?.unitId === unit.id && loadingSegment?.segmentIndex === index}
                                                            />
                                                        ))}
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
