import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="flex flex-col items-center p-4">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-12 w-96 mb-4" />
            <Skeleton className="h-[600px] w-[600px] rounded-lg mt-4" />
        </div>
    );
}
