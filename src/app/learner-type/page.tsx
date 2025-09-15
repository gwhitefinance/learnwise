
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
    question: "How do you prefer to learn new things?",
    options: {
      a: "By reading books, articles, and written instructions.",
      b: "By listening to someone explain it, like in a lecture or podcast.",
      c: "By watching videos, looking at diagrams, or seeing demonstrations.",
      d: "By jumping in and trying it myself, learning through hands-on practice.",
    },
    styles: { a: "Reading/Writing", b: "Auditory", c: "Visual", d: "Kinesthetic" },
  },
  {
    question: "When you are trying to remember a phone number, you are most likely to:",
    options: {
        a: "Visualize the numbers on a keypad as you dial.",
        b: "Say the numbers out loud to yourself, over and over.",
        c: "Write the numbers down or trace them with your finger.",
        d: "Associate the numbers with a pattern or rhythm.",
    },
    styles: { a: "Visual", b: "Auditory", c: "Kinesthetic", d: "Auditory" },
  },
  {
    question: "When assembling furniture, what are you most likely to do?",
    options: {
        a: "Read the instruction manual from start to finish before beginning.",
        b: "Have someone read the instructions to you while you work.",
        c: "Look at the diagrams and pictures to see how it fits together.",
        d: "Start putting pieces together and figure it out as you go.",
    },
    styles: { a: "Reading/Writing", b: "Auditory", c: "Visual", d: "Kinesthetic" },
  },
   {
    question: "How do you best remember someone's name after meeting them?",
    options: {
        a: "By seeing it written down.",
        b: "By repeating their name out loud when you talk to them.",
        c: "By picturing their face.",
        d: "By associating them with an action, like a firm handshake.",
    },
    styles: { a: "Reading/Writing", b: "Auditory", c: "Visual", d: "Kinesthetic" },
  },
  {
    question: "If you were learning a new dance step, you would prefer to:",
    options: {
        a: "Read a written description of the steps.",
        b: "Listen to the instructor count out the rhythm and call out the steps.",
        c: "Watch a video of someone doing the step multiple times.",
        d: "Jump in and physically try to follow along.",
    },
    styles: { a: "Reading/Writing", b: "Auditory", c: "Visual", d: "Kinesthetic" },
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
        const counts = { Visual: 0, Auditory: 0, Kinesthetic: 0, "Reading/Writing": 0 };
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
                    <p className="text-sm text-muted-foreground mb-2">Onboarding (4/4)</p>
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
