
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wand2, Loader2, Zap, Wind, Coffee, Droplets, Smile, Meh, Frown, Sparkles, Sprout, Flower, Leaf, Edit, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateMindfulnessExercise } from '@/lib/actions';
import type { GenerateMindfulnessExerciseOutput } from '@/ai/schemas/mindfulness-schema';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

const feelings = [
    { name: 'Stressed', icon: <Zap /> },
    { name: 'Anxious', icon: <Wind /> },
    { name: 'Unfocused', icon: <Coffee /> },
    { name: 'Sad', icon: <Frown /> },
    { name: 'Okay', icon: <Meh /> },
    { name: 'Happy', icon: <Smile /> },
];

const gardenLevels = [
    { threshold: 0, icon: <div className="h-16 w-16 rounded-full bg-yellow-900/50 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-yellow-200"></div></div>, label: "Awaiting Seed" },
    { threshold: 1, icon: <Sprout className="h-16 w-16 text-green-400" />, label: "A single sprout appears." },
    { threshold: 5, icon: <Leaf className="h-16 w-16 text-green-500" />, label: "A small plant is growing." },
    { threshold: 10, icon: <Flower className="h-16 w-16 text-pink-400" />, label: "Your garden is blooming!" },
    { threshold: 20, icon: <Sparkles className="h-16 w-16 text-yellow-400" />, label: "Your garden is flourishing!" },
];

export default function MindfulnessPage() {
    const [selectedFeeling, setSelectedFeeling] = useState<string>('Stressed');
    const [isLoading, setIsLoading] = useState(false);
    const [exercise, setExercise] = useState<GenerateMindfulnessExerciseOutput | null>(null);
    const [gardenCount, setGardenCount] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        const count = parseInt(localStorage.getItem('mindfulnessGardenCount') || '0', 10);
        setGardenCount(count);
    }, []);

    const handleGenerateExercise = async () => {
        setIsLoading(true);
        setExercise(null);
        try {
            const result = await generateMindfulnessExercise({ feeling: selectedFeeling });
            setExercise(result);
            
            const newCount = gardenCount + 1;
            setGardenCount(newCount);
            localStorage.setItem('mindfulnessGardenCount', String(newCount));

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
    
    const currentGardenLevel = gardenLevels.slice().reverse().find(level => gardenCount >= level.threshold) || gardenLevels[0];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mindfulness Garden</h1>
                <p className="text-muted-foreground">
                    Take a moment to pause, breathe, and tend to your inner garden.
                </p>
            </div>
            
             <Card className="bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10">
                <CardHeader>
                    <CardTitle>Your Garden's Progress</CardTitle>
                    <CardDescription>Each mindfulness session helps your garden grow.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center p-8">
                    <motion.div
                        key={currentGardenLevel.label}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring' }}
                    >
                        {currentGardenLevel.icon}
                    </motion.div>
                    <p className="mt-4 font-semibold">{currentGardenLevel.label}</p>
                    <p className="text-sm text-muted-foreground">{gardenCount} sessions completed</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>How are you feeling right now?</CardTitle>
                        <CardDescription>Select a feeling to get a tailored mindfulness exercise.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {feelings.map(feeling => (
                                <button
                                    key={feeling.name}
                                    onClick={() => setSelectedFeeling(feeling.name)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border text-lg font-semibold transition-all aspect-square",
                                        selectedFeeling === feeling.name
                                            ? "border-primary bg-primary/10 ring-2 ring-primary text-primary"
                                            : "border-border hover:bg-muted"
                                    )}
                                >
                                    {feeling.icon}
                                    <span className="text-sm">{feeling.name}</span>
                                </button>
                            ))}
                        </div>
                         <div className="flex justify-center mt-8">
                            <Button size="lg" onClick={handleGenerateExercise} disabled={isLoading}>
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                                ) : (
                                    <><Wand2 className="mr-2 h-5 w-5" /> Get Mindful Moment</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Daily Reflection</CardTitle>
                        <CardDescription>Take a moment for gratitude and creative expression.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Gratitude Journal</h4>
                            <Textarea placeholder="What are three things you're grateful for today?" />
                        </div>
                        <div>
                             <h4 className="font-semibold text-sm mb-2">Draw Your Feelings</h4>
                             <Link href="/dashboard/whiteboard" className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Edit className="mr-2 h-4 w-4" /> Open Doodle Canvas
                                </Button>
                             </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AnimatePresence>
            {exercise && (
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                 >
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
                 </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}
