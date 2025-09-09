
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type RecentFile = {
      name: string;
      subject: string;
      modified: string;
  };

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      setFiles(selectedFiles);
    }
  };

  const handleUpload = () => {
    if (!files || files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No files selected',
        description: 'Please select at least one file to upload.',
      });
      return;
    }
    
    const newFiles: RecentFile[] = Array.from(files).map(file => ({
        name: file.name,
        subject: "General", // Or try to infer from context
        modified: "Just now",
    }));

    const recentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    const updatedFiles = [...newFiles, ...recentFiles];
    localStorage.setItem('recentFiles', JSON.stringify(updatedFiles));

    console.log('Uploading files:', files);
    toast({
      title: 'Upload Successful!',
      description: `${files.length} file(s) have been queued for processing.`,
    });
    setFiles(null);
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
     if (!isDragging) setIsDragging(true);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileChange(droppedFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyze your study materials</h1>
        <p className="text-muted-foreground">
          Upload your documents, notes, or other study materials for AI analysis. Our AI will identify your learning style and provide personalized study recommendations.
        </p>
      </div>

      <div 
        className={cn(
            "relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input 
          id="file-upload-input"
          type="file" 
          multiple 
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
          <p className="mb-2 text-lg font-semibold">
            Drag and drop your files here
          </p>
          <p className="text-sm text-muted-foreground">
            Or click to browse your files
          </p>
        </div>
        <Button onClick={(e) => {
            e.stopPropagation(); // prevent triggering the div's onClick
            handleUpload();
        }}>
          Upload Files
        </Button>
      </div>
      
      {files && files.length > 0 && (
          <div className="mt-4">
              <h3 className="text-lg font-semibold">Selected files:</h3>
              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                  {Array.from(files).map((file, index) => (
                      <li key={index}>{file.name}</li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
}
