import CourseDetailPageClient from './CourseDetailClient';

interface PageProps {
  params: { courseId: string };
}

export default function Page({ params }: PageProps) {
  return <CourseDetailPageClient courseId={params.courseId} />;
}
