
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AIBuddy from '@/components/ai-buddy';
import { Clock, Play, HelpCircle, ArrowRight, MessageSquare, List, GitMerge, FileAudio, FileVideo, Search, Mic, X, Loader2 } from 'lucide-react';
import Loading from './loading';
import { format } from 'date-fns';
import { generateTextTutoringSession } from '@/lib/actions';
import { TutoringSessionOutput } from '@/ai/schemas/image-tutoring-schema';
import GeneratingTutorSession from './GeneratingTutorSession';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';


function TutorSession() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [user] = useAuthState(auth);

    const [isLoading, setIsLoading] = useState(true);
    const [sessionContent, setSessionContent] = useState<TutoringSessionOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const materialName = searchParams.get('materialName') || 'your material';
    const learningGoal = searchParams.get('learningGoal') || 'Understand the key concepts.';
    const materialId = searchParams.get('materialId');

    useEffect(() => {
        const generateContent = async () => {
            if (!materialId || !materialName) {
                setError("Missing material information.");
                setIsLoading(false);
                return;
            }

            // In a real app, you'd fetch the content of the materialId from a database
            // For now, we'll simulate it with the material name.
            const mockContent = `This is the content for ${materialName}. The learning goal is: ${learningGoal}`;
            
            try {
                const result = await generateTextTutoringSession({
                    textContent: mockContent,
                    prompt: learningGoal,
                    learnerType: 'Reading/Writing' // Or get from localStorage
                });
                setSessionContent(result);
            } catch (e) {
                console.error("Failed to generate session content:", e);
                setError("Failed to generate your tutoring session. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        generateContent();
    }, [materialId, materialName, learningGoal]);


    if (isLoading) {
        return <GeneratingTutorSession />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-center">
                <div>
                    <p className="text-red-500 font-semibold">{error}</p>
                    <Button onClick={() => router.push('/dashboard/taz-tutors')} className="mt-4">Go Back</Button>
                </div>
            </div>
        );
    }
    
    if (!sessionContent) {
        return (
             <div className="flex items-center justify-center h-full text-center">
                <p>Could not load session content.</p>
            </div>
        )
    }

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
                           {sessionContent.conceptualExplanation}
                        </p>
                    </div>
                </main>
                <aside className="col-span-3 border-l p-4 flex flex-col bg-muted/50">
                     <h3 className="font-semibold mb-4 flex-shrink-0">Session Transcript</h3>
                     <div className="flex-1 space-y-4 overflow-y-auto">
                        <div className="flex items-start gap-3">
                            <AIBuddy className="w-8 h-8 flex-shrink-0" />
                            <div className="p-3 rounded-lg bg-primary text-primary-foreground max-w-xs text-sm">
                                Alright, {user?.displayName}! Let's dive into the introduction to AI and machine learning on Databricks. We're looking at the first page of our material, which gives us an overview of the tools provided by Mosaic AI on the Databricks platform.
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
