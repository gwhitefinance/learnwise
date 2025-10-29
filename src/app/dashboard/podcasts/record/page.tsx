
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Podcast, Wand2, Loader2, Play, Pause, StopCircle, ArrowLeft, Video, Mic, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generatePodcastEpisode } from '@/lib/actions';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

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
    const [isLoadingScript, setIsLoadingScript] = useState(false);
    const router = useRouter();

    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [recordType, setRecordType] = useState<'audio' | 'video'>('audio');

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

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

        return () => {
            unsubscribe();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
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

        setIsLoadingScript(true);
        setScript('');
        try {
            const result = await generatePodcastEpisode({
                courseName: selectedCourse.name,
                episodeTitle: selectedUnit.title,
                episodeContent: content,
            });
            setScript(result.script);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to generate script.' });
        } finally {
            setIsLoadingScript(false);
        }
    };
    
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: recordType === 'video' });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const recorder = new MediaRecorder(stream, { mimeType: recordType === 'video' ? 'video/webm' : 'audio/webm' });
            setMediaRecorder(recorder);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setRecordedChunks(prev => [...prev, event.data]);
                }
            };
            
            recorder.onstop = handleUpload;

            recorder.start();
            setIsRecording(true);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Could not start recording.', description: 'Please ensure you have given microphone/camera permissions.' });
        }
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
        streamRef.current?.getTracks().forEach(track => track.stop());
        setIsRecording(false);
    };

    const handleUpload = async () => {
        if (recordedChunks.length === 0 || !user || !selectedCourse || !selectedUnit) {
            toast({ variant: 'destructive', title: 'No recording data to upload.' });
            return;
        }
        
        setIsUploading(true);
        const blob = new Blob(recordedChunks, { type: recordType === 'video' ? 'video/webm' : 'audio/webm' });
        const storage = getStorage();
        const fileRef = ref(storage, `podcasts/${user.uid}/${Date.now()}.${recordType === 'video' ? 'webm' : 'ogg'}`);
        
        try {
            const snapshot = await uploadBytes(fileRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const episodeData: any = {
                userId: user.uid,
                courseId: selectedCourse.id,
                unitTitle: selectedUnit.title,
                script: script,
                timestamp: serverTimestamp(),
            };

            if (recordType === 'video') {
                episodeData.videoUrl = downloadURL;
            } else {
                episodeData.audioUrl = downloadURL;
            }

            await addDoc(collection(db, 'podcastEpisodes'), episodeData);
            
            toast({ title: 'Episode saved!', description: 'Your new episode has been saved to your library.'});
            setRecordedChunks([]);
            router.push('/dashboard/podcasts');

        } catch (error) {
            console.error("Upload failed: ", error);
            toast({ variant: 'destructive', title: 'Upload Failed.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
             <Button variant="ghost" onClick={() => router.push('/dashboard/podcasts')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Podcasts
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Podcast Recording Studio</h1>
                <p className="text-muted-foreground">Create your own audio or video podcast episodes.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Select Content</CardTitle>
                            <CardDescription>Choose the course and unit to base your episode on.</CardDescription>
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
                            <Button className="w-full" onClick={handleGenerateScript} disabled={isLoadingScript || !selectedUnit}>
                                {isLoadingScript ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Generate Script
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>2. Record Episode</CardTitle>
                            <CardDescription>Record your audio or video episode.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="flex gap-2">
                                <Button variant={recordType === 'audio' ? 'default' : 'outline'} onClick={() => setRecordType('audio')} className="w-full">
                                    <Mic className="mr-2 h-4 w-4"/> Audio Only
                                </Button>
                                <Button variant={recordType === 'video' ? 'default' : 'outline'} onClick={() => setRecordType('video')} className="w-full">
                                    <Video className="mr-2 h-4 w-4"/> Video
                                </Button>
                            </div>
                             {recordType === 'video' && (
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-lg"></video>
                                </div>
                            )}
                            <Button 
                                onClick={isRecording ? stopRecording : startRecording} 
                                disabled={isUploading || isLoadingScript}
                                className="w-full" 
                                variant={isRecording ? 'destructive' : 'default'}
                            >
                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (isRecording ? <StopCircle className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>)}
                                {isUploading ? 'Saving...' : (isRecording ? 'Stop Recording' : 'Start Recording')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="min-h-[600px]">
                        <CardHeader>
                            <CardTitle>3. Your Script</CardTitle>
                            <CardDescription>Read from this AI-generated script, or edit it to make it your own.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingScript ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            ) : (
                                <Textarea 
                                    value={script} 
                                    onChange={(e) => setScript(e.target.value)} 
                                    placeholder="Your generated script will appear here..."
                                    className="h-[450px] text-base"
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
