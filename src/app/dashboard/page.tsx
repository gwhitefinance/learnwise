
'use client';

import { useState, useEffect } from 'react';
import { motion } from "framer-motion"
import {
  FileText,
  Download,
  Plus,
  UploadCloud,
  GraduationCap,
  Lightbulb,
  GitMerge,
  ClipboardPenLine,
  Calendar,
  BarChart3,
  BrainCircuit,
  PenSquare,
  Home,
  LayoutGrid,
  Folder,
  Briefcase,
  BookOpen,
  ArrowRight,
  Link as LinkIcon,
  Notebook
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

  type Course = {
    id: string;
    name: string;
    instructor: string;
    credits: number;
    url?: string;
    description: string;
    progress: number;
    files: number;
  };
  
  type RecentFile = {
      name: string;
      subject: string;
      modified: string;
  };

  type Project = {
    name: string;
    course: string;
    dueDate: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
  }
  
  const AppCard = ({ title, description, icon, href, isFeatured, actionButton }: { title: string; description: string; icon: React.ReactNode; href: string, isFeatured?: boolean, actionButton?: React.ReactNode }) => (
    <Link href={href} className="block">
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={cn(
                "relative group rounded-2xl border border-border/20 bg-background/50 p-6 overflow-hidden flex flex-col",
                isFeatured ? "lg:col-span-2 lg:row-span-2" : "",
            )}
        >
            <div>
                <div className="bg-primary/10 text-primary p-3 rounded-xl inline-block mb-4">
                    {icon}
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground mt-2">{description}</p>
            </div>
            {actionButton && (
                <div className='mt-6' onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    {actionButton}
                </div>
            )}
        </motion.div>
    </Link>
);


  const initialCourses = [
    {
      id: "1",
      name: "Calculus I",
      description: "Master differential and integral calculus.",
      instructor: "Prof. David Lee",
      credits: 4,
      progress: 75,
      files: 12,
      url: ''
    },
    {
      id: "2",
      name: "Intro to Programming",
      description: "Learn Python fundamentals and best practices.",
      instructor: "Dr. Emily Carter",
      credits: 3,
      progress: 60,
      files: 28,
      url: 'https://www.coursera.org/specializations/python'
    },
    {
      id: "3",
      name: "Linear Algebra",
      description: "Understand vectors, matrices, and transformations.",
      instructor: "Dr. Sarah Jones",
      credits: 3,
      progress: 90,
      files: 18,
      url: ''
    },
  ];

  const initialRecentFiles: RecentFile[] = [
    {
      name: "Calculus Midterm Study Guide.pdf",
      subject: "Calculus I",
      modified: "2 hours ago",
    },
    {
      name: "History Chapter 5 Notes.docx",
      subject: "World History",
      modified: "Yesterday",
    },
    {
      name: "Programming Assignment 3.py",
      subject: "Intro to Programming",
      modified: "3 days ago",
    },
    {
      name: "Linear Algebra Problem Set 2.pdf",
      subject: "Linear Algebra",
      modified: "4 days ago",
    },
    {
      name: "English Essay Draft.docx",
      subject: "English Literature",
      modified: "1 week ago",
    },
  ];
  
  const initialProjects: Project[] = [
      { name: 'Research Paper', course: 'World History', dueDate: '2024-12-01', status: 'In Progress' },
      { name: 'Final Project', course: 'Intro to Programming', dueDate: '2024-12-10', status: 'Not Started' },
      { name: 'Midterm Exam', course: 'Calculus I', dueDate: '2024-11-15', status: 'Completed' },
  ];

  const apps = [
    { title: "AI Chat", href: "/dashboard/ai-chat", description: "Get instant answers and explanations from your AI study partner.", icon: <BrainCircuit className="w-8 h-8"/>, isFeatured: true, actionButton: <Button variant="outline" className="w-full">Start Chatting <ArrowRight className="ml-2 h-4 w-4"/></Button> },
    { title: "Practice Quiz", href: "/dashboard/practice-quiz", description: "Test your knowledge with AI quizzes.", icon: <Lightbulb className="w-8 h-8"/>, actionButton: <Button variant="outline" className="w-full">Generate Quiz <ArrowRight className="ml-2 h-4 w-4"/></Button>},
    { title: "Study Roadmaps", href: "/dashboard/roadmaps", description: "Plan your learning journey.", icon: <GitMerge className="w-8 h-8"/> },
    { title: "Whiteboard", href: "/dashboard/whiteboard", description: "Brainstorm and visualize ideas.", icon: <PenSquare className="w-8 h-8"/> },
    { title: "Notes", href: "/dashboard/notes", description: "Create, organize, and review your notes.", icon: <Notebook className="w-8 h-8"/> },
    { title: "Calendar", href: "/dashboard/calendar", description: "Manage your deadlines and study schedule.", icon: <Calendar className="w-8 h-8"/> },
  ];

  const learningResources = [
    { title: "The Feynman Technique", description: "A method for learning anything by explaining it in simple terms.", link: "#" },
    { title: "Spaced Repetition", description: "An evidence-based learning technique that is usually performed with flashcards.", link: "#" },
    { title: "Active Recall", description: "A process of actively stimulating memory during the learning process.", link: "#" },
  ];

  const integrations = [
    {
        name: "Google Calendar",
        icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
        description: "Sync deadlines and study sessions automatically.",
    },
    {
        name: "Notion",
        icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
        description: "Connect your notes and knowledge bases.",
    },
    {
        name: "Slack",
        icon: "https://cdn.freebiesupply.com/logos/large/2x/slack-logo-icon.png",
        description: "Get study reminders and form study groups.",
    },
    {
        name: "Zoom",
        icon: "https://t4.ftcdn.net/jpg/03/75/33/61/360_F_375336103_KQSAG9rQuOgdSx01GNIPK9abZaIeGoGR.jpg",
        description: "Launch study sessions directly from your calendar.",
    },
    {
        name: "Google Drive",
        icon: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
        description: "Import documents and notes for analysis.",
    },
    {
        name: "GitHub",
        icon: "https://cdn.iconscout.com/icon/free/png-256/free-github-icon-svg-png-download-1597554.png?f=webp",
        description: "Track coding projects alongside your coursework.",
    },
];

export default function DashboardPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [isAddCourseOpen, setAddCourseOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', instructor: '', credits: '', url: ''});
    const { toast } = useToast();
    const [files, setFiles] = useState<FileList | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploadOpen, setUploadOpen] = useState(false);

     useEffect(() => {
        const savedCourses = localStorage.getItem('courses');
        if (savedCourses) {
            setCourses(JSON.parse(savedCourses));
        } else {
            setCourses(initialCourses);
            localStorage.setItem('courses', JSON.stringify(initialCourses));
        }

        const savedFiles = localStorage.getItem('recentFiles');
        if (savedFiles) {
            setRecentFiles(JSON.parse(savedFiles));
        } else {
            setRecentFiles(initialRecentFiles);
            localStorage.setItem('recentFiles', JSON.stringify(initialRecentFiles));
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCourse = () => {
        if (!newCourse.name || !newCourse.instructor || !newCourse.credits) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all required fields.'
            });
            return;
        }

        const courseToAdd: Course = {
            id: crypto.randomUUID(),
            name: newCourse.name,
            instructor: newCourse.instructor,
            credits: parseInt(newCourse.credits, 10),
            url: newCourse.url,
            description: `A comprehensive course on ${newCourse.name} taught by ${newCourse.instructor}.`,
            progress: 0,
            files: 0,
        };

        const updatedCourses = [courseToAdd, ...courses];
        setCourses(updatedCourses);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        setNewCourse({ name: '', instructor: '', credits: '', url: '' });
        setAddCourseOpen(false);
        toast({
            title: 'Course Added!',
            description: `${courseToAdd.name} has been added to your list.`
        });
    };
    
    const handleFileChange = (selectedFiles: FileList | null) => {
        if (selectedFiles) {
          setFiles(selectedFiles);
        }
    };

    const handleUpload = () => {
        if (!files || files.length === 0) {
          toast({
            variant: 'destructive',
            title: 'No files selected',
            description: 'Please select at least one file to upload.',
          });
          return;
        }
        
        const newFiles: RecentFile[] = Array.from(files).map(file => ({
            name: file.name,
            subject: "General", // Or try to infer from context
            modified: "Just now",
        }));

        const updatedFiles = [...newFiles, ...recentFiles];
        setRecentFiles(updatedFiles);
        localStorage.setItem('recentFiles', JSON.stringify(updatedFiles));

        console.log('Uploading files:', files);
        toast({
          title: 'Upload Successful!',
          description: `${files.length} file(s) have been queued for processing.`,
        });
        setFiles(null);
        setUploadOpen(false);
    };
      
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
         if (!isDragging) setIsDragging(true);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
          handleFileChange(droppedFiles);
          setUploadOpen(true);
        }
    };

   
  return (
    <div className="space-y-8 mt-0">
        <Tabs defaultValue="home">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="grid w-full max-w-[750px] grid-cols-6 rounded-2xl p-1">
                <TabsTrigger value="home" className="rounded-xl data-[state=active]:rounded-xl"><Home className="w-4 h-4 mr-2"/>Home</TabsTrigger>
                <TabsTrigger value="apps" className="rounded-xl data-[state=active]:rounded-xl"><LayoutGrid className="w-4 h-4 mr-2"/>Apps</TabsTrigger>
                <TabsTrigger value="files" className="rounded-xl data-[state=active]:rounded-xl"><Folder className="w-4 h-4 mr-2"/>Files</TabsTrigger>
                <TabsTrigger value="projects" className="rounded-xl data-[state=active]:rounded-xl"><Briefcase className="w-4 h-4 mr-2"/>Projects</TabsTrigger>
                <TabsTrigger value="learn" className="rounded-xl data-[state=active]:rounded-xl"><BookOpen className="w-4 h-4 mr-2"/>Learn</TabsTrigger>
                <TabsTrigger value="integrations" className="rounded-xl data-[state=active]:rounded-xl"><LinkIcon className="w-4 h-4 mr-2"/>Integrations</TabsTrigger>
              </TabsList>
              <div className="hidden md:flex gap-2">
                <Dialog open={isUploadOpen} onOpenChange={setUploadOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-2xl">
                          <Download className="mr-2 h-4 w-4" />
                          Upload Materials
                        </Button>
                    </DialogTrigger>
                    <DialogContent
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                         <DialogHeader>
                            <DialogTitle>Upload Study Materials</DialogTitle>
                        </DialogHeader>
                        <div 
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                            )}
                            onClick={() => document.getElementById('file-upload-input')?.click()}
                          >
                            <input 
                              id="file-upload-input"
                              type="file" 
                              multiple 
                              className="hidden"
                              onChange={(e) => handleFileChange(e.target.files)}
                            />
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-lg font-semibold">
                                Drag and drop your files here
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Or click to browse
                              </p>
                            </div>
                        </div>
                        {files && files.length > 0 && (
                          <div className="mt-4">
                              <h3 className="text-lg font-semibold">Selected files:</h3>
                              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                                  {Array.from(files).map((file, index) => (
                                      <li key={index}>{file.name}</li>
                                  ))}
                              </ul>
                          </div>
                        )}
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleUpload}>Upload</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                <Dialog open={isAddCourseOpen} onOpenChange={setAddCourseOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-2xl">
                          <Plus className="mr-2 h-4 w-4" />
                          New Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a New Course</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Course Name</Label>
                                <Input id="name" name="name" value={newCourse.name} onChange={handleInputChange} placeholder="e.g., Introduction to AI"/>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="instructor">Instructor</Label>
                                <Input id="instructor" name="instructor" value={newCourse.instructor} onChange={handleInputChange} placeholder="e.g., Dr. Alan Turing"/>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="credits">Credits</Label>
                                <Input id="credits" name="credits" type="number" value={newCourse.credits} onChange={handleInputChange} placeholder="e.g., 3"/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="url">Course URL (Optional)</Label>
                                <Input id="url" name="url" value={newCourse.url} onChange={handleInputChange} placeholder="https://example.com/course-link"/>
                            </div>
                        </div>
                         <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleAddCourse}>Add Course</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value="home">
                 <section>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white"
                    >
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-4">
                            <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Premium</Badge>
                            <h2 className="text-3xl font-bold">Welcome to LearnWise Study Suite</h2>
                            <p className="max-w-[600px] text-white/80">
                            Unleash your potential with our comprehensive suite of AI-powered study tools and
                            resources.
                            </p>
                            <div className="flex flex-wrap gap-3">
                            <Button className="rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                                Upgrade to Pro
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-2xl bg-transparent border-white text-white hover:bg-white/10"
                            >
                                Take a Tour
                            </Button>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="relative h-40 w-40"
                            >
                            <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                            <div className="absolute inset-4 rounded-full bg-white/20" />
                            <div className="absolute inset-8 rounded-full bg-white/30" />
                            <div className="absolute inset-12 rounded-full bg-white/40" />
                            <div className="absolute inset-16 rounded-full bg-white/50" />
                            </motion.div>
                        </div>
                        </div>
                    </motion.div>
                </section>


                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-8">
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Recent Files</h2>
                        <Link href="/dashboard/upload">
                            <Button variant="ghost" className="rounded-2xl">
                                View All
                            </Button>
                        </Link>
                        </div>
                        <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Last Modified</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {recentFiles.slice(0, 3).map((file, index) => (
                                <TableRow key={index}>
                                     <TableCell className="font-medium">{file.name}</TableCell>
                                    <TableCell>{file.subject}</TableCell>
                                    <TableCell>{file.modified}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </Card>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Active Courses</h2>
                        <Link href="/dashboard/courses">
                            <Button variant="ghost" className="rounded-2xl">
                                View All
                            </Button>
                        </Link>
                        </div>
                         <div className="space-y-4">
                            {courses.slice(0, 3).map((course) => (
                                <Card key={course.id}>
                                     <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium">{course.name}</h3>
                                            <Badge variant="outline" className="rounded-xl">
                                            In Progress
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                            <span>Progress</span>
                                            <span>{course.progress}%</span>
                                            </div>
                                            <Progress value={course.progress} className="h-2 rounded-xl" />
                                        </div>
                                        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                            <FileText className="mr-1 h-4 w-4" />
                                            {course.files} files
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>
            </TabsContent>
            
             <TabsContent value="apps">
                 <div className="grid lg:grid-cols-2 gap-6 items-start">
                    <div className="grid grid-cols-1 gap-6">
                         <AppCard title="AI Chat" href="/dashboard/ai-chat" description="Get instant answers and explanations from your AI study partner." icon={<BrainCircuit className="w-8 h-8"/>} isFeatured actionButton={<Button variant="outline" className="w-full">Start Chatting <ArrowRight className="ml-2 h-4 w-4"/></Button>} />
                         <AppCard title="Practice Quiz" href="/dashboard/practice-quiz" description="Test your knowledge with AI quizzes." icon={<Lightbulb className="w-8 h-8"/>} actionButton={<Button variant="outline" className="w-full">Generate Quiz <ArrowRight className="ml-2 h-4 w-4"/></Button>}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <AppCard title="Study Roadmaps" href="/dashboard/roadmaps" description="Plan your learning journey." icon={<GitMerge className="w-8 h-8"/>} />
                       <AppCard title="Whiteboard" href="/dashboard/whiteboard" description="Brainstorm and visualize ideas." icon={<PenSquare className="w-8 h-8"/>} />
                       <AppCard title="Notes" href="/dashboard/notes" description="Create, organize, and review your notes." icon={<Notebook className="w-8 h-8"/>} />
                       <AppCard title="Calendar" href="/dashboard/calendar" description="Manage your deadlines and study schedule." icon={<Calendar className="w-8 h-8"/>} />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="files">
                 <Card>
                    <CardHeader>
                        <CardTitle>All Files</CardTitle>
                        <CardDescription>Manage all your uploaded study materials.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Last Modified</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {recentFiles.map((file, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{file.name}</TableCell>
                                    <TableCell>{file.subject}</TableCell>
                                    <TableCell>{file.modified}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="projects">
                <Card>
                    <CardHeader>
                        <CardTitle>Projects & Assignments</CardTitle>
                        <CardDescription>Keep track of your larger tasks and their deadlines.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {projects.map((project, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{project.name}</TableCell>
                                    <TableCell>{project.course}</TableCell>
                                    <TableCell>{project.dueDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={project.status === 'Completed' ? 'secondary' : project.status === 'In Progress' ? 'default' : 'outline'}>{project.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="learn">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {learningResources.map((resource) => (
                        <a key={resource.title} href={resource.link} target="_blank" rel="noopener noreferrer">
                            <Card className="hover:bg-muted transition-colors h-full">
                                <CardHeader>
                                    <CardTitle>{resource.title}</CardTitle>
                                    <CardDescription>{resource.description}</CardHeader>
                                </Card>
                            </a>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="integrations">
                <Card>
                     <CardHeader>
                        <CardTitle>Connect Your Apps</CardTitle>
                        <CardDescription>Seamlessly integrate with the tools you already use.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {integrations.map((integration) => (
                            <Card key={integration.name}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                     <Image
                                        className="size-12"
                                        src={integration.icon}
                                        alt={`${integration.name}-icon`}
                                        width={48}
                                        height={48}
                                    />
                                    <div>
                                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                                        <CardDescription className="text-xs">{integration.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardFooter>
                                    <Button variant="outline" className="w-full">Connect</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
    </div>
  )
}

    