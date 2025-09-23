
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MoreVertical, Trash2, Star, Archive, Sparkles, Wand2, Lightbulb, Copy, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { generateSummary } from '@/ai/flows/note-summary-flow';
import { generateQuizFromNote } from '@/ai/flows/note-to-quiz-flow';
import type { GenerateQuizOutput } from '@/ai/schemas/quiz-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateFlashcardsFromNote } from '@/ai/flows/note-to-flashcard-flow';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp, onSnapshot, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Unit = {
    id: string;
    name: string;
};

type Course = {
    id: string;
    name: string;
    units?: Unit[];
};

type Note = {
  id: string;
  title: string;
  content: string;
  date: Date;
  color: string;
  isImportant: boolean;
  isCompleted: boolean;
  userId?: string;
  courseId?: string;
  unitId?: string;
};

type FirestoreNote = Omit<Note, 'date'> & {
    date: Timestamp;
}

type Flashcard = {
    front: string;
    back: string;
};

const NoteCard = ({ note, onDelete, onToggleImportant, onToggleComplete, onSummarize, onGenerateQuiz, onGenerateFlashcards }: { note: Note, onDelete: (id: string) => void, onToggleImportant: (id: string) => void, onToggleComplete: (id: string, isCompleted: boolean) => void, onSummarize: (content: string) => void, onGenerateQuiz: (noteContent: string) => void, onGenerateFlashcards: (noteContent: string) => void }) => {
  return (
    <Card className={`overflow-hidden ${note.color}`}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{note.title}</CardTitle>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={() => onSummarize(note.content)}>
                    <Wand2 className="mr-2 h-4 w-4 text-purple-500"/> Summarize with AI
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => onGenerateFlashcards(note.content)}>
                    <Copy className="mr-2 h-4 w-4 text-blue-500"/> Generate Flashcards
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerateQuiz(note.content)}>
                    <Lightbulb className="mr-2 h-4 w-4 text-yellow-500"/> Generate Quiz
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleImportant(note.id)}>
                    <Star className="mr-2 h-4 w-4"/> {note.isImportant ? 'Unmark' : 'Mark'} as Important
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleComplete(note.id, !note.isCompleted)}>
                   <Archive className="mr-2 h-4 w-4"/> {note.isCompleted ? 'Un-archive' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive">
                   <Trash2 className="mr-2 h-4 w-4"/> Delete Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <CardDescription className="text-sm pt-2">{note.content}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
         <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(note.date), { addSuffix: true })}</p>
      </CardContent>
    </Card>
  );
};

