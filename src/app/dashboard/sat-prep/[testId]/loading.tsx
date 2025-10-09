
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Skeleton className="h-10 w-48 mb-4" />
            <div className="w-full text-center p-8 mb-8">
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
                <Skeleton className="h-20 w-48 mx-auto mt-6" />
                <div className="flex justify-around items-center mt-8">
                    <div className="text-center w-32 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="text-center w-32 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
            </div>
        </div>
    );
}
