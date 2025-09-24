
'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, Lightbulb, Link as LinkIcon, Plus, UploadCloud, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type CourseFile = {
    id: string;
    name: string;
    type: string;
    size: number;
}

type Chapter = {
    id: string;
    title: string;
    content: string;
    activity: string;
};

type Unit = {
    id: string;
    name: string;
    chapters: Chapter[];
    files?: CourseFile[];
}

type Course = {
  id: string;
  name: string;
  instructor: string;
  credits: number;
  url?: string;
  imageUrl?: string;
  description?: string;
  userId?: string;
  units?: Unit[];
};

export default function ClientCoursePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { toast } = useToast();

  // State for dialogs
  const [isUnitDialogOpen, setUnitDialogOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null);
  
  const fetchCourse = useCallback(async () => {
      if (!user || !courseId) return;
      setLoading(true);
      const docRef = doc(db, "courses", courseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const courseData = { id: docSnap.id, ...docSnap.data() } as Course;
        if (courseData.userId === user.uid) {
          if (!courseData.description) {
            courseData.description = `This course, taught by ${courseData.instructor}, provides a comprehensive overview of ${courseData.name}. It covers fundamental principles and advanced topics to equip students with the knowledge needed in this field.`;
          }
          setCourse(courseData);
        } else {
          setCourse(null); 
        }
      } else {
        setCourse(null);
      }
      setLoading(false);
    }, [user, courseId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!courseId) {
        setLoading(false);
        return;
    }

    fetchCourse();
  }, [courseId, user, authLoading, router, fetchCourse]);

  const handleAddUnit = async () => {
      if (!newUnitName.trim() || !course) {
          toast({ variant: 'destructive', title: 'Unit name is required.' });
          return;
      }

      const newUnit: Unit = {
          id: crypto.randomUUID(),
          name: newUnitName,
          chapters: [],
          files: [],
      };

      try {
          const courseRef = doc(db, 'courses', course.id);
          await updateDoc(courseRef, {
              units: arrayUnion(newUnit)
          });
          toast({ title: 'Unit Added!', description: `"${newUnitName}" has been added.` });
          setUnitDialogOpen(false);
          setNewUnitName('');
          fetchCourse(); // Refetch to get updated data
      } catch (error) {
          console.error("Error adding unit: ", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not add the unit.' });
      }
  };

  const handleFileUpload = async () => {
    if (!filesToUpload || filesToUpload.length === 0 || !selectedUnitId || !course) {
        toast({ variant: 'destructive', title: 'File and unit selection are required.'});
        return;
    }

    const newFiles: CourseFile[] = Array.from(filesToUpload).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
    }));

    const updatedUnits = course.units?.map(unit => {
        if (unit.id === selectedUnitId) {
            return {
                ...unit,
                files: [...(unit.files || []), ...newFiles]
            }
        }
        return unit;
    });

    try {
        const courseRef = doc(db, 'courses', course.id);
        await updateDoc(courseRef, { units: updatedUnits });
        toast({ title: 'Files Added!', description: `${newFiles.length} file(s) added to the unit.`});
        fetchCourse();
    } catch (error) {
        console.error("Error uploading files: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not upload files.'});
    } finally {
        setUploadDialogOpen(false);
        setFilesToUpload(null);
        setSelectedUnitId(null);
    }
  }
  
  const openUploadDialog = (unitId: string) => {
    setSelectedUnitId(unitId);
    setUploadDialogOpen(true);
  }


  if (loading || authLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="aspect-[3/2] w-full" />
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!course) {
    notFound();
    return null;
  }

  return (
    <>
    <div className="space-y-6">
      <Link href="/dashboard/courses">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-4xl font-bold mb-2">{course.name}</CardTitle>
                  <CardDescription className="text-lg">
                    Taught by {course.instructor} &bull; {course.credits} Credits
                  </CardDescription>
                </div>
                {course.url && (
                  <a href={course.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <LinkIcon className="mr-2 h-4 w-4" /> Visit Course
                    </Button>
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mt-4">{course.description}</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Image
            src={course.imageUrl || 'https://picsum.photos/seed/course1/600/400'}
            alt="Course thumbnail"
            width={600}
            height={400}
            className="rounded-lg object-cover w-full"
            data-ai-hint="online course"
          />
        </div>
      </div>

       <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight">Course Content</h2>
                <Dialog open={isUnitDialogOpen} onOpenChange={setUnitDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Unit</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add New Unit</DialogTitle></DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="unit-name">Unit Name</Label>
                            <Input id="unit-name" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} placeholder="e.g., Unit 1: Introduction"/>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleAddUnit}>Add Unit</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Accordion type="single" collapsible className="w-full" defaultValue={course.units?.[0]?.id}>
                 {course.units && course.units.length > 0 ? course.units.map(unit => (
                    <AccordionItem key={unit.id} value={unit.id}>
                        <AccordionTrigger className="text-lg font-medium">{unit.name}</AccordionTrigger>
                        <AccordionContent>
                           <div className="space-y-6 pl-4 border-l-2 ml-2">
                                {/* Chapters Section */}
                                {unit.chapters?.length > 0 ? (
                                <div className="space-y-4">
                                    {unit.chapters.map(chapter => (
                                        <div key={chapter.id}>
                                            <h4 className="font-semibold text-md">{chapter.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{chapter.content}</p>
                                            <div className="mt-2 p-3 bg-amber-500/10 rounded-md border border-amber-500/20 text-sm">
                                                <p className="font-semibold text-amber-700">Activity:</p>
                                                <p className="text-muted-foreground">{chapter.activity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No chapters in this unit yet.</p>
                                )}

                                {/* Files Section */}
                                <div className="pt-4 border-t">
                                     <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-md">Unit Files</h4>
                                        <Button variant="ghost" size="sm" onClick={() => openUploadDialog(unit.id)}>
                                            <UploadCloud className="mr-2 h-4 w-4"/> Upload File
                                        </Button>
                                    </div>
                                    {unit.files?.length > 0 ? (
                                        <ul className="space-y-2">
                                            {unit.files.map(file => (
                                                <li key={file.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <span>{file.name}</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No files uploaded to this unit.</p>
                                    )}
                                </div>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                )) : (
                    <Card className="text-center p-8 border-dashed">
                        <p className="text-muted-foreground">No units created yet. Add a unit or regenerate course content from a URL.</p>
                    </Card>
                )}
            </Accordion>
        </div>


      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Study Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href={`/dashboard/ai-chat?courseId=${course.id}`}>
            <Card className="hover:bg-muted transition-colors h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit /> AI Chat
                </CardTitle>
                <CardDescription>
                  Get instant answers and explanations tailored to this course.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href={`/dashboard/practice-quiz?topic=${encodeURIComponent(course.name)}`}>
            <Card className="hover:bg-muted transition-colors h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb /> Practice Quiz
                </CardTitle>
                <CardDescription>
                  Test your knowledge with AI-generated quizzes about {course.name}.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/dashboard/notes">
            <Card className="hover:bg-muted transition-colors h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText /> Take Notes
                </CardTitle>
                <CardDescription>
                  Create and organize your study notes for this course.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
    
    <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>Add files to the selected unit.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="file-upload">Choose files</Label>
                <Input id="file-upload" type="file" multiple onChange={(e) => setFilesToUpload(e.target.files)}/>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleFileUpload}>Upload</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    </>
  );
}
