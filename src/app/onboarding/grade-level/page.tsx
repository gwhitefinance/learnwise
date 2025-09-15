
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight, School, Building, GraduationCap, User } from 'lucide-react';
import { motion } from 'framer-motion';

const gradeLevels = [
  { value: "Elementary", label: "Elementary School", icon: <School className="h-6 w-6" /> },
  { value: "Junior High", label: "Junior High", icon: <Building className="h-6 w-6" /> },
  { value: "High School", label: "High School", icon: <Building className="h-6 w-6" /> },
  { value: "College", label: "College", icon: <GraduationCap className="h-6 w-6" /> },
  { value: "Other", label: "Other", icon: <User className="h-6 w-6" /> },
];

export default function GradeLevelPage() {
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const handleNext = () => {
        if (!selectedGrade) {
            toast({
                variant: 'destructive',
                title: 'Please make a selection',
                description: 'You must choose a grade level to continue.',
            });
            return;
        }
        
        localStorage.setItem('onboardingGradeLevel', selectedGrade);

        if (['Elementary', 'Junior High', 'High School'].includes(selectedGrade)) {
            router.push('/onboarding/grade');
        } else {
            router.push('/onboarding/interests');
        }
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
                    <p className="text-sm text-muted-foreground mb-2">Onboarding (1/4)</p>
                    <Progress value={25} />
                 </div>

                <h1 className="text-4xl font-bold text-center mb-12">What is your current grade level?</h1>

                <RadioGroup value={selectedGrade ?? ''} onValueChange={setSelectedGrade}>
                    <div className="space-y-4">
                        {gradeLevels.map(({ value, label, icon }) => (
                             <Label key={value} htmlFor={value} className={cn(
                                "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer text-lg",
                                selectedGrade === value ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border hover:bg-muted"
                            )}>
                                <div className="text-primary">{icon}</div>
                                <RadioGroupItem value={value} id={value} className="sr-only" />
                                <span>{label}</span>
                            </Label>
                        ))}
                    </div>
                </RadioGroup>

                <div className="mt-12 flex justify-end">
                    <Button size="lg" onClick={handleNext} disabled={!selectedGrade}>
                        Next
                       <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
