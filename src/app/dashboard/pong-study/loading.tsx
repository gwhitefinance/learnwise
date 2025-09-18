import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <Skeleton className="h-10 w-64 mb-4" />
            <div className="bg-card p-8 rounded-lg shadow-lg text-center">
                <Skeleton className="h-6 w-80 mb-4" />
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Skeleton className="h-10 w-72" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <Skeleton className="h-[600px] w-[800px] rounded-lg mt-8" />
        </div>
    );
}
