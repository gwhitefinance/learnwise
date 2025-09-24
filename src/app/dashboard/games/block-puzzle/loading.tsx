
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="flex flex-col items-center p-4">
            <Skeleton className="h-10 w-64 mb-4" />
            <div className="flex gap-8 items-start">
                <Skeleton className="w-[404px] h-[404px]" />
                <div className="w-48 space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}
