
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { History, Crown, Paperclip, Code, Mic, Pen, Calculator, Sparkles, Loader2, PlayCircle, Bot, Pilcrow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { problemSolvingTool } from "@/ai/tools/problem-solving-tool";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AIBuddy from "@/components/ai-buddy";
import QRCode from 'qrcode.react';

type Solution = {
    answer: string;
    steps: string[];
}

export default function HomeworkSolverPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [question, setQuestion] = useState('');
    const [solution, setSolution] = useState<Solution | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        // We can only generate this on the client side
        setQrCodeUrl(`${window.location.origin}/upload-note/homework`);
    }, []);

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
        <div className="min-h-screen flex flex-col p-4 bg-background">
            <header className="flex justify-between items-center mb-6">
                 <div>
                    {/* The main dashboard layout provides the top header, so we only need the History button */}
                </div>
                 <Button variant="outline" className="rounded-full">
                    <History className="mr-2 h-4 w-4" />
                    History
                </Button>
            </header>

            <main className="w-full max-w-2xl mx-auto flex-1">
                <div className="w-full text-center mb-8">
                     <Button variant="outline" className="rounded-full bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                        <Sparkles className="mr-2 h-4 w-4"/> Ultra
                    </Button>
                    <h1 className="text-5xl font-bold tracking-tight mt-4">AI Homework Solver</h1>
                    <p className="text-muted-foreground mt-2">Type or upload a homework question and get detailed breakdown of the solution.</p>
                    
                    <div className="relative bg-card border rounded-2xl p-4 text-left shadow-lg mt-8">
                        <textarea
                            placeholder="Type your question here"
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
                                <Button variant="ghost" size="icon" className="rounded-full"><Pilcrow className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-full"><Calculator className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-full"><Mic className="h-5 w-5" /></Button>
                            </div>
                             <Button onClick={handleSolve} className="rounded-full px-8 py-3 font-semibold text-base" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Solve'}
                            </Button>
                        </div>
                    </div>

                    <div className="relative bg-card border rounded-2xl p-6 text-left shadow-lg mt-8 flex items-center gap-6">
                        <div className="bg-white p-2 rounded-lg">
                           {qrCodeUrl ? <QRCode value={qrCodeUrl} size={80} /> : <div className="h-[80px] w-[80px] bg-muted animate-pulse rounded-md" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Snap a photo of a problem on iOS & Android!</h4>
                            <p className="text-muted-foreground text-sm mt-1">Scan the QR code and download the Knowt app to snap and solve problems from your phone.</p>
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
                                    <p className="font-bold text-lg">{solution.answer}</p>
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
            <footer className="w-full max-w-2xl mx-auto text-center text-xs text-muted-foreground mt-8">
                 <p>By uploading your file to Knowt, you acknowledge that you agree to Knowt's Terms of Service and Community Guidelines.</p>
                 <p>Please be sure not to violate others' copyright or privacy rights. Learn more</p>
            </footer>
        </div>
    );
}
