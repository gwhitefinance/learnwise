
"use client"

import Script from "next/script";

interface SplineSceneProps {
  scene: string
  className?: string
}

export default function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <>
      <Script type="module" src="https://unpkg.com/@splinetool/viewer@1.10.57/build/spline-viewer.js" />
      {/* @ts-ignore */}
      <spline-viewer url={scene} class={className}></spline-viewer>
    </>
  )
}
