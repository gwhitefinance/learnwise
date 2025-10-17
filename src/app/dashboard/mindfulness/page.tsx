
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wand2, Loader2, Zap, Wind, Coffee, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateMindfulnessExercise } from '@/lib/actions';
import type { GenerateMindfulnessExerciseOutput } from '@/ai/schemas/mindfulness-schema';

const feelings = [
    { name: 'Stressed', icon: <Zap /> },
    { name: 'Anxious', icon: <Wind /> },
    { name: 'Unfocused', icon: <Coffee /> },
];

export default function MindfulnessPage() {
    const [selectedFeeling, setSelectedFeeling] = useState<string>('Stressed');
    const [isLoading, setIsLoading] = useState(false);
    const [exercise, setExercise] = useState<GenerateMindfulnessExerciseOutput | null>(null);
    const { toast } = useToast();

    const handleGenerateExercise = async () => {
        setIsLoading(true);
        setExercise(null);
        try {
            const result = await generateMindfulnessExercise({ feeling: selectedFeeling });
            setExercise(result);
        } catch (error) {
            console.error("Failed to generate exercise:", error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Could not create a mindfulness exercise. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mindfulness & Well-being</h1>
                <p className="text-muted-foreground">
                    Take a moment to pause, breathe, and recenter your focus.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>How are you feeling right now?</CardTitle>
                    <CardDescription>Select a feeling to get a tailored mindfulness exercise.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {feelings.map(feeling => (
                            <button
                                key={feeling.name}
                                onClick={() => setSelectedFeeling(feeling.name)}
                                className={cn(
                                    "flex items-center justify-center gap-2 p-4 rounded-lg border text-lg font-semibold transition-all",
                                    selectedFeeling === feeling.name
                                        ? "border-primary bg-primary/10 ring-2 ring-primary text-primary"
                                        : "border-border hover:bg-muted"
                                )}
                            >
                                {feeling.icon}
                                {feeling.name}
                            </button>
                        ))}
                    </div>
                     <div className="flex justify-center mt-8">
                        <Button size="lg" onClick={handleGenerateExercise} disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                            ) : (
                                <><Wand2 className="mr-2 h-5 w-5" /> Generate a Mindful Moment</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {exercise && (
                 <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                             <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                                {exercise.type === 'Breathing' ? <Wind /> : exercise.type === 'Grounding' ? <Droplets /> : <Zap />}
                            </div>
                            <div>
                                <CardTitle className="text-blue-700">{exercise.title}</CardTitle>
                                <CardDescription>{exercise.type} Exercise</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">{exercise.exercise}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
