
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function PracticeTestPage() {

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Card className="max-w-2xl w-full text-center p-8">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
                        <FileText className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl mt-4">Full-Length Digital SAT Practice Test</CardTitle>
                    <CardDescription className="mt-2 text-lg">
                        This is a full-length practice test that mirrors the format of the official digital SAT.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="text-left space-y-2 text-muted-foreground mb-8">
                        <li className="flex items-center gap-2"><strong>Reading and Writing:</strong> 64 minutes, 54 questions</li>
                        <li className="flex items-center gap-2"><strong>Math:</strong> 70 minutes, 44 questions</li>
                        <li className="flex items-center gap-2"><strong>Total Time:</strong> Approximately 2 hours 14 minutes</li>
                    </ul>
                    <Button size="lg" className="w-full max-w-xs" disabled>
                       Start Test (Coming Soon)
                    </Button>
                     <div className="mt-4">
                        <Button variant="link" asChild>
                            <Link href="/dashboard/sat-prep">Back to SAT Prep Hub</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
