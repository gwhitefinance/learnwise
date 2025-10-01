'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GradeSpecificPage() {
    const [grade, setGrade] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    const handleNext = () => {
        if (!grade.trim()) {
            toast({
                variant: 'destructive',
                title: 'Please enter your grade',
            });
            return;
        }
        
        localStorage.setItem('onboardingSpecificGrade', grade);
        router.push('/onboarding/interests');
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
                    <p className="text-sm text-muted-foreground mb-2">Onboarding (1.5/4)</p>
                    <Progress value={37.5} />
                 </div>

                <h1 className="text-4xl font-bold text-center mb-12">What grade are you in?</h1>

                <div className="relative max-w-sm mx-auto">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        type="text" 
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="e.g., 5, 9, 12"
                        className="pl-10 text-center text-lg h-12"
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    />
                </div>

                <div className="mt-12 flex justify-end">
                    <Button size="lg" onClick={handleNext} disabled={!grade}>
                        Next
                       <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
