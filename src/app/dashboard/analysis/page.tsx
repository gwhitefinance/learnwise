
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loading from './loading';

export const dynamic = "force-dynamic";

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
