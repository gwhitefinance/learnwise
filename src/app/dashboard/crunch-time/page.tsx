
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import { UploadCloud, Link as LinkIcon, Youtube, Wand2, Loader2, Image as ImageIcon, FileText, ArrowLeft, BookOpen, List, BrainCircuit, Lightbulb, Zap, Plus, GitMerge, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateCrunchTimeStudyGuide, generateExplanation } from '@/lib/actions';
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

type HowToStep = {
    step: string;
    description: string;
};

type QuizQuestion = {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
};

type CrunchTimeOutput = {
    title: string;
    summary: string;
    keyConcepts: KeyConcept[];
    howToGuide: HowToStep[];
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

const StudyGuideDisplay = ({ guide, onReset, learnerType }: { guide: CrunchTimeOutput, onReset: () => void, learnerType: string }) => {
    const [quizQuestions, setQuizQuestions] = useState(guide.practiceQuiz);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [isGeneratingNewQuestion, setIsGeneratingNewQuestion] = useState(false);

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            resetQuestionState();
        } else {
            // End of quiz logic could go here, e.g. show summary
            onReset(); // For now, just reset the whole guide
        }
    };
    
    const resetQuestionState = () => {
        setSelectedAnswer(null);
        setIsSubmitted(false);
        setExplanation(null);
    };

    const handleCheckAnswer = async () => {
        if (!selectedAnswer) return;
        setIsSubmitted(true);
        if (selectedAnswer !== currentQuestion.answer) {
            setIsExplanationLoading(true);
            try {
                const result = await generateExplanation({
                    question: currentQuestion.question,
                    userAnswer: selectedAnswer,
                    correctAnswer: currentQuestion.answer,
                    learnerType: learnerType as any,
                });
                setExplanation(result.explanation);
                // Optionally, generate a new question to replace the wrong one for future practice
            } catch (error) {
                console.error(error);
                setExplanation("Sorry, couldn't load an explanation.");
            } finally {
                setIsExplanationLoading(false);
            }
        }
    };

    const handleGenerateNewQuestion = async () => {
        setIsGeneratingNewQuestion(true);
        try {
            const result = await generateExplanation({
                question: currentQuestion.question,
                userAnswer: selectedAnswer || "",
                correctAnswer: currentQuestion.answer,
                learnerType: learnerType as any,
            });
            const newQuestion = {
                ...result.practiceQuestion,
                answer: result.practiceQuestion.answer
            };
            setQuizQuestions(prev => {
                const newQuestions = [...prev];
                newQuestions.splice(currentQuestionIndex + 1, 0, newQuestion);
                return newQuestions;
            });
            handleNextQuestion();
        } catch(e) {
            console.error(e);
        } finally {
            setIsGeneratingNewQuestion(false);
        }
    }


    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">{guide.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                 <Accordion type="multiple" defaultValue={['summary', 'key-concepts', 'how-to-guide', 'study-plan', 'practice-quiz']} className="w-full space-y-4">
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
                    <AccordionItem value="how-to-guide" className="border rounded-lg bg-muted/20">
                        <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><GitMerge className="h-5 w-5 text-primary"/>How-to Guide</AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-4 border-t pt-4">
                            {guide.howToGuide.map((step: HowToStep, i: number) => (
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
                            <div className="text-sm text-muted-foreground text-center">
                                Question {currentQuestionIndex + 1} of {quizQuestions.length}
                            </div>
                            <p className="font-semibold text-center text-lg">{currentQuestion.question}</p>
                            <RadioGroup value={selectedAnswer || ''} onValueChange={setSelectedAnswer} disabled={isSubmitted}>
                                <div className="space-y-3">
                                {currentQuestion.options.map((opt: string, oIndex: number) => (
                                    <Label key={oIndex} className={cn(
                                        "flex items-center gap-3 p-3 border rounded-md transition-all",
                                        isSubmitted && (opt === currentQuestion.answer ? 'border-green-500 bg-green-500/10' : (selectedAnswer === opt ? 'border-red-500 bg-red-500/10' : '')),
                                        !isSubmitted && (selectedAnswer === opt ? "border-primary bg-primary/10" : "cursor-pointer")
                                    )}>
                                        <RadioGroupItem value={opt} />
                                        <span>{opt}</span>
                                        {isSubmitted && opt === currentQuestion.answer && <CheckCircle className="h-5 w-5 text-green-500 ml-auto"/>}
                                        {isSubmitted && selectedAnswer === opt && !isCorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto"/>}
                                    </Label>
                                ))}
                                </div>
                            </RadioGroup>
                             {isSubmitted && (
                                <div className="space-y-4 pt-4 border-t">
                                    {isCorrect ? (
                                        <p className="text-green-600 font-semibold text-center">Correct! Great job.</p>
                                    ) : (
                                        <div className="p-4 bg-red-500/10 text-red-700 rounded-lg">
                                            <p className="font-bold">Not quite.</p>
                                            {isExplanationLoading ? <p>Loading explanation...</p> : <p>{explanation}</p>}
                                        </div>
                                    )}
                                    <div className="flex justify-center gap-2">
                                        {!isCorrect && (
                                             <Button variant="outline" onClick={handleGenerateNewQuestion} disabled={isGeneratingNewQuestion}>
                                                {isGeneratingNewQuestion ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                                                New Question
                                            </Button>
                                        )}
                                        <Button onClick={handleNextQuestion}>
                                            {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Session'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                             {!isSubmitted && <Button onClick={handleCheckAnswer} disabled={!selectedAnswer}>Check Answer</Button>}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="pt-6 border-t">
                     <Button variant="ghost" onClick={onReset} className="w-full text-muted-foreground">
                        <RefreshCw className="w-4 h-4 mr-2"/> Start Over
                    </Button>
                </div>
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
                    <StudyGuideDisplay guide={studyGuide} onReset={() => setStudyGuide(null)} learnerType={learnerType}/>
                </div>
            )}
        </div>
    );
}

