
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-96 mb-2" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="w-full">
                <Skeleton className="h-64 w-full" />
                <div className="flex justify-end mt-4">
                    <Skeleton className="h-10 w-48" />
                </div>
            </div>
        </div>
    );
}
