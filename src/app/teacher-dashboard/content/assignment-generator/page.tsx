'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Loader2, FileText, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// --- Types and Mock Action (Moved locally to fix import errors) ---

type GenerateQuizInput = {
    topic: string;
    questionType: 'Multiple Choice' | 'True/False' | 'Short Answer';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    numQuestions: number;
};

type GenerateQuizOutput = {
    questions: {
        questionText: string;
        options?: string[];
        correctAnswer: string;
    }[];
};

// Mock server action to simulate generation without backend dependencies
const generateQuizAction = async (input: GenerateQuizInput): Promise<GenerateQuizOutput> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

    return {
        questions: Array.from({ length: input.numQuestions }).map((_, i) => ({
            questionText: `Generated ${input.difficulty} question about "${input.topic}" #${i + 1}`,
            options: input.questionType === 'Multiple Choice' 
                ? ['Option A', 'Option B', 'Option C', 'Option D'] 
                : input.questionType === 'True/False' 
                    ? ['True', 'False'] 
                    : undefined,
            correctAnswer: input.questionType === 'Multiple Choice' ? 'Option A' : 'True'
        }))
    };
};

// ---------------------------------------------------------------

export default function AssignmentGeneratorPage() {
    const [topics, setTopics] = useState('');
    const [questionType, setQuestionType] = useState('Multiple Choice');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState('10');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedAssignment, setGeneratedAssignment] = useState<GenerateQuizOutput | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!topics.trim()) {
            toast({
                variant: 'destructive',
                title: 'Topics are required',
                description: 'Please enter one or more topics for your assignment.',
            });
            return;
        }

        setIsLoading(true);
        setGeneratedAssignment(null);

        try {
            const input: GenerateQuizInput = {
                topic: topics,
                questionType: questionType as 'Multiple Choice' | 'True/False' | 'Short Answer',
                difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
                numQuestions: parseInt(numQuestions),
            };

            const result = await generateQuizAction(input);
            
            setGeneratedAssignment(result);
            toast({
                title: 'Assignment Generated!',
                description: `Your ${result.questions.length}-question assignment is ready.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'The AI could not generate an assignment. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Assignment Generator</h1>
                <p className="text-muted-foreground">
                    Quickly generate worksheets, quizzes, or modules based on any topic.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Details</CardTitle>
                            <CardDescription>Specify the parameters for your assignment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="topics">Topic(s)</Label>
                                <Input 
                                    id="topics" 
                                    placeholder="e.g., The Cell Cycle, American Revolution" 
                                    value={topics}
                                    onChange={(e) => setTopics(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="question-type">Question Type</Label>
                                <Select value={questionType} onValueChange={setQuestionType}>
                                    <SelectTrigger id="question-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                        <SelectItem value="True/False">True/False</SelectItem>
                                        <SelectItem value="Short Answer">Short Answer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger id="difficulty">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="num-questions">Number of Questions</Label>
                                <Select value={numQuestions} onValueChange={setNumQuestions}>
                                    <SelectTrigger id="num-questions">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating...</>
                                ) : (
                                    <><Wand2 className="mr-2 h-4 w-4"/> Generate</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="min-h-[400px]">
                        <CardHeader>
                            <CardTitle>Generated Assignment</CardTitle>
                            <CardDescription>Review the questions below. You can assign this to a class or export it.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                                </div>
                            ) : generatedAssignment ? (
                                <div className="space-y-6">
                                    {generatedAssignment.questions.map((q, index) => (
                                        <div key={index} className="p-4 bg-muted rounded-lg">
                                            <p className="font-semibold">{index + 1}. {q.questionText}</p>
                                            {q.options && (
                                                <ul className="list-disc list-inside pl-4 mt-2 text-sm text-muted-foreground">
                                                    {q.options.map(opt => <li key={opt}>{opt}</li>)}
                                                </ul>
                                            )}
                                            <p className="text-sm font-bold mt-2">Answer: <span className="font-normal text-primary">{q.correctAnswer}</span></p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground mb-4"/>
                                    <p className="text-muted-foreground">Your generated assignment will appear here.</p>
                                </div>
                            )}
                        </CardContent>
                        {generatedAssignment && (
                             <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline">Export as PDF</Button>
                                <Button>Assign to Class <ArrowRight className="ml-2 h-4 w-4"/></Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}