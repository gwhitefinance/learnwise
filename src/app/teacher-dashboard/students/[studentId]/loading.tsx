
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-48" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    );
}
