"use client";
import dynamic from 'next/dynamic';
import Loading from './loading';

const PongStudyClientPage = dynamic(() => import('./PongStudyClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function PongStudyPage() {
  return <PongStudyClientPage />;
}
