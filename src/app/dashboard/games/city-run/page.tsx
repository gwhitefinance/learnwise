
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CityRunPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-full p-4 text-center">
             <Button variant="ghost" onClick={() => router.push('/dashboard/games')} className="absolute top-4 left-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Arcade
            </Button>
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-3xl">City Run</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This game is under construction. Check back soon!</p>
                </CardContent>
            </Card>
        </div>
    );
}
