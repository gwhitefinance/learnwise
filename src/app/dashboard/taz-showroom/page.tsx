
'use client';

import dynamic from "next/dynamic";

const TazShowroomCanvas = dynamic(
  () => import("@/components/TazShowroomCanvas"),
  { ssr: false }
);

export default function TazShowroomPage() {
  return (
    <div className="w-full h-screen bg-gray-950">
      <TazShowroomCanvas />
    </div>
  );
}
