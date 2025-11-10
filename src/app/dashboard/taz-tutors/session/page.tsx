'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AIBuddy from '@/components/ai-buddy';
import { Clock, Play, HelpCircle, ArrowRight, MessageSquare, List, GitMerge, FileAudio, FileVideo, Search, Mic, X } from 'lucide-react';
import Loading from './loading';
import { format } from 'date-fns';

function TutorSession() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const materialName = searchParams.get('materialName') || 'your material';
    const learningGoal = searchParams.get('learningGoal') || 'Understand the key concepts.';
    const pageRange = searchParams.get('pageRange') || 'All Pages';
    const materialTitle = `${materialName} ${pageRange !== 'All Pages' ? `(${pageRange} pages)` : ''}`;

    const handleStart = () => {
        // This is where the actual tutoring session would begin.
        // For now, it can just show a toast or log a message.
        console.log("Starting session...");
        router.push('/dashboard/notes/new'); // Navigate to the notes page for the session
    };

    return (
        <div className="h-screen w-screen bg-background flex flex-col">
            <header className="flex-shrink-0 flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="destructive" size="sm" onClick={() => router.push('/dashboard/taz-tutors')}>End Session</Button>
                    <Button variant="outline" size="sm"><Mic className="mr-2 h-4 w-4"/> Mute me</Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><List className="mr-2 h-4 w-4"/> Lesson Plan</Button>
                    <Button variant="outline" size="sm"><HelpCircle className="mr-2 h-4 w-4"/> Helpful Tips</Button>
                </div>
            </header>
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                <aside className="col-span-3 border-r p-4 overflow-y-auto">
                   <h3 className="font-semibold mb-4">Lesson Plan</h3>
                    <div className="space-y-2 text-sm">
                        <div className="p-2 rounded-md bg-muted font-semibold">Introduction to AI and Machine Learning</div>
                        <div className="p-2 rounded-md">Generative AI on Databricks</div>
                        <div className="p-2 rounded-md">Understanding Generative AI</div>
                    </div>
                </aside>
                <main className="col-span-6 flex flex-col items-center justify-center p-8 overflow-y-auto">
                    <div className="w-full max-w-2xl text-center">
                        <h1 className="text-4xl font-bold mb-4">Introduction to AI and machine learning on Databricks</h1>
                        <p className="text-lg text-muted-foreground">
                            This section introduces the tools that Mosaic AI (formerly Databricks Machine Learning) provides to help you build AI and ML systems. The following diagram shows how various products on Databricks platform help you implement your end to end workflows to build your own generative AI and ML systems
                        </p>
                    </div>
                </main>
                <aside className="col-span-3 border-l p-4 flex flex-col bg-muted/50">
                     <h3 className="font-semibold mb-4 flex-shrink-0">Session Transcript</h3>
                     <div className="flex-1 space-y-4 overflow-y-auto">
                        <div className="flex items-start gap-3">
                            <AIBuddy className="w-8 h-8 flex-shrink-0" />
                            <div className="p-3 rounded-lg bg-primary text-primary-foreground max-w-xs text-sm">
                                Alright, Averie! Let's dive into the introduction to AI and machine learning on Databricks. We're looking at the first page of our material, which gives us an overview of the tools provided by Mosaic AI on the Databricks platform.
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <AIBuddy className="w-8 h-8 flex-shrink-0" />
                            <div className="p-3 rounded-lg bg-primary text-primary-foreground max-w-xs text-sm">
                                This introduction gives us an idea of the workflow from data collection to deployment. Do you have any questions about this introduction, or shall we continue to the next page?
                            </div>
                        </div>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                             <AIBuddy className="w-6 h-6 flex-shrink-0" />
                            <span>Spark.E is awaiting your response</span>
                            <button className="underline font-semibold">just continue</button>
                         </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 flex gap-2">
                        <Button variant="outline" className="flex-1">Just continue</Button>
                        <Button variant="secondary" className="flex-1">Input a question</Button>
                    </div>
                </aside>
            </div>
             <footer className="p-2 border-t flex justify-end items-center text-sm text-muted-foreground">
                Page 1 of 7
            </footer>
        </div>
    );
}

export default function TutorSessionPage() {
    return (
        <Suspense fallback={<Loading />}>
            <TutorSession />
        </Suspense>
    )
}
