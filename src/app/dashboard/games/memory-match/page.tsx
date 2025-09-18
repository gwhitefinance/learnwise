"use client";
import dynamic from 'next/dynamic';
import Loading from './loading';

const MemoryMatchClientPage = dynamic(() => import('./MemoryMatchClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function MemoryMatchPage() {
  return <MemoryMatchClientPage />;
}
