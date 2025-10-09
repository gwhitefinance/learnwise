
'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, Lightbulb, Link as LinkIcon, Plus, UploadCloud, FileText, Trash2, Wand2, Loader2, Video, Image as ImageIcon } from 'lucide-react';
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
import { generateChapterContent, generateMiniCourse } from '@/lib/actions';
import { useTour } from '../../layout';
import { cn } from '@/lib/utils';


type CourseFile = {
    id: string;
    name: string;
    type: string;
    size: number;
}

type Chapter = {
    id: string;
    title: string;
    content?: string;
    activity?: string;
    imageUrl?: string;
    diagramUrl?: string;
    videoUrl?: string;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { toast } = useToast();
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const { nextTourStep } = useTour();


  // State for dialogs
  const [isUnitDialogOpen, setUnitDialogOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null);
  const [isChapterContentLoading, setChapterContentLoading] = useState<Record<string, boolean>>({});

  
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
    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');

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

  const handleGenerateLab = async () => {
    if (!course || !user) return;
    
    setIsGenerating(true);
    toast({ title: 'Generating Learning Lab...', description: `This might take a minute...` });

    try {
        const learnerType = localStorage.getItem('learnerType') as any || 'Reading/Writing';
        const result = await generateMiniCourse({
            courseName: course.name,
            courseDescription: course.description || `An in-depth course on ${course.name}`,
            learnerType,
        });

        const newUnits = result.modules.map(module => ({
            id: crypto.randomUUID(),
            name: module.title,
            chapters: module.chapters.map(chapter => ({ 
                ...chapter, 
                id: crypto.randomUUID(),
            }))
        }));
        
        if (newUnits.length === 0) {
            throw new Error("AI did not generate any modules.");
        }
        
        const courseRef = doc(db, 'courses', course.id);
        await updateDoc(courseRef, { 
            units: newUnits,
        });
        
        setCourse(prev => prev ? { ...prev, units: newUnits } : null);

        toast({ title: 'Learning Lab Generated!', description: 'Your new course structure is ready.'});
        nextTourStep();

    } catch (error) {
        console.error("Failed to generate course content:", error);
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create content for this course.' });
    } finally {
        setIsGenerating(false);
    }
  };

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

  const handleGenerateChapterContent = async (unitId: string, chapterId: string) => {
    if (!course || !learnerType) return;
    const unit = course.units?.find(u => u.id === unitId);
    const chapter = unit?.chapters.find(c => c.id === chapterId);

    if (!unit || !chapter) return;

    setChapterContentLoading(prev => ({...prev, [chapterId]: true }));
    try {
      const result = await generateChapterContent({
        courseName: course.name,
        moduleTitle: unit.name,
        chapterTitle: chapter.title,
        learnerType: learnerType as any,
      });

      const updatedUnits = course.units?.map(u => {
        if (u.id === unitId) {
          return {
            ...u,
            chapters: u.chapters.map(c => c.id === chapterId ? { ...c, ...result } : c),
          };
        }
        return u;
      });

      const courseRef = doc(db, 'courses', course.id);
      await updateDoc(courseRef, { units: updatedUnits });
      setCourse(prev => prev ? { ...prev, units: updatedUnits } : null);
    } catch (error) {
      console.error('Failed to generate chapter content', error);
      toast({ variant: 'destructive', title: 'Failed to generate content.' });
    } finally {
      setChapterContentLoading(prev => ({ ...prev, [chapterId]: false }));
    }
  };


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
                <h2 className="text-2xl font-semibold tracking-tight">Learning Lab Content</h2>
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
            
            {(!course.units || course.units.length === 0) ? (
                 <Card className="text-center p-8 border-dashed">
                    <Wand2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No Learning Lab content has been generated for this course yet.</p>
                    <Button id="generate-lab-button" onClick={handleGenerateLab} disabled={isGenerating}>
                        {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4"/> Generate Learning Lab with AI</>}
                    </Button>
                </Card>
            ) : (
                <Accordion type="multiple" className="w-full space-y-4">
                    {course.units.map(unit => (
                        <AccordionItem key={unit.id} value={unit.id} className="bg-card border rounded-lg">
                            <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
                                {unit.name}
                            </AccordionTrigger>
                            <AccordionContent className="p-6 pt-0">
                                <div className="space-y-4">
                                     {unit.chapters?.length > 0 ? (
                                        <Accordion type="multiple" className="w-full space-y-2">
                                            {unit.chapters.map(chapter => (
                                                <AccordionItem key={chapter.id} value={chapter.id} className="bg-muted/50 border rounded-md">
                                                    <AccordionTrigger className="px-4 py-3 text-md hover:no-underline">{chapter.title}</AccordionTrigger>
                                                    <AccordionContent className="px-4 pb-4">
                                                        <div className='space-y-4 border-t pt-4'>
                                                            {chapter.content ? (
                                                                <>
                                                                    {chapter.imageUrl && (
                                                                        <div className="mt-4 rounded-lg overflow-hidden border aspect-video relative">
                                                                            <Image src={chapter.imageUrl} alt={`Header for ${chapter.title}`} layout="fill" objectFit="cover" />
                                                                        </div>
                                                                    )}
                                                                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{chapter.content}</p>
                                                                    {chapter.diagramUrl && (
                                                                        <div className="mt-4 p-4 bg-background/50 rounded-lg">
                                                                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2"><ImageIcon size={16} /> Diagram</h5>
                                                                            <div className="rounded-lg overflow-hidden border aspect-video relative">
                                                                                <Image src={chapter.diagramUrl} alt={`Diagram for ${chapter.title}`} layout="fill" objectFit="contain" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {chapter.videoUrl && (
                                                                        <div className="mt-4 p-4 bg-background/50 rounded-lg">
                                                                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2"><Video size={16} /> Video Clip</h5>
                                                                            <div className="rounded-lg overflow-hidden border aspect-video bg-black">
                                                                                <video src={chapter.videoUrl} controls className="w-full h-full" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="mt-4 p-3 bg-amber-500/10 rounded-md border border-amber-500/20 text-sm">
                                                                        <p className="font-semibold text-amber-700">Activity:</p>
                                                                        <p className="text-muted-foreground">{chapter.activity}</p>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <Button size="sm" variant="secondary" className="mt-2" onClick={() => handleGenerateChapterContent(unit.id, chapter.id)} disabled={isChapterContentLoading[chapter.id]}>
                                                                    <Wand2 className="mr-2 h-4 w-4"/> {isChapterContentLoading[chapter.id] ? 'Generating...' : 'Generate Content with AI'}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No chapters in this unit yet.</p>
                                    )}

                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-md">Unit Files</h4>
                                            <Button variant="ghost" size="sm" onClick={() => openUploadDialog(unit.id)}>
                                                <UploadCloud className="mr-2 h-4 w-4"/> Upload File
                                            </Button>
                                        </div>
                                        {unit.files && unit.files.length > 0 ? (
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
                    ))}
                </Accordion>
            )}
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
