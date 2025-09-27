
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Lightbulb, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

type QuizAttempt = {
  id: string;
  userId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  topic: string;
  isCorrect: boolean;
};

function AnalysisPage() {
  const [learnerType, setLearnerType] = useState('Visual');
  const [loading, setLoading] = useState(true);
  const [weakestTopic, setWeakestTopic] = useState<string | null>(null);
  const [topicStats, setTopicStats] = useState<Record<string, { correct: number, incorrect: number }>>({});
  
  const [user, authLoading] = useAuthState(auth);

  useEffect(() => {
    if (authLoading || !user) return;

    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
      setLearnerType(storedLearnerType);
    }
    
    // Fetch quiz attempts
    const attemptsQuery = query(collection(db, 'quizAttempts'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(attemptsQuery, (snapshot) => {
        const attempts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as QuizAttempt));
        
        // Process attempts to find weakest topic and stats
        const stats: Record<string, { correct: number, incorrect: number }> = {};
        attempts.forEach(attempt => {
            if (!stats[attempt.topic]) {
                stats[attempt.topic] = { correct: 0, incorrect: 0 };
            }
            if (attempt.userAnswer.toLowerCase() === attempt.correctAnswer.toLowerCase()) {
                stats[attempt.topic].correct++;
            } else {
                stats[attempt.topic].incorrect++;
            }
        });
        
        setTopicStats(stats);
        
        let weakest: string | null = null;
        let maxIncorrectRatio = -1;

        for (const topic in stats) {
            const { correct, incorrect } = stats[topic];
            const total = correct + incorrect;
            if (total === 0) continue;
            const incorrectRatio = incorrect / total;
            
            if (incorrectRatio > maxIncorrectRatio) {
                maxIncorrectRatio = incorrectRatio;
                weakest = topic;
            }
        }
        
        setWeakestTopic(weakest);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);
  
  const chartData = useMemo(() => {
      const masteredCount = Object.entries(topicStats).filter(([_, stats]) => stats.incorrect === 0 && stats.correct > 0).length;
      const needsWorkCount = Object.keys(topicStats).length - masteredCount;

      return [
        { topic: 'Mastered', count: masteredCount, fill: 'hsl(var(--primary))' },
        { topic: 'Needs Work', count: needsWorkCount, fill: 'hsl(var(--muted))' }
      ];
  }, [topicStats]);

  if (loading || authLoading) {
      return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <Skeleton className="h-8 w-80 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>

            <div>
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
             <div>
                <Skeleton className="h-8 w-96 mb-4" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Analysis Dashboard</h1>
        <p className="text-muted-foreground">Personalized insights and tools to enhance your study sessions.</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Key Insights</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Your Learner Type</CardTitle>
               <Lightbulb className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{learnerType}</div>
               <p className="text-xs text-muted-foreground">AI responses are tailored to this style</p>
            </CardContent>
          </Card>
           <Card className="bg-amber-500/10 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Weakest Topic</CardTitle>
               <TrendingDown className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{weakestTopic ?? 'None yet!'}</div>
               <p className="text-xs text-muted-foreground">{weakestTopic ? 'Focus here for the biggest gains.' : 'Keep taking quizzes to find out.'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Topic Mastery</CardTitle>
            </CardHeader>
             <CardContent className="flex gap-4">
                <ChartContainer config={{}} className="h-24 w-24">
                     <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="count" nameKey="topic" innerRadius={18}>
                            {chartData.map((entry) => (
                                <Cell key={entry.topic} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="flex flex-col justify-center">
                    <p className="text-sm font-medium">{chartData[0].count} Topics Mastered</p>
                    <p className="text-sm text-muted-foreground">{chartData[1].count} Topics Need Work</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

       <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Suggested Actions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-6">
               <Link href={`/dashboard/practice-quiz?topic=${encodeURIComponent(weakestTopic ?? 'new topic')}`}>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary"><Lightbulb /></div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Take a Targeted Quiz</h3>
                            <p className="text-muted-foreground text-sm">
                                Generate a new quiz focusing on your weakest topic, <span className="font-semibold">{weakestTopic ?? '...'}</span>, to build your skills where it counts.
                            </p>
                        </div>
                    </div>
                </Link>
            </CardContent>
          </Card>
           <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-6">
              <Link href={`/dashboard/ai-chat?topic=${encodeURIComponent(weakestTopic ?? '')}`}>
                    <div className="flex items-start gap-4">
                         <div className="p-3 bg-primary/10 rounded-lg text-primary"><BrainCircuit /></div>
                         <div>
                            <h3 className="text-lg font-semibold mb-1">Chat with an AI Tutor</h3>
                            <p className="text-muted-foreground text-sm">
                                Start a conversation with your AI study partner. Ask for explanations, examples, or a study plan for {weakestTopic ?? 'any topic'}.
                            </p>
                         </div>
                    </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}

export default AnalysisPage;
