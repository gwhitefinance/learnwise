
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>
                <div className="flex-1">
                    <Skeleton className="h-[60vh] w-full" />
                </div>
            </div>
        </div>
    );
}
