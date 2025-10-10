
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
import { motion } from 'framer-motion';

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
    script: string;
    audioDataUri?: string;
    isPlaying: boolean;
    isGeneratingAudio: boolean;
};

const EpisodePlayer = ({ onPlay, isPlaying, isGeneratingAudio }: { onPlay: () => void; isPlaying: boolean; isGeneratingAudio: boolean; }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-muted rounded-lg">
             <motion.div
                className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-2xl flex items-center justify-center"
                animate={{
                    scale: isPlaying ? [1, 1.05, 1] : 1,
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            >
                <motion.div 
                    className="w-40 h-40 rounded-full bg-gradient-to-tl from-blue-300 to-indigo-500"
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                />
            </motion.div>
            <Button onClick={onPlay} className="mt-8 rounded-full h-16 w-16" size="icon" disabled={isGeneratingAudio}>
                {isGeneratingAudio ? <Loader2 className="h-8 w-8 animate-spin" /> : isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
        </div>
    );
};

export default function PodcastsClientPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [generatingScriptId, setGeneratingScriptId] = useState<string | null>(null);
    
    const [episodes, setEpisodes] = useState<Record<string, EpisodeState>>({});
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

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
        return () => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
        };
      }, []);


    const handleGenerateEpisodeScript = async (course: Course, unitId: string) => {
        const unit = course.units?.find(u => u.id === unitId);
        if (!unit) return;

        const content = unit.chapters.map(c => `Chapter: ${c.title}\n${c.content || ''}`).join('\n\n');

        if (!content.trim()) {
            toast({ variant: 'destructive', title: 'No content available', description: 'Please make sure the selected unit has generated chapter content.' });
            return;
        }
        
        setGeneratingScriptId(unitId);
        toast({ title: `Generating Episode Script: ${unit.title}`, description: 'This should be quick...' });

        try {
            const result = await generatePodcastEpisode({
                courseName: course.name,
                episodeTitle: unit.title,
                episodeContent: content,
            });

            setEpisodes(prev => ({
                ...prev,
                [unitId]: {
                    script: result.script,
                    isPlaying: false,
                    isGeneratingAudio: false,
                }
            }));
            toast({ title: 'Script Ready!', description: 'Click play to generate and listen to the audio.'});

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create the podcast script.' });
        } finally {
            setGeneratingScriptId(null);
        }
    };
    
    const handlePlay = async (unitId: string) => {
        const episode = episodes[unitId];
        if (!episode) return;
        
        // If already playing, pause it.
        if (isPlaying && activeUnitId === unitId) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }
        
        // If paused, resume it.
        if (!isPlaying && activeUnitId === unitId && audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
            return;
        }
        
        // If there's audio, just play it.
        if (episode.audioDataUri) {
            playAudio(unitId, episode.audioDataUri);
            return;
        }

        // If no audio, generate it.
        setEpisodes(prev => ({...prev, [unitId]: {...prev[unitId], isGeneratingAudio: true}}));
        toast({ title: 'Generating audio...', description: 'This may take a moment.'});
        try {
            const audioResult = await generateAudio({ text: episode.script });
            const audioDataUri = audioResult.audioDataUri;
            
            setEpisodes(prev => ({...prev, [unitId]: {...prev[unitId], audioDataUri, isGeneratingAudio: false}}));
            playAudio(unitId, audioDataUri);
            
        } catch (error) {
            console.error("Audio generation failed: ", error);
            toast({ variant: 'destructive', title: 'Audio Generation Failed'});
            setEpisodes(prev => ({...prev, [unitId]: {...prev[unitId], isGeneratingAudio: false}}));
        }
    };

    const [isPlaying, setIsPlaying] = useState(false);

    const playAudio = (unitId: string, audioDataUri: string) => {
        if(activeUnitId && activeUnitId !== unitId) {
            const oldEpisode = episodes[activeUnitId];
            if (oldEpisode) setEpisodes(prev => ({...prev, [activeUnitId!]: {...oldEpisode, isPlaying: false}}));
        }
        
        if (audioRef.current) {
            audioRef.current.pause();
        }

        const newAudio = new Audio(audioDataUri);
        audioRef.current = newAudio;
        setActiveUnitId(unitId);
        
        newAudio.play();
        setIsPlaying(true);

        newAudio.onplay = () => setIsPlaying(true);
        newAudio.onpause = () => setIsPlaying(false);
        newAudio.onended = () => {
            setIsPlaying(false);
            setActiveUnitId(null);
            audioRef.current = null;
        };
    }

    const isCurrentlyPlaying = (unitId: string) => isPlaying && activeUnitId === unitId;

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
                                    const isGeneratingScript = generatingScriptId === unit.id;
                                    
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
                                                        <p className="mb-4 text-muted-foreground">Generate the script for this episode first.</p>
                                                        <Button onClick={() => handleGenerateEpisodeScript(selectedCourse, unit.id)} disabled={isGeneratingScript}>
                                                            {isGeneratingScript ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Script...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate Script</>}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <EpisodePlayer 
                                                        isPlaying={isCurrentlyPlaying(unit.id)}
                                                        isGeneratingAudio={episode.isGeneratingAudio}
                                                        onPlay={() => handlePlay(unit.id)}
                                                    />
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
