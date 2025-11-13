import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="p-8">
            <Skeleton className="h-10 w-1/2 mx-auto mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
