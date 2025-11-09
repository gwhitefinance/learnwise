

'use client';

import { useState, useEffect, useContext } from 'react';
import { Plus, Flame, Upload, ChevronDown, Calendar, FileText, Mic, LayoutGrid, Settings, LogOut, BarChart3, Bell, Bolt, School, Play, Users, GitMerge, GraduationCap, ClipboardCheck, BarChart, Award, MessageSquare, Briefcase, Share2, BookOpen, ChevronRight, Store, PenTool, BookMarked, Gamepad2, Headphones, Loader2, Wand2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import StudySetCard from '@/components/StudySetCard';
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Snail, Turtle, Rabbit } from 'lucide-react';
import { cn } from '@/lib/utils';
import GeneratingCourse from '../dashboard/courses/GeneratingCourse';
import { generateInitialCourseAndRoadmap } from '@/lib/actions';
import { RewardContext } from '@/context/RewardContext';
import RewardsDialog from '@/components/RewardsDialog';
import TazCoinIcon from '@/components/TazCoinIcon';


type Course = {
  id: string;
  name: string;
};

const paces = [
  { value: "6", label: "Casual", description: "A relaxed pace for exploring.", icon: <Snail className="h-6 w-6" /> },
  { value: "3", label: "Steady", description: "A balanced pace for consistent learning.", icon: <Turtle className="h-6 w-6" /> },
  { value: "1", label: "Intense", description: "A fast-paced schedule for quick mastery.", icon: <Rabbit className="h-6 w-6" /> },
];

