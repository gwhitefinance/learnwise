// src/app/dashboard/analysis/page.tsx

import dynamicImport from 'next/dynamic'; // ✅ renamed to avoid conflict
import Loading from './loading';

// Force this page to be dynamically rendered at request time, not at build time.
export const dynamic = 'force-dynamic';

// Dynamically import the client component.
// We remove `ssr: false` as it's not allowed in Server Components.
// The 'use client' directive within AnalysisClientPage will ensure it behaves as expected.
const AnalysisClientPage = dynamicImport(() => import('./AnalysisClientPage'), {
  loading: () => <Loading />,
});

export default function AnalysisPage() {
  return <AnalysisClientPage />;
}
