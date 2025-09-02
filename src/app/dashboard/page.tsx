
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// NOTE: In a real app, this data would be fetched from a database
// and managed with a state management solution.
const getCourses = () => {
  if (typeof window !== 'undefined') {
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
      return JSON.parse(savedCourses);
    }
  }
  return [
    {
        id: '1',
        name: "Introduction to Python Programming",
        instructor: "Dr. Emily Carter",
        credits: 3,
        url: 'https://www.coursera.org/specializations/python',
        imageUrl: 'https://picsum.photos/600/400'
    },
    {
        id: '2',
        name: "Data Science Fundamentals",
        instructor: "Prof. David Lee",
        credits: 4,
        url: 'https://www.coursera.org/professional-certificates/ibm-data-science',
        imageUrl: 'https://picsum.photos/600/401'
    },
    {
        id: '3',
        name: "UI/UX Design Principles",
        instructor: "Dr. Sarah Jones",
        credits: 3,
        url: 'https://www.coursera.org/specializations/ui-ux-design',
        imageUrl: 'https://picsum.photos/600/402'
    },
  ];
};


export default function Dashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    setCourses(getCourses());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Sophia! Here's an overview of your learning journey.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Quick Access</h2>
        <Link href="/dashboard/courses">
            <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Course
            </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Your Courses</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Link key={course.id} href={course.url || '#'} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <Image
                    src={course.imageUrl || 'https://picsum.photos/600/400'}
                    alt="Course thumbnail"
                    width={600}
                    height={400}
                    className="rounded-t-lg object-cover"
                    data-ai-hint="online course"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold">
                    {course.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {course.instructor}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Roadmap Progress</h2>
          <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Data Science Roadmap</span>
                            <span className="text-sm text-muted-foreground">60%</span>
                        </div>
                        <Progress value={60} />
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
        <div>
           <h2 className="text-2xl font-semibold tracking-tight mb-4">Recent Notes</h2>
           <div className="space-y-2">
            <Card>
                <CardContent className="p-4 flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground"/>
                    <span className="font-medium">Key Concepts in Machine Learning</span>
                </CardContent>
            </Card>
             <Card>
                <CardContent className="p-4 flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground"/>
                    <span className="font-medium">Design Thinking Process</span>
                </CardContent>
            </Card>
             <Card>
                <CardContent className="p-4 flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground"/>
                    <span className="font-medium">Python Best Practices</span>
                </CardContent>
            </Card>
           </div>
        </div>
      </div>

    </div>
  );
}
