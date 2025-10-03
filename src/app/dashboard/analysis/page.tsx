'use client';

import dynamic from 'next/dynamic';
import Loading from './loading';
import { Suspense } from 'react';

const AnalysisClientPage = dynamic(() => import('./AnalysisClientPage'), {
    ssr: false,
    loading: () => <Loading />,
});

export default function AnalysisPage() {
    return (
        <Suspense fallback={<Loading />}>
            <AnalysisClientPage />
        </Suspense>
    );
}
