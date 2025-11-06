
'use client';

import dynamic from 'next/dynamic';
import Loading from './loading';

const TriviaBlasterClientPage = dynamic(() => import('../trivia-blaster/TriviaBlasterClientPage'), {
    ssr: false,
    loading: () => <Loading />,
});

export default function TriviaBlasterPage() {
    return <TriviaBlasterClientPage />;
}
