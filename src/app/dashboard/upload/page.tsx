

'use client';

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Youtube, FileText, Music, Trash2, Plus, Wand2, Loader2, BookOpen, Lightbulb, Copy, ArrowLeft, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot, getDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { generateCrunchTimeStudyGuide, generateQuizFromNote, generateFlashcardsFromNote, generateCourseFromMaterials } from '@/lib/actions';
import type { CrunchTimeOutput } from '@/ai/schemas/crunch-time-schema';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import GeneratingCourse from "../courses/GeneratingCourse";
import QRCode from 'qrcode.react';

type Material = {
    type: 'file' | 'text' | 'url' | 'audio';
    content: string;
    fileName?: string;
};

type Course = {
    id: string;
    name: string;
    materials?: Material[];
};

type Flashcard = {
    front: string;
    back: string;
};


const YoutubeEmbed = ({ url }: { url: string }) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (!videoId) return <p className="text-red-500">Invalid YouTube URL</p>;
    return (
        <div className="aspect-video">
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
            ></iframe>
        </div>
    );
};

const MaterialCard = ({ material, onRemove, onGenerate }: { material: Material, onRemove: () => void, onGenerate: (type: 'guide' | 'quiz' | 'flashcards', material: Material) => void }) => {
    let Icon = FileText;
    if (material.type === 'url') Icon = Youtube;
    if (material.type === 'audio') Icon = Music;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Icon className={cn("h-6 w-6 flex-shrink-0", material.type === 'url' && 'text-red-500')} />
                        <CardTitle className="text-lg truncate">{material.fileName || material.content}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {material.type === 'url' ? <YoutubeEmbed url={material.content} /> : material.type === 'text' ? <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md line-clamp-3">{material.content}</p> : <p className="text-sm text-muted-foreground">File: {material.fileName}</p>}
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onGenerate('guide', material)}><BookOpen className="w-4 h-4 mr-2"/>Study Guide</Button>
                <Button variant="outline" size="sm" onClick={() => onGenerate('quiz', material)}><Lightbulb className="w-4 h-4 mr-2"/>Practice Quiz</Button>
                <Button variant="outline" size="sm" onClick={() => onGenerate('flashcards', material)}><Copy className="w-4 h-4 mr-2"/>Flashcards</Button>
            </CardFooter>
        </Card>
    );
};


