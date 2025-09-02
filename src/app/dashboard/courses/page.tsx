
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilePenLine, Plus, Trash2, Link as LinkIcon, Eye } from "lucide-react";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const initialCourses = [
    {
        id: '1',
        name: "Introduction to Programming",
        instructor: "Dr. Emily Carter",
        credits: 3,
        url: 'https://www.coursera.org/specializations/python'
    },
    {
        id: '2',
        name: "Calculus I",
        instructor: "Prof. David Lee",
        credits: 4,
        url: ''
    },
    {
        id: '3',
        name: "Linear Algebra",
        instructor: "Dr. Sarah Jones",
        credits: 3,
        url: ''
    },
];

type Course = {
    id: string;
    name: string;
    instructor: string;
    credits: number;
    url?: string;
};

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isAddCourseOpen, setAddCourseOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', instructor: '', credits: '', url: ''});
    const { toast } = useToast();

    useEffect(() => {
        const savedCourses = localStorage.getItem('courses');
        if (savedCourses) {
            setCourses(JSON.parse(savedCourses));
        } else {
            setCourses(initialCourses);
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

    const handleDeleteCourse = (id: string) => {
        const updatedCourses = courses.filter(c => c.id !== id);
        setCourses(updatedCourses);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        toast({
            title: 'Course Removed',
        });
    };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Dialog open={isAddCourseOpen} onOpenChange={setAddCourseOpen}>
            <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Course
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
      <Card>
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
                        {course.name}
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
                    <Button variant="ghost" size="icon">
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
        </CardContent>
      </Card>
    </div>
  );
}
