

'use client';

import dynamic from 'next/dynamic';
import DashboardLoading from './loading';

const DashboardClientPage = dynamic(
  () => import('./DashboardClientPage'),
  { ssr: false, loading: () => <DashboardLoading /> }
);


export default function DashboardPage() {
  return <DashboardClientPage />;
}
