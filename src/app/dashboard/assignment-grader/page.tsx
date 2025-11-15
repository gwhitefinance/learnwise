
'use client';

import { useState, useRef, ChangeEvent, DragEvent, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { UploadCloud, FileText, Wand2, Loader2, ArrowRight, RefreshCw, GraduationCap, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { generateAssignmentGrade, analyzeImage } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { RewardContext } from '@/context/RewardContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';


type GradeResult = {
    score: number;
    strengths: string[];
    improvements: string[];
    finalVerdict: string;
};

const GradeDisplay = ({ result }: { result: GradeResult }) => {
    const scoreColor = result.score >= 90 ? 'text-green-500' : result.score >= 80 ? 'text-blue-500' : result.score >= 70 ? 'text-yellow-500' : 'text-red-500';

    return (
        <Card className="w-full">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Your Grade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40">
                         <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                className="text-muted"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                className={scoreColor}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray={`${result.score}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                strokeLinecap="round"
                                transform="rotate(-90 18 18)"
                            />
                        </svg>
                        <div className={`absolute inset-0 flex items-center justify-center text-5xl font-bold ${scoreColor}`}>
                            {result.score}
                        </div>
                    </div>
                     <p className="font-semibold text-lg mt-4">{result.finalVerdict}</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-green-500/10">
                        <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-green-800/80">
                            {result.strengths.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                     <div className="p-4 rounded-lg bg-red-500/10">
                        <h4 className="font-semibold text-red-700 mb-2">Areas for Improvement</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-800/80">
                             {result.improvements.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};


export default function AssignmentGraderPage() {
    const [assignmentText, setAssignmentText] = useState('');
    const [assignmentImage, setAssignmentImage] = useState<string | null>(null);
    const [rubricText, setRubricText] = useState('');
    const [isGrading, setIsGrading] = useState(false);
    const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showReward } = useContext(RewardContext);
    const [user] = useAuthState(auth);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };
    
    const handleFile = (file: File) => {
        setFileName(file.name);
        setAssignmentImage(null);
        setAssignmentText('');
        
        if (file.type.startsWith('image/')) {
             const reader = new FileReader();
            reader.onload = (event) => {
                setAssignmentImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setAssignmentText(text);
            };
            reader.readAsText(file);
        }
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setAssignmentText(e.target.value);
        if (fileName) setFileName(null);
        if (assignmentImage) setAssignmentImage(null);
    };
    
    const handleGrade = async () => {
        if (!assignmentText.trim() && !assignmentImage) {
            toast({ variant: 'destructive', title: 'Assignment content is required.' });
            return;
        }

        setIsGrading(true);
        setGradeResult(null);

        try {
            let result;
            if (assignmentImage) {
                 const analysis = await analyzeImage({
                    imageDataUri: assignmentImage,
                    prompt: `Grade this assignment based on the following rubric: ${rubricText || "Standard academic rubric"}. Provide an overall score (0-100), 2-3 strengths, 2-3 areas for improvement, and a final one-sentence verdict. Format the output like the assignment grader tool.`,
                });
                // This is a simplified mapping. Assumes the AI follows the prompt format.
                const firstSolution = analysis.solutions[0];
                const content = `${firstSolution.problem}\n\n${firstSolution.steps.join('\n')}\n\n${firstSolution.answer}`;

                result = await generateAssignmentGrade({
                    assignment: content,
                    rubric: rubricText,
                });

            } else {
                result = await generateAssignmentGrade({
                    assignment: assignmentText,
                    rubric: rubricText || "Standard grading rubric for this type of assignment.",
                });
            }
            setGradeResult(result);
            if (user && result.score > 0) {
                const coinsEarned = 10;
                const xpEarned = 25;
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    coins: increment(coinsEarned),
                    xp: increment(xpEarned),
                });
                showReward({ type: 'coins_and_xp', amount: coinsEarned, xp: xpEarned });
            }

        } catch (error) {
            console.error("Grading failed:", error);
            toast({ variant: 'destructive', title: 'Grading Failed', description: 'Could not grade the assignment. Please try again.' });
        } finally {
            setIsGrading(false);
        }
    };

    const handleReset = () => {
        setAssignmentText('');
        setAssignmentImage(null);
        setRubricText('');
        setGradeResult(null);
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Assignment Grader</h1>
                    <p className="text-muted-foreground">Upload, paste, or drag & drop your assignment and get instant feedback from Taz.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/essay-grader">
                        <GraduationCap className="mr-2 h-4 w-4"/> Grade an Essay
                    </Link>
                </Button>
            </div>
            
            {gradeResult ? (
                 <div>
                    <GradeDisplay result={gradeResult} />
                    <div className="mt-6 flex justify-center gap-4">
                        <Button onClick={handleReset}>
                            <RefreshCw className="mr-2 h-4 w-4"/> Grade Another Assignment
                        </Button>
                    </div>
                </div>
            ) : (
                <Card
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={cn("transition-colors", isDragging && "border-primary ring-2 ring-primary")}
                >
                    <CardHeader>
                        <CardTitle>Submit Your Assignment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <Tabs defaultValue="paste">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="paste">Paste Text</TabsTrigger>
                                <TabsTrigger value="upload">Upload File</TabsTrigger>
                            </TabsList>
                            <TabsContent value="paste" className="pt-4">
                                <Textarea 
                                    placeholder="Paste your assignment content here..."
                                    className="h-48"
                                    value={assignmentText}
                                    onChange={handleTextChange}
                                />
                            </TabsContent>
                             <TabsContent value="upload" className="pt-4">
                                <div 
                                    className="p-8 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.md,.docx,.pdf,image/*" onChange={handleFileChange} />
                                    {assignmentImage ? (
                                        <div className="flex flex-col items-center">
                                            <ImageIcon className="h-10 w-10 text-primary mb-2" />
                                            <p className="font-semibold">Image selected: {fileName}</p>
                                            <img src={assignmentImage} alt="Preview" className="max-h-32 mt-4 rounded-md" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-muted rounded-full inline-block">
                                                <UploadCloud className="h-8 w-8 text-primary"/>
                                            </div>
                                            <h4 className="mt-4 font-semibold">{fileName ? `Selected: ${fileName}` : 'Click to upload or drag & drop your assignment'}</h4>
                                            <p className="text-xs text-muted-foreground">Text files, PDFs, or images</p>
                                        </>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="space-y-2">
                            <Label htmlFor="rubric">Grading Rubric or Instructions (Optional)</Label>
                            <Textarea
                                id="rubric"
                                placeholder="Paste the grading rubric or specific instructions from your teacher here..."
                                className="w-full min-h-[100px] p-2 border rounded-md"
                                value={rubricText}
                                onChange={(e) => setRubricText(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleGrade} disabled={isGrading || (!assignmentText.trim() && !assignmentImage)}>
                            {isGrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                            {isGrading ? 'Grading...' : 'Grade with AI'}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}

