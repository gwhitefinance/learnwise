
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="h-screen w-screen flex flex-col">
            <header className="p-3 border-b flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </header>
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                <aside className="col-span-3 border-r p-4 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </aside>
                <main className="col-span-6 p-8 space-y-4">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </main>
                <aside className="col-span-3 border-l p-4 flex flex-col bg-muted/50">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-3 justify-end">
                            <Skeleton className="h-16 w-3/4 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-20 w-3/4 rounded-lg" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Skeleton className="h-12 w-full" />
                    </div>
                </aside>
            </div>
            <footer className="p-2 border-t flex justify-end">
                 <Skeleton className="h-6 w-24" />
            </footer>
        </div>
    );
}
