'use client';

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Youtube, FileText, Video, Music, Copy, QrCode, Mic, Trash2, Plus, Play, StopCircle, Wand2, Loader2, BookOpen, GitMerge, List, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import QRCode from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { generateCrunchTimeStudyGuide } from "@/lib/actions";
import type { CrunchTimeOutput } from '@/ai/schemas/crunch-time-schema';
import GeneratingCourse from "../courses/GeneratingCourse";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";


const StudyGuideDisplay = ({ guide, onReset }: { guide: CrunchTimeOutput, onReset: () => void }) => {
    return (
        <Card className="w-full mt-8">
            <CardHeader>
                <CardTitle className="text-2xl">{guide.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                 <Accordion type="multiple" defaultValue={['summary', 'key-concepts']} className="w-full space-y-4">
                    <AccordionItem value="summary" className="border rounded-lg bg-muted/20">
                        <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2">Summary</AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 text-muted-foreground border-t pt-4">{guide.summary}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="key-concepts" className="border rounded-lg bg-muted/20">
                        <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/>Key Concepts</AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-4 border-t pt-4">
                            {guide.keyConcepts.map((concept) => (
                                <div key={concept.term}>
                                    <p className="font-semibold">{concept.term}</p>
                                    <p className="text-sm text-muted-foreground">{concept.definition}</p>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="how-to-guide" className="border rounded-lg bg-muted/20">
                        <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><GitMerge className="h-5 w-5 text-primary"/>How-to Guide</AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-4 border-t pt-4">
                            {guide.howToGuide.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">{i + 1}</div>
                                    <div>
                                        <p className="font-semibold">{step.step}</p>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="study-plan" className="border rounded-lg bg-muted/20">
                        <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><List className="h-5 w-5 text-primary"/>Action Plan</AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-4 border-t pt-4">
                             {guide.studyPlan.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">{i + 1}</div>
                                    <div>
                                        <p className="font-semibold">{step.step}</p>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="practice-quiz" className="border rounded-lg bg-muted/20">
                        <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/>Practice Quiz</AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-6 border-t pt-4">
                            {guide.practiceQuiz.map((q, qIndex) => (
                                <div key={qIndex} className="space-y-3">
                                    <p className="font-semibold">{qIndex + 1}. {q.question}</p>
                                    <RadioGroup>
                                        {q.options.map((opt, oIndex) => (
                                            <Label key={oIndex} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted">
                                                <RadioGroupItem value={opt} />
                                                {opt}
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter>
                 <Button variant="outline" onClick={onReset} className="w-full">Start Over</Button>
            </CardFooter>
        </Card>
    );
};


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
    
    // Combined state for all materials
    const [materials, setMaterials] = useState<{type: 'file' | 'text' | 'url' | 'audio', content: string, file?: File}[]>([]);

    const [currentText, setCurrentText] = useState('');
    const [currentLink, setCurrentLink] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const [studyGuide, setStudyGuide] = useState<CrunchTimeOutput | null>(null);

    useEffect(() => {
        if (courseId) {
            setQrCodeUrl(`${window.location.origin}/upload-note/${courseId}`);
        }
    }, [courseId]);

    const handleFilesSelected = (files: FileList | null) => {
        if (files) {
            const newMaterials = Array.from(files).map(file => ({ type: 'file' as const, content: file.name, file }));
            setMaterials(prev => [...prev, ...newMaterials]);
            toast({ title: `${newMaterials.length} file(s) added.` });
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
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        handleFilesSelected(e.dataTransfer.files);
    };
    
    const removeItem = (index: number) => {
        setMaterials(prev => prev.filter((_, i) => i !== index));
    };

    const addTextSnippet = () => {
        if (currentText.trim()) {
            setMaterials(prev => [...prev, { type: 'text', content: currentText.trim() }]);
            setCurrentText('');
        }
    };

    const addYoutubeLink = () => {
        if (currentLink.trim()) {
            setMaterials(prev => [...prev, { type: 'url', content: currentLink.trim() }]);
            setCurrentLink('');
        }
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
                    setMaterials(prev => [...prev, { type: 'audio', content: 'Recorded Audio', file: new File([audioBlob], "recording.wav") }]);
                    stream.getTracks().forEach(track => track.stop());
                };
                
                mediaRecorderRef.current.start();
                setIsRecording(true);
                toast({ title: 'Recording started...' });
            } catch (err) {
                 toast({ variant: 'destructive', title: 'Microphone access denied.' });
            }
        }
    };

    const hasContent = materials.length > 0;

    const handleGenerateStudyGuide = async () => {
        if (!materials.length) {
            toast({ variant: 'destructive', title: 'No content provided.' });
            return;
        }

        setIsGenerating(true);
        setStudyGuide(null);

        // For now, we prioritize the first piece of content for generation.
        // A more advanced version could combine them.
        const firstMaterial = materials[0];

        try {
            let inputType: 'text' | 'url' | 'image' = 'text';
            let content = '';

            if (firstMaterial.type === 'url') {
                inputType = 'url';
                content = firstMaterial.content;
            } else if (firstMaterial.type === 'file' && firstMaterial.file?.type.startsWith('image/')) {
                inputType = 'image';
                content = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(firstMaterial.file!);
                });
            } else {
                 // All other files and text are treated as text for now
                inputType = 'text';
                content = materials.map(m => m.content).join('\n\n');
            }
            
            const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';

            const result = await generateCrunchTimeStudyGuide({
                inputType,
                content,
                learnerType,
            });
            setStudyGuide(result);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Study Guide Generation Failed' });
        } finally {
            setIsGenerating(false);
        }
    };

    if (isGenerating && !studyGuide) {
        return <GeneratingCourse courseName={"your study guide"} />;
    }
    
    if (studyGuide) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                 <StudyGuideDisplay guide={studyGuide} onReset={() => { setStudyGuide(null); setMaterials([]); }} />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Add Materials</h1>
            <p className="text-muted-foreground mb-8">Upload files, links, or record a lecture to generate a personalized study guide.</p>
            
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
                                {materials.map((material, index) => {
                                    let Icon = FileText;
                                    if(material.type === 'url') Icon = Youtube;
                                    if(material.type === 'audio') Icon = Music;

                                    return (
                                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                                            <Icon className={cn("h-4 w-4 mr-2 flex-shrink-0", material.type === 'url' && 'text-red-500')}/>
                                            <span className="flex-1 truncate">{material.content}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    )
                                })}
                            </CardContent>
                             <CardFooter>
                                <Button className="w-full" onClick={handleGenerateStudyGuide} disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                                    {isGenerating ? 'Generating...' : 'Generate Study Guide with AI'}
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
