
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const questions = [
  {
    question: "How do you prefer to learn?",
    options: {
      a: "I like to read and write notes",
      b: "I like to listen to lectures or podcasts",
      c: "I like to watch videos or demonstrations",
      d: "I like to learn by doing and practicing",
    },
    styles: { a: "Visual", b: "Auditory", c: "Visual", d: "Kinesthetic" },
  },
  {
    question: "When you are trying to remember a phone number, you are most likely to:",
    options: {
        a: "Visualize the numbers on a keypad.",
        b: "Say the numbers out loud to yourself.",
        c: "Write the numbers down or trace them with your finger.",
    },
    styles: { a: "Visual", b: "Auditory", c: "Kinesthetic" },
  },
  {
    question: "What's your favorite way to get news?",
    options: {
        a: "Reading articles in a newspaper or online.",
        b: "Listening to a news radio station or podcast.",
        c: "Watching news broadcasts on TV.",
    },
    styles: { a: "Visual", b: "Auditory", c: "Visual" }, // Watching is visual
  },
   {
    question: "When you get a new gadget, you first:",
    options: {
        a: "Read the instruction manual carefully.",
        b: "Ask someone to explain how to use it.",
        c: "Start pressing buttons and figure it out as you go.",
    },
    styles: { a: "Visual", b: "Auditory", c: "Kinesthetic" },
  },
  {
    question: "If you were learning a new dance step, you would prefer to:",
    options: {
        a: "Watch a video of someone doing the step.",
        b: "Listen to the instructor count out the rhythm and steps.",
        c: "Jump in and try to follow along with the movements.",
    },
    styles: { a: "Visual", b: "Auditory", c: "Kinesthetic" },
  }
];


export default function LearnerTypeQuizPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const handleNext = () => {
        if (selectedAnswer === null) {
            toast({
                variant: 'destructive',
                title: 'Please select an answer',
                description: 'You must choose an option to continue.',
            });
            return;
        }

        const newAnswers = { ...answers, [currentQuestionIndex]: selectedAnswer };
        setAnswers(newAnswers);
        setSelectedAnswer(null);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // End of quiz, calculate result
            calculateResult(newAnswers);
        }
    };

    const calculateResult = (finalAnswers: Record<number, string>) => {
        const counts = { Visual: 0, Auditory: 0, Kinesthetic: 0 };
        questions.forEach((q, i) => {
            const answer = finalAnswers[i];
            const style = q.styles[answer as keyof typeof q.styles] as keyof typeof counts;
            if(style) {
                counts[style]++;
            }
        });

        const dominantStyle = Object.keys(counts).reduce((a, b) =>
            counts[a as keyof typeof counts] > counts[b as keyof typeof counts] ? a : b
        );

        localStorage.setItem('learnerType', dominantStyle);
        toast({
            title: 'Quiz Complete!',
            description: `You are a ${dominantStyle} learner. Redirecting you to your personalized dashboard...`,
        });

        // Redirect to dashboard, which will then be customized
        router.push('/dashboard');
    };

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <div className="w-full max-w-2xl px-8">
                 <div className="mb-8">
                    <p className="text-sm text-muted-foreground mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    <Progress value={progress} />
                 </div>

                <h1 className="text-4xl font-bold text-center mb-12">{currentQuestion.question}</h1>

                <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer}>
                    <div className="space-y-4">
                        {Object.entries(currentQuestion.options).map(([key, option]) => (
                             <Label key={key} htmlFor={key} className={cn(
                                "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer text-lg",
                                selectedAnswer === key ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border hover:bg-muted"
                            )}>
                                <RadioGroupItem value={key} id={key} />
                                <span>{option}</span>
                            </Label>
                        ))}
                    </div>
                </RadioGroup>

                <div className="mt-12 flex justify-end">
                    <Button size="lg" onClick={handleNext}>
                        {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish & Go to Dashboard'}
                       <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
