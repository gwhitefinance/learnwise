'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AIBuddy from '@/components/ai-buddy';
import { Clock, Play, HelpCircle, ArrowRight, MessageSquare, List, GitMerge, FileAudio, FileVideo, Search, Mic, X } from 'lucide-react';
import Loading from './loading';
import { format } from 'date-fns';

const voiceCommands = [
    { icon: <Play className="h-5 w-5" />, title: "Start Session", description: "Say \"let's start\" or \"begin session\" to kick things off" },
    { icon: <HelpCircle className="h-5 w-5" />, title: "Ask Questions", description: "Ask for clarification or a deeper explanation on any topic" },
    { icon: <ArrowRight className="h-5 w-5" />, title: "Navigate Content", description: "Use commands like \"next page\" or \"go back to the introduction\"" },
    { icon: <MessageSquare className="h-5 w-5" />, title: "Chat Naturally", description: "Interact with Spark.E as you would with a real tutor" },
    { icon: <List className="h-5 w-5" />, title: "Check Progress", description: "Ask \"how am I doing?\" to get a quick progress update" },
    { icon: <GitMerge className="h-5 w-5" />, title: "Complete Section", description: "Ask to \"mark section complete\" to track your progress" },
    { icon: <FileAudio className="h-5 w-5" />, title: "Adjust Speech", description: "Say \"speak faster\" or \"slow down\" to control the pace" },
    { icon: <FileVideo className="h-5 w-5" />, title: "Request Visuals", description: "Ask Spark.E to \"show me a diagram\" or \"find a video\"" },
];

function SessionReady() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const materialName = searchParams.get('materialName') || 'your material';
    const learningGoal = searchParams.get('learningGoal') || 'Understand the key concepts.';
    const pageRange = searchParams.get('pageRange');
    
    const materialTitle = `${materialName} ${pageRange ? `(${pageRange} pages)` : ''}`;

    const handleStart = () => {
        // Reconstruct query params for the actual session page
        const queryParams = new URLSearchParams({
            materialId: searchParams.get('materialId') || '',
            materialName: materialName,
            learningGoal: learningGoal,
        });
         if (pageRange) {
            queryParams.set('pageRange', pageRange);
        }
        router.push(`/dashboard/taz-tutors/session?${queryParams.toString()}`);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto">
                    <AIBuddy />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Your tutoring session is ready!</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Session Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Your Material:</h3>
                        <p className="text-muted-foreground">{materialTitle}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Your Learning Goal:</h3>
                        <p className="text-muted-foreground">{learningGoal}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Helpful Tips & Voice Commands</CardTitle>
                    <CardDescription>Get the most out of your session by using these voice commands.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {voiceCommands.map((command, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="p-3 bg-muted rounded-full">
                                    {command.icon}
                                </div>
                                <div>
                                    <h4 className="font-semibold">{command.title}</h4>
                                    <p className="text-sm text-muted-foreground">{command.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            <div className="text-center mt-8">
                <Button size="lg" onClick={handleStart}>
                    Start Session
                </Button>
            </div>
        </div>
    );
}

export default function SessionReadyPage() {
    return (
        <Suspense fallback={<Loading />}>
            <SessionReady />
        </Suspense>
    )
}
