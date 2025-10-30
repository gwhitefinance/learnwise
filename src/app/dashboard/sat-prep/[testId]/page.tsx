
'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Trophy, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import practiceTestData from '@/lib/sat-practice-test.json';
import { cn } from '@/lib/utils';
import Loading from './loading';

type AnswerFeedback = { question: string; answer: string; correctAnswer: string; isCorrect: boolean; };
type TestResult = {
    id: string;
    userId: string;
    total: number;
    readingWriting: number;
    math: number;
    timestamp: { toDate: () => Date };
    answers: Record<string, string>;
};

type Question = {
    id: string;
    passage?: string;
    question: string;
    options?: string[];
    answer: string;
    type: 'multiple-choice' | 'grid-in';
};

const allQuestions: Question[] = [
    ...(practiceTestData.reading_writing.modules.flatMap(m => m.questions) as any),
    ...(practiceTestData.math.modules.flatMap(m => m.questions) as any)
];

export default function TestResultPage() {
    const params = useParams();
    const router = useRouter();
    const { testId } = params;
    const [user, authLoading] = useAuthState(auth);
    const [result, setResult] = useState<TestResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;
        if (!user && !authLoading) {
            router.push('/login');
            return;
        }

        const fetchResult = async () => {
            if (typeof testId !== 'string') return;
            const docRef = doc(db, 'satTestResults', testId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                setResult({ id: docSnap.id, ...docSnap.data() } as TestResult);
            } else {
                notFound();
            }
            setLoading(false);
        };

        fetchResult();

    }, [user, authLoading, testId, router]);


    if (loading || authLoading) {
        return <Loading />;
    }
    
    if (!result) {
        return notFound();
    }
    
    const incorrectAnswers = allQuestions.filter(q => result.answers[q.id] && result.answers[q.id] !== q.answer);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Button variant="ghost" onClick={() => router.push('/dashboard/sat-prep')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to SAT Prep Hub
            </Button>
            
            <Card className="w-full text-center p-8 mb-8">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
                        <Trophy className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-4xl mt-4">Test Results</CardTitle>
                    <CardDescription className="mt-2 text-lg">
                        Test taken on {new Date(result.timestamp.toDate()).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-7xl font-bold my-6 text-primary">{result.total}</div>
                    <div className="flex justify-around items-center text-lg mt-8">
                         <div className="text-center">
                            <p className="text-muted-foreground">Reading & Writing</p>
                            <p className="font-bold text-2xl">{result.readingWriting}</p>
                        </div>
                         <div className="text-center">
                            <p className="text-muted-foreground">Math</p>
                            <p className="font-bold text-2xl">{result.math}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <div className="space-y-6">
                <h2 className="text-2xl font-bold">Review Incorrect Answers ({incorrectAnswers.length})</h2>
                {incorrectAnswers.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {incorrectAnswers.map((question, index) => (
                            <AccordionItem value={`item-${index}`} key={question.id} className="border bg-card rounded-lg">
                                <AccordionTrigger className="p-4 text-left hover:no-underline">
                                    <span className="font-semibold flex-1">Question {index + 1}: {question.question.substring(0, 50)}...</span>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 pt-0 border-t">
                                    <div className="prose dark:prose-invert max-w-none mb-4">
                                        {question.passage && <p className="text-muted-foreground border-l-4 pl-4 italic">{question.passage}</p>}
                                        <p className="font-bold">{question.question}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 p-3 rounded-md bg-red-500/10 text-red-700">
                                            <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div><span className="font-semibold">Your Answer:</span> {result.answers[question.id] || "No answer"}</div>
                                        </div>
                                         <div className="flex items-start gap-2 p-3 rounded-md bg-green-500/10 text-green-700">
                                            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div><span className="font-semibold">Correct Answer:</span> {question.answer}</div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4"/>
                            <p className="font-semibold">No incorrect answers. Great job!</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
