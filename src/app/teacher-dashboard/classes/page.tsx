

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { nanoid } from 'nanoid';

type Class = {
    id: string;
    name: string;
    description: string;
    studentCount: number;
    ownerId: string;
}

export default function ClassesPage() {
    const [user, authLoading] = useAuthState(auth);
    const { toast } = useToast();
    const [classes, setClasses] = useState<Class[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [newClassDescription, setNewClassDescription] = useState('');

    useEffect(() => {
        if (authLoading || !user) return;

        const q = query(collection(db, "squads"), where("ownerId", "==", user.uid)); // FIX: Querying 'squads' collection
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userClasses = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                studentCount: doc.data().members?.length || 0
            } as Class));
            setClasses(userClasses);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    const handleCreateClass = async () => {
        if (!newClassName.trim() || !user) {
            toast({ variant: 'destructive', title: 'Class name is required.' });
            return;
        }

        setIsCreating(true);
        try {
            const inviteCode = nanoid(10);
            await addDoc(collection(db, 'squads'), { // FIX: Adding to 'squads' collection
                name: newClassName,
                description: newClassDescription,
                ownerId: user.uid,
                members: [user.uid], // FIX: Changed from studentIds to members
                inviteCode: inviteCode,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Class Created!', description: `"${newClassName}" is ready to be set up.`});
            setNewClassName('');
            setNewClassDescription('');
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error creating class:", error);
            toast({ variant: 'destructive', title: 'Failed to create class.' });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
                    <p className="text-muted-foreground">Manage your class sections, rosters, and assignments.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a New Class</DialogTitle>
                            <DialogDescription>Give your new class a name and an optional description.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="class-name">Class Name</Label>
                                <Input id="class-name" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="e.g., Period 3 - English 10" />
                            </div>
                             <div>
                                <Label htmlFor="class-desc">Description (Optional)</Label>
                                <Input id="class-desc" value={newClassDescription} onChange={(e) => setNewClassDescription(e.target.value)} placeholder="e.g., 2024-2025 School Year" />
                            </div>
                        </div>
                        <DialogFooter>
                             <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateClass} disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Class'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            {isLoading || authLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : classes.length === 0 ? (
                <Card className="text-center p-12">
                    <CardHeader>
                        <CardTitle>No classes created yet</CardTitle>
                        <CardDescription>Get started by creating your first class to enroll students and assign content.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setIsDialogOpen(true)}>Create Your First Class</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map(cls => (
                        <Card key={cls.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{cls.name}</CardTitle>
                                <CardDescription>{cls.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4"/>
                                    <span>{cls.studentCount || 0} Students</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/teacher-dashboard/classes/${cls.id}`}>
                                        Manage Class <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
