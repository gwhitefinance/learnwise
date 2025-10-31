
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import { UploadCloud, Link as LinkIcon, Youtube, Wand2, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTutoringSession, generateTextTutoringSession } from '@/lib/actions';
import { getYouTubeTranscript } from '@/ai/tools/youtube-transcript-tool';
import { scrapeWebpageTool } from '@/ai/tools/web-scraper-tool';
import { TutoringSessionOutput } from '@/ai/schemas/image-tutoring-schema';
import { PracticeQuestionSchema } from '@/ai/schemas/quiz-explanation-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import ListenAssistant from '@/components/ListenAssistant';


export default function UploadPage() {
    const [learnerType, setLearnerType] = useState<string>('Unknown');
    const [activeTab, setActiveTab] = useState('image');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [textInput, setTextInput] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [userPrompt, setUserPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tutoringSession, setTutoringSession] = useState<TutoringSessionOutput | null>(null);
    const [practiceAnswer, setPracticeAnswer] = useState<string | undefined>(undefined);
    const [isAnswered, setIsAnswered] = useState(false);
    
    const [isDragging, setIsDragging] = useState(false);
    
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedLearnerType = localStorage.getItem('learnerType');
        if (storedLearnerType) {
            setLearnerType(storedLearnerType);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            const file = files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setTutoringSession(null);
        setPracticeAnswer(undefined);
        setIsAnswered(false);

        try {
            let sessionResult: TutoringSessionOutput;
            if (activeTab === 'image' && imageUrl) {
                sessionResult = await generateTutoringSession({
                    imageDataUri: imageUrl,
                    prompt: userPrompt,
                    learnerType: learnerType as any,
                });
            } else if (activeTab === 'text' && textInput) {
                 sessionResult = await generateTextTutoringSession({
                    textContent: textInput,
                    prompt: userPrompt,
                    learnerType: learnerType as any,
                });
            } else if (activeTab === 'url' && urlInput) {
                let content = '';
                if (urlInput.includes('youtube.com') || urlInput.includes('youtu.be')) {
                    content = await getYouTubeTranscript({ url: urlInput });
                } else {
                    content = await scrapeWebpageTool({ url: urlInput });
                }
                
                if (content.startsWith('Error:')) {
                    throw new Error(content);
                }

                sessionResult = await generateTextTutoringSession({
                    textContent: content,
                    prompt: userPrompt,
                    learnerType: learnerType as any,
                });

            } else {
                toast({ variant: 'destructive', title: 'No content provided.' });
                setIsLoading(false);
                return;
            }
            setTutoringSession(sessionResult);

        } catch (error: any) {
            console.error("Failed to generate tutoring session:", error);
            toast({ variant: 'destructive', title: 'Generation Failed', description: error.message || 'Could not generate session.' });
        } finally {
            setIsLoading(false);
        }
    };

    const isCorrect = practiceAnswer === tutoringSession?.practiceQuestion.answer;

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            const file = droppedFiles[0];
            if (file.type.startsWith('image/')) {
                setImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                toast({ variant: 'destructive', title: 'Invalid File', description: 'Please drop an image file.' });
            }
        }
    };
    
    return (
         <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Content Analysis</h1>
                <p className="text-muted-foreground">Upload your materials to get a personalized, AI-powered tutoring session.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <CardHeader>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="image"><ImageIcon className="h-4 w-4 mr-2"/>Image</TabsTrigger>
                                <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2"/>Text</TabsTrigger>
                                <TabsTrigger value="url"><LinkIcon className="h-4 w-4 mr-2"/>URL</TabsTrigger>
                            </TabsList>
                        </CardHeader>
                        <CardContent>
                            <TabsContent value="image">
                                <div className="space-y-4">
                                     <div 
                                        className={cn(
                                            "relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                                        )}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        <input ref={fileInputRef} id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange}/>
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="Preview" className="max-h-48 rounded-md" />
                                        ) : (
                                            <div className="flex flex-col items-center text-center text-muted-foreground">
                                                <UploadCloud className="h-10 w-10 mb-2"/>
                                                <span className="font-semibold">Click to upload or drag & drop</span>
                                                <p className="text-xs mt-1">PNG, JPG, or GIF</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="text">
                                <div className="space-y-2">
                                    <Label htmlFor="text-input">Paste your text</Label>
                                    <Textarea id="text-input" placeholder="Paste your notes, an article, or any text here..." className="h-48" value={textInput} onChange={(e) => setTextInput(e.target.value)} />
                                </div>
                            </TabsContent>
                            <TabsContent value="url">
                                <div className="space-y-2">
                                    <Label htmlFor="url-input">Enter a URL</Label>
                                    <div className="flex gap-2">
                                        <Input id="url-input" placeholder="https://example.com" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                                        <Button variant="secondary" onClick={() => setUrlInput(prev => `https://youtube.com/watch?v=...`)}><Youtube className="h-5 w-5 text-red-500"/></Button>
                                    </div>
                                </div>
                            </TabsContent>

                            <div className="space-y-2 mt-4">
                                <Label htmlFor="prompt-input">What do you need help with? (Optional)</Label>
                                <Input id="prompt-input" placeholder="e.g., Explain this like I'm 10, what are the key formulas?" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} />
                            </div>
                            <Button onClick={handleGenerate} disabled={isLoading} className="w-full mt-6">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                                {isLoading ? 'Analyzing...' : 'Generate Tutoring Session'}
                            </Button>
                        </CardContent>
                    </Tabs>
                </Card>

                 <Card className="min-h-[400px]">
                    <CardHeader>
                        <CardTitle>Your Personalized Session</CardTitle>
                        <CardDescription>AI-generated explanations and practice based on your content.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-6 w-1/3"/>
                                <Skeleton className="h-4 w-full"/>
                                <Skeleton className="h-4 w-full"/>
                                <Skeleton className="h-4 w-3/4"/>
                                <div className="pt-4 space-y-2">
                                    <Skeleton className="h-6 w-1/4"/>
                                    <Skeleton className="h-10 w-full"/>
                                    <Skeleton className="h-10 w-full"/>
                                </div>
                            </div>
                        ) : tutoringSession ? (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Conceptual Explanation</h4>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{tutoringSession.conceptualExplanation}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Step-by-Step Walkthrough</h4>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{tutoringSession.stepByStepWalkthrough}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Key Concepts</h4>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        {tutoringSession.keyConcepts.map(concept => <li key={concept}>{concept}</li>)}
                                    </ul>
                                </div>
                                <div>
                                     <h4 className="font-semibold text-lg mb-2">Practice Question</h4>
                                     <p className="font-semibold mb-4">{tutoringSession.practiceQuestion.question}</p>
                                      <RadioGroup value={practiceAnswer} onValueChange={setPracticeAnswer} disabled={isAnswered}>
                                        <div className="space-y-3">
                                            {tutoringSession.practiceQuestion.options.map((option, index) => (
                                                <Label key={index} className={cn(
                                                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer",
                                                    isAnswered && option === tutoringSession.practiceQuestion.answer && "border-green-500 bg-green-500/10",
                                                    isAnswered && practiceAnswer === option && !isCorrect && "border-red-500 bg-red-500/10",
                                                    !isAnswered && practiceAnswer === option && "border-primary"
                                                )}>
                                                    <RadioGroupItem value={option} id={`pq-option-${index}`} />
                                                    {option}
                                                </Label>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                    <div className="mt-4">
                                        {!isAnswered && <Button onClick={() => setIsAnswered(true)} disabled={!practiceAnswer}>Check Answer</Button>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Personalized Advice</h4>
                                    <p className="text-muted-foreground">{tutoringSession.personalizedAdvice}</p>
                                </div>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-64 text-center">
                                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4"/>
                                <p className="text-muted-foreground">Your tutoring session will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
