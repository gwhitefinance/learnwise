
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MoreVertical, Trash2, Star, Archive, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { generateSummary } from '@/ai/flows/note-summary-flow';

type Note = {
  id: string;
  title: string;
  content: string;
  date: Date;
  color: string;
  isImportant: boolean;
  isCompleted: boolean;
};

const initialNotes: Note[] = [
  { id: '1', title: 'Project Ideation', content: 'Brainstorm ideas for the new marketing campaign. Focus on user engagement and brand visibility.', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), color: 'bg-red-100 dark:bg-red-900/20', isImportant: true, isCompleted: false },
  { id: '2', title: 'Weekly Sync', content: 'Prepare agenda for the weekly sync meeting. Include topics: Q3 roadmap, budget allocation, and team performance.', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), color: 'bg-yellow-100 dark:bg-yellow-900/20', isImportant: false, isCompleted: false },
  { id: '3', title: 'UI/UX Feedback', content: 'Review the latest mockups from the design team and provide constructive feedback. Check for consistency.', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), color: 'bg-blue-100 dark:bg-blue-900/20', isImportant: false, isCompleted: false },
  { id: '4', title: 'Code Refactor', content: 'Plan for refactoring the legacy codebase. Identify modules with high technical debt and prioritize them.', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), color: 'bg-purple-100 dark:bg-purple-900/20', isImportant: true, isCompleted: true },
  { id: '5', title: 'Client Call Notes', content: 'Summarize key discussion points from the call with Client X. Action items: send follow-up email, schedule demo.', date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), color: 'bg-indigo-100 dark:bg-indigo-900/20', isImportant: false, isCompleted: false },
  { id: '6', title: 'Personal Goals Q3', content: 'Outline personal development goals for the third quarter. Focus on learning a new programming language.', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), color: 'bg-green-100 dark:bg-green-900/20', isImportant: false, isCompleted: false },
];


const NoteCard = ({ note, onDelete, onToggleImportant, onToggleComplete, onSummarize }: { note: Note, onDelete: (id: string) => void, onToggleImportant: (id: string) => void, onToggleComplete: (id: string) => void, onSummarize: (content: string) => void }) => {
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

  const { toast } = useToast();
  
  const colors = ['bg-red-100 dark:bg-red-900/20', 'bg-yellow-100 dark:bg-yellow-900/20', 'bg-green-100 dark:bg-green-900/20', 'bg-blue-100 dark:bg-blue-900/20', 'bg-purple-100 dark:bg-purple-900/20', 'bg-indigo-100 dark:bg-indigo-900/20'];


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
                <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onToggleImportant={handleToggleImportant} onToggleComplete={handleToggleComplete} onSummarize={handleSummarize}/>
              ))}
           </div>
        </TabsContent>
        <TabsContent value="important" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map(note => (
                <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onToggleImportant={handleToggleImportant} onToggleComplete={handleToggleComplete} onSummarize={handleSummarize}/>
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
                <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onToggleImportant={handleToggleImportant} onToggleComplete={handleToggleComplete} onSummarize={handleSummarize}/>
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
    </>
  );
}
