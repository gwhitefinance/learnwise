
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="h-screen flex flex-row gap-4 p-6 bg-gray-50">
            <div className="flex-1 flex flex-col">
                <div className="mb-4">
                     <Skeleton className="h-12 w-full" />
                </div>
                <div className="flex-1">
                    <Skeleton className="h-full w-full" />
                </div>
            </div>
            <div className="w-96">
                <Skeleton className="h-full w-full" />
            </div>
        </div>
    )
}
