
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="bg-black text-white min-h-screen">
            <div className="container mx-auto px-4 py-24">
                <div className="text-center mb-12">
                    <Skeleton className="h-12 w-1/2 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/3 mx-auto" />
                </div>

                <div className="space-y-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-neutral-900">
                            <Skeleton className="h-10 w-16" />
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
