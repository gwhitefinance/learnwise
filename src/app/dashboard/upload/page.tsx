
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { generateSummary } from '@/ai/flows/note-summary-flow';
import { Skeleton } from '@/components/ui/skeleton';


export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      // Limit to text-based files for now
      if (!selectedFile.type.startsWith('text/')) {
          toast({
              variant: 'destructive',
              title: 'Unsupported File Type',
              description: 'Please upload a text-based file (e.g., .txt, .md).',
          });
          return;
      }
      setFile(selectedFile);
      setSummary('');

      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result as string);
      };
      reader.readAsText(selectedFile);

      toast({
        title: 'File Selected',
        description: `${selectedFile.name} is ready to be summarized.`,
      });
    }
  };

  const handleGenerateSummary = async () => {
    if (!fileContent) {
      toast({
        variant: 'destructive',
        title: 'No content to summarize',
        description: 'Please select a file first.',
      });
      return;
    }
    
    setIsSummarizing(true);
    setSummary('');
    try {
        const result = await generateSummary({ noteContent: fileContent });
        setSummary(result.summary);
         toast({
            title: 'Summary Generated!',
            description: `The AI has summarized ${file?.name}.`,
        });
    } catch (error) {
        console.error("Failed to generate summary:", error);
        toast({
            variant: 'destructive',
            title: 'Summarization Failed',
            description: 'Could not generate a summary for this document.',
        });
    } finally {
        setIsSummarizing(false);
    }
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyze Your Documents</h1>
        <p className="text-muted-foreground">
          Upload a text document to get an instant AI-powered summary.
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
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
          accept="text/*,.md"
        />
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
          <p className="mb-2 text-lg font-semibold">
            {file ? file.name : "Drag and drop a file here"}
          </p>
          <p className="text-sm text-muted-foreground">
            Or click to browse your files (text files only)
          </p>
        </div>
      </div>
      
      {fileContent && (
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>File Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea readOnly value={fileContent} className="h-64 bg-muted" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>AI Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    {isSummarizing ? (
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : summary ? (
                        <p className="text-muted-foreground">{summary}</p>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            <p>Click the button to generate a summary.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      )}

      {fileContent && (
        <div className="flex justify-end">
            <Button onClick={handleGenerateSummary} disabled={isSummarizing}>
                <Wand2 className="mr-2 h-4 w-4"/>
                {isSummarizing ? 'Generating...' : 'Generate Summary'}
            </Button>
        </div>
      )}

    </div>
  );
}
