
'use client';

import { useState, useRef } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Camera, UploadCloud, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeImage } from '@/lib/actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

export default function MobileNoteUploadPage() {
    const params = useParams();
    const { courseId } = params;
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setAnalysisResult(null);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUpload = async () => {
        if (!imagePreview || !user) {
            toast({ variant: 'destructive', title: 'No image selected or not logged in.' });
            return;
        }

        setIsLoading(true);
        setAnalysisResult(null);
        
        try {
            const { analysis } = await analyzeImage({ imageDataUri: imagePreview });
            setAnalysisResult(analysis);
            
            // Save the analyzed content as a new note
            await addDoc(collection(db, "notes"), {
                title: `Uploaded Note - ${new Date().toLocaleDateString()}`,
                content: analysis,
                imageUrl: imagePreview,
                isWhiteboardNote: true, // Re-using this to denote an image-based note
                date: Timestamp.now(),
                color: 'bg-green-100 dark:bg-green-900/20',
                isImportant: false,
                isCompleted: false,
                userId: user.uid,
                courseId: courseId,
            });

            toast({ title: "Success!", description: "Your note has been analyzed and saved to your account." });
        } catch (error) {
            console.error("Analysis or save failed:", error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not process your image.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Upload a Note</h1>
            <p className="text-muted-foreground mb-6">Take a picture of your notes to add them to your course.</p>

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
                    disabled={!imagePreview || isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Camera className="mr-2 h-5 w-5" />}
                    {isLoading ? 'Analyzing & Saving...' : 'Upload and Summarize'}
                </Button>

                {analysisResult && (
                    <div className="p-4 bg-background rounded-lg border text-left">
                        <h3 className="font-semibold mb-2">Analysis Result:</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysisResult}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

