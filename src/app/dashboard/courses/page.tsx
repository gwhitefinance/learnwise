
'use client';

import dynamic from 'next/dynamic';
import Loading from './loading';

const CoursesClientPage = dynamic(() => import('./CoursesClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function CoursesPage() {
    return <CoursesClientPage />;
}
