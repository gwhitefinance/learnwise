
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Skeleton className="h-10 w-48" />
            <div>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    );
}
