"use client";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ClientCoursePage = dynamic(() => import('./ClientCoursePage'), { 
    ssr: false,
    loading: () => (
        <div className="space-y-6">
            <Skeleton className="h-10 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="aspect-[3/2] w-full" />
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    )
});

export default function CoursePage() {
  return <ClientCoursePage />;
}
