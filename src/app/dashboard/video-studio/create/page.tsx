
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Video, Wand2, Loader2, ArrowLeft, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateVideo } from '@/lib/actions';
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

export default function CreateVideoPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [script, setScript] = useState('');
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

    const router = useRouter();
    const { toast } = useToast();
    const [user] = useAuthState(auth);

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

    const handleGenerateVideo = async () => {
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
        setGeneratedVideoUrl(null);
        try {
            const result = await generateVideo({
                courseName: selectedCourse.name,
                episodeTitle: selectedUnit.title,
                episodeContent: content,
            });
            setScript(result.script);
            setGeneratedVideoUrl(result.videoUrl);
            
            // Save to Firestore
            await addDoc(collection(db, 'podcastEpisodes'), {
                userId: user?.uid,
                courseId: selectedCourse.id,
                unitTitle: selectedUnit.title,
                script: result.script,
                videoUrl: result.videoUrl,
                timestamp: serverTimestamp(),
            });

            toast({ title: 'Video Generated & Saved!', description: 'Your new video is ready and saved to your library.' });

        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Failed to generate video.', description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
             <Button variant="ghost" onClick={() => router.push('/dashboard/video-studio')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Video Studio
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Video</h1>
                <p className="text-muted-foreground">Generate a short animated video lecturette from your course content.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Select Content</CardTitle>
                            <CardDescription>Choose the course and unit to base your video on.</CardDescription>
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
                            <CardTitle>2. Generate Video</CardTitle>
                            <CardDescription>Let the AI create a script and animated video for you.</CardDescription>
                        </CardHeader>
                         <CardContent>
                             <Button className="w-full" onClick={handleGenerateVideo} disabled={isGenerating || !selectedUnit}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                {isGenerating ? 'Generating Video...' : 'Generate Video'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card className="min-h-[400px]">
                        <CardHeader>
                            <CardTitle>3. Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                    <p className="text-muted-foreground">Generating your video. This may take a minute...</p>
                                </div>
                            ) : generatedVideoUrl ? (
                                <video controls src={generatedVideoUrl} className="w-full rounded-lg"></video>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
                                    <Video className="h-16 w-16 text-muted-foreground mb-4"/>
                                    <p className="text-muted-foreground">Your generated video will appear here.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
