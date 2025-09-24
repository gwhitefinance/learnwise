
"use client";
import dynamic from 'next/dynamic';
import Loading from './loading';

const BlockPuzzleClientPage = dynamic(() => import('./BlockPuzzleClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function BlockPuzzlePage() {
  return <BlockPuzzleClientPage />;
}
