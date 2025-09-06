
'use client';
import { Button } from '@/components/ui/button';
import { GitMerge, Lightbulb, PencilRuler, Video, Upload, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const visualTools = [
  {
    icon: GitMerge,
    title: 'Mind Map Generator',
    description: 'Visually organize information and see the bigger picture.',
  },
  {
    icon: PencilRuler,
    title: 'Interactive Flashcards',
    description: 'Reinforce key concepts with dynamic, visual flashcards.',
  },
  {
    icon: Video,
    title: 'Video Annotation',
    description: 'Add notes, highlights, and drawings directly to your videos.',
  }
]

const recentCourses = [
    {
        id: '1',
        title: "Intro to Graphic Design",
        uploaded: "Uploaded 2 days ago",
        imageUrl: 'https://picsum.photos/300/300?random=1',
        hint: 'abstract art'
    },
    {
        id: '2',
        title: "Data Visualization Fundamentals",
        uploaded: "Uploaded 1 week ago",
        imageUrl: 'https://picsum.photos/300/300?random=2',
        hint: 'notebook diagram'
    },
    {
        id: '3',
        title: "The Art of Storyboarding",
        uploaded: "Uploaded 3 weeks ago",
        imageUrl: 'https://picsum.photos/300/300?random=3',
        hint: 'sticky notes'
    },
];

export default function Dashboard() {

  return (
    <div className="space-y-10">
      <div className="bg-slate-800/50 p-8 rounded-2xl flex flex-col items-center text-center">
          <Lightbulb className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-3xl font-bold mb-2">Unlock Your Visual Potential</h2>
          <p className="text-muted-foreground max-w-2xl mb-6">
              Upload your courses and let LearnWise transform them into engaging visual experiences. Get started by uploading your first course file.
          </p>
          <Button>
              <Upload className="mr-2 h-4 w-4"/>
              Upload Course
          </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Quick Access Visual Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visualTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                    <div key={index} className="group flex flex-col gap-4 bg-slate-800/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                             <Icon className="h-10 w-10 text-primary" />
                             <h3 className="text-xl font-bold">{tool.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm mt-2">{tool.description}</p>
                    </div>
                )
            })}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Recently Added Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentCourses.map(course => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="group flex flex-col gap-3">
              <div className="relative overflow-hidden rounded-lg">
                 <Image
                    src={course.imageUrl}
                    alt={course.title}
                    width={300}
                    height={300}
                    className="w-full aspect-square object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={course.hint}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Video className="text-white h-10 w-10"/>
                  </div>
              </div>
              <div>
                  <p className="text-lg font-medium">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.uploaded}</p>
              </div>
            </Link>
          ))}
           <Link href="/dashboard/courses" className="group flex flex-col gap-3 justify-center items-center bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700 hover:border-primary transition-colors cursor-pointer">
              <PlusCircle className="h-12 w-12 text-slate-600 group-hover:text-primary transition-colors" />
              <p className="text-slate-500 group-hover:text-white transition-colors font-medium">Add New Course</p>
            </Link>
        </div>
      </div>
    </div>
  );
}
