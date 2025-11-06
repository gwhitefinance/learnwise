
"use client";
import dynamic from 'next/dynamic';
import Loading from './loading';

const TriviaBlasterClientPage = dynamic(() => import('./TriviaBlasterClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function TriviaBlasterPage() {
  return <TriviaBlasterClientPage />;
}
