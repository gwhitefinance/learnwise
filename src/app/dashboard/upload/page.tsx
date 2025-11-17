
'use client';

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Youtube, FileText, Video, Music, Copy, QrCode, Mic, Trash2, Plus, Play, StopCircle, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import QRCode from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { generateCourseFromMaterials } from "@/lib/actions";
import GeneratingCourse from "../courses/GeneratingCourse";

export default function UploadPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseId = searchParams.get('courseId');
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingCourseName, setGeneratingCourseName] = useState('');

    // State for multiple inputs
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [textSnippets, setTextSnippets] = useState<string[]>([]);
    const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
    
    const [currentText, setCurrentText] = useState('');
    const [currentLink, setCurrentLink] = useState('');

    // Recording state
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);


    useEffect(() => {
        if (courseId) {
            setQrCodeUrl(`${window.location.origin}/upload-note/${courseId}`);
        }
    }, [courseId]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'noteUpload') {
                toast({ title: "Image Received!", description: "Your image has been sent for processing." });
                // Here you would typically handle the uploaded image data
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [toast]);
    
    const handleFilesSelected = (files: FileList | null) => {
        if (files) {
            const newFiles = Array.from(files);
            setUploadedFiles(prev => [...prev, ...newFiles]);
            toast({ title: `${newFiles.length} file(s) added.` });
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFilesSelected(e.target.files);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFilesSelected(e.dataTransfer.files);
    };
    
    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const addTextSnippet = () => {
        if (currentText.trim()) {
            setTextSnippets(prev => [...prev, currentText.trim()]);
            setCurrentText('');
        }
    };
    
    const removeTextSnippet = (index: number) => {
        setTextSnippets(prev => prev.filter((_, i) => i !== index));
    };

    const addYoutubeLink = () => {
        if (currentLink.trim()) {
            setYoutubeLinks(prev => [...prev, currentLink.trim()]);
            setCurrentLink('');
        }
    };
    
    const removeYoutubeLink = (index: number) => {
        setYoutubeLinks(prev => prev.filter((_, i) => i !== index));
    };
    
    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    const url = URL.createObjectURL(audioBlob);
                    setRecordedAudioUrl(url);
                    stream.getTracks().forEach(track => track.stop());
                };
                
                mediaRecorderRef.current.start();
                setIsRecording(true);
                setRecordedAudioUrl(null);
                toast({ title: 'Recording started...' });
            } catch (err) {
                 toast({ variant: 'destructive', title: 'Microphone access denied.' });
            }
        }
    };

    const hasContent = uploadedFiles.length > 0 || textSnippets.length > 0 || youtubeLinks.length > 0 || recordedAudioUrl;

    const handleGenerateCourse = async () => {
        if (!hasContent || !user) {
            toast({ variant: 'destructive', title: 'No content to generate from.' });
            return;
        }

        const courseName = `New Course from Materials - ${new Date().toLocaleDateString()}`;
        setGeneratingCourseName(courseName);
        setIsGenerating(true);

        // This is a simplified approach. A real implementation would handle file uploads and content extraction.
        // For now, we'll just use text snippets and URLs.
        const allText = textSnippets.join('\n\n');

        try {
            const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
            const result = await generateCourseFromMaterials({
                courseName,
                textContext: allText,
                urls: youtubeLinks,
                learnerType,
            });
            
            const newUnits = result.modules.map((module) => ({
                id: crypto.randomUUID(),
                title: module.title,
                chapters: module.chapters.map((chapter) => ({
                    id: crypto.randomUUID(),
                    title: chapter.title,
                    content: chapter.content,
                    activity: chapter.activity,
                }))
            }));
            
            const courseData = {
                name: result.courseTitle,
                description: `An AI-generated course based on your uploaded materials.`,
                userId: user.uid,
                units: newUnits,
                isNewTopic: true,
                completedChapters: [],
            };

            const docRef = await addDoc(collection(db, "courses"), courseData);
            
            toast({ title: 'Course Generated!', description: 'Your new learning lab is ready.'});
            router.push(`/dashboard/courses?courseId=${docRef.id}`);

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Course Generation Failed' });
        } finally {
            setIsGenerating(false);
        }
    }

    if (isGenerating) {
        return <GeneratingCourse courseName={generatingCourseName} />;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Add Materials</h1>
            <p className="text-muted-foreground mb-8">Upload files, links, or record a lecture to start generating study materials.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Your Content</CardTitle>
                            <CardDescription>Choose your preferred method to add materials.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="upload">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="upload"><UploadCloud className="w-4 h-4 mr-2"/>Upload</TabsTrigger>
                                    <TabsTrigger value="paste"><FileText className="w-4 h-4 mr-2"/>Paste</TabsTrigger>
                                    <TabsTrigger value="youtube"><Youtube className="w-4 h-4 mr-2"/>YouTube</TabsTrigger>
                                    <TabsTrigger value="record"><Mic className="w-4 h-4 mr-2"/>Record</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload" className="pt-6">
                                    <div 
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer h-80",
                                            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                                        )}
                                        onClick={handleUploadClick}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            multiple
                                        />
                                        <div className="p-3 bg-muted rounded-full">
                                            <UploadCloud className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold">Click to upload or drag & drop</h3>
                                        <p className="text-muted-foreground text-sm">Supports PDF, DOCX, PPT, MP3, MP4, and more</p>
                                    </div>
                                </TabsContent>
                                <TabsContent value="paste" className="pt-6">
                                    <div className="flex flex-col h-80">
                                         <Textarea 
                                            placeholder="Paste your text here..." 
                                            className="flex-1"
                                            value={currentText}
                                            onChange={(e) => setCurrentText(e.target.value)}
                                        />
                                         <Button onClick={addTextSnippet} className="mt-2" disabled={!currentText.trim()}>
                                            <Plus className="mr-2 h-4 w-4"/> Add Text Snippet
                                        </Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="youtube" className="pt-6">
                                    <div className="flex flex-col items-center justify-center h-80 bg-muted rounded-xl p-4">
                                        <div className="w-full max-w-md space-y-2">
                                            <Input 
                                                placeholder="Enter a YouTube video URL..." 
                                                value={currentLink}
                                                onChange={(e) => setCurrentLink(e.target.value)}
                                            />
                                            <Button onClick={addYoutubeLink} className="w-full" disabled={!currentLink.trim()}>
                                                <Plus className="mr-2 h-4 w-4"/> Add Link
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="record" className="pt-6">
                                    <div className="flex flex-col items-center justify-center h-80 bg-muted rounded-xl">
                                        <Button variant={isRecording ? 'destructive' : 'outline'} onClick={toggleRecording}>
                                            {isRecording ? <StopCircle className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                                        </Button>
                                         <p className="text-xs text-muted-foreground mt-2">{isRecording ? "Recording in progress..." : "Record your lecture in real-time."}</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {hasContent && (
                        <Card>
                             <CardHeader>
                                <CardTitle>Staged Materials</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {uploadedFiles.length > 0 && uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                                        <FileText className="h-4 w-4 mr-2 flex-shrink-0"/>
                                        <span className="flex-1 truncate">{file.name}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                {textSnippets.length > 0 && textSnippets.map((text, index) => (
                                     <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                                        <FileText className="h-4 w-4 mr-2 flex-shrink-0"/>
                                        <span className="flex-1 truncate">"{text}"</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTextSnippet(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                {youtubeLinks.length > 0 && youtubeLinks.map((link, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                                        <Youtube className="h-4 w-4 mr-2 flex-shrink-0 text-red-500"/>
                                        <span className="flex-1 truncate">{link}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeYoutubeLink(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                {recordedAudioUrl && (
                                     <div className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                                        <Music className="h-4 w-4 mr-2 flex-shrink-0"/>
                                        <audio src={recordedAudioUrl} controls className="flex-1" />
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRecordedAudioUrl(null)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={handleGenerateCourse} disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                                    {isGenerating ? 'Generating...' : 'Generate Course with AI'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>

                <div className="md:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><QrCode/> Add from Phone</CardTitle>
                            <CardDescription>Scan this QR code with your phone's camera to snap a picture of your notes and upload them directly.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <div className="bg-white p-2 rounded-lg">
                                {qrCodeUrl ? <QRCode value={qrCodeUrl} size={160} /> : <div className="h-[160px] w-[160px] flex items-center justify-center text-muted-foreground text-sm">Select a course first.</div>}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle>Ask your friends to help</CardTitle>
                            <CardDescription>Share this link to collaborate on study materials.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <Button variant="outline"><Copy className="w-4 h-4 mr-2"/> Copy Link</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