export default function UploadPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseId = searchParams.get('courseId');
    const [course, setCourse] = useState<Course | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);
    
    // Add materials state
    const [currentText, setCurrentText] = useState('');
    const [currentLink, setCurrentLink] = useState('');

    // AI Generation Modals State
    const [isGenerating, setIsGenerating] = useState(false);
    const [studyGuide, setStudyGuide] = useState<CrunchTimeOutput | null>(null);
    const [isQuizDialogOpen, setQuizDialogOpen] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
    const [isFlashcardDialogOpen, setFlashcardDialogOpen] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [generatingCourseName, setGeneratingCourseName] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (!courseId || !user) {
            if (!user && !authLoading) router.push('/dashboard/courses');
            return;
        };

        const courseRef = doc(db, 'courses', courseId);
        const unsubscribe = onSnapshot(courseRef, (doc) => {
            if (doc.exists()) {
                setCourse({ id: doc.id, ...doc.data() } as Course);
            } else {
                toast({ variant: 'destructive', title: 'Course not found.' });
                router.push('/dashboard/courses');
            }
        });
        setQrCodeUrl(`${window.location.origin}/upload-note/${courseId}`);

        return () => unsubscribe();
    }, [courseId, user, router, toast, authLoading]);

    const addMaterial = async (material: Material) => {
        if (!courseId) return;
        const courseRef = doc(db, 'courses', courseId);
        try {
            await updateDoc(courseRef, {
                materials: arrayUnion(material)
            });
            toast({ title: 'Material added!' });
        } catch (error) {
            console.error("Error adding material: ", error);
            toast({ variant: 'destructive', title: 'Could not add material.' });
        }
    };
    
    const handleFilesSelected = (files: FileList | null) => {
        if (files) {
            Array.from(files).forEach(file => {
                // Here you would normally upload the file to a storage service (e.g., Firebase Storage)
                // and get a URL. For this demo, we'll just store the name.
                addMaterial({ type: 'file', content: `path/to/${file.name}`, fileName: file.name });
            });
        }
    };

    const addTextSnippet = () => {
        if (currentText.trim()) {
            addMaterial({ type: 'text', content: currentText.trim(), fileName: `Text Snippet` });
            setCurrentText('');
        }
    };

    const addYoutubeLink = () => {
        if (currentLink.trim()) {
            addMaterial({ type: 'url', content: currentLink.trim(), fileName: 'YouTube Video' });
            setCurrentLink('');
        }
    };

    const removeItem = async (material: Material) => {
        if (!courseId || !course?.materials) return;
        const courseRef = doc(db, 'courses', courseId);
        try {
            await updateDoc(courseRef, {
                materials: arrayRemove(material)
            });
            toast({ title: 'Material removed.' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Could not remove material.' });
        }
    };

    const handleGenerate = async (type: 'guide' | 'quiz' | 'flashcards', material: Material) => {
        setIsGenerating(true);

        try {
            const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
            let contentToProcess = material.content;
            let inputType: 'text' | 'url' = 'text';

            if (material.type === 'url') {
                inputType = 'url';
            } else if (material.type === 'text') {
                inputType = 'text';
            } else {
                 toast({ variant: 'destructive', title: 'This material type is not yet supported for generation.' });
                 setIsGenerating(false);
                 return;
            }

            if (type === 'guide') {
                const result = await generateCrunchTimeStudyGuide({
                    inputType,
                    content: contentToProcess,
                    learnerType,
                });
                setStudyGuide(result);
            } else if (type === 'quiz') {
                const result = await generateQuizFromNote({
                    noteContent: contentToProcess, // Assuming URL content will be scraped by the flow
                    learnerType,
                });
                setGeneratedQuiz(result);
                setQuizDialogOpen(true);
            } else if (type === 'flashcards') {
                const result = await generateFlashcardsFromNote({
                    noteContent: contentToProcess,
                    learnerType,
                });
                setFlashcards(result.flashcards);
                setFlashcardDialogOpen(true);
            }

        } catch (error) {
            console.error(`Error generating ${type}:`, error);
            toast({ variant: 'destructive', title: `Failed to generate ${type}.` });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateCourse = async () => {
        if (!course || !course.materials || course.materials.length === 0) {
            toast({ variant: 'destructive', title: 'No materials to generate course from.' });
            return;
        }

        setIsGenerating(true);
        setGeneratingCourseName(course.name);

        const textContent = course.materials.filter(m => m.type === 'text').map(m => m.content).join('\n\n');
        const urls = course.materials.filter(m => m.type === 'url').map(m => m.content);

        try {
            const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
            const result = await generateCourseFromMaterials({
                courseName: course.name,
                textContext: textContent,
                urls: urls,
                learnerType: learnerType,
            });
            
            const newUnits = result.modules.map(module => ({
                id: crypto.randomUUID(),
                title: module.title,
                chapters: module.chapters.map(chapter => ({
                    id: crypto.randomUUID(),
                    title: chapter.title,
                    content: '', // Content will be generated on-demand
                    activity: ''
                }))
            }));

            const courseRef = doc(db, 'courses', course.id);
            await updateDoc(courseRef, { units: newUnits });

            toast({ title: 'Course Generated!', description: 'Your new course structure is ready.' });
            router.push(`/dashboard/courses?courseId=${course.id}`);

        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Course Generation Failed' });
        } finally {
            setIsGenerating(false);
        }
    }


    const hasContent = course?.materials && course.materials.length > 0;

    if (isGenerating && !studyGuide) {
        return <GeneratingCourse courseName={generatingCourseName || "your study materials"} />;
    }

    // This is a stand-in. A proper study guide display component would be better.
    if (studyGuide) {
        return <div className="p-8 max-w-6xl mx-auto">
            <Button onClick={() => setStudyGuide(null)}>Back</Button>
            <pre>{JSON.stringify(studyGuide, null, 2)}</pre>
        </div>
    }


    return (
        <div className="p-8 max-w-6xl mx-auto">
             <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Materials for: {course?.name}</h1>
            <p className="text-muted-foreground mb-8">This is your central hub. Add materials and use AI tools to generate study aids.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Add New Material</h2>
                     <Card>
                        <CardContent className="p-6">
                            <Tabs defaultValue="upload">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="upload"><UploadCloud className="w-4 h-4 mr-2"/>Upload</TabsTrigger>
                                    <TabsTrigger value="paste"><FileText className="w-4 h-4 mr-2"/>Paste</TabsTrigger>
                                    <TabsTrigger value="youtube"><Youtube className="w-4 h-4 mr-2"/>YouTube</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload" className="pt-6">
                                     <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-24 border-dashed">
                                        <UploadCloud className="mr-2 h-4 w-4"/> Click to upload files
                                    </Button>
                                    <input type="file" ref={fileInputRef} onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" multiple />
                                </TabsContent>
                                <TabsContent value="paste" className="pt-6">
                                    <div className="space-y-2">
                                        <Textarea placeholder="Paste text here..." value={currentText} onChange={e => setCurrentText(e.target.value)} />
                                        <Button onClick={addTextSnippet} disabled={!currentText.trim()}><Plus className="mr-2 h-4 w-4"/>Add Snippet</Button>
                                    </div>
                                </TabsContent>
                                 <TabsContent value="youtube" className="pt-6">
                                    <div className="space-y-2">
                                        <Input placeholder="Enter YouTube URL..." value={currentLink} onChange={e => setCurrentLink(e.target.value)} />
                                        <Button onClick={addYoutubeLink} disabled={!currentLink.trim()}><Plus className="mr-2 h-4 w-4"/>Add Link</Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><QrCode/> Add from Phone</CardTitle>
                            <CardDescription>Scan this QR code with your phone's camera to snap a picture of your notes and upload them directly.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <div className="bg-white p-2 rounded-lg">
                                {qrCodeUrl ? <QRCode value={qrCodeUrl} size={128} /> : <div className="h-[128px] w-[128px] flex items-center justify-center text-muted-foreground text-sm">Select a course</div>}
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><LinkIcon/> Invite Link</CardTitle>
                             <CardDescription>Share a link to this page to collaborate with others.</CardDescription>
                         </CardHeader>
                         <CardContent className="flex items-center justify-between">
                             <Button variant="outline"><Copy className="w-4 h-4 mr-2"/> Copy Link</Button>
                         </CardContent>
                     </Card>
                </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                         <h2 className="text-xl font-semibold">Your Materials ({course?.materials?.length || 0})</h2>
                         <Button onClick={handleGenerateCourse} disabled={!hasContent || isGenerating}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                            Generate Course with AI
                        </Button>
                    </div>
                     {hasContent ? (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {course.materials?.map((material, index) => (
                                <MaterialCard key={index} material={material} onRemove={() => removeItem(material)} onGenerate={handleGenerate}/>
                            ))}
                        </div>
                    ) : (
                        <Card className="flex items-center justify-center h-48 border-dashed">
                            <p className="text-muted-foreground">Your added materials will appear here.</p>
                        </Card>
                    )}
                </div>
            </div>

            {/* AI Generation Modals */}
            <Dialog open={isQuizDialogOpen} onOpenChange={setQuizDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{generatedQuiz?.quizTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 max-h-[60vh] overflow-y-auto">
                        {generatedQuiz && (
                            <div className="space-y-6">
                                {generatedQuiz.questions.map((q, index) => (
                                    <div key={index}>
                                        <p className="font-semibold">{index + 1}. {q.questionText}</p>
                                        <ul className="list-disc list-inside pl-4 mt-2 text-sm text-muted-foreground">
                                            {q.options.map(opt => <li key={opt}>{opt}</li>)}
                                        </ul>
                                        <p className="text-sm font-bold mt-2">Answer: <span className="font-normal text-primary">{q.correctAnswer}</span></p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isFlashcardDialogOpen} onOpenChange={setFlashcardDialogOpen}>
                 <DialogContent>
                    <DialogHeader><DialogTitle>Flashcards</DialogTitle></DialogHeader>
                    {flashcards.length > 0 ? (
                         <div className="py-4 text-center">
                            <p className="text-xl font-semibold">{flashcards[0].front}</p>
                            <p className="text-muted-foreground mt-4">{flashcards[0].back}</p>
                        </div>
                    ) : <p>No flashcards generated.</p>}
                 </DialogContent>
            </Dialog>
        </div>
    );
}
