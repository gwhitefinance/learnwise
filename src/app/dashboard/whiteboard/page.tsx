"use client";
import dynamic from 'next/dynamic';
import Loading from './loading';

const WhiteboardClientPage = dynamic(() => import('./WhiteboardClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function WhiteboardPage() {
  return <WhiteboardClientPage />;
}
