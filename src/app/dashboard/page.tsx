
'use client';

import { useState, useEffect } from 'react';
import { motion } from "framer-motion"
import {
  Users,
  FileText,
  Download,
  Plus,
  UploadCloud
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

  const recentFiles = [
    {
      name: "Calculus Midterm Study Guide.pdf",
      subject: "Calculus I",
      modified: "2 hours ago",
      shared: true,
      size: "2.1 MB",
      collaborators: 3,
    },
    {
      name: "History Chapter 5 Notes.docx",
      subject: "World History",
      modified: "Yesterday",
      shared: true,
      size: "82 KB",
      collaborators: 2,
    },
    {
      name: "Programming Assignment 3.py",
      subject: "Intro to Programming",
      modified: "3 days ago",
      shared: false,
      size: "12 KB",
      collaborators: 0,
    },
  ]
  
  const projects = [
    {
      name: "Calculus I",
      description: "Master differential and integral calculus.",
      progress: 75,
      dueDate: "June 15, 2025",
      members: 1,
      files: 12,
    },
    {
      name: "Intro to Programming",
      description: "Learn Python fundamentals and best practices.",
      progress: 60,
      dueDate: "July 30, 2025",
      members: 1,
      files: 28,
    },
    {
      name: "Linear Algebra",
      description: "Understand vectors, matrices, and transformations.",
      progress: 90,
      dueDate: "May 25, 2025",
      members: 1,
      files: 18,
    },
  ]

  type Course = {
    id: string;
    name: string;
    instructor: string;
    credits: number;
    url?: string;
  };

export default function DashboardPage() {
    const [courses, setCourses] = useState<Course[]>([]);
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
        };

        const updatedCourses = [...courses, courseToAdd];
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
        // TODO: Implement actual file upload logic
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
          setFiles(droppedFiles);
        }
    };

   
  return (
    <div className="space-y-8 mt-0">
        <Tabs defaultValue="home">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="grid w-full max-w-[600px] grid-cols-5 rounded-2xl p-1">
                <TabsTrigger value="home" className="rounded-xl data-[state=active]:rounded-xl">
                  Home
                </TabsTrigger>
                <TabsTrigger value="apps" className="rounded-xl data-[state=active]:rounded-xl">
                  Apps
                </TabsTrigger>
                <TabsTrigger value="files" className="rounded-xl data-[state=active]:rounded-xl">
                  Files
                </TabsTrigger>
                <TabsTrigger value="projects" className="rounded-xl data-[state=active]:rounded-xl">
                  Projects
                </TabsTrigger>
                <TabsTrigger value="learn" className="rounded-xl data-[state=active]:rounded-xl">
                  Learn
                </TabsTrigger>
              </TabsList>
              <div className="hidden md:flex gap-2">
                <Dialog open={isUploadOpen} onOpenChange={setUploadOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-2xl">
                          <Download className="mr-2 h-4 w-4" />
                          Upload Course Information
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                         <DialogHeader>
                            <DialogTitle>Upload Study Materials</DialogTitle>
                        </DialogHeader>
                        <div 
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                            )}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
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
        </Tabs>
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


        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Recent Files</h2>
                <Button variant="ghost" className="rounded-2xl">
                    View All
                </Button>
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
                    {recentFiles.map((file) => (
                        <TableRow key={file.name}>
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
                <Button variant="ghost" className="rounded-2xl">
                    View All
                </Button>
                </div>
                 <div className="space-y-4">
                    {projects.slice(0, 3).map((project) => (
                        <Card key={project.name}>
                             <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium">{project.name}</h3>
                                    <Badge variant="outline" className="rounded-xl">
                                    In Progress
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-2 rounded-xl" />
                                </div>
                                <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                    <FileText className="mr-1 h-4 w-4" />
                                    {project.files} files
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    </div>
  )
}

    