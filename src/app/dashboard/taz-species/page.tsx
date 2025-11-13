
'use client';

import { Suspense } from "react";
import dynamic from "next/dynamic";

const TazzShowcase = dynamic(() => import('@/components/TazzShowcase'), {
  ssr: false,
  loading: () => <div className="h-screen w-screen flex items-center justify-center"><p>Loading 3D Scene...</p></div>
});

export default function TazSpeciesPage() {
  return (
    <div className="h-full w-full">
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><p>Loading 3D Scene...</p></div>}>
        <TazzShowcase />
      </Suspense>
    </div>
  );
}
