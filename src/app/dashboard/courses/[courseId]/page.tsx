
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

  // Manually create a plain, serializable object to pass to the client component.
  const courseData = docSnap.data();
  const course: Course = {
      id: docSnap.id,
      name: courseData.name,
      instructor: courseData.instructor,
      credits: courseData.credits,
      url: courseData.url || '',
      imageUrl: courseData.imageUrl || '',
      description: courseData.description || '',
      userId: courseData.userId || '',
  };
  
  // We now pass the fetched course data directly as a prop to the client component.
  return <CourseDetailPageClient course={course} />;
}
