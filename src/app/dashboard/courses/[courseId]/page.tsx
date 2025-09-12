
import CourseDetailPageClient from './CourseDetailClient';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import type { Course } from './CourseDetailClient';


// This is now an async Server Component, which is the correct place to fetch data.
export default async function Page({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const docRef = doc(db, "courses", courseId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // This will correctly render the not-found page on the server.
    notFound();
  }

  const course = { id: docSnap.id, ...docSnap.data() } as Course;
  
  // We now pass the fetched course data directly as a prop to the client component.
  return <CourseDetailPageClient course={course} />;
}
