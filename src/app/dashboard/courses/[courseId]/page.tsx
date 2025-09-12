
import CourseDetailPageClient from './CourseDetailClient';

// This is now a simple server component wrapper.
// Its only job is to get the courseId from the URL and pass it to the client component.
export default function Page({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  
  // We pass the courseId string as a prop.
  return <CourseDetailPageClient courseId={courseId} />;
}
