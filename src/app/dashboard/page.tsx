

'use client';

import dynamic from 'next/dynamic';
import DashboardLoading from './loading';

const DashboardPageClient = dynamic(
  () => import('./DashboardPageClient'),
  { ssr: false, loading: () => <DashboardLoading /> }
);


export default function DashboardPage() {
  return <DashboardPageClient />;
}
