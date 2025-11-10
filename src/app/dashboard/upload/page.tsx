
'use client';

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadCloud, Youtube, FileText, Video, Music, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function UploadPage() {
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            toast({ title: "File Selected", description: `${file.name}` });
            // Here you would typically handle the file upload
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            toast({ title: "File Dropped", description: `${file.name}` });
            // Handle the dropped file
            e.dataTransfer.clearData();
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Add Materials</h1>
            <p className="text-muted-foreground mb-8">Upload files, links, or record a lecture to start generating study materials.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-8 text-center">
                        <div 
                            className={cn(
                                "border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-4 transition-colors cursor-pointer",
                                isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                            )}
                            onClick={handleUploadClick}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="p-3 bg-muted rounded-full">
                                <UploadCloud className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold">Upload any files from Class</h3>
                            <p className="text-muted-foreground">Click to upload or drag and drop files</p>
                            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                                <Button variant="outline" size="sm" className="pointer-events-none"><FileText className="w-4 h-4 mr-2"/>Powerpoints</Button>
                                <Button variant="outline" size="sm" className="pointer-events-none"><FileText className="w-4 h-4 mr-2"/>PDF Documents</Button>
                                <Button variant="outline" size="sm" className="pointer-events-none"><Music className="w-4 h-4 mr-2"/>Audio Files</Button>
                                <Button variant="outline" size="sm" className="pointer-events-none"><Video className="w-4 h-4 mr-2"/>Video Files</Button>
                                <Button variant="outline" size="sm" className="pointer-events-none"><Youtube className="w-4 h-4 mr-2"/>Youtube Video</Button>
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
