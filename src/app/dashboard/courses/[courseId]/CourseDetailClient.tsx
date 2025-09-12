
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, Lightbulb, FileText, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

// Define the Course type here so it can be exported and used by the server component.
export type Course = {
    id: string;
    name: string;
    instructor: string;
    credits: number;
    url?: string;
    imageUrl?: string;
    description?: string;
    userId?: string;
};

// This is now a "dumb" presentational component that just receives data and renders it.
export default function CourseDetailPageClient({ course }: { course: Course }) {
  
  const courseDescription = course.description || `This course, taught by ${course.instructor}, provides a comprehensive overview of ${course.name}. It covers fundamental principles and advanced topics to equip students with the knowledge needed in this field.`;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/courses">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Button>
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                             <CardTitle className="text-4xl font-bold mb-2">{course.name}</CardTitle>
                             <CardDescription className="text-lg">Taught by {course.instructor} &bull; {course.credits} Credits</CardDescription>
                        </div>
                        {course.url && (
                             <a href={course.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline"><LinkIcon className="mr-2 h-4 w-4"/> Visit Course</Button>
                            </a>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mt-4">{courseDescription}</p>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-4">
             <Image
                src={course.imageUrl || 'https://picsum.photos/600/400'}
                alt="Course thumbnail"
                width={600}
                height={400}
                className="rounded-lg object-cover w-full"
                data-ai-hint="online course"
              />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Study Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href={`/dashboard/ai-chat?courseId=${course.id}`}>
            <Card className="hover:bg-muted transition-colors h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit/> AI Chat</CardTitle>
                <CardDescription>Get instant answers and explanations tailored to this course.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href={`/dashboard/practice-quiz?topic=${encodeURIComponent(course.name)}`}>
            <Card className="hover:bg-muted transition-colors h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb/> Practice Quiz</CardTitle>
                <CardDescription>Test your knowledge with AI-generated quizzes about {course.name}.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
           <Link href="/dashboard/notes">
            <Card className="hover:bg-muted transition-colors h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText/> Take Notes</CardTitle>
                <CardDescription>Create and organize your study notes for this course.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

    </div>
  );
}
