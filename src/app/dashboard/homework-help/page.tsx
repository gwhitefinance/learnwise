
'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Crown, Paperclip, Code, Mic, Pen, Calculator } from "lucide-react";

export default function HomeworkSolverPage() {
    return (
        <div className="bg-[#1C1C1E] text-white min-h-screen flex flex-col items-center justify-center p-4 relative">
            <div className="absolute top-8 left-8">
                <Button variant="outline" className="rounded-full bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700 text-white">
                    <History className="mr-2 h-4 w-4" />
                    History
                </Button>
            </div>

            <div className="w-full max-w-2xl text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                     <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        <Crown className="mr-1 h-3 w-3" />
                        Ultra
                    </Badge>
                </div>
                <h1 className="text-5xl font-bold tracking-tight">AI Homework Solver</h1>
                <p className="text-muted-foreground mt-4 max-w-md mx-auto">
                    Type or upload a homework question and get a detailed breakdown of the solution.
                </p>

                <div className="mt-12">
                    <div className="relative bg-neutral-800/50 border border-neutral-700 rounded-2xl p-4 text-left">
                        <textarea
                            placeholder="Type your question here"
                            className="w-full h-32 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-lg placeholder:text-neutral-500"
                        />
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full bg-neutral-700/60 hover:bg-neutral-700 text-neutral-400">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                 <Button variant="ghost" size="icon" className="rounded-full bg-neutral-700/60 hover:bg-neutral-700 text-neutral-400">
                                    <Code className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full bg-neutral-700/60 hover:bg-neutral-700 text-neutral-400">
                                    <Calculator className="h-5 w-5" />
                                </Button>
                                 <Button variant="ghost" size="icon" className="rounded-full bg-neutral-700/60 hover:bg-neutral-700 text-neutral-400">
                                    <Pen className="h-5 w-5" />
                                </Button>
                                 <Button variant="ghost" size="icon" className="rounded-full bg-neutral-700/60 hover:bg-neutral-700 text-neutral-400">
                                    <Mic className="h-5 w-5" />
                                </Button>
                            </div>
                             <Button className="rounded-full px-8 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold">
                                Solve
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
