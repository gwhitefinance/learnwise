

'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { History, Crown, Paperclip, Mic, Pen, Calculator, Sparkles, Loader2, PlayCircle, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateProblemSolvingSession, analyzeImage } from "@/lib/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AIBuddy from "@/components/ai-buddy";
import QRCode from 'qrcode.react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Solution = {
    answer: string;
    steps: string[];
}

const CalculatorComponent = () => {
    const [display, setDisplay] = useState('0');
    const [currentValue, setCurrentValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const handleDigitClick = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const handleOperatorClick = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (currentValue === null) {
            setCurrentValue(inputValue);
        } else if (operator) {
            const result = performCalculation();
            setCurrentValue(result);
            setDisplay(String(result));
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };
    
    const performCalculation = (): number => {
        const inputValue = parseFloat(display);
        if (currentValue === null || operator === null) return inputValue;

        switch (operator) {
            case '+': return currentValue + inputValue;
            case '-': return currentValue - inputValue;
            case '*': return currentValue * inputValue;
            case '/': return currentValue / inputValue;
            default: return inputValue;
        }
    };

    const handleEqualsClick = () => {
        if (operator === null || currentValue === null) return;
        const result = performCalculation();
        setDisplay(String(result));
        setCurrentValue(null);
        setOperator(null);
        setWaitingForOperand(false);
    };
    
    const handleClear = () => {
        setDisplay('0');
        setCurrentValue(null);
        setOperator(null);
        setWaitingForOperand(false);
    };

    const handleDecimalClick = () => {
        if (waitingForOperand) {
             setDisplay('0.');
             setWaitingForOperand(false);
             return;
        }
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const buttonClasses = "h-16 text-xl bg-muted hover:bg-muted/80";

    return (
        <div className="p-4 space-y-2 bg-background rounded-lg">
            <div className="bg-muted text-right p-4 rounded-lg text-4xl font-mono break-all">{display}</div>
            <div className="grid grid-cols-4 gap-2">
                <Button onClick={handleClear} className={cn(buttonClasses, "col-span-2 bg-destructive/80 hover:bg-destructive text-white")}>AC</Button>
                <Button onClick={() => setDisplay(String(parseFloat(display) * -1))} className={buttonClasses}>+/-</Button>
                <Button onClick={() => handleOperatorClick('/')} className={cn(buttonClasses, "bg-primary/80 hover:bg-primary text-white")}>÷</Button>
                
                {['7','8','9'].map(d => <Button key={d} onClick={() => handleDigitClick(d)} className={buttonClasses}>{d}</Button>)}
                <Button onClick={() => handleOperatorClick('*')} className={cn(buttonClasses, "bg-primary/80 hover:bg-primary text-white")}>×</Button>

                {['4','5','6'].map(d => <Button key={d} onClick={() => handleDigitClick(d)} className={buttonClasses}>{d}</Button>)}
                <Button onClick={() => handleOperatorClick('-')} className={cn(buttonClasses, "bg-primary/80 hover:bg-primary text-white")}>−</Button>

                {['1','2','3'].map(d => <Button key={d} onClick={() => handleDigitClick(d)} className={buttonClasses}>{d}</Button>)}
                <Button onClick={() => handleOperatorClick('+')} className={cn(buttonClasses, "bg-primary/80 hover:bg-primary text-white")}>+</Button>

                <Button onClick={() => handleDigitClick('0')} className={cn(buttonClasses, "col-span-2")}>0</Button>
                <Button onClick={handleDecimalClick} className={buttonClasses}>.</Button>
                <Button onClick={handleEqualsClick} className={cn(buttonClasses, "bg-primary/80 hover:bg-primary text-white")}>=</Button>
            </div>
        </div>
    )
}


export default function HomeworkSolverPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [question, setQuestion] = useState('');
    const [solution, setSolution] = useState<Solution | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        setQrCodeUrl(`${window.location.origin}/upload-note/homework`);
    }, []);
    
     useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setQuestion(transcript);
                setIsListening(false);
                toast({ title: "Question captured!" });
            };
            
            recognitionRef.current.onerror = (event: any) => {
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    toast({ variant: 'destructive', title: 'Voice recognition error.' });
                }
                setIsListening(false);
            };
            
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [toast]);

    const handleSolve = async () => {
        if (!question.trim()) {
            toast({ variant: 'destructive', title: 'Please enter a question.' });
            return;
        }
        setIsLoading(true);
        setSolution(null);
        try {
            const result = await generateProblemSolvingSession({ topic: question });
            setSolution(result);
        } catch (error) {
            console.error("Error solving problem:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not get a solution.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsLoading(true);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const imageDataUri = reader.result as string;
                try {
                    const result = await analyzeImage({ imageDataUri, prompt: 'Extract the text from this homework problem.' });
                    setQuestion(result.analysis);
                    toast({ title: 'Image analyzed successfully!' });
                } catch (err) {
                    toast({ variant: 'destructive', title: 'Analysis failed.', description: 'Could not extract text from the image.'});
                } finally {
                    setIsLoading(false);
                }
            };
        }
    };

    const handleMicClick = () => {
        if (!recognitionRef.current) {
            toast({ variant: 'destructive', title: 'Voice input not supported in this browser.' });
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            toast({ title: 'Listening...', description: 'Please state your question.' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-4 bg-white">
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <header className="flex justify-between items-center mb-6">
                 <div>
                </div>
                 <Button variant="outline" className="rounded-full">
                    <History className="mr-2 h-4 w-4" />
                    History
                </Button>
            </header>

            <main className="w-full max-w-2xl mx-auto flex-1">
                <div className="w-full text-center mb-8">
                     <Button variant="outline" className="rounded-full bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                        <Sparkles className="mr-2 h-4 w-4"/> Taz Helps
                    </Button>
                    <h1 className="text-5xl font-bold tracking-tight mt-4">Taz Homework Help</h1>
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
                                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                 <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full"><Calculator className="h-5 w-5" /></Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-xs p-2">
                                        <DialogHeader>
                                            <DialogTitle>Calculator</DialogTitle>
                                        </DialogHeader>
                                        <CalculatorComponent />
                                    </DialogContent>
                                </Dialog>
                                <Button asChild variant="ghost" size="icon" className="rounded-full">
                                    <Link href="/dashboard/whiteboard"><Pen className="h-5 w-5" /></Link>
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full" onClick={handleMicClick}>
                                    <Mic className={cn("h-5 w-5", isListening && "text-primary animate-pulse")} />
                                </Button>
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
                            <h4 className="font-bold text-lg">Scan the QR code to snap a pic of your homework and get help</h4>
                            <p className="text-muted-foreground text-sm mt-1">Use your phone to upload an image of your homework.</p>
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
        </div>
    );
}
