'use client';

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Youtube, FileText, Video, Music, Copy, QrCode, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import QRCode from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UploadPage() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (courseId) {
            setQrCodeUrl(`${window.location.origin}/upload-note/${courseId}`);
        }
    }, [courseId]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'noteUpload') {
                toast({ title: "Image Received!", description: "Your image has been sent for processing." });
                console.log("Received image data URI from mobile.");
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [toast]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            toast({ title: "File Selected", description: `${file.name}` });
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
            e.dataTransfer.clearData();
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Add Materials</h1>
            <p className="text-muted-foreground mb-8">Upload files, links, or record a lecture to start generating study materials.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Your Content</CardTitle>
                            <CardDescription>Choose your preferred method to add materials.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="upload">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="upload"><UploadCloud className="w-4 h-4 mr-2"/>Upload</TabsTrigger>
                                    <TabsTrigger value="paste"><FileText className="w-4 h-4 mr-2"/>Paste</TabsTrigger>
                                    <TabsTrigger value="youtube"><Youtube className="w-4 h-4 mr-2"/>YouTube</TabsTrigger>
                                    <TabsTrigger value="record"><Mic className="w-4 h-4 mr-2"/>Record</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload" className="pt-6">
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
                                        <h3 className="text-xl font-semibold">Click to upload or drag & drop</h3>
                                        <p className="text-muted-foreground text-sm">Supports PDF, DOCX, PPT, MP3, MP4, and more</p>
                                    </div>
                                </TabsContent>
                                <TabsContent value="paste" className="pt-6">
                                     <Textarea placeholder="Paste your text here..." className="h-48"/>
                                </TabsContent>
                                <TabsContent value="youtube" className="pt-6">
                                    <Input placeholder="Enter a YouTube video URL..." />
                                </TabsContent>
                                <TabsContent value="record" className="pt-6">
                                    <div className="flex flex-col items-center justify-center h-48 bg-muted rounded-xl">
                                        <Button variant={isRecording ? 'destructive' : 'outline'} onClick={() => setIsRecording(!isRecording)}>
                                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                                        </Button>
                                         <p className="text-xs text-muted-foreground mt-2">{isRecording ? "Recording in progress..." : "Record your lecture in real-time."}</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><QrCode/> Add from Phone</CardTitle>
                            <CardDescription>Scan this QR code with your phone's camera to snap a picture of your notes and upload them directly.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <div className="bg-white p-2 rounded-lg">
                                {qrCodeUrl ? <QRCode value={qrCodeUrl} size={160} /> : <div className="h-[160px] w-[160px] flex items-center justify-center text-muted-foreground text-sm">Select a course first.</div>}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle>Ask your friends to help</CardTitle>
                            <CardDescription>Share this link to collaborate on study materials.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <Button variant="outline"><Copy className="w-4 h-4 mr-2"/> Copy Link</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}