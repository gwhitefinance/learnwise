
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

type Note = {
  id: string;
  title: string;
  content: string;
  date: Date;
  color: string;
  isImportant: boolean;
  isCompleted: boolean;
};

type Flashcard = {
    front: string;
    back: string;
};

const initialNotes: Note[] = [
  { id: '1', title: 'Project Ideation', content: 'Brainstorm ideas for the new marketing campaign. Focus on user engagement and brand visibility.', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), color: 'bg-red-100 dark:bg-red-900/20', isImportant: true, isCompleted: false },
  { id: '2', title: 'Weekly Sync', content: 'Prepare agenda for the weekly sync meeting. Include topics: Q3 roadmap, budget allocation, and team performance.', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), color: 'bg-yellow-100 dark:bg-yellow-900/20', isImportant: false, isCompleted: false },
  { id: '3', title: 'UI/UX Feedback', content: 'Review the latest mockups from the design team and provide constructive feedback. Check for consistency.', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), color: 'bg-blue-100 dark:bg-blue-900/20', isImportant: false, isCompleted: false },
  { id: '4', title: 'Code Refactor', content: 'Plan for refactoring the legacy codebase. Identify modules with high technical debt and prioritize them.', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), color: 'bg-purple-100 dark:bg-purple-900/20', isImportant: true, isCompleted: true },
  { id: '5', title: 'Client Call Notes', content: 'Summarize key discussion points from the call with Client X. Action items: send follow-up email, schedule demo.', date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), color: 'bg-indigo-100 dark:bg-indigo-900/20', isImportant: false, isCompleted: false },
  { id: '6', title: 'Personal Goals Q3', content: 'Outline personal development goals for the third quarter. Focus on learning a new programming language.', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), color: 'bg-green-100 dark:bg-green-900/20', isImportant: false, isCompleted: false },
];


const NoteCard = ({ note, onDelete, onToggleImportant, onToggleComplete, onSummarize, onGenerateQuiz, onGenerateFlashcards }: { note: Note, onDelete: (id: string) => void, onToggleImportant: (id: string) => void, onToggleComplete: (id: string) => void, onSummarize: (content: string) => void, onGenerateQuiz: (noteContent: string) => void, onGenerateFlashcards: (noteContent: string) => void }) => {
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
                <DropdownMenuItem onClick={() => onToggleComplete(note.id)}>
                   <Archive className="mr-2 h-4 w-4"/> {note.isCompleted ? 'Unmark' : 'Mark'} as Completed
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
         <p className="text-xs text-muted-foreground">{formatDistanceToNow(note.date, { addSuffix: true })}</p>
      </CardContent>
    </Card>
  );
};

const TodoListItem = ({ note, onDelete, onToggleComplete }: { note: Note, onDelete: (id: string) => void, onToggleComplete: (id: string) => void }) => {
    return (
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
                <Checkbox id={`task-${note.id}`} checked={note.isCompleted} onCheckedChange={() => onToggleComplete(note.id)} />
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
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isNoteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [activeTab, setActiveTab] = useState('all');
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


  const { toast } = useToast();
  
  const colors = ['bg-red-100 dark:bg-red-900/20', 'bg-yellow-100 dark:bg-yellow-900/20', 'bg-green-100 dark:bg-green-900/20', 'bg-blue-100 dark:bg-blue-900/20', 'bg-purple-100 dark:bg-purple-900/20', 'bg-indigo-100 dark:bg-indigo-900/20'];

  useEffect(() => {
    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');
  }, []);

  const handleAddNote = () => {
    if (!newNoteTitle) {
      toast({
        variant: 'destructive',
        title: 'Title is required',
        description: 'Please enter a title for your note.',
      });
      return;
    }
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: newNoteTitle,
      content: newNoteContent,
      date: new Date(),
      color: colors[Math.floor(Math.random() * colors.length)],
      isImportant: false,
      isCompleted: false,
    };
    setNotes([newNote, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNoteDialogOpen(false);
    toast({
      title: 'Note Created!',
      description: 'Your new note has been saved.',
    });
  };
  
  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
     toast({
      title: 'Note Deleted',
    });
  };
  
  const handleToggleImportant = (id: string) => {
    setNotes(notes.map(n => n.id === id ? {...n, isImportant: !n.isImportant} : n));
  };

  const handleToggleComplete = (id: string) => {
    setNotes(notes.map(n => n.id === id ? {...n, isCompleted: !n.isCompleted} : n));
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

  const filteredNotes = notes.filter(note => {
      if (activeTab === 'important') return note.isImportant && !note.isCompleted;
      if (activeTab === 'todo') return !note.isCompleted;
      if (activeTab === 'completed') return note.isCompleted;
      return true;
  });


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
              <div className="grid gap-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea id="note-content" value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="Write your note here..."/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
              <Button onClick={handleAddNote}>Save Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map(note => (
                <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onToggleImportant={handleToggleImportant} onToggleComplete={handleToggleComplete} onSummarize={handleSummarize} onGenerateQuiz={handleGenerateQuiz} onGenerateFlashcards={handleGenerateFlashcards}/>
              ))}
           </div>
        </TabsContent>
        <TabsContent value="important" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map(note => (
                <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onToggleImportant={handleToggleImportant} onToggleComplete={handleToggleComplete} onSummarize={handleSummarize} onGenerateQuiz={handleGenerateQuiz} onGenerateFlashcards={handleGenerateFlashcards}/>
              ))}
           </div>
        </TabsContent>
        <TabsContent value="todo" className="mt-4">
            <Card>
                <CardContent className="p-0">
                    {filteredNotes.filter(n => !n.isCompleted).map(note => (
                        <TodoListItem key={note.id} note={note} onDelete={handleDeleteNote} onToggleComplete={handleToggleComplete}/>
                    ))}
                    {filteredNotes.filter(n => !n.isCompleted).length === 0 && <p className="p-4 text-center text-muted-foreground">No tasks to do!</p>}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map(note => (
                <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onToggleImportant={handleToggleImportant} onToggleComplete={handleToggleComplete} onSummarize={handleSummarize} onGenerateQuiz={handleGenerateQuiz} onGenerateFlashcards={handleGenerateFlashcards}/>
              ))}
           </div>
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
                        <p className="animate-pulse">Generating your summary...</p>
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
