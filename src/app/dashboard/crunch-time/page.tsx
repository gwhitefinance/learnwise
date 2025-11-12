'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import { UploadCloud, Link as LinkIcon, Youtube, Wand2, Loader2, Image as ImageIcon, FileText, ArrowLeft, BookOpen, List, BrainCircuit, Lightbulb, Zap, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateCrunchTimeStudyGuide } from '@/lib/actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRouter } from 'next/navigation';
import AIBuddy from '@/components/ai-buddy';

// Define the types
type KeyConcept = {
    term: string;
    definition: string;
};

type StudyStep = {
    step: string;
    description: string;
};

type QuizQuestion = {
    question: string;
    options: string[];
    answer: string;
};

type CrunchTimeOutput = {
    title: string;
    summary: string;
    keyConcepts: KeyConcept[];
    studyPlan: StudyStep[];
    practiceQuiz: QuizQuestion[];
};


const ResourceInput = ({ onGenerate }: { onGenerate: (type: 'text' | 'url' | 'image', content: string) => void }) => {
    const [activeTab, setActiveTab] = useState('text');
    const [textInput, setTextInput] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
                setActiveTab('image');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGenerateClick = () => {
        if (activeTab === 'text') onGenerate('text', textInput);
        else if (activeTab === 'url') onGenerate('url', urlInput);
        else if (activeTab === 'image' && imageUrl) onGenerate('image', imageUrl);
        else toast({ variant: 'destructive', title: 'No content provided.' });
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => { setImageUrl(reader.result as string); setActiveTab('image'); };
            reader.readAsDataURL(file);
        } else {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please drop an image file.' });
        }
    };

    return (
        <Card className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2"/>Text</TabsTrigger>
                        <TabsTrigger value="url"><LinkIcon className="h-4 w-4 mr-2"/>URL</TabsTrigger>
                        <TabsTrigger value="image"><ImageIcon className="h-4 w-4 mr-2"/>Image</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="text">
                        <Textarea placeholder="Paste your notes, an article, or any text here..." className="h-48" value={textInput} onChange={(e) => setTextInput(e.target.value)} />
                    </TabsContent>
                    <TabsContent value="url">
                        <Input placeholder="e.g., https://example.com/article" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                    </TabsContent>
                    <TabsContent value="image">
                        <div className={cn("relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors", isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50")}
                             onClick={() => fileInputRef.current?.click()} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange}/>
                            {imageUrl ? <img src={imageUrl} alt="Preview" className="max-h-40 rounded-md" /> : <div className="text-center text-muted-foreground"><UploadCloud className="h-10 w-10 mx-auto mb-2"/><p className="font-semibold">Click to upload or drag & drop</p></div>}
                        </div>
                    </TabsContent>
                    <Button onClick={handleGenerateClick} className="w-full mt-6">
                        <Wand2 className="mr-2 h-4 w-4"/> Generate Study Guide
                    </Button>
                </CardContent>
            </Tabs>
        </Card>
    )
}

const StudyGuideDisplay = ({ guide }: { guide: CrunchTimeOutput }) => {
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">{guide.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                 <Accordion type="multiple" defaultValue={['summary', 'key-concepts', 'study-plan', 'practice-quiz']} className="w-full space-y-4">
                    <AccordionItem value="summary" className="border rounded-lg bg-muted/20">
                        <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>Summary</AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 text-muted-foreground border-t pt-4">{guide.summary}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="key-concepts" className="border rounded-lg bg-muted/20">
                        <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/>Key Concepts</AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-4 border-t pt-4">
                            {guide.keyConcepts.map((concept: KeyConcept) => (
                                <div key={concept.term}>
                                    <p className="font-semibold">{concept.term}</p>
                                    <p className="text-sm text-muted-foreground">{concept.definition}</p>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="study-plan" className="border rounded-lg bg-muted/20">
                        <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><List className="h-5 w-5 text-primary"/>Action Plan</AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-4 border-t pt-4">
                             {guide.studyPlan.map((step: StudyStep, i: number) => (
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
                            {guide.practiceQuiz.map((q: QuizQuestion, qIndex: number) => {
                                const isCorrect = quizAnswers[qIndex] === q.answer;
                                return (
                                <div key={qIndex} className="space-y-3">
                                    <p className="font-semibold">{qIndex + 1}. {q.question}</p>
                                    <RadioGroup value={quizAnswers[qIndex]} onValueChange={(val) => setQuizAnswers(prev => ({...prev, [qIndex]: val}))} disabled={submitted}>
                                        {q.options.map((opt: string, oIndex: number) => (
                                            <Label key={oIndex} className={cn("flex items-center gap-3 p-3 border rounded-md cursor-pointer", submitted && (opt === q.answer ? 'border-green-500 bg-green-500/10' : (quizAnswers[qIndex] === opt ? 'border-red-500 bg-red-500/10' : '')) )}>
                                                <RadioGroupItem value={opt} />
                                                {opt}
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                    {submitted && !isCorrect && <p className="text-sm text-red-500">Correct answer: {q.answer}</p>}
                                </div>
                            )})}
                             <Button onClick={() => setSubmitted(true)} disabled={submitted}>Check Answers</Button>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    )
}

export default function CrunchTimePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [studyGuide, setStudyGuide] = useState<CrunchTimeOutput | null>(null);
    const [learnerType, setLearnerType] = useState<string>('Unknown');
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        setLearnerType(localStorage.getItem('learnerType') || 'Unknown');
    }, []);

    const handleGenerate = async (type: 'text' | 'url' | 'image', content: string) => {
        setIsLoading(true);
        setStudyGuide(null);
        try {
            const result = await generateCrunchTimeStudyGuide({
                inputType: type,
                content: content,
                learnerType: learnerType as any
            });
            setStudyGuide(result);
        } catch (error: any) {
            console.error("Crunch time generation failed:", error);
            toast({ variant: 'destructive', title: 'Generation Failed', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Dashboard
            </Button>
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center justify-center gap-2"><Zap/> Crunch Time</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    No time? No problem. Upload any study material and let your AI tutor create a personalized study guide to help you ace your test.
                </p> 
            </div>
            
            {!studyGuide && !isLoading && <ResourceInput onGenerate={handleGenerate} />}
            
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-96">
                    <AIBuddy className="w-48 h-48" isStatic={false} />
                    <p className="text-lg font-semibold mt-4 animate-pulse">Studying for you...</p>
                </div>
            )}
            
            {studyGuide && (
                <div className="space-y-4">
                    <StudyGuideDisplay guide={studyGuide} />
                    <Button onClick={() => setStudyGuide(null)} className="w-full">
                        <Plus className="mr-2 h-4 w-4"/> Start a New Session
                    </Button>
                </div>
            )}
        </div>
    );
}