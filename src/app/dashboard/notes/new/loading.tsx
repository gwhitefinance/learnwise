
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="h-full flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <div className="flex-1">
                    <Skeleton className="h-full w-full" />
                </div>
            </div>
            <div className="w-full md:w-80 lg:w-96">
                <Skeleton className="h-full w-full" />
            </div>
        </div>
    )
}
