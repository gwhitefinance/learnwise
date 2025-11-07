'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  Plus,
  LayoutGrid,
  GraduationCap,
  Upload,
} from 'lucide-react';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import AIBuddy from '@/components/ai-buddy';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Course = {
  id: string;
  name: string;
};

const Header = () => {
    const [user] = useAuthState(auth);
    return (
        <header className="flex justify-end items-center p-4 gap-2">
            <Button variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                <Upload className="h-4 w-4 mr-2"/>
                Upgrade
            </Button>
            <Button variant="outline">Feedback</Button>
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                {user?.displayName?.charAt(0) || 'G'}
            </div>
        </header>
    )
}

function DashboardClientPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, authLoading] = useAuthState(auth);
    const router = useRouter();
    const [activeSet, setActiveSet] = useState<string | null>(null);

     useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/signup');
            return;
        }

        const q = query(collection(db, "courses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            if (userCourses.length > 0 && !activeSet) {
                setActiveSet(userCourses[0].id);
            }
            setIsLoading(false);
        });
        
        return () => unsubscribe();
    }, [user, authLoading, router, activeSet]);

  return (
    <div className="p-8">
        <Header />
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <AIBuddy className="w-16 h-16" />
                <div>
                    <h1 className="text-2xl font-bold">Good afternoon, {user?.displayName?.split(' ')[0] || 'Grady White'}!</h1>
                    <p className="text-muted-foreground">Which study set are you working on today?</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <Button variant="ghost">
                    <Plus className="mr-2 h-4 w-4" /> Add Set
                </Button>
                 <Button variant="ghost">
                    <LayoutGrid className="mr-2 h-4 w-4" /> See All My Sets
                </Button>
            </div>
        </div>
        
        <div className="flex items-center gap-2 pb-6 border-b">
            {courses.map(course => (
                 <Button 
                    key={course.id} 
                    variant={activeSet === course.id ? 'default' : 'outline'}
                    className={cn(
                        "flex items-center gap-2",
                        activeSet === course.id && 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20'
                    )}
                    onClick={() => setActiveSet(course.id)}
                >
                    <GraduationCap className="h-4 w-4"/>
                    {course.name}
                </Button>
            ))}
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="border-dashed">
                        <Plus className="h-4 w-4"/>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a New Study Set</DialogTitle>
                        <DialogDescription>
                            What subject are you studying?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Set Name</Label>
                            <Input id="name" placeholder="e.g., SAT Math, Biology 101"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button>Add Set</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    </div>
  )
}

export default DashboardClientPage;
