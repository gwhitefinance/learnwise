
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>

            <div className="text-center p-12">
                <Skeleton className="mx-auto h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
                <Skeleton className="h-4 w-2/3 mx-auto mb-6" />
            </div>
        </div>
    );
}
