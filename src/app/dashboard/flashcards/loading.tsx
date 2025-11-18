
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-2xl space-y-4">
                <Skeleton className="h-4 w-1/4 mx-auto" />
                <Skeleton className="h-80 w-full" />
                <div className="flex justify-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
        </div>
    );
}
