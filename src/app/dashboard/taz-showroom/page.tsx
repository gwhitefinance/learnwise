
"use client";

import dynamic from "next/dynamic";

const TazShowroomScene = dynamic(
  () => import("@/components/TazShowroomScene"),
  { ssr: false }
);

export default function TazShowroomPage() {
  return (
    <div className="w-full h-screen bg-gray-950">
      <TazShowroomScene />
    </div>
  );
}
