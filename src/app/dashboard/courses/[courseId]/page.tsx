
import ClientCoursePage from './ClientCoursePage';

export default function CoursePage({ params }: { params: { courseId: string } }) {
  return <ClientCoursePage courseId={params.courseId} />;
}
