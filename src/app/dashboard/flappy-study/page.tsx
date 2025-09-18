"use client";
import dynamic from 'next/dynamic';

const FlappyStudyClientPage = dynamic(() => import('./FlappyStudyClientPage'), { ssr: false });

export default function FlappyStudyPage() {
    return <FlappyStudyClientPage />;
}
