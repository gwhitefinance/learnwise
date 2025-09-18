"use client";
import dynamic from 'next/dynamic';
import Loading from './loading';

const SnakeClientPage = dynamic(() => import('./SnakeClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function SnakePage() {
  return <SnakeClientPage />;
}
