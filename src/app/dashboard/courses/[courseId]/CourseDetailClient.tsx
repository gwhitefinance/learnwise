
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, Lightbulb, FileText, Link as LinkIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// Define the Course type here.
type Course = {
    id: string;
    name: string;
    instructor: string;
    credits: number;
    url?: string;
    imageUrl?: string;
    description?: string;
    userId?: string;
};

// The client component now fetches its own data.
export default function CourseDetailPageClient({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      setLoading(true);
      const docRef = doc(db, "courses", courseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const courseData = docSnap.data();
        setCourse({
            id: docSnap.id,
            name: courseData.name,
            instructor: courseData.instructor,
            credits: courseData.credits,
            url: courseData.url || '',
            imageUrl: courseData.imageUrl || '',
            description: courseData.description || '',
            userId: courseData.userId || '',
        });
      } else {
        // If not found, redirect to a 404 or courses page.
        router.push('/dashboard/courses');
      }
      setLoading(false);
    };

    fetchCourse();
  }, [courseId, router]);
  
  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="aspect-[3/2] w-full" />
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!course) {
    // This can be a more specific "not found" component.
    return (
        <div>
            <Link href="/dashboard/courses">
                <Button variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
                </Button>
            </Link>
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Course Not Found</h2>
                <p className="text-muted-foreground mt-2">The course you are looking for does not exist.</p>
            </div>
        </div>
    );
  }

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
