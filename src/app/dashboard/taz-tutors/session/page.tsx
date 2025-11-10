'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AIBuddy from '@/components/ai-buddy';
import { Clock, Play, HelpCircle, ArrowRight, MessageSquare, List, GitMerge, FileAudio, FileVideo } from 'lucide-react';
import Loading from './loading';
import { format } from 'date-fns';

const tips = [
    { icon: <HelpCircle className="h-5 w-5" />, title: "Ask for a Quiz", description: "Say \"Give me a quiz question\" and Spark.E will test your knowledge of the material" },
    { icon: <ArrowRight className="h-5 w-5" />, title: "Change Page", description: "Simply say \"change page\" and Spark.E will navigate to your requested page" },
    { icon: <FileAudio className="h-5 w-5" />, title: "Adjust Speaking Speed", description: "Say \"speak faster\" or \"speak slower\" to adjust Spark.E's speaking pace" },
    { icon: <FileVideo className="h-5 w-5" />, title: "Skip Current Speech", description: "Say \"skip\" or \"skip current ramble\" to move on to the next topic" },
    { icon: <Search className="h-5 w-5" />, title: "Find Topic or Page", description: "Mention any topic or page number and Spark.E will locate the relevant page for you" },
    { icon: <List className="h-5 w-5" />, title: "Show Lesson Plan", description: "Ask to \"show lesson plan\" to see your learning progress" },
    { icon: <GitMerge className="h-5 w-5" />, title: "Complete Section", description: "Ask to \"mark section complete\" to track your progress" },
    { icon: <MessageSquare className="h-5 w-5" />, title: "Interrupt Anytime", description: "Feel free to interrupt Spark.E at any time - just start speaking" },
]

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
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto">
                    <AIBuddy />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{materialTitle}</h1>
            </div>

            <Card>
                <CardContent className="p-6 flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-lg">Learning Goal</h2>
                        <p className="text-muted-foreground">{learningGoal}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(), 'PP, p')}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-lg">Ready to Start</h2>
                        <p className="text-muted-foreground">Begin your personalized learning experience.</p>
                    </div>
                    <Button size="lg" onClick={handleStart}>
                        <Play className="mr-2 h-5 w-5" />
                        Start Session
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        Helpful Tips
                        <Button variant="outline" size="sm">Voice Commands</Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tips.map(tip => (
                        <div key={tip.title} className="flex items-start gap-4">
                            <div className="p-2 bg-muted rounded-full text-primary">
                                {tip.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold">{tip.title}</h3>
                                <p className="text-sm text-muted-foreground">{tip.description}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
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
