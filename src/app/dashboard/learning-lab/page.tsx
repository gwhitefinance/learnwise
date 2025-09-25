
'use client';

import dynamic from 'next/dynamic';
import Loading from './loading';

const LearningLabClientPage = dynamic(() => import('./LearningLabClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function LearningLabPage() {
    return <LearningLabClientPage />;
}
