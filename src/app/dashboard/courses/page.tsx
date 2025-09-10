
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilePenLine, Plus, Trash2, Link as LinkIcon, Eye } from "lucide-react";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import CoursesTable from './courses-table';
import { unstable_noStore as noStore } from 'next/cache';


type Course = {
    id: string;
    name: string;
    instructor: string;
    credits: number;
    url?: string;
    userId?: string;
};

// This is a placeholder for getting the current user's ID on the server.
// In a real app, this would come from a server-side session management solution.
// For this example, we will hardcode it for demonstration purposes.
const getUserId = () => {
    // This is not a real user ID. Replace with actual server-side auth logic.
    // As we are not using server-side auth, this will return null and won't fetch any courses.
    // To make this work for the prototype, we need a way to get the user on the server.
    // For now, let's assume we can't fetch user-specific data on the server without auth.
    return "mock-user-id-for-ssr-demo"; // This will need to be replaced with real auth.
}

async function getCourses() {
    // This tells Next.js not to cache this fetch, so we always get fresh data.
    noStore();
    try {
        // Since we can't get the real user on the server easily in this setup,
        // this part will not work as expected without a server-side auth solution.
        // We will simulate fetching data and pass it to a client component.
        // For the purpose of this prototype, we'll fetch all courses.
        // In a real app, you MUST filter by userId.
        const q = query(collection(db, "courses"));
        const querySnapshot = await getDocs(q);
        const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        return courses;

    } catch (error) {
        console.error("Error fetching courses on server: ", error);
        return [];
    }
}


export default async function CoursesPage() {
    const courses = await getCourses();

    return (
        <div className="space-y-4">
            <CoursesTable initialCourses={courses} />
        </div>
    );
}

