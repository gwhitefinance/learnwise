
'use client';

import dynamic from 'next/dynamic';
import Loading from './loading';

const CoursesClientPage = dynamic(() => import('./CoursesClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function CoursesPage() {
    // This now simply renders the client page, which will redirect to the main dashboard
    // for adding new courses.
    return <CoursesClientPage />;
}
