
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

const questions = [
  {
    question: "When you are learning something new, what helps you the most?",
    options: {
      a: "Watching a demonstration or looking at diagrams.",
      b: "Listening to someone explain it to you.",
      c: "Trying it out for yourself.",
    },
    styles: { a: "Visual", b: "Auditory", c: "Kinesthetic" },
  },
  {
    question: "What do you remember most from a movie?",
    options: {
      a: "The scenery and the way it looked.",
      b: "The soundtrack and the dialogue.",
      c: "The feelings you had while watching it.",
    },
    styles: { a: "Visual", b: "Auditory", c: "Kinesthetic" },
  },
  {
    question: "When assembling furniture, what are you most likely to do?",
    options: {
      a: "Follow the diagrams and illustrations carefully.",
      b: "Have someone read the instructions to you.",
      c: "Jump right in and figure it out as you go.",
    },
    styles: { a: "Visual", b: "Auditory", c: "Kinesthetic" },
  },
];

export default function LearnerTypePage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length !== questions.length) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Test',
        description: 'Please answer all questions before submitting.',
      });
      return;
    }

    const counts = { Visual: 0, Auditory: 0, Kinesthetic: 0 };
    questions.forEach((q, i) => {
      const answer = answers[i];
      const style = q.styles[answer as keyof typeof q.styles] as keyof typeof counts;
      counts[style]++;
    });

    const dominantStyle = Object.keys(counts).reduce((a, b) => 
      counts[a as keyof typeof counts] > counts[b as keyof typeof counts] ? a : b
    );
    
    setResult(dominantStyle);
    localStorage.setItem('learnerType', dominantStyle);
    toast({
      title: 'Test Complete!',
      description: `You are a ${dominantStyle} learner. The AI will now tailor its responses to your learning style.`,
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Learner Type Test</h1>
      <Card>
        <CardHeader>
          <CardTitle>Discover Your Learning Style</CardTitle>
          <CardDescription>
            Answer the questions below to find out what type of learner you are.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="space-y-2">
              <p className="font-medium">{i + 1}. {q.question}</p>
              <RadioGroup onValueChange={(value) => handleAnswerChange(i, value)}>
                {Object.entries(q.options).map(([key, option]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`q${i}-${key}`} />
                    <Label htmlFor={`q${i}-${key}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
          <Button onClick={handleSubmit}>Submit Answers</Button>
          {result && (
            <div className="pt-4">
              <h3 className="text-lg font-semibold">Your Result:</h3>
              <p className="text-xl font-bold text-primary">{result}</p>
              <p className="text-muted-foreground">The AI chat will now be personalized based on your learning style.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
