
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="flex h-screen bg-muted/40">
            {/* Sidebar Skeleton */}
            <div className="hidden md:flex flex-col w-72 bg-background border-r">
                <div className="p-4 border-b flex justify-between items-center">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-8" />
                </div>
                <div className="flex-1 p-2 space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            {/* Chat Area Skeleton */}
            <div className="flex flex-col flex-1 h-screen">
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                        {/* AI Message Skeleton */}
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="w-1/2 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>
                        {/* User Message Skeleton */}
                        <div className="flex items-start gap-4 justify-end">
                            <div className="w-1/2 space-y-2 items-end flex flex-col">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                         {/* AI Message Skeleton */}
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="w-1/2 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-background">
                    <div className="relative max-w-4xl mx-auto">
                        <Skeleton className="h-12 w-full rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
