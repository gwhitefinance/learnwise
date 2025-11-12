

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mic, Wand2, Loader2, ArrowLeft, Play, Pause, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { generatePodcastEpisode, generateSpeechFlow } from '@/lib/actions';
import { Textarea } from '@/components/ui/textarea';

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

export default function RecordPodcastPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [script, setScript] = useState('');
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const router = useRouter();
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);

    useEffect(() => {
        if (authLoading || !user) return;
        
        const q = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            setIsLoadingCourses(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);
    
    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    const selectedUnit = selectedCourse?.units?.find(u => u.id === selectedUnitId);

    const handleGenerateScript = async () => {
        if (!selectedCourse || !selectedUnit) {
            toast({ variant: 'destructive', title: 'Please select a course and unit.'});
            return;
        }

        const content = selectedUnit.chapters.map(c => `Chapter: ${c.title}\n${c.content || ''}`).join('\n\n');
        if (!content.trim()) {
            toast({ variant: 'destructive', title: 'No content available for this unit.' });
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generatePodcastEpisode({
                courseName: selectedCourse.name,
                episodeTitle: selectedUnit.title,
                episodeContent: content,
            });
            setScript(result.script);

            const speechResult = await generateSpeechFlow({ text: result.script });
            setAudioUrl(speechResult.audioUrl);

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Failed to generate script.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioUrl(audioUrl);
                stream.getTracks().forEach(track => track.stop()); // Stop microphone access
            };
            
            mediaRecorderRef.current.start();
        }
        setIsRecording(!isRecording);
    };

    const handleSaveEpisode = async () => {
        if (!user || !selectedCourse || !selectedUnit || !script) {
            toast({ variant: 'destructive', title: 'Missing information to save.'});
            return;
        }
        try {
            await addDoc(collection(db, 'podcastEpisodes'), {
                userId: user.uid,
                courseId: selectedCourse.id,
                unitTitle: selectedUnit.title,
                script,
                audioUrl,
                timestamp: serverTimestamp(),
            });
            toast({ title: 'Episode Saved!' });
            router.push('/dashboard/podcasts');
        } catch (error) {
            console.error("Error saving episode:", error);
            toast({ variant: 'destructive', title: 'Could not save episode.' });
        }
    };

    return (
        <div className="space-y-6">
             <Button variant="ghost" onClick={() => router.push('/dashboard/courses')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Courses
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Podcast</h1>
                <p className="text-muted-foreground">Generate a script, record your voice, and save your episode.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Select Content</CardTitle>
                            <CardDescription>Choose the course and unit to base your podcast on.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Select onValueChange={setSelectedCourseId} value={selectedCourseId} disabled={isLoadingCourses}>
                                    <SelectTrigger><SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select a course"} /></SelectTrigger>
                                    <SelectContent>
                                        {courses.map(course => (
                                            <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                 <Select onValueChange={setSelectedUnitId} value={selectedUnitId} disabled={!selectedCourse}>
                                    <SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger>
                                    <SelectContent>
                                        {selectedCourse?.units?.map(unit => (
                                            <SelectItem key={unit.id} value={unit.id}>{unit.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>2. Generate Script & Audio</CardTitle>
                            <CardDescription>Let the AI create a podcast script and audio for you.</CardDescription>
                        </CardHeader>
                         <CardContent>
                             <Button className="w-full" onClick={handleGenerateScript} disabled={isGenerating || !selectedUnit}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                {isGenerating ? 'Generating...' : 'Generate Script & Audio'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>3. Review & Save</CardTitle>
                            <CardDescription>Review your audio and save the final episode.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            {audioUrl && (
                                <audio controls src={audioUrl} className="w-full"></audio>
                            )}
                            <Button className="w-full" onClick={handleSaveEpisode} disabled={!script}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Episode
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card className="min-h-[600px]">
                        <CardHeader>
                            <CardTitle>Podcast Script</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={script}
                                readOnly
                                placeholder="Your generated script will appear here..."
                                className="h-[500px] text-base"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
