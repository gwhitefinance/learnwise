
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight, Rabbit, Snail, Turtle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const paces = [
  { value: "6", label: "Casual", description: "A relaxed pace, perfect for exploring topics without pressure.", icon: <Snail className="h-6 w-6" /> },
  { value: "3", label: "Steady", description: "A balanced pace for consistent and thorough learning.", icon: <Turtle className="h-6 w-6" /> },
  { value: "1", label: "Intense", description: "A fast-paced schedule for when you need to learn quickly.", icon: <Rabbit className="h-6 w-6" /> },
];

export default function PacePage() {
    const [selectedPace, setSelectedPace] = useState<string | null>("3");
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
        router.push('/onboarding/learner-type');
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

                <h1 className="text-4xl font-bold text-center mb-12">How quickly do you want to learn?</h1>

                <RadioGroup value={selectedPace ?? ''} onValueChange={setSelectedPace}>
                    <div className="space-y-4">
                        {paces.map(({ value, label, icon, description }) => (
                             <Label key={value} htmlFor={value} className={cn(
                                "flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                selectedPace === value ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border hover:bg-muted"
                            )}>
                                <RadioGroupItem value={value} id={value} className="mt-1" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {icon}
                                        <span className="font-semibold text-lg">{label}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
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
