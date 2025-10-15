
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, FilePlus, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Loading from './loading';

type Class = {
    id: string;
    name: string;
    description: string;
    studentIds: string[];
    ownerId: string;
};

// Mock student data until we have real data
const mockStudents = [
    { id: '1', name: 'Olivia Martin', email: 'olivia@example.com', avatar: '/avatars/01.png' },
    { id: '2', name: 'Liam Garcia', email: 'liam@example.com', avatar: '/avatars/02.png' },
    { id: '3', name: 'Emma Rodriguez', email: 'emma@example.com', avatar: '/avatars/03.png' },
    { id: '4', name: 'Noah Smith', email: 'noah@example.com', avatar: '/avatars/04.png' },
];

export default function ManageClassPage() {
    const params = useParams();
    const router = useRouter();
    const { classId } = params;
    const [user, authLoading] = useAuthState(auth);
    const [classData, setClassData] = useState<Class | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;
        if (!user && !authLoading) {
            router.push('/login');
            return;
        }

        if (typeof classId !== 'string') {
            setLoading(false);
            return;
        }

        const classDocRef = doc(db, 'classes', classId);
        const unsubscribe = onSnapshot(classDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().ownerId === user.uid) {
                setClassData({ id: docSnap.id, ...docSnap.data() } as Class);
            } else {
                setClassData(null); // Access denied or not found
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, classId, router]);
    
    if (loading || authLoading) {
        return <Loading />;
    }

    if (!classData) {
        return (
            <div>
                <Button variant="ghost" onClick={() => router.push('/teacher-dashboard/classes')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Classes
                </Button>
                <h1 className="text-2xl font-bold">Class not found</h1>
                <p>You may not have access to this class or it may have been deleted.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.push('/teacher-dashboard/classes')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Classes
            </Button>
            <div>
                <h1 className="text-3xl font-bold">Manage: {classData.name}</h1>
                <p className="text-muted-foreground">{classData.description}</p>
            </div>

            <Tabs defaultValue="roster">
                <TabsList>
                    <TabsTrigger value="roster">Roster</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="roster" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Student Roster</CardTitle>
                                <CardDescription>View and manage students in this class.</CardDescription>
                            </div>
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4"/>
                                Add Students
                            </Button>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                {mockStudents.map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={student.avatar} />
                                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">View Profile</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="assignments" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Assignments</CardTitle>
                                <CardDescription>Create and manage assignments for this class.</CardDescription>
                            </div>
                            <Button>
                                <FilePlus className="mr-2 h-4 w-4"/>
                                New Assignment
                            </Button>
                        </CardHeader>
                        <CardContent>
                             <div className="text-center text-muted-foreground p-12">
                                <p>No assignments created yet for this class.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="settings" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Settings</CardTitle>
                            <CardDescription>Manage general settings for this class.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="text-center text-muted-foreground p-12">
                                <p>Settings will be available here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
