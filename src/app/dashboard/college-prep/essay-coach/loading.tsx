
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 p-4 border-b">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </header>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-hidden">
                <div className="md:col-span-2 h-full">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="h-full flex flex-col">
                    <Skeleton className="h-full w-full" />
                </div>
            </div>
        </div>
    );
}
