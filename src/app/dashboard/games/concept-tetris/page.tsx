
"use client";
import dynamic from 'next/dynamic';
import Loading from './loading';

const ConceptTetrisClientPage = dynamic(() => import('./ConceptTetrisClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function ConceptTetrisPage() {
  return <ConceptTetrisClientPage />;
}
