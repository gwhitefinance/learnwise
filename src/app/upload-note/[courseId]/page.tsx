
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MobileNoteUploadPage() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUpload = () => {
        if (!imagePreview) {
            toast({ variant: 'destructive', title: 'No image selected.' });
            return;
        }

        // Send the image data to the parent window (the desktop app)
        if (window.opener) {
            window.opener.postMessage({
                type: 'noteUpload',
                imageDataUri: imagePreview
            }, window.location.origin);
            
            toast({ title: "Image sent!", description: "Check your desktop to see the result." });
            setTimeout(() => window.close(), 1000);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect back to the main app.' });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Upload a Note</h1>
            <p className="text-muted-foreground mb-6">Take a picture of your notes to add them to your session.</p>

            <div className="w-full max-w-md space-y-4">
                 <div 
                    className="relative w-full aspect-video bg-background rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="object-contain h-full w-full" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <UploadCloud className="h-10 w-10 mb-2"/>
                            <p>Tap to upload or take a photo</p>
                        </div>
                    )}
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={handleUpload}
                    disabled={!imagePreview}
                >
                    <Camera className="mr-2 h-5 w-5" />
                    Send to My Computer
                </Button>
            </div>
        </div>
    );
}
