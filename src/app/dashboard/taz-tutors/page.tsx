
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

const MaterialCard = ({ name, date }: { name: string, date: string }) => (
  <Card className="hover:shadow-md transition-shadow cursor-pointer">
    <CardContent className="p-4 flex items-center gap-3">
      <FileText className="h-6 w-6 text-muted-foreground" />
      <div>
        <p className="font-semibold text-sm truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </CardContent>
  </Card>
);

export default function TazTutorsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [user, authLoading] = useAuthState(auth);
    const [courses, setCourses] = useState<Course[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

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

    const filteredCourses = courses.filter(course => course.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()));

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
                                <MaterialCard key={course.id} name={course.name} date={format(course.createdAt?.toDate() || new Date(), 'MM/dd/yyyy')} />
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
                                <MaterialCard key={note.id} name={note.title} date={format(note.date?.toDate() || new Date(), 'MM/dd/yyyy')} />
                            ))
                        ) : (
                            <p className="col-span-full text-center text-muted-foreground">No notes found.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
