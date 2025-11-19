

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wand2, FlaskConical, Plus, ArrowRight, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, onSnapshot, serverTimestamp, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { Snail, Turtle, Rabbit } from 'lucide-react';
import { cn } from '@/lib/utils';
import GeneratingCourse from '../courses/GeneratingCourse';
import { generateInitialCourseAndRoadmap } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type Course = {
    id: string;
    name: string;
    description?: string;
    url?: string;
    userId?: string;
    units?: Module[];
    completedChapters?: string[];
    instructor?: string;
    credits?: number;
    isNewTopic?: boolean;
    labCompleted?: boolean;
    keyConcepts?: string[];
};

type Module = {
    id: string;
    title: string;
    chapters: Chapter[];
};

type Chapter = {
    id: string;
    title: string;
    content?: any; // Can be string or structured content
    activity?: string;
};

const paces = [
  { value: "6", label: "Casual", description: "A relaxed pace for exploring.", icon: <Snail className="h-6 w-6" /> },
  { value: "3", label: "Steady", description: "A balanced pace for consistent learning.", icon: <Turtle className="h-6 w-6" /> },
  { value: "1", label: "Intense", description: "A fast-paced schedule for quick mastery.", icon: <Rabbit className="h-6 w-6" /> },
];


export default function CoursesListPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', instructor: '', credits: '', url: '', description: '', isNewTopic: null as boolean | null });
  const [isSaving, setIsSaving] = useState(false);
  const [addCourseStep, setAddCourseStep] = useState(1);
  const [learningPace, setLearningPace] = useState<string>("3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCourseName, setGeneratingCourseName] = useState('');
  const [learnerType, setLearnerType] = useState<string | null>(null);

  useEffect(() => {
    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');
  }, []);
  
  useEffect(() => {
    if (authLoading || !user) return;

    const q = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const resetAddCourseDialog = () => {
    setAddCourseStep(1);
    setNewCourse({ name: '', instructor: '', credits: '', url: '', description: '', isNewTopic: null as boolean | null });
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

        const newUnits = courseOutline.modules.map((unit, uIdx) => ({
            id: crypto.randomUUID(),
            title: unit.title,
            chapters: unit.chapters.map((chapter, cIdx) => ({
                id: crypto.randomUUID(),
                title: chapter.title,
                ...(uIdx === 0 && cIdx === 0 ? { 
                    content: firstChapterContent.content,
                    activity: firstChapterContent.activity,
                } : {}),
            }))
        }));

        const courseData = {
            name: courseOutline.courseTitle || newCourse.name,
            description: newCourse.description || `An in-depth course on ${newCourse.name}`,
            url: newCourse.url,
            userId: user.uid,
            units: newUnits,
            isNewTopic: true,
            completedChapters: [],
            progress: 0,
            keyConcepts: courseOutline.keyConcepts || [],
        };

        const courseDocRef = await addDoc(collection(db, "courses"), courseData);
        
        const newRoadmap = {
            goals: roadmap.goals.map(g => ({ ...g, id: crypto.randomUUID(), icon: g.icon || 'Flag' })),
            milestones: roadmap.milestones.map(m => ({ ...m, id: crypto.randomUUID(), icon: m.icon || 'Calendar', completed: false }))
        };
        await addDoc(collection(db, 'roadmaps'), { ...newRoadmap, courseId: courseDocRef.id, userId: user.uid });
        
        toast({ title: 'Course & Roadmap Generated!', description: 'Your new learning lab is ready.' });
        router.push(`/dashboard/courses/${courseDocRef.id}`);
        
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
        toast({ variant: "destructive", title: "Error", description: "Could not add course." });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
        await deleteDoc(doc(db, "courses", courseId));
        toast({ title: 'Course Deleted' });
    } catch (error) {
        console.error("Error deleting course:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete course." });
    }
  };

  if (isGenerating) {
    return <GeneratingCourse courseName={generatingCourseName} />;
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
                <p className="text-muted-foreground">Manage your courses and generate interactive learning labs.</p>
            </div>
             <Dialog open={addCourseOpen} onOpenChange={(open) => { if (!open) resetAddCourseDialog(); setAddCourseOpen(open); }}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4"/> Add Course
                    </Button>
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
        </div>
        {isLoading || authLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
            </div>
        ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => {
                    const totalChapters = course.units?.reduce((acc, unit) => acc + (unit.chapters?.length ?? 0), 0) ?? 0;
                    const completedCount = course.completedChapters?.length ?? 0;
                    const courseProgress = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;
                    
                    return (
                    <Card key={course.id} className="hover:shadow-md transition-shadow flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{course.name}</CardTitle>
                                <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                             <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                    <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                </DropdownMenuItem>
                                             </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the course and all associated data.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <CardDescription>{course.description || (totalChapters > 0 ? `${totalChapters} chapters` : 'No content generated')}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {totalChapters > 0 && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{Math.round(courseProgress)}% Complete</p>
                                    <Progress value={courseProgress} className="h-2" />
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" asChild>
                                <Link href={`/dashboard/courses/${course.id}`}>
                                    {courseProgress > 0 ? 'Continue Learning' : 'Start Learning!'}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )})}
            </div>
        ) : (
            <Card className="text-center p-12">
               <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold">No Courses Created Yet</h2>
              <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                Click "Add Course" to create your first course and generate an interactive learning lab.
              </p>
            </Card>
        )}
    </div>
);
}
