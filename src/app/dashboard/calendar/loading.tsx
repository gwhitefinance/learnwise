
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="w-full h-full p-6">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <div className="md:col-span-3">
                    <Skeleton className="h-[70vh] w-full" />
                </div>
            </div>
        </div>
    )
}
