'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight, Rabbit, Snail, Turtle } from 'lucide-react';
import { motion } from 'framer-motion';

const paceOptions = [
  { value: "3", label: "Relaxed", description: "Learn at a comfortable pace over 3 months.", icon: <Snail className="h-6 w-6" /> },
  { value: "2", label: "Standard", description: "A balanced approach over 2 months.", icon: <Turtle className="h-6 w-6" /> },
  { value: "1", label: "Intensive", description: "A fast-paced, focused sprint over 1 month.", icon: <Rabbit className="h-6 w-6" /> },
];

export default function PacePage() {
    const [selectedPace, setSelectedPace] = useState<string | null>("2");
    const router = useRouter();
    const { toast } = useToast();

    const handleNext = () => {
        if (!selectedPace) {
            toast({
                variant: 'destructive',
                title: 'Please select a pace',
            });
            return;
        }
        
        localStorage.setItem('learningPace', selectedPace);
        router.push('/learner-type');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl px-8"
            >
                 <div className="mb-8">
                    <p className="text-sm text-muted-foreground mb-2">Onboarding (3/4)</p>
                    <Progress value={75} />
                 </div>

                <h1 className="text-4xl font-bold text-center mb-4">How quickly do you want to learn?</h1>
                <p className="text-center text-muted-foreground mb-12">This will help us schedule your roadmap and calendar events.</p>


                <RadioGroup value={selectedPace ?? ''} onValueChange={setSelectedPace}>
                    <div className="space-y-4">
                        {paceOptions.map(({ value, label, description, icon }) => (
                             <Label key={value} htmlFor={value} className={cn(
                                "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer text-lg",
                                selectedPace === value ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border hover:bg-muted"
                            )}>
                                <div className="text-primary">{icon}</div>
                                <RadioGroupItem value={value} id={value} className="sr-only" />
                                <div>
                                    <span className="font-semibold">{label}</span>
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                </div>
                            </Label>
                        ))}
                    </div>
                </RadioGroup>

                <div className="mt-12 flex justify-end">
                    <Button size="lg" onClick={handleNext} disabled={!selectedPace}>
                        Next
                       <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
