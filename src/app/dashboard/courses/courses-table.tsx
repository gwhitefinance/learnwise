
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilePenLine, Plus, Trash2, Link as LinkIcon, Eye, Info, X } from "lucide-react";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateCourseFromUrl } from '@/lib/actions';


type Course = {
    id: string;
    name: string;
    instructor: string;
    credits: number;
    description?: string;
    url?: string;
    userId?: string;
};

function CoursesTable({ initialCourses }: { initialCourses: Course[] }) {
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const [isAddCourseOpen, setAddCourseOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', instructor: '', credits: '', url: '', description: '' });
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);
    const router = useRouter();
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [showInfoAlert, setShowInfoAlert] = useState(false);
    const [gradeLevel, setGradeLevel] = useState<string | null>(null);

    useEffect(() => {
        const hideAlert = localStorage.getItem('hideCoursesInfoAlert');
        if (hideAlert !== 'true') {
            setShowInfoAlert(true);
        }
        const storedGradeLevel = localStorage.getItem('onboardingGradeLevel');
        setGradeLevel(storedGradeLevel);
    }, []);
    
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/signup');
            return;
        };

        setIsDataLoading(true);
        const q = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            setIsDataLoading(false);
        }, (error) => {
            console.error("Error fetching courses: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load courses.'});
            setIsDataLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, router, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCourse = async () => {
        if (!newCourse.name) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all required fields.'
            });
            return;
        }
        if (!user) return;

        setIsSaving(true);
        setAddCourseOpen(false); // Close dialog immediately

        const courseToAdd = {
            name: newCourse.name,
            instructor: newCourse.instructor || 'N/A',
            credits: parseInt(newCourse.credits, 10) || 0,
            url: newCourse.url,
            description: newCourse.description,
            userId: user.uid,
        };

        try {
            const docRef = await addDoc(collection(db, "courses"), courseToAdd);
            toast({
                title: 'Course Added!',
                description: `${courseToAdd.name} has been added to your list.`
            });

            // If a URL was provided, generate the course content with AI
            if (newCourse.url) {
                toast({
                    title: 'Generating Course Content...',
                    description: 'The AI is analyzing the URL to create course units. This may take a moment.',
                });
                
                const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';

                try {
                    const { modules } = await generateCourseFromUrl({ 
                        courseUrl: newCourse.url, 
                        learnerType,
                        courseName: newCourse.name,
                        courseDescription: newCourse.description,
                        webContent: ''
                    });
                    const units = modules.map(module => ({
                        id: crypto.randomUUID(),
                        name: module.title,
                        chapters: module.chapters.map(chapter => ({ ...chapter, id: crypto.randomUUID() }))
                    }));

                    const courseDocRef = doc(db, 'courses', docRef.id);
                    await updateDoc(courseDocRef, { units });

                    toast({
                        title: 'Course Content Generated!',
                        description: `We've added ${units.length} units to your course.`,
                    });
                } catch (aiError) {
                    console.error("AI generation failed:", aiError);
                    toast({
                        variant: 'destructive',
                        title: 'AI Generation Failed',
                        description: 'Could not generate course content from the URL. You can add units manually.',
                    });
                }
            }
        } catch(error) {
            console.error("Error adding document: ", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not add course. Please try again.',
            });
        } finally {
            setNewCourse({ name: '', instructor: '', credits: '', url: '', description: '' });
            setIsSaving(false);
        }
    };


    const handleDeleteCourse = async (id: string) => {
        try {
            await deleteDoc(doc(db, "courses", id));
            toast({
                title: 'Course Removed',
            });
        } catch (error) {
            console.error("Error removing document: ", error);
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not remove course. Please try again.',
            });
        }
    };
    
    const dismissInfoAlert = () => {
        setShowInfoAlert(false);
        localStorage.setItem('hideCoursesInfoAlert', 'true');
    };

    if (authLoading || isDataLoading) {
        return <LoadingSkeleton />;
    }


  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Dialog open={isAddCourseOpen} onOpenChange={setAddCourseOpen}>
            <DialogTrigger asChild>
                <Button id="add-course-button">
                  <Plus className="mr-2 h-4 w-4" /> Add Course
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add a New Course</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Course Name</Label>
                        <Input id="name" name="name" value={newCourse.name} onChange={handleInputChange} placeholder="e.g., Introduction to AI"/>
                    </div>
                     {gradeLevel !== 'Other' && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="instructor">Instructor</Label>
                                <Input id="instructor" name="instructor" value={newCourse.instructor} onChange={handleInputChange} placeholder="e.g., Dr. Alan Turing"/>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="credits">Credits</Label>
                                <Input id="credits" name="credits" type="number" value={newCourse.credits} onChange={handleInputChange} placeholder="e.g., 3"/>
                            </div>
                        </>
                     )}
                    <div className="grid gap-2">
                        <Label htmlFor="url">Course URL (Optional)</Label>
                        <Input id="url" name="url" value={newCourse.url} onChange={handleInputChange} placeholder="https://example.com/course-link"/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Course Description (Optional)</Label>
                        <Input id="description" name="description" value={newCourse.description} onChange={handleInputChange} placeholder="A brief summary of the course."/>
                    </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleAddCourse} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Add Course'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

       {showInfoAlert && (
            <Alert className="mt-4 pr-12 relative">
                <Info className="h-4 w-4" />
                <AlertTitle>Pro Tip!</AlertTitle>
                <AlertDescription>
                    Click on a course name to view its details, add units, and upload files.
                </AlertDescription>
                 <button
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                    onClick={dismissInfoAlert}
                    aria-label="Dismiss pro tip"
                >
                    <X className="h-5 w-5" />
                </button>
            </Alert>
        )}

      <Card className="mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">COURSE NAME</TableHead>
                <TableHead className="font-semibold">INSTRUCTOR</TableHead>
                <TableHead className="font-semibold">CREDITS</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Link href={`/dashboard/courses/${course.id}`} className="hover:underline">
                            {course.name}
                        </Link>
                        {course.url && (
                            <a href={course.url} target="_blank" rel="noopener noreferrer">
                                <LinkIcon className="h-4 w-4 text-muted-foreground hover:text-primary"/>
                            </a>
                        )}
                    </div>
                    </TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/courses/${course.id}`}>
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" disabled>
                      <FilePenLine className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCourse(course.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            {courses.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    You haven't added any courses yet. Click "Add Course" to get started.
                </div>
            )}
        </CardContent>
      </Card>
    </>
  );
}


function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({length: 3}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Skeleton className="h-8 w-8 inline-block" />
                                        <Skeleton className="h-8 w-8 inline-block" />
                                        <Skeleton className="h-8 w-8 inline-block" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

const CoursesTableComponent = dynamic(() => Promise.resolve(CoursesTable), { ssr: false });

export default CoursesTableComponent;

    

    