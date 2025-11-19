
"use client";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loading from './loading';

const CalendarClientPage = dynamic(() => import('./CalendarClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function CalendarPage() {
  return (
    <Suspense fallback={<Loading/>}>
        <CalendarClientPage />
    </Suspense>
  );
}
