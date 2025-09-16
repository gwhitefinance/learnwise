
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
  Notebook,
  Flame,
  Trophy,
  Palette,
  Gem,
  Music,
  Gamepad2,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { generateMotivationalMessage } from '@/ai/flows/motivational-message-flow';
const SplineScene = dynamic(() => import('@/components/ui/spline-scene'), { ssr: false });


  type Course = {
    id: string;
    name: string;
    instructor: string;
    credits: number;
    url?: string;
    description: string;
    progress: number;
    files: number;
    userId?: string;
  };

  type FirestoreProject = {
    id:string;
    name: string;
    course: string;
    dueDate: Timestamp;
    status: 'Not Started' | 'In Progress' | 'Completed';
    userId?: string;
  }
  
  type RecentFile = {
      id: string;
      name: string;
      subject: string;
      modified: Timestamp;
      userId?: string;
  };

  type Project = Omit<FirestoreProject, 'dueDate'> & {
    dueDate: string;
  }

  type DisplayFile = Omit<RecentFile, 'modified'> & {
      modified: string;
  }
  
  const AppCard = ({ title, description, icon, href, actionButton, id }: { title: string; description: string; icon: React.ReactNode; href: string, actionButton?: React.ReactNode, id?: string }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="relative group rounded-2xl border border-border/20 bg-background/50 p-6 overflow-hidden flex flex-col"
        id={id}
    >
        <Link href={href} className="flex flex-col flex-grow">
            <div>
                <div className="bg-primary/10 text-primary p-3 rounded-xl inline-block mb-4">
                    {icon}
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground mt-2">{description}</p>
            </div>
        </Link>
        {actionButton && (
            <div className='mt-6' onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                {actionButton}
            </div>
        )}
    </motion.div>
);

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
        name: "Spotify",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png",
        description: "Play your favorite focus playlists while you study.",
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

function DashboardPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [recentFiles, setRecentFiles] = useState<DisplayFile[]>([]);
    const [isAddCourseOpen, setAddCourseOpen] = useState(false);
    const [isSavingCourse, setIsSavingCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', instructor: '', credits: '', url: ''});
    const { toast } = useToast();
    const [files, setFiles] = useState<FileList | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploadOpen, setUploadOpen] = useState(false);
    const [isAddProjectOpen, setAddProjectOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', course: '', dueDate: new Date() as Date | undefined });
    const [streak, setStreak] = useState(0);
    const [user] = useAuthState(auth);
    const [motivationalMessage, setMotivationalMessage] = useState('');

     useEffect(() => {
        if (!user) return;
        
        setIsDataLoading(true);

        const unsubscribes: (() => void)[] = [];

        // Subscribe to courses
        const qCourses = query(collection(db, "courses"), where("userId", "==", user.uid));
        unsubscribes.push(onSnapshot(qCourses, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            setIsDataLoading(false);
        }));

        // Subscribe to projects
        const qProjects = query(collection(db, "projects"), where("userId", "==", user.uid));
        unsubscribes.push(onSnapshot(qProjects, (snapshot) => {
            const userProjects = snapshot.docs.map(doc => {
                const data = doc.data() as FirestoreProject;
                return {
                    ...data,
                    id: doc.id,
                    dueDate: data.dueDate.toDate().toISOString(),
                } as Project;
            });
            // Sort on client
            userProjects.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            setProjects(userProjects);
        }));

        // Subscribe to recent files
        const qFiles = query(collection(db, "recentFiles"), where("userId", "==", user.uid));
        unsubscribes.push(onSnapshot(qFiles, (snapshot) => {
            const userFiles = snapshot.docs.map(doc => {
                const data = doc.data() as RecentFile;
                return {
                    ...data,
                    id: doc.id,
                    modified: format(data.modified.toDate(), 'PPP'),
                } as DisplayFile;
            });
            // Sort on client
            userFiles.sort((a,b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
            setRecentFiles(userFiles);
        }));


        // Mock streak calculation
        const lastVisit = localStorage.getItem('lastVisit');
        const today = new Date().toDateString();
        if (lastVisit === today) {
            setStreak(Number(localStorage.getItem('streakCount')) || 1);
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastVisit === yesterday.toDateString()) {
                const newStreak = (Number(localStorage.getItem('streakCount')) || 0) + 1;
                setStreak(newStreak);
                localStorage.setItem('streakCount', String(newStreak));
            } else {
                setStreak(1);
                localStorage.setItem('streakCount', '1');
            }
        }
        localStorage.setItem('lastVisit', today);
        
        // Fetch motivational message
        async function getMotivation() {
            if (user?.displayName) {
                 try {
                    const { message } = await generateMotivationalMessage({ userName: user.displayName.split(' ')[0] });
                    setMotivationalMessage(message);
                } catch(e) {
                    console.error("Couldn't get motivational message", e);
                    setMotivationalMessage("Let's get learning!");
                }
            }
        }
        getMotivation();

        return () => unsubscribes.forEach(unsub => unsub());
    }, [user]);

    const handleProjectInputChange = (field: string, value: string | Date | undefined) => {
        setNewProject(prev => ({ ...prev, [field]: value }));
    };

    const handleAddProject = async () => {
        if (!newProject.name || !newProject.course || !newProject.dueDate || !user) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all required fields.'
            });
            return;
        }

        try {
            await addDoc(collection(db, "projects"), {
                name: newProject.name,
                course: newProject.course,
                dueDate: Timestamp.fromDate(newProject.dueDate),
                status: 'Not Started',
                userId: user.uid
            });
            setNewProject({ name: '', course: '', dueDate: new Date() });
            setAddProjectOpen(false);
            toast({
                title: 'Project Added!',
                description: `${newProject.name} has been added to your list.`
            });
        } catch (error) {
            console.error("Error adding project: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not add project."});
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCourse = async () => {
        if (!newCourse.name || !newCourse.instructor || !newCourse.credits) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all required fields.'
            });
            return;
        }
        if (!user) return;

        setIsSavingCourse(true);
        setAddCourseOpen(false); // Close dialog immediately

        const courseToAdd = {
            name: newCourse.name,
            instructor: newCourse.instructor,
            credits: parseInt(newCourse.credits, 10),
            url: newCourse.url,
            userId: user.uid,
            description: `A comprehensive course on ${newCourse.name} taught by ${newCourse.instructor}.`,
            progress: 0,
            files: 0,
        };
        
        try {
            await addDoc(collection(db, "courses"), courseToAdd);
            toast({
                title: 'Course Added!',
                description: `${courseToAdd.name} has been added to your list.`
            });
        } catch(error) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not add course. Please try again.',
            });
        } finally {
            setNewCourse({ name: '', instructor: '', credits: '', url: '' });
            setIsSavingCourse(false);
        }
    };
    
    const handleFileChange = (selectedFiles: FileList | null) => {
        if (selectedFiles) {
          setFiles(selectedFiles);
        }
    };

    const handleUpload = async () => {
        if (!files || files.length === 0 || !user) {
          toast({
            variant: 'destructive',
            title: 'No files selected',
            description: 'Please select at least one file to upload.',
          });
          return;
        }
        
        const uploadPromises = Array.from(files).map(file => {
            return addDoc(collection(db, 'recentFiles'), {
                name: file.name,
                subject: "General",
                modified: Timestamp.now(),
                userId: user.uid,
            });
        });

        try {
            await Promise.all(uploadPromises);
            toast({
                title: 'Upload Successful!',
                description: `${files.length} file(s) have been added.`,
            });
        } catch (error) {
            console.error("Error uploading files: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not upload files."});
        }

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

    const rewards = [
        {
            streak: 7,
            icon: Trophy,
            title: "7-Day Scholar Badge",
            description: "Show off your consistency with a new profile badge.",
        },
        {
            streak: 14,
            icon: Music,
            title: "'Deep Focus' Playlist",
            description: "Unlock an exclusive playlist for Focus Mode.",
        },
        {
            streak: 21,
            icon: Palette,
            title: "Unlock 'Arcade' Theme",
            description: "A fun, retro-inspired theme for your dashboard.",
        },
        {
            streak: 30,
            icon: Gamepad2,
            title: "Unlock 'Study Pong' Game",
            description: "A new retro game to make studying fun.",
        },
    ];

   
  return (
    <div className="space-y-8 mt-0">
        
        <Tabs defaultValue="home" id="main-tabs">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="grid w-full max-w-[750px] grid-cols-6 rounded-2xl p-1">
                <TabsTrigger value="home" className="rounded-xl data-[state=active]:rounded-xl" id="home-tab-trigger"><Home className="w-4 h-4 mr-2"/>Home</TabsTrigger>
                <TabsTrigger value="apps" className="rounded-xl data-[state=active]:rounded-xl" id="apps-tab-trigger"><LayoutGrid className="w-4 h-4 mr-2"/>Apps</TabsTrigger>
                <TabsTrigger value="files" className="rounded-xl data-[state=active]:rounded-xl"><Folder className="w-4 h-4 mr-2"/>Files</TabsTrigger>
                <TabsTrigger value="projects" className="rounded-xl data-[state=active]:rounded-xl"><Briefcase className="w-4 h-4 mr-2"/>Projects</TabsTrigger>
                <TabsTrigger value="learn" className="rounded-xl data-[state=active]:rounded-xl"><BookOpen className="w-4 h-4 mr-2"/>Learn</TabsTrigger>
                <TabsTrigger value="integrations" className="rounded-xl data-[state=active]:rounded-xl"><LinkIcon className="w-4 h-4 mr-2"/>Integrations</TabsTrigger>
              </TabsList>
              <div className="hidden md:flex gap-2">
                <Dialog open={isUploadOpen} onOpenChange={setUploadOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-2xl" id="upload-materials-button">
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
                            <Button onClick={handleAddCourse} disabled={isSavingCourse}>
                                {isSavingCourse ? 'Saving...' : 'Add Course'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value="home">
                 <section>
                    <motion.div
                        id="welcome-banner"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white flex items-center gap-8"
                    >
                        <div className="flex-1 space-y-4">
                            <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Get Started</Badge>
                            <h2 className="text-3xl font-bold">Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'}!</h2>
                            <p className="max-w-[600px] text-white/80">
                                "{motivationalMessage || 'Ready to learn something new today?'}"
                            </p>
                        </div>
                        <div className="hidden lg:block w-64 h-64">
                             <SplineScene
                                scene="https://prod.spline.design/dwz1-rI2v7i-b8jC/scene.splinecode"
                                className="w-full h-full"
                            />
                        </div>
                    </motion.div>
                </section>


                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-8">
                    <section className="space-y-4" id="recent-files">
                        <Card className="bg-orange-500/10 border-orange-500/20 text-orange-900 dark:text-orange-200">
                           <CardContent className="p-6 flex items-center gap-6">
                                <div className="p-4 bg-white/50 rounded-full">
                                    <Flame className="w-8 h-8 text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold">{streak} Day Streak!</h3>
                                    <p className="text-sm opacity-80">
                                        {streak > 1 ? "Keep the fire going! You're building a great habit." : "Every journey starts with a single step. Keep it up!"}
                                    </p>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="rounded-full border-orange-500/50 bg-transparent hover:bg-white/20">
                                            View Rewards
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" /> Your Reward Path</DialogTitle>
                                            <CardDescription>
                                                You are on a {streak}-day streak! Keep it up to unlock these rewards.
                                            </CardDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            {rewards.map(reward => {
                                                const isUnlocked = streak >= reward.streak;
                                                const nextMilestone = Math.ceil(streak / 7) * 7;
                                                const isNextUp = !isUnlocked && reward.streak === nextMilestone;
                                                return (
                                                    <Card key={reward.title} className={cn("transition-all", !isUnlocked && "opacity-50", isNextUp && "border-primary shadow-lg")}>
                                                        <CardHeader className="flex flex-row items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn("p-2 rounded-lg", isUnlocked ? "bg-primary/20" : "bg-muted")}>
                                                                    <reward.icon className={cn("h-8 w-8", isUnlocked ? "text-primary" : "text-muted-foreground")} />
                                                                </div>
                                                                <div>
                                                                    <CardTitle>{reward.title}</CardTitle>
                                                                    <CardDescription>
                                                                        {isUnlocked ? "Unlocked!" : `Unlocks at ${reward.streak}-day streak`}
                                                                    </CardDescription>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" disabled={!isUnlocked} onClick={() => toast({ title: `"${reward.title}" claimed!`})}>
                                                                {isUnlocked ? "Claim" : "Locked"}
                                                            </Button>
                                                        </CardHeader>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                           </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle>Recent Files</CardTitle>
                                <CardDescription>Your most recently accessed documents.</CardDescription>
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
                                        {recentFiles.length > 0 ? (
                                            recentFiles.slice(0, 5).map((file, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{file.name}</TableCell>
                                                    <TableCell>{file.subject}</TableCell>
                                                    <TableCell>{file.modified}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground p-8">
                                                    You haven't uploaded any files yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="space-y-4" id="active-courses">
                        <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Active Courses</h2>
                        <Link href="/dashboard/courses">
                            <Button variant="ghost" className="rounded-2xl">
                                View All
                            </Button>
                        </Link>
                        </div>
                         <div className="space-y-4">
                            {isDataLoading ? (
                                Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)
                            ) : courses.length > 0 ? (
                                courses.slice(0, 2).map((course) => (
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
                                ))
                            ) : (
                                <Card><CardContent className="p-8 text-center text-muted-foreground">You haven't added any courses yet.</CardContent></Card>
                            )}
                        </div>
                    </section>
                </div>
            </TabsContent>
            
            <TabsContent value="apps">
                <div className="grid lg:grid-cols-2 gap-6 items-start">
                    <div className="grid grid-cols-1 gap-6">
                       <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <AppCard 
                                id="ai-chat-app"
                                title="AI Chat" 
                                href="/dashboard/ai-chat" 
                                description="Get instant answers and explanations from your AI study partner." 
                                icon={<BrainCircuit className="w-8 h-8"/>} 
                                actionButton={<Button variant="outline" className="w-full">Start Chatting <ArrowRight className="ml-2 h-4 w-4"/></Button>} 
                            />
                        </motion.div>
                       <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <AppCard 
                                title="Practice Quiz" 
                                href="/dashboard/practice-quiz" 
                                description="Test your knowledge with AI quizzes." 
                                icon={<Lightbulb className="w-8 h-8"/>}
                                actionButton={<Button variant="outline" className="w-full">Generate Quiz <ArrowRight className="ml-2 h-4 w-4"/></Button>}
                            />
                        </motion.div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}><AppCard title="Study Roadmaps" href="/dashboard/roadmaps" description="Plan your learning journey." icon={<GitMerge className="w-8 h-8"/>} /></motion.div>
                       <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}><AppCard title="Whiteboard" href="/dashboard/whiteboard" description="Brainstorm and visualize ideas." icon={<PenSquare className="w-8 h-8"/>} /></motion.div>
                       <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}><AppCard title="Notes" href="/dashboard/notes" description="Create, organize, and review your notes." icon={<Notebook className="w-8 h-8"/>} /></motion.div>
                       <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}><AppCard title="Calendar" href="/dashboard/calendar" description="Manage your deadlines and study schedule." icon={<Calendar className="w-8 h-8"/>} /></motion.div>
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
                       <div className="text-center text-muted-foreground p-8">Upload a file to get started.</div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="projects">
                {projects.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Projects & Assignments</CardTitle>
                                    <CardDescription>Keep track of your larger tasks and their deadlines.</CardDescription>
                                </div>
                                <Dialog open={isAddProjectOpen} onOpenChange={setAddProjectOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Add Project
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add a New Project</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="project-name">Project Name</Label>
                                                <Input id="project-name" value={newProject.name} onChange={(e) => handleProjectInputChange('name', e.target.value)} placeholder="e.g., Research Paper"/>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="project-course">Course</Label>
                                                <Select value={newProject.course} onValueChange={(value) => handleProjectInputChange('course', value)}>
                                                    <SelectTrigger id="project-course">
                                                        <SelectValue placeholder="Select a course" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {courses.map(course => (
                                                            <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="project-due-date">Due Date</Label>
                                                <DatePicker date={newProject.dueDate} setDate={(date) => handleProjectInputChange('dueDate', date)} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                            <Button onClick={handleAddProject}>Add Project</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <Card key={project.id} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle>{project.name}</CardTitle>
                                            <CardDescription>{project.course}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-muted-foreground">Due: {format(new Date(project.dueDate), "PPP")}</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Badge 
                                                variant={project.status === 'Completed' ? 'secondary' : project.status === 'In Progress' ? 'default' : 'outline'}
                                                className={cn(
                                                    project.status === 'Completed' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                                                    project.status === 'In Progress' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                                )}
                                            >{project.status}</Badge>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center py-20 rounded-lg border border-dashed">
                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Projects Yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Click the button to add your first project or assignment.
                        </p>
                        <Dialog open={isAddProjectOpen} onOpenChange={setAddProjectOpen}>
                            <DialogTrigger asChild>
                                <Button className="mt-4">
                                    <Plus className="mr-2 h-4 w-4" /> Add Project
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add a New Project</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="project-name">Project Name</Label>
                                        <Input id="project-name" value={newProject.name} onChange={(e) => handleProjectInputChange('name', e.target.value)} placeholder="e.g., Research Paper"/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="project-course">Course</Label>
                                        <Select value={newProject.course} onValueChange={(value) => handleProjectInputChange('course', value)}>
                                            <SelectTrigger id="project-course">
                                                <SelectValue placeholder="Select a course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map(course => (
                                                    <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="project-due-date">Due Date</Label>
                                        <DatePicker date={newProject.dueDate} setDate={(date) => handleProjectInputChange('dueDate', date)} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                    <Button onClick={handleAddProject}>Add Project</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </TabsContent>


             <TabsContent value="learn">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {learningResources.map((resource) => (
                        <a key={resource.title} href={resource.link} target="_blank" rel="noopener noreferrer">
                            <Card className="hover:bg-muted transition-colors h-full">
                                <CardHeader>
                                    <CardTitle>{resource.title}</CardTitle>
                                    <CardDescription>{resource.description}</CardDescription>
                                </CardHeader>
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
                                    <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
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

const DashboardPageComponent = dynamic(() => Promise.resolve(DashboardPage), { ssr: false });

export default DashboardPageComponent;

    