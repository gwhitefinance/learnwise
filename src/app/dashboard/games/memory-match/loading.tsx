import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="flex flex-col items-center p-4">
            <Skeleton className="h-10 w-64 mb-4" />
            <div className="w-full max-w-md p-8 text-center">
                <Skeleton className="h-6 w-3/4 mx-auto mb-4" />
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-10 w-72" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        </div>
    );
}
