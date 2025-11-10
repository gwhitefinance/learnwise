
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
import { auth, db } from '@/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';


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
    const pageRange = searchParams.get('pageRange');

    useEffect(() => {
        const generateContent = async () => {
            if (!materialId || !materialName) {
                setError("Missing material information.");
                setIsLoading(false);
                return;
            }

            let fetchedContent = '';
            try {
                // Determine if it's a course or note and fetch content
                const courseDoc = await getDoc(doc(db, 'courses', materialId));
                if (courseDoc.exists()) {
                    const courseData = courseDoc.data();
                    fetchedContent = courseData.units?.flatMap((u: any) => u.chapters).map((c: any) => c.content).join('\n\n') || `Course content for ${courseData.name}`;
                } else {
                    const noteDoc = await getDoc(doc(db, 'notes', materialId));
                    if (noteDoc.exists()) {
                        fetchedContent = noteDoc.data().content;
                    } else {
                        throw new Error("Could not find the selected material.");
                    }
                }

                if (!fetchedContent.trim()) {
                    fetchedContent = `The user selected the topic "${materialName}". Please generate a tutoring session about it.`;
                }
                
                let fullPrompt = learningGoal;
                if (pageRange) {
                    fullPrompt += ` Please structure this session into ${pageRange} pages.`;
                }

                const result = await generateTextTutoringSession({
                    textContent: fetchedContent,
                    prompt: fullPrompt,
                    learnerType: (localStorage.getItem('learnerType') as any) || 'Reading/Writing'
                });
                setSessionContent(result);

            } catch (e: any) {
                console.error("Failed to generate session content:", e);
                setError(e.message || "Failed to generate your tutoring session. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        generateContent();
    }, [materialId, materialName, learningGoal, pageRange]);


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
        <div className="h-full w-full flex flex-col">
            <header className="flex-shrink-0 flex items-center justify-between p-3 border-b">
                <h2 className="text-xl font-bold">Taz</h2>
                <div className="flex items-center gap-2">
                    <Button variant="destructive" size="sm" onClick={() => router.push('/dashboard/taz-tutors')}>End Session</Button>
                    <Button variant="outline" size="sm"><Mic className="mr-2 h-4 w-4"/> Mute me</Button>
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
                <main className="col-span-9 flex flex-col items-center justify-center p-8 overflow-y-auto">
                    <div className="w-full max-w-2xl text-center">
                        <h1 className="text-4xl font-bold mb-4">Introduction to AI and machine learning on Databricks</h1>
                        <p className="text-lg text-muted-foreground">
                           {sessionContent.conceptualExplanation}
                        </p>
                    </div>
                    <div className="absolute bottom-8 right-8">
                        <AIBuddy className="w-24 h-24" />
                    </div>
                </main>
            </div>
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
