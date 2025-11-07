
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Link as LinkIcon, Youtube, FileText, Mic, Copy, Video, SquarePen } from 'lucide-react';

const uploadOptions = [
    { name: 'Powerpoints', icon: <FileText /> },
    { name: 'PDF Documents', icon: <FileText /> },
    { name: 'Audio Files', icon: <Mic /> },
    { name: 'Video Files', icon: <Video /> },
    { name: 'Import Quizlet', icon: <Copy /> },
    { name: 'YouTube Video', icon: <Youtube /> },
    { name: 'From Canvas', icon: <FileText /> },
];

function UploadPageContent() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');
    // In a real app, you would fetch the course name using this ID.
    const courseName = "Selected Course"; 

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight">Upload Materials for {courseName}</h1>
                <p className="text-muted-foreground mt-2">Add content to your course to generate study materials.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><UploadCloud /> Upload Files from Your Computer</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer">
                                <p className="font-semibold">Click to upload or drag and drop files</p>
                                <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, PPT, MP3, MP4, etc.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><LinkIcon /> Import from Web</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Button variant="outline"><Youtube className="mr-2 h-4 w-4"/> YouTube</Button>
                            <Button variant="outline"><Copy className="mr-2 h-4 w-4"/> Quizlet</Button>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Mic /> Record Lecture</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Record your lecture in real-time and get AI-powered notes, summaries, and study materials.</p>
                            <Button className="w-full">Start Recording</Button>
                        </CardContent>
                    </Card>
                </div>
                
                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create from Scratch</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Button variant="outline" className="w-full justify-start"><SquarePen className="mr-2 h-4 w-4" /> Create a New Note</Button>
                             <Button variant="outline" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" /> Create a Document</Button>
                        </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-primary/20">
                        <CardHeader>
                            <CardTitle>What Happens Next?</CardTitle>
                            <CardDescription>We'll turn your content into digestible study materials.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <FileText />
                                </div>
                                <div>
                                    <p className="font-semibold">Study Materials</p>
                                    <p className="text-sm text-muted-foreground">Flashcards, Quizzes, games and more.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                 <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <FileText />
                                </div>
                                <div>
                                    <p className="font-semibold">Plans & Progress Tracking</p>
                                    <p className="text-sm text-muted-foreground">A Study Plan based off your exact class.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function UploadPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UploadPageContent />
        </Suspense>
    )
}

    
