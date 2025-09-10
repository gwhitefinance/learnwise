
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="flex flex-col items-center">
            <div className="text-center mb-10 w-full max-w-3xl">
                <Skeleton className="h-10 w-1/2 mx-auto mb-2"/>
                <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>

            <div className="w-full max-w-3xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <div className="flex flex-wrap gap-2 mt-2">
                           <Skeleton className="h-8 w-24" />
                           <Skeleton className="h-8 w-24" />
                           <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2"><Skeleton className="h-5 w-24"/><Skeleton className="h-10 w-full"/></div>
                        <div className="space-y-2"><Skeleton className="h-5 w-24"/><Skeleton className="h-10 w-full"/></div>
                        <div className="space-y-2"><Skeleton className="h-5 w-24"/><Skeleton className="h-10 w-full"/></div>
                    </div>
                </div>
                 
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>
        </div>
    )
}
