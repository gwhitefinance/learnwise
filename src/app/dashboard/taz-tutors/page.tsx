
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, FileText, Upload, BookOpen } from 'lucide-react';
import AIBuddy from '@/components/ai-buddy';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation';

type Course = {
    id: string;
    name: string;
    createdAt: Timestamp;
};

type Note = {
    id: string;
    title: string;
    date: Timestamp;
};

const MaterialCard = ({ name, date, isSelected, onClick }: { name: string, date: string, isSelected: boolean, onClick: () => void }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Card 
                    className={`hover:shadow-md transition-shadow cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={onClick}
                >
                    <CardContent className="p-4 flex items-center gap-3">
                        <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm truncate">{name}</p>
                            <p className="text-xs text-muted-foreground">{date}</p>
                        </div>
                    </CardContent>
                </Card>
            </TooltipTrigger>
            <TooltipContent>
                <p>{name}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export default function TazTutorsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [user, authLoading] = useAuthState(auth);
    const [courses, setCourses] = useState<Course[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
    const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
    const [learningGoal, setLearningGoal] = useState('');
    const [pageRange, setPageRange] = useState('');
    const router = useRouter();


    useEffect(() => {
        if (!user) {
            if (!authLoading) setLoading(false);
            return;
        }

        const coursesQuery = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            setLoading(false);
        });

        const notesQuery = query(collection(db, "notes"), where("userId", "==", user.uid), orderBy("date", "desc"));
        const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
            const userNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
            setNotes(userNotes);
        });

        return () => {
            unsubscribeCourses();
            unsubscribeNotes();
        };

    }, [user, authLoading]);

    const handleSelectMaterial = (id: string) => {
        setSelectedMaterial(id);
    }
    
    const handleStartSession = () => {
        if (!selectedMaterial) return;

        const materialName = courses.find(c => c.id === selectedMaterial)?.name || notes.find(n => n.id === selectedMaterial)?.title;

        const queryParams = new URLSearchParams({
            materialId: selectedMaterial,
            materialName: materialName || "Selected Material",
            learningGoal: learningGoal || "Explain the key concepts.",
        });
        
        if (pageRange) {
            queryParams.set('pageRange', pageRange);
        }

        router.push(`/dashboard/taz-tutors/session-ready?${queryParams.toString()}`);
    }

    const filteredCourses = courses.filter(course => course.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const quickExamples = [
        "I just want to chat about the document",
        "Explain the key concepts",
        "Show me each page and explain it",
        "Teach me in very simple terms for my exam"
    ];

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex justify-end gap-2 mb-8">
                <Button variant="outline">Share</Button>
                <Button variant="outline">Feedback</Button>
            </div>

            <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4">
                    <AIBuddy />
                </div>
                <h1 className="text-2xl font-bold">Start a Tutoring Session</h1>
            </div>

            <Tabs defaultValue="courses" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="courses">
                        <BookOpen className="mr-2 h-4 w-4" /> From Courses
                    </TabsTrigger>
                    <TabsTrigger value="notes">
                        <FileText className="mr-2 h-4 w-4" /> From Notes
                    </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-4 my-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search materials..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button><Upload className="mr-2 h-4 w-4" /> Upload Material</Button>
                </div>
                
                <TabsContent value="courses">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {loading ? (
                            Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                        ) : filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <MaterialCard 
                                    key={course.id} 
                                    name={course.name} 
                                    date={format(course.createdAt?.toDate() || new Date(), 'MM/dd/yyyy')}
                                    isSelected={selectedMaterial === course.id}
                                    onClick={() => handleSelectMaterial(course.id)}
                                />
                            ))
                        ) : (
                             <p className="col-span-full text-center text-muted-foreground">No courses found.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="notes">
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {loading ? (
                            Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                        ) : filteredNotes.length > 0 ? (
                            filteredNotes.map((note) => (
                                <MaterialCard 
                                    key={note.id} 
                                    name={note.title} 
                                    date={format(note.date?.toDate() || new Date(), 'MM/dd/yyyy')}
                                    isSelected={selectedMaterial === note.id}
                                    onClick={() => handleSelectMaterial(note.id)}
                                />
                            ))
                        ) : (
                            <p className="col-span-full text-center text-muted-foreground">No notes found.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
             <div className="mt-12 text-center">
                 <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" disabled={!selectedMaterial}>
                            Start Session with Selected Material
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Tutor Session</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="learning-goal">What is your learning goal for this session?</Label>
                                <Input 
                                    id="learning-goal" 
                                    placeholder="e.g., Explain the key concepts, Help me solve these problems..."
                                    value={learningGoal}
                                    onChange={(e) => setLearningGoal(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Quick examples:</Label>
                                <div className="flex flex-wrap gap-2">
                                    {quickExamples.map(ex => (
                                        <Button key={ex} variant="outline" size="sm" onClick={() => setLearningGoal(ex)}>
                                            {ex}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <Card>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">Select Amount of Pages (Optional)</h4>
                                        <p className="text-sm text-muted-foreground">Focus the AI on a specific number of pages.</p>
                                    </div>
                                    <Select onValueChange={setPageRange}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select amount" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 Pages</SelectItem>
                                            <SelectItem value="10">10 Pages</SelectItem>
                                            <SelectItem value="15">15 Pages</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsSessionDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleStartSession}>Create Session</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
