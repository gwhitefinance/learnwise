
import CoursesTable from './courses-table';
import { unstable_noStore as noStore } from 'next/cache';
import { getDocs, query, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Course = {
    id: string;
    name: string;
    instructor: string;
    credits: number;
    url?: string;
    userId?: string;
};

async function getCourses() {
    // This tells Next.js not to cache this fetch, so we always get fresh data.
    noStore();
    try {
        // In a real app with server-side auth, you would get the user ID here
        // and filter the query. For this prototype, we fetch all courses
        // and let the client component handle filtering for real-time.
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
    const initialCourses = await getCourses();

    return (
        <div className="space-y-4">
            <CoursesTable initialCourses={initialCourses} />
        </div>
    );
}
