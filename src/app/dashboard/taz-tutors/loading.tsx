
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto p-8 animate-pulse">
            <div className="flex justify-end gap-2 mb-8">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
            </div>

            <div className="text-center mb-8">
                <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                <Skeleton className="h-8 w-3/4 mx-auto" />
            </div>

            <Skeleton className="h-10 w-72 mx-auto mb-8" />
            
            <div className="text-center mb-8">
                <Skeleton className="h-9 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-2/3 mx-auto mt-2" />
            </div>

            <div className="flex items-center gap-4 mb-8">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-36" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(12)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
        </div>
    );
}
