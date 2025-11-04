import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <Skeleton className="h-10 w-48" />
            <div className="text-center space-y-4">
                <Skeleton className="h-10 w-64 mx-auto" />
                <Skeleton className="h-4 w-full max-w-2xl mx-auto" />
                <Skeleton className="h-4 w-full max-w-lg mx-auto" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-12 w-full mt-4" />
            </div>
        </div>
    );
}