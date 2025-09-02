
'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz, GenerateQuizInput } from '@/ai/flows/quiz-flow';

const suggestedTopics = ["Mathematics", "Science", "History", "Literature", "Computer Science"];

export default function PracticeQuizPage() {
    const [topics, setTopics] = useState('');
    const [questionType, setQuestionType] = useState('Multiple Choice');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState('10');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerateQuiz = async () => {
        if (!topics.trim()) {
            toast({
                variant: 'destructive',
                title: 'Topics are required',
                description: 'Please enter some topics or keywords for your quiz.',
            });
            return;
        }

        setIsLoading(true);
        try {
            const input: GenerateQuizInput = {
                topics,
                questionType: questionType as 'Multiple Choice' | 'True/False' | 'Short Answer',
                difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
                numQuestions: parseInt(numQuestions),
            };
            const quiz = await generateQuiz(input);
            // TODO: Display the generated quiz
            console.log(quiz);
             toast({
                title: 'Quiz Generated!',
                description: 'Your quiz is ready.',
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate quiz. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="flex flex-col items-center">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold">Practice Quiz</h1>
                <p className="text-muted-foreground mt-2">Generate a customized quiz to test your knowledge.</p>
            </div>

            <Card className="w-full max-w-3xl">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <Label htmlFor="topics" className="text-sm font-medium">Enter Topics or Keywords</Label>
                            <Input 
                                id="topics" 
                                placeholder="e.g., Photosynthesis, World War II" 
                                className="mt-2"
                                value={topics}
                                onChange={(e) => setTopics(e.target.value)}
                            />
                        </div>
                        <div>
                             <Label className="text-sm font-medium">Or Select a Suggested Area</Label>
                             <div className="flex flex-wrap gap-2 mt-2">
                                {suggestedTopics.map(topic => (
                                    <Button key={topic} variant="outline" size="sm" onClick={() => setTopics(prev => prev ? `${prev}, ${topic}` : topic)}>
                                        {topic}
                                    </Button>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quiz Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="question-type">Question Type</Label>
                                <Select value={questionType} onValueChange={setQuestionType}>
                                    <SelectTrigger id="question-type" className="mt-2">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                        <SelectItem value="True/False">True/False</SelectItem>
                                        <SelectItem value="Short Answer">Short Answer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="difficulty">Difficulty Level</Label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger id="difficulty" className="mt-2">
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="num-questions">Number of Questions</Label>
                                <Select value={numQuestions} onValueChange={setNumQuestions}>
                                    <SelectTrigger id="num-questions" className="mt-2">
                                        <SelectValue placeholder="Select number" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <Button onClick={handleGenerateQuiz} disabled={isLoading}>
                            {isLoading ? 'Generating...' : 'Generate Quiz'}
                            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
