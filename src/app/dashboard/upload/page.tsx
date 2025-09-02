
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function UploadPage() {
  const [className, setClassName] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const { toast } = useToast();

  const handleUpload = () => {
    if (!className || !files || files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Please provide a class name and select at least one file.',
      });
      return;
    }
    // TODO: Implement actual file upload logic
    console.log('Uploading for class:', className);
    console.log('Files:', files);
    toast({
      title: 'Upload Successful!',
      description: `${files.length} file(s) for "${className}" have been queued for processing.`,
    });
    setClassName('');
    const fileInput = document.getElementById('documents') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
    setFiles(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Upload Materials</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload Class Information and Documents</CardTitle>
          <CardDescription>
            Add your syllabus, notes, and other materials to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="class-name">Class Name</Label>
            <Input 
              id="class-name" 
              placeholder="e.g., Introduction to Psychology" 
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="documents">Documents</Label>
            <Input 
              id="documents" 
              type="file" 
              multiple 
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>
           <Button className="w-full" onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