const Index = () => {
  const [user, loading] = useAuthState(auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', instructor: '', credits: '', url: '', description: '', isNewTopic: null as boolean | null });
  const [isSaving, setIsSaving] = useState(false);
  const [addCourseStep, setAddCourseStep] = useState(1);
  const [learningPace, setLearningPace] = useState<string>("3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCourseName, setGeneratingCourseName] = useState('');
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { showReward } = useContext(RewardContext);


  useEffect(() => {
    if (!user) return;
    
    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');

    // Streak logic
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    let currentStreak = Number(localStorage.getItem('streakCount')) || 0;
    const lastClaimedDate = localStorage.getItem('dailyRewardClaimed');
    
    if (lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastVisit === yesterday.toDateString()) {
            currentStreak++;
        } else {
            currentStreak = 1;
        }
        localStorage.setItem('lastVisit', today);
        localStorage.setItem('streakCount', String(currentStreak));
    }
    setStreak(currentStreak);
    
    if (lastClaimedDate !== today) {
        setCanClaimDaily(true);
    }

    const q = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
        if (userCourses.length > 0 && !activeCourse) {
            setActiveCourse(userCourses[0]);
        }
        setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, activeCourse]);
  
  const resetAddCourseDialog = () => {
    setAddCourseStep(1);
    setNewCourse({ name: '', instructor: '', credits: '', url: '', description: '', isNewTopic: null });
    setLearningPace("3");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };
  
   const handleGenerateCourse = async () => {
    if (!user || !newCourse.name || newCourse.isNewTopic === null || !learnerType) return;
    
    setAddCourseOpen(false);
    setIsGenerating(true);
    setGeneratingCourseName(newCourse.name);
    
    try {
        const result = await generateInitialCourseAndRoadmap({
            courseName: newCourse.name,
            courseDescription: newCourse.description || `An in-depth course on ${newCourse.name}`,
            learnerType: learnerType as any,
            durationInMonths: parseInt(learningPace, 10),
        });

        const { courseOutline, firstChapterContent, roadmap } = result;

        const newUnits = courseOutline.modules.map((module, mIdx) => ({
            id: crypto.randomUUID(),
            title: module.title,
            chapters: module.chapters.map((chapter, cIdx) => ({
                id: crypto.randomUUID(),
                title: chapter.title,
                ...(mIdx === 0 && cIdx === 0 ? { ...firstChapterContent, content: firstChapterContent.content as any } : {}),
            }))
        }));

        const courseData = {
            name: newCourse.name,
            description: newCourse.description || `An in-depth course on ${newCourse.name}`,
            url: newCourse.url,
            userId: user.uid,
            units: newUnits,
            isNewTopic: true,
            completedChapters: [],
            progress: 0,
        };

        const courseDocRef = await addDoc(collection(db, "courses"), courseData);
        
        const newRoadmap = {
            goals: roadmap.goals.map(g => ({ ...g, id: crypto.randomUUID(), icon: g.icon || 'Flag' })),
            milestones: roadmap.milestones.map(m => ({ ...m, id: crypto.randomUUID(), icon: m.icon || 'Calendar', completed: false }))
        };
        await addDoc(collection(db, 'roadmaps'), { ...newRoadmap, courseId: courseDocRef.id, userId: user.uid });
        
        toast({ title: 'Course & Roadmap Generated!', description: 'Your new learning lab is ready.' });
        router.push(`/dashboard/courses?courseId=${courseDocRef.id}`);
        
    } catch (error) {
        console.error("Failed to generate course and roadmap:", error);
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create the full course content.' });
    } finally {
        setIsGenerating(false);
        resetAddCourseDialog();
    }
  };


  const handleAddExistingCourse = async () => {
    if (!newCourse.name) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please enter a course name.' });
        return;
    }
    if (!user) return;

    setIsSaving(true);

    const courseData = {
        name: newCourse.name,
        description: newCourse.description || `An in-depth course on ${newCourse.name}`,
        url: newCourse.url,
        instructor: newCourse.instructor || 'N/A',
        credits: parseInt(newCourse.credits, 10) || 0,
        userId: user.uid,
        isNewTopic: false,
        units: [],
        completedChapters: [],
        progress: 0,
        files: 0,
    };

    try {
        const docRef = await addDoc(collection(db, "courses"), courseData);
        toast({ title: 'Course Added!' });
        resetAddCourseDialog();
        setAddCourseOpen(false);
        router.push(`/dashboard/upload?courseId=${docRef.id}`);

    } catch(error) {
        console.error("Error adding course: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add course.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleClaimReward = async () => {
    if (!user || !canClaimDaily) return;
    
    const amount = Math.floor(Math.random() * 41) + 10; // 10 to 50 coins

    try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { coins: increment(amount) });
        
        localStorage.setItem('dailyRewardClaimed', new Date().toDateString());
        setCanClaimDaily(false);
        
        showReward({ type: 'coins', amount });
        toast({ title: 'Reward Claimed!', description: `You earned ${amount} coins!` });
    } catch(e) {
        console.error("Failed to claim reward:", e);
        toast({ variant: 'destructive', title: 'Could not claim reward' });
    }
  };

  if (isGenerating) {
    return <GeneratingCourse courseName={generatingCourseName} />;
  }

  if (loading || dataLoading) {
    return (
        <div className="p-8">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-12 w-full max-w-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Skeleton className="h-[450px] w-full" />
                </div>
                <div className="space-y-8">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Good afternoon, {user?.displayName?.split(' ')[0] || 'User'}! 👋</h1>
            <p className="text-slate-500 dark:text-slate-400">Which study set are you working on today?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-surface-dark p-2 pl-3 pr-4 rounded-full shadow-md shadow-blue-500/10">
              <Bolt className="text-amber-500" />
              <span className="font-bold text-slate-900 dark:text-white">12,500 XP</span>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="text-sm font-semibold">See Rewards</Button>
                </DialogTrigger>
                <RewardsDialog streak={streak} />
            </Dialog>
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-md shadow-blue-500/10">
              <Bell className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </header>
        <div className="flex items-center gap-2 border-b border-blue-200/80 dark:border-slate-700 mb-8">
            {courses.slice(0, 3).map(course => (
                 <button 
                    key={course.id}
                    onClick={() => setActiveCourse(course)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold ${activeCourse?.id === course.id ? 'border-primary-light text-primary-dark dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary-light'}`}
                  >
                    <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">
                        {course.name.substring(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate max-w-[120px]">{course.name}</span>
                </button>
            ))}
            <Dialog open={addCourseOpen} onOpenChange={(open) => { if (!open) resetAddCourseDialog(); setAddCourseOpen(open); }}>
                <DialogTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400">
                        <Plus className="text-slate-400" />
                        <span className="text-sm">Add Course</span>
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a New Course</DialogTitle>
                        <DialogDescription>
                            {addCourseStep === 1 ? 'First, provide some details about your course.' : 'How quickly do you want to learn?'}
                        </DialogDescription>
                    </DialogHeader>
                    {addCourseStep === 1 ? (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Course Name</Label>
                                <Input id="name" name="name" value={newCourse.name} onChange={handleInputChange} placeholder="e.g., Introduction to AI"/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea id="description" name="description" value={newCourse.description} onChange={handleInputChange} placeholder="A brief summary of the course"/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="url">Course URL (Optional)</Label>
                                <Input id="url" name="url" value={newCourse.url} onChange={handleInputChange} placeholder="https://example.com/course-link"/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="is-new-topic">Are you currently in this course?</Label>
                                <Select onValueChange={(value) => setNewCourse(prev => ({...prev, isNewTopic: value === 'true' }))}>
                                    <SelectTrigger id="is-new-topic">
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">Yes, I am</SelectItem>
                                        <SelectItem value="true">No, I'm learning something new</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ) : (
                        <div className="py-4">
                            <RadioGroup value={learningPace} onValueChange={setLearningPace} className="space-y-4">
                                {paces.map(pace => (
                                    <Label key={pace.value} htmlFor={`pace-${pace.value}`} className={cn("flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer", learningPace === pace.value && "border-primary bg-primary/10 ring-2 ring-primary")}>
                                        <RadioGroupItem value={pace.value} id={`pace-${pace.value}`} className="mt-1" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {pace.icon}
                                                <span className="font-semibold text-lg">{pace.label}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{pace.description}</p>
                                        </div>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </div>
                    )}
                    <DialogFooter>
                        {addCourseStep === 1 ? (
                            <>
                                <Button variant="ghost" onClick={() => { setAddCourseOpen(false); resetAddCourseDialog();}}>Cancel</Button>
                                <Button onClick={() => newCourse.isNewTopic ? setAddCourseStep(2) : handleAddExistingCourse()} disabled={isSaving || newCourse.isNewTopic === null || !newCourse.name}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {newCourse.isNewTopic ? 'Next' : 'Add Course'}
                                    {newCourse.isNewTopic && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => setAddCourseStep(1)}>Back</Button>
                                <Button onClick={handleGenerateCourse} disabled={isSaving || isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isGenerating ? 'Generating...' : 'Generate Course & Plan'}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Link href="/dashboard/courses" className="ml-auto flex items-center gap-2 text-sm font-semibold text-primary-light">
              See All My Sets
            </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeCourse ? <StudySetCard course={activeCourse} /> : <div className="text-center p-12 bg-muted rounded-2xl">Select a course to see details.</div>}
          </div>
          <div className="space-y-8">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-md shadow-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Flame className="text-orange-500 text-4xl" />
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{streak} day streak!</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Keep up the good work.</p>
                </div>
              </div>
                <Button onClick={handleClaimReward} disabled={!canClaimDaily} className="text-sm font-semibold">
                    {canClaimDaily ? 'Claim Daily Coins' : 'Claimed'}
                </Button>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-md shadow-blue-500/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Materials</h3>
                <button className="flex items-center gap-2 text-sm font-semibold text-primary-light bg-blue-500/10 px-3 py-2 rounded-xl hover:bg-blue-500/20">
                  <Upload className="text-base" />
                  Upload
                </button>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-slate-800/60 rounded-xl">
                    <FileText className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Risk Management</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nov 6, 2025</p>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-slate-800/60 rounded-xl">
                    <FileText className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Technical Analysis</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nov 6, 2025</p>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-slate-800/60 rounded-xl">
                    <Mic className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Untitled Lecture</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nov 5, 2025</p>
                  </div>
                </li>
              </ul>
              <button className="w-full text-center mt-6 text-sm font-semibold text-primary-light">View All</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
