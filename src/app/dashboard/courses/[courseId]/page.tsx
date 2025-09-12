import ClientCoursePage from './ClientCoursePage';

export default function CoursePage({ params }: { params: any }) {
  return <ClientCoursePage courseId={params.courseId} />;
}
