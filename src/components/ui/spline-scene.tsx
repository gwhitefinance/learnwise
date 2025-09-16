'use client'

import Spline from '@splinetool/react-spline/next';
import { Application } from '@splinetool/runtime';

interface SplineSceneProps {
  scene: string;
  className?: string;
  onLoad?: (spline: Application) => void;
}

export default function SplineScene({ scene, className, onLoad }: SplineSceneProps) {
  return (
    <Spline
        scene={scene}
        className={className}
        onLoad={onLoad}
    />
  )
}