const TodoListItem = ({ note, onDelete, onToggleComplete }: { note: Note, onDelete: (id: string) => void, onToggleComplete: (id: string, isCompleted: boolean) => void }) => {
    return (
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
                <Checkbox id={`task-${note.id}`} checked={note.isCompleted} onCheckedChange={(checked) => onToggleComplete(note.id, !!checked)} />
                <Label htmlFor={`task-${note.id}`} className={`text-sm ${note.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {note.title}
                </Label>
            </div>
             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => onDelete(note.id)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isNoteDialogOpen, setNoteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCourseId, setNewNoteCourseId] = useState<string | undefined>(undefined);
  const [newNoteUnitId, setNewNoteUnitId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('all');

  const [filterCourseId, setFilterCourseId] = useState<string | null>(null);
  const [filterUnitId, setFilterUnitId] = useState<string | null>(null);

  const [isSummaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [isQuizDialogOpen, setQuizDialogOpen] = useState(false);
  const [isQuizLoading, setQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  const [isFlashcardDialogOpen, setFlashcardDialogOpen] = useState(false);
  const [isFlashcardLoading, setFlashcardLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isNotesLoading, setIsNotesLoading] = useState(true);
  
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  
  const colors = ['bg-red-100 dark:bg-red-900/20', 'bg-yellow-100 dark:bg-yellow-900/20', 'bg-green-100 dark:bg-green-900/20', 'bg-blue-100 dark:bg-blue-900/20', 'bg-purple-100 dark:bg-purple-900/20', 'bg-indigo-100 dark:bg-indigo-900/20'];

  useEffect(() => {
    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/signup');
        return;
    }

    setIsNotesLoading(true);
    const q = query(collection(db, "notes"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userNotes = querySnapshot.docs.map(doc => {
            const data = doc.data() as Omit<FirestoreNote, 'id'>;
            return { 
                id: doc.id,
                ...data,
                date: data.date.toDate()
            } as Note;
        });
        
        userNotes.sort((a, b) => b.date.getTime() - a.date.getTime());
        setNotes(userNotes);
        setIsNotesLoading(false);
    });

    const coursesQuery = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
        const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
    });
    
    return () => {
        unsubscribe();
        unsubscribeCourses();
    }
  }, [user, authLoading, router]);
  
  const resetNewNoteForm = () => {
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteCourseId(undefined);
    setNewNoteUnitId(undefined);
  };

  const handleAddNote = async () => {
    if (!newNoteTitle || !user) {
      toast({
        variant: 'destructive',
        title: 'Title is required',
        description: 'Please enter a title for your note.',
      });
      return;
    }
    
    setIsSaving(true);
    const tempId = crypto.randomUUID();
    const noteData: Note = {
      id: tempId,
      title: newNoteTitle,
      content: newNoteContent,
      date: new Date(),
      color: colors[Math.floor(Math.random() * colors.length)],
      isImportant: false,
      isCompleted: false,
      userId: user.uid,
      courseId: newNoteCourseId,
      unitId: newNoteUnitId,
    };

    setNotes(prev => [noteData, ...prev]);
    setNoteDialogOpen(false);
    resetNewNoteForm();
    setIsSaving(false);


    try {
        const docData: Omit<Note, 'id'> = { ...noteData };
        delete (docData as any).id;

        const docRef = await addDoc(collection(db, "notes"), docData);

        setNotes(prev => prev.map(n => n.id === tempId ? { ...n, id: docRef.id } : n));

        toast({
            title: 'Note Created!',
            description: 'Your new note has been saved.',
        });
    } catch(error) {
        console.error("Error adding note: ", error);
        setNotes(prev => prev.filter(n => n.id !== tempId));
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save note. Please try again.',
        });
    }
  };
  
  const handleDeleteNote = async (id: string) => {
    try {
        await deleteDoc(doc(db, "notes", id));
        toast({ title: 'Note Deleted' });
    } catch(error) {
        console.error("Error deleting note: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete note.' });
    }
  };
  
  const handleToggleImportant = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if(!note) return;
    try {
        const noteRef = doc(db, "notes", id);
        await updateDoc(noteRef, { isImportant: !note.isImportant });
    } catch (error) {
         console.error("Error updating note: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update note.' });
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
     try {
        const noteRef = doc(db, "notes", id);
        await updateDoc(noteRef, { isCompleted });
        toast({ title: isCompleted ? 'Note Archived' : 'Note Restored' });
    } catch (error) {
        console.error("Error updating note: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update note.' });
    }
  };

  const handleSummarize = async (noteContent: string) => {
    setSummaryDialogOpen(true);
    setSummaryLoading(true);
    setSummaryContent('');
    try {
        const result = await generateSummary({ noteContent });
        setSummaryContent(result.summary);
    } catch (error) {
        console.error("Failed to generate summary:", error);
        setSummaryContent('Sorry, there was an error generating the summary.');
        toast({
            variant: 'destructive',
            title: 'Summarization Failed',
            description: 'Could not generate a summary for this note.',
        });
    } finally {
        setSummaryLoading(false);
    }
  };
  
  const handleGenerateQuiz = async (noteContent: string) => {
    setQuizDialogOpen(true);
    setQuizLoading(true);
    setGeneratedQuiz(null);
    try {
        const result = await generateQuizFromNote({
            noteContent,
            learnerType: (learnerType as any) ?? 'Reading/Writing'
        });
        setGeneratedQuiz(result);
    } catch(error) {
        console.error("Failed to generate quiz:", error);
        toast({
            variant: 'destructive',
            title: 'Quiz Generation Failed',
            description: 'Could not generate a quiz for this note.',
        });
        setQuizDialogOpen(false);
    } finally {
        setQuizLoading(false);
    }
  };

  const handleGenerateFlashcards = async (noteContent: string) => {
    setFlashcardDialogOpen(true);
    setFlashcardLoading(true);
    setFlashcards([]);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    try {
        const result = await generateFlashcardsFromNote({
            noteContent,
            learnerType: (learnerType as any) ?? 'Reading/Writing'
        });
        setFlashcards(result.flashcards);
    } catch(error) {
        console.error("Failed to generate flashcards:", error);
        toast({
            variant: 'destructive',
            title: 'Flashcard Generation Failed',
            description: 'Could not generate flashcards for this note.',
        });
        setFlashcardDialogOpen(false);
    } finally {
        setFlashcardLoading(false);
    }
  };

  const getFilteredNotes = () => {
    let filtered = notes;

    if (filterCourseId && filterCourseId !== 'all') {
        filtered = filtered.filter(note => note.courseId === filterCourseId);
        if (filterUnitId && filterUnitId !== 'all') {
            filtered = filtered.filter(note => note.unitId === filterUnitId);
        }
    }

    if (activeTab === 'all') return filtered.filter(note => !note.isCompleted);
    if (activeTab === 'important') return filtered.filter(note => note.isImportant && !note.isCompleted);
    if (activeTab === 'todo') return filtered.filter(note => !note.isCompleted);
    if (activeTab === 'completed') return filtered.filter(note => note.isCompleted);

    return [];
  };

  const displayedNotes = getFilteredNotes();
  const selectedCourseForFilter = courses.find(c => c.id === filterCourseId);

  const selectedCourseForDialog = courses.find(c => c.id === newNoteCourseId);

  return (
    <>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notes</h1>
        <Dialog open={isNoteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Note</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="note-title">Title</Label>
                <Input id="note-title" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="Note title"/>
              </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="note-course">Course</Label>
                      <Select value={newNoteCourseId} onValueChange={setNewNoteCourseId}>
                          <SelectTrigger id="note-course"><SelectValue placeholder="Select Course" /></SelectTrigger>
                          <SelectContent>
                              {courses.map(course => (
                                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="note-unit">Unit</Label>
                      <Select value={newNoteUnitId} onValueChange={setNewNoteUnitId} disabled={!newNoteCourseId || !selectedCourseForDialog?.units}>
                          <SelectTrigger id="note-unit"><SelectValue placeholder="Select Unit" /></SelectTrigger>
                          <SelectContent>
                              {selectedCourseForDialog?.units?.map(unit => (
                                  <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea id="note-content" value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="Write your note here..."/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
              <Button onClick={handleAddNote} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

       <div className="flex gap-4">
          <Select value={filterCourseId || 'all'} onValueChange={val => { setFilterCourseId(val); setFilterUnitId(null); }}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter by Course" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
          <Select value={filterUnitId || 'all'} onValueChange={val => setFilterUnitId(val)} disabled={!filterCourseId || filterCourseId === 'all'}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter by Unit" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {selectedCourseForFilter?.units?.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
       </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="completed">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
            {isNotesLoading ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {displayedNotes.map(note => (
                        <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onToggleImportant={handleToggleImportant} onToggleComplete={handleToggleComplete} onSummarize={handleSummarize} onGenerateQuiz={handleGenerateQuiz} onGenerateFlashcards={handleGenerateFlashcards}/>
                    ))}
                    {displayedNotes.length === 0 && <p className="text-center text-muted-foreground col-span-full py-12">No active notes. Create one to get started!</p>}
                </div>
            )}
        </TabsContent>
        <TabsContent value="important" className="mt-4">
             {isNotesLoading ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedNotes.map(note => (
                    <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onToggleImportant={handleToggleImportant} onToggleComplete={handleToggleComplete} onSummarize={handleSummarize} onGenerateQuiz={handleGenerateQuiz} onGenerateFlashcards={handleGenerateFlashcards}/>
                ))}
                {displayedNotes.length === 0 && <p className="text-center text-muted-foreground col-span-full py-12">No important notes yet.</p>}
                </div>
            )}
        </TabsContent>
        <TabsContent value="todo" className="mt-4">
            <Card>
                <CardContent className="p-0">
                    {isNotesLoading ? (
                        <div className="p-4 space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ) : (
                        <>
                        {displayedNotes.map(note => (
                            <TodoListItem key={note.id} note={note} onDelete={handleDeleteNote} onToggleComplete={handleToggleComplete}/>
                        ))}
                        {displayedNotes.length === 0 && <p className="p-4 text-center text-muted-foreground">No tasks to do!</p>}
                        </>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
            {isNotesLoading ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedNotes.map(note => (
                    <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onToggleImportant={handleToggleImportant} onToggleComplete={handleToggleComplete} onSummarize={handleSummarize} onGenerateQuiz={handleGenerateQuiz} onGenerateFlashcards={handleGenerateFlashcards}/>
                ))}
                {displayedNotes.length === 0 && <p className="text-center text-muted-foreground col-span-full py-12">No archived notes.</p>}
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>

    <Dialog open={isSummaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="text-purple-500" />
                    AI-Generated Summary
                </DialogTitle>
            </DialogHeader>
            <div className="py-4">
                {isSummaryLoading ? (
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ) : (
                    <p className="text-muted-foreground">{summaryContent}</p>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button>Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isQuizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Lightbulb className="text-yellow-500" />
                    Practice Quiz
                </DialogTitle>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
                {isQuizLoading ? (
                     <div className="space-y-2">
                        <p className="animate-pulse">Generating your quiz...</p>
                    </div>
                ) : (
                   generatedQuiz && (
                       <div className="space-y-6">
                           {generatedQuiz.questions.map((q, index) => (
                               <div key={index}>
                                   <p className="font-semibold">{index + 1}. {q.question}</p>
                                   <RadioGroup className="mt-2 space-y-2">
                                       {q.options?.map((opt, i) => (
                                           <div key={i} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt} id={`q${index}-opt${i}`} />
                                                <Label htmlFor={`q${index}-opt${i}`}>{opt}</Label>
                                           </div>
                                       ))}
                                   </RadioGroup>
                               </div>
                           ))}
                       </div>
                   )
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button>Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isFlashcardDialogOpen} onOpenChange={setFlashcardDialogOpen}>
        <DialogContent className="max-w-xl">
             <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Copy className="text-blue-500" />
                    Flashcards
                </DialogTitle>
            </DialogHeader>
            <div className="py-4">
                {isFlashcardLoading ? (
                    <div className="flex items-center justify-center h-52">
                        <p className="animate-pulse">Generating your flashcards...</p>
                    </div>
                ) : flashcards.length > 0 ? (
                    <div className="space-y-4">
                         <div className="text-center text-sm text-muted-foreground">
                            Card {currentFlashcardIndex + 1} of {flashcards.length}
                        </div>
                        <div
                            className="relative w-full h-64 cursor-pointer"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <AnimatePresence>
                                <motion.div
                                    key={isFlipped ? 'back' : 'front'}
                                    initial={{ rotateY: isFlipped ? 180 : 0 }}
                                    animate={{ rotateY: 0 }}
                                    exit={{ rotateY: isFlipped ? 0 : -180 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute w-full h-full p-6 flex items-center justify-center text-center rounded-lg border bg-card text-card-foreground shadow-sm"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <p className="text-xl font-semibold">
                                        {isFlipped ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="flex justify-center items-center gap-4">
                            <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.max(0, prev - 1))}} disabled={currentFlashcardIndex === 0}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => setIsFlipped(!isFlipped)}>
                                <RefreshCw className="mr-2 h-4 w-4"/> Flip Card
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.min(flashcards.length - 1, prev + 1))}} disabled={currentFlashcardIndex === flashcards.length - 1}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-52">
                        <p>No flashcards were generated.</p>
                    </div>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button>Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
