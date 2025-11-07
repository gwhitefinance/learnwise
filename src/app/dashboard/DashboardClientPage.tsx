

'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  Plus,
  LayoutGrid,
  GraduationCap,
  Upload,
  Bookmark,
  Settings,
  FileText,
  Lightbulb,
  MessageSquare,
  Gamepad2,
  Copy,
  Headphones,
  ChevronDown,
  Play,
  Flame,
  Calendar,
  FilePenLine,
  Mic,
  ChevronRight,
} from 'lucide-react';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import AIBuddy from '@/components/ai-buddy';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

type Chapter = {
  id: string;
  title: string;
}

type Unit = {
  id: string;
  title: string;
  chapters: Chapter[];
}

type Course = {
  id: string;
  name: string;
  units?: Unit[];
  completedChapters?: string[];
};

const CourseDetailCard = ({ course }: { course: Course }) => {
    const totalMaterials = course.units?.reduce((acc, unit) => acc + unit.chapters.length, 0) || 0;
    
    const quickActions = [
        { icon: <FileText size={16}/>, label: 'Tests/Quizzes', count: 1, hasDropdown: true },
        { icon: <Lightbulb size={16}/>, label: 'Explainers', count: 0 },
        { icon: <MessageSquare size={16}/>, label: 'Tutor Me', count: 0 },
        { icon: <Gamepad2 size={16}/>, label: 'Arcade', count: 2, hasDropdown: true },
        { icon: <Copy size={16}/>, label: 'Flashcards', count: 1, hasDropdown: true },
        { icon: <Headphones size={16}/>, label: 'Audio Recap', count: 0 },
    ];
    
    const getUnitProgress = (unit: Unit) => {
        if (!unit.chapters || unit.chapters.length === 0 || !course.completedChapters) {
            return 0;
        }
        const completedInUnit = unit.chapters.filter(chap => course.completedChapters?.includes(chap.id)).length;
        return (completedInUnit / unit.chapters.length) * 100;
    }

    return (
        <div className="mt-8">
            <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-blue-200">
                                <GraduationCap className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{course.name}</h2>
                                <p className="text-sm text-muted-foreground">{totalMaterials} materials</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon"><Bookmark/></Button>
                            <Button variant="ghost" size="icon"><Settings/></Button>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        {quickActions.map(action => (
                            <Button key={action.label} variant="outline" className="justify-start h-12 bg-white/50 hover:bg-white/80">
                                {action.icon}
                                <span className="font-semibold ml-2">{action.count}</span>
                                <span className="text-muted-foreground ml-1">{action.label}</span>
                                {action.hasDropdown && <ChevronDown size={16} className="ml-auto text-muted-foreground"/>}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <div className="text-center my-6">
                <Button size="lg" className="rounded-full h-12 px-8 bg-blue-500 hover:bg-blue-600">
                    <Play className="mr-2 h-5 w-5 fill-white"/>
                    Continue Learning
                </Button>
            </div>
            <div className="space-y-4">
                {course.units?.slice(0, 4).map(unit => (
                    <div key={unit.id} className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg">
                        <Link href={`/dashboard/courses?courseId=${course.id}`} className="flex-1">
                            <p className="font-semibold underline-offset-4 hover:underline">{unit.title}</p>
                        </Link>
                        <Progress value={getUnitProgress(unit)} className="w-32 h-2"/>
                        <span className="text-sm font-medium text-muted-foreground w-10 text-right">{getUnitProgress(unit).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
            {course.units && course.units.length > 4 && (
                 <div className="text-center mt-6">
                    <Button variant="ghost">View All</Button>
                </div>
            )}
        </div>
    )
}

const RightSidebar = () => {

    const materials = [
        { icon: <FilePenLine className="h-6 w-6 text-blue-500" />, title: 'Risk Management Strategies', date: 'Nov 6, 2025' },
        { icon: <FilePenLine className="h-6 w-6 text-blue-500" />, title: 'Technical Analysis Tools', date: 'Nov 6, 2025' },
        { icon: <Mic className="h-6 w-6 text-purple-500" />, title: 'Untitled Lecture', date: 'Nov 5, 2025' }
    ]

    const upcoming = [
        { icon: <Gamepad2 className="h-5 w-5" />, title: 'Technical Analysis for Day ...', date: 'Nov 8', color: 'bg-pink-500/20 text-pink-600' },
        { icon: <FileText className="h-5 w-5" />, title: 'Trend-Following Technical ...', date: 'Nov 8', color: 'bg-yellow-500/20 text-yellow-600' },
    ]

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flame className="text-orange-500"/>
                        <span className="font-semibold">3 day streak!</span>
                    </div>
                    <Button variant="link" asChild>
                        <Link href="/leaderboard">View Leaderboard</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Materials</CardTitle>
                    <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2"/>
                        Upload
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {materials.map(item => (
                        <div key={item.title} className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-lg">
                                {item.icon}
                            </div>
                            <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.date}</p>
                            </div>
                        </div>
                    ))}
                    <Button variant="link" className="w-full">View All</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Upcoming
                        <Calendar className="h-5 w-5 text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {upcoming.map(item => (
                        <div key={item.title} className="flex items-center justify-between hover:bg-muted p-2 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${item.color}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.date}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    ))}
                     <Button variant="link" className="w-full">View All</Button>
                </CardContent>
            </Card>
        </div>
    )
}

function DashboardClientPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, authLoading] = useAuthState(auth);
    const router = useRouter();
    const [activeSet, setActiveSet] = useState<string | null>(null);

     useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/signup');
            return;
        }

        const q = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            if (userCourses.length > 0 && !activeSet) {
                setActiveSet(userCourses[0].id);
            }
            setIsLoading(false);
        });
        
        return () => unsubscribe();
    }, [user, authLoading, router, activeSet]);
    
    const activeCourse = courses.find(c => c.id === activeSet);

  return (
    <div className='space-y-8'>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <AIBuddy className="w-4 h-4" />
                <div>
                    <h1 className="text-2xl font-bold">Good afternoon, {user?.displayName?.split(' ')[0] || 'Grady'}!</h1>
                    <p className="text-muted-foreground">Which study set are you working on today?</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <Button variant="ghost">
                    <Plus className="mr-2 h-4 w-4" /> Add Set
                </Button>
                 <Button variant="ghost">
                    <LayoutGrid className="mr-2 h-4 w-4" /> See All My Sets
                </Button>
            </div>
        </div>
        
        <div className="flex items-center gap-2 pb-6 border-b">
            {courses.map(course => (
                 <Button 
                    key={course.id} 
                    variant={activeSet === course.id ? 'default' : 'outline'}
                    className={cn(
                        "flex items-center gap-2",
                        activeSet === course.id && 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20'
                    )}
                    onClick={() => setActiveSet(course.id)}
                >
                    <GraduationCap className="h-4 w-4"/>
                    {course.name}
                </Button>
            ))}
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="border-dashed">
                        <Plus className="h-4 w-4"/>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a New Study Set</DialogTitle>
                        <DialogDescription>
                            What subject are you studying?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Set Name</Label>
                            <Input id="name" placeholder="e.g., SAT Math, Biology 101"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button>Add Set</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                {activeCourse && <CourseDetailCard course={activeCourse} />}
            </div>
            <div className="lg:col-span-1">
                <RightSidebar />
            </div>
        </div>
    </div>
  )
}

export default DashboardClientPage;
