
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loading from './loading';

const LearningLabClientPage = dynamic(() => import('./LearningLabClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function LearningLabPage() {
    return (
        <Suspense fallback={<Loading />}>
            <LearningLabClientPage />
        </Suspense>
    );
}
