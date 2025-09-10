
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </div>

            <Skeleton className="h-10 w-full max-w-md" />

            <div className="flex justify-end">
                <Skeleton className="h-10 w-48" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Skeleton className="h-40" />
                        <Skeleton className="h-40" />
                        <Skeleton className="h-40" />
                    </div>
                </div>
                <div className="space-y-8">
                     <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-28" />
                    </div>
                    <div className="space-y-8">
                        <div className="flex items-start gap-6"><Skeleton className="h-8 w-8 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-48"/><Skeleton className="h-4 w-32"/></div></div>
                        <div className="flex items-start gap-6"><Skeleton className="h-8 w-8 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-48"/><Skeleton className="h-4 w-32"/></div></div>
                        <div className="flex items-start gap-6"><Skeleton className="h-8 w-8 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-48"/><Skeleton className="h-4 w-32"/></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
