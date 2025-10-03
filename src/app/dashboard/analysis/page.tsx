'use client';

import dynamic from 'next/dynamic';
import Loading from './loading';
import { Suspense } from 'react';

const AnalysisPageComponent = dynamic(() => import('./AnalysisClientPage'), {
    ssr: false,
});

export default function AnalysisPage() {
    return (
        <Suspense fallback={<Loading />}>
            <AnalysisPageComponent />
        </Suspense>
    );
}
