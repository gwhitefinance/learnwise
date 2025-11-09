'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Crown, Paperclip, Code, Mic, Pen, Calculator, Sparkles, Loader2, PlayCircle, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { problemSolvingTool } from "@/ai/tools/problem-solving-tool";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import AIBuddy from "@/components/ai-buddy";

type Solution = {
    solution: string;
    steps: string[];
}

export default function HomeworkSolverPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [question, setQuestion] = useState('');
    const [solution, setSolution] = useState<Solution | null>(null);

    const handleSolve = async () => {
        if (!question.trim()) {
            toast({ variant: 'destructive', title: 'Please enter a question.' });
            return;
        }
        setIsLoading(true);
        setSolution(null);
        try {
            const result = await problemSolvingTool({ problem: question });
            setSolution(result);
        } catch (error) {
            console.error("Error solving problem:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not get a solution.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-4">
            <header className="flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-2xl font-bold tracking-tight">Snap & Solve Solution</h1>
                    <p className="text-muted-foreground text-sm">Home &gt; Snap & Solve Solution</p>
                </div>
                 <Button variant="outline" className="rounded-full">
                    <History className="mr-2 h-4 w-4" />
                    History
                </Button>
            </header>

            <main className="w-full max-w-2xl mx-auto">
                <div className="w-full text-center mb-8">
                     <div className="relative bg-card border rounded-2xl p-4 text-left shadow-lg">
                        <textarea
                            placeholder="If 3x – 5 = 16, what is the value of 6x + 4?"
                            className="w-full h-24 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-lg placeholder:text-muted-foreground"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSolve();
                                }
                            }}
                        />
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Button variant="ghost" size="icon" className="rounded-full"><Paperclip className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-full"><Code className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-full"><Calculator className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-full"><Pen className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-full"><Mic className="h-5 w-5" /></Button>
                            </div>
                             <Button onClick={handleSolve} className="rounded-full px-8 py-3 font-semibold text-base" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                Solve
                            </Button>
                        </div>
                    </div>
                </div>
                
                {isLoading && (
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground mt-2">Tutorin is thinking...</p>
                    </div>
                )}

                {solution && (
                     <div className="space-y-6">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <Avatar><AvatarFallback>Y</AvatarFallback></Avatar>
                                <div>
                                    <p className="text-sm font-semibold">You</p>
                                    <p>{question}</p>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <AIBuddy className="h-10 w-10"/>
                                <div>
                                    <p className="text-sm font-semibold">Tutorin's Answer</p>
                                    <p className="font-bold text-lg">{solution.solution}</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="hover:bg-muted transition-colors cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <PlayCircle />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Watch a video</p>
                                        <p className="text-sm text-muted-foreground">to learn how to solve this step-by-step</p>
                                    </div>
                                </CardContent>
                            </Card>
                             <Card className="hover:bg-muted transition-colors cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                     <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <Bot />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Practice questions</p>
                                        <p className="text-sm text-muted-foreground">instantly with feedback</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {solution.steps.map((step, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="text-lg">Step {index + 1}:</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{step}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}