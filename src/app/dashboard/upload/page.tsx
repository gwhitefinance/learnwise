
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadCloud, Youtube, FileText, Video, Music, Copy } from "lucide-react";

export default function UploadPage() {
    const [isRecording, setIsRecording] = useState(false);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Add Materials</h1>
            <p className="text-muted-foreground mb-8">Upload files, links, or record a lecture to start generating study materials.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-8 text-center">
                        <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-4">
                            <div className="p-3 bg-muted rounded-full">
                                <UploadCloud className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold">Upload any files from Class</h3>
                            <p className="text-muted-foreground">Click to upload or drag and drop files</p>
                            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                                <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2"/>Powerpoints</Button>
                                <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2"/>PDF Documents</Button>
                                <Button variant="outline" size="sm"><Music className="w-4 h-4 mr-2"/>Audio Files</Button>
                                <Button variant="outline" size="sm"><Video className="w-4 h-4 mr-2"/>Video Files</Button>
                                <Button variant="outline" size="sm"><Youtube className="w-4 h-4 mr-2"/>Youtube Video</Button>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Ask your friends to help upload Materials</h3>
                                <p className="text-sm text-muted-foreground">Share this link with your classmates to collaborate.</p>
                            </div>
                            <Button variant="outline"><Copy className="w-4 h-4 mr-2"/> Copy Link</Button>
                        </CardContent>
                    </Card>

                    <Card className={isRecording ? "bg-red-500/10 border-red-500/30" : ""}>
                        <CardContent className="p-6 flex items-center justify-between">
                             <div>
                                <h3 className="font-semibold">Are you in class? Start a live lecture</h3>
                                <p className="text-sm text-muted-foreground">Record your lecture in real-time and get AI-powered notes.</p>
                            </div>
                            <Button variant={isRecording ? 'destructive' : 'outline'} onClick={() => setIsRecording(!isRecording)}>
                                {isRecording ? 'Stop Recording' : 'Start Recording'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1 space-y-4">
                    <Card className="p-6">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle>We will turn it into Digestible Study Materials</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold">Study Materials</h4>
                                <p className="text-sm text-muted-foreground">Flashcards, Quizzes, games and more.</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold">Plans & Progress Tracking</h4>
                                <p className="text-sm text-muted-foreground">A Study Plan based off your exact class.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
