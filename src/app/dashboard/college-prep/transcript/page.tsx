
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type Course = {
    id: string;
    name: string;
    type: 'AP' | 'Honors' | 'Regular';
};

export default function TranscriptPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseType, setNewCourseType] = useState<'AP' | 'Honors' | 'Regular'>('Regular');

    useEffect(() => {
        const savedCourses = localStorage.getItem('transcriptCourses');
        if (savedCourses) {
            setCourses(JSON.parse(savedCourses));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('transcriptCourses', JSON.stringify(courses));
    }, [courses]);

    const handleAddCourse = () => {
        if (!newCourseName.trim()) {
            toast({ variant: 'destructive', title: 'Course name is required.' });
            return;
        }

        const newCourse: Course = {
            id: crypto.randomUUID(),
            name: newCourseName,
            type: newCourseType,
        };

        setCourses(prev => [...prev, newCourse]);
        setNewCourseName('');
        setNewCourseType('Regular');
        setIsAddCourseOpen(false);
        toast({ title: 'Course Added!' });
    };

    const handleDeleteCourse = (id: string) => {
        setCourses(prev => prev.filter(c => c.id !== id));
        toast({ title: 'Course Removed' });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Button variant="ghost" onClick={() => router.push('/dashboard/college-prep')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to College Prep Hub
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Transcript</h1>
                <p className="text-muted-foreground">Add all the courses you've taken to help us calculate your academic rigor.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>My Courses ({courses.length})</CardTitle>
                        <CardDescription>A list of your high school coursework.</CardDescription>
                    </div>
                     <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4"/> Add Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add a New Course</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="course-name">Course Name</Label>
                                    <Input id="course-name" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} placeholder="e.g., AP Calculus BC"/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="course-type">Course Type</Label>
                                    <Select value={newCourseType} onValueChange={(v: any) => setNewCourseType(v)}>
                                        <SelectTrigger id="course-type">
                                            <SelectValue placeholder="Select type"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AP">AP</SelectItem>
                                            <SelectItem value="Honors">Honors</SelectItem>
                                            <SelectItem value="Regular">Regular</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                <Button onClick={handleAddCourse}>Add Course</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {courses.length > 0 ? (
                        <div className="space-y-3">
                            {courses.map(course => (
                                <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                    <div>
                                        <p className="font-semibold">{course.name}</p>
                                        <p className="text-xs text-muted-foreground">{course.type}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCourse(course.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground p-8">
                            You haven't added any courses yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
