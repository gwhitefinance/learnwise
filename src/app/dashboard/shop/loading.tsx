
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Loading() {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </div>

            <Card>
                <CardHeader>
                     <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-4 w-96 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <Skeleton className="w-full aspect-square rounded-lg" />
                        </div>
                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <Skeleton className="h-6 w-24 mb-4" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-16 w-16 rounded-full" />
                                    <Skeleton className="h-16 w-16 rounded-full" />
                                    <Skeleton className="h-16 w-16 rounded-full" />
                                </div>
                            </div>
                             <div>
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="grid grid-cols-3 gap-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
