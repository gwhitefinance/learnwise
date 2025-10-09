
'use client';
import dynamic from 'next/dynamic';
import Loading from './loading';

const PodcastsClientPage = dynamic(() => import('./PodcastsClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function PodcastsPage() {
  return <PodcastsClientPage />;
}
