
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

export default function AnalysisPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Analysis Dashboard</h1>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Key Insights</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Learner Type</CardDescription>
              <CardTitle className="text-4xl">Visual</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Study Material Complexity</CardDescription>
              <CardTitle className="text-4xl">Medium</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Estimated Study Time</CardDescription>
              <CardTitle className="text-4xl">4 hours</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Personalized Study Recommendations</h2>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="max-w-xl">
                <h3 className="text-xl font-semibold mb-2">Visual Aids</h3>
                <p className="text-muted-foreground mb-4">
                  Use diagrams, charts, and mind maps to understand complex concepts. Focus on visual representations of information.
                </p>
                <Button>Explore Visual Aids</Button>
              </div>
              <Image 
                src="https://picsum.photos/400/300"
                alt="Visual Aids representation"
                width={200}
                height={150}
                className="rounded-lg object-cover"
                data-ai-hint="diagram chart"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="max-w-xl">
                <h3 className="text-xl font-semibold mb-2">Interactive Exercises</h3>
                <p className="text-muted-foreground mb-4">
                  Engage with interactive quizzes and simulations to reinforce your understanding. Practice applying concepts through hands-on activities.
                </p>
                <Button>Start Exercises</Button>
              </div>
               <Image 
                src="https://picsum.photos/400/301"
                alt="Interactive Exercises representation"
                width={200}
                height={150}
                className="rounded-lg object-cover"
                data-ai-hint="person studying"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Progress Tracker</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                        <span className="text-sm font-medium">60% Complete</span>
                    </div>
                    <Progress value={60} />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-4">
                        <CardDescription>Study Material Coverage</CardDescription>
                        <div className="flex items-baseline gap-2">
                             <CardTitle className="text-4xl">60%</CardTitle>
                             <span className="text-sm font-semibold text-green-500">Overall +10%</span>
                        </div>
                    </Card>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
