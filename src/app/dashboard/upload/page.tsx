
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Wand2, Link, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { generateSummary } from '@/ai/flows/note-summary-flow';
import { analyzeImage } from '@/ai/flows/image-analysis-flow';
import { scrapeWebpageTool } from '@/ai/tools/web-scraper-tool';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  // State for text input
  const [textContent, setTextContent] = useState('');

  // State for URL input
  const [url, setUrl] = useState('');
  
  // State for image input
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imagePrompt, setImagePrompt] = useState('');
  
  // Shared state for results
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const handleImageFileChange = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: 'Please upload an image file (e.g., .png, .jpg, .gif).',
        });
        return;
      }
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSummary = async () => {
      if (!textContent && !url) {
          toast({ variant: 'destructive', title: 'No content', description: 'Please paste text or provide a URL.' });
          return;
      }
      
      setIsSummarizing(true);
      setSummary('');

      try {
          let contentToSummarize = textContent;
          if (url) {
              toast({ title: 'Scraping website...', description: 'Fetching content from the URL.'});
              contentToSummarize = await scrapeWebpageTool({ url });
          }

          const result = await generateSummary({ noteContent: contentToSummarize });
          setSummary(result.summary);
          toast({ title: 'Summary Generated!', description: 'The AI has summarized the content.' });
      } catch (error) {
          console.error("Failed to generate summary:", error);
          toast({ variant: 'destructive', title: 'Summarization Failed', description: 'Could not process the content.' });
      } finally {
          setIsSummarizing(false);
      }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      toast({ variant: 'destructive', title: 'No image selected', description: 'Please upload an image.' });
      return;
    }
    
    setIsSummarizing(true);
    setSummary('');

    try {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = async (e) => {
            const imageDataUri = e.target?.result as string;
            const result = await analyzeImage({ imageDataUri, prompt: imagePrompt });
            setSummary(result.analysis);
            toast({ title: 'Analysis Complete!', description: 'The AI has analyzed your image.' });
            setIsSummarizing(false);
        };
        reader.onerror = (error) => {
            throw error;
        }
    } catch (error) {
        console.error("Failed to analyze image:", error);
        toast({ variant: 'destructive', title: 'Image Analysis Failed', description: 'Could not process the image.' });
        setIsSummarizing(false);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFileChange(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyze Your Documents</h1>
        <p className="text-muted-foreground">
          Upload course materials to get instant AI-powered summaries and explanations.
        </p>
      </div>
      
      <Tabs defaultValue="text-url">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text-url">Text & URL</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>
        <TabsContent value="text-url">
            <Card>
                <CardHeader>
                    <CardTitle>Summarize from Text or URL</CardTitle>
                    <CardDescription>Paste text directly or enter a URL to scrape a webpage and generate a summary.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="url-input">URL</Label>
                        <Input id="url-input" placeholder="https://example.com/article" value={url} onChange={(e) => setUrl(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="text-content">Or Paste Text</Label>
                        <Textarea 
                            id="text-content"
                            placeholder="Paste your course notes or assignment text here..." 
                            className="h-48"
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleGenerateSummary} disabled={isSummarizing || (!textContent && !url)}>
                            <Wand2 className="mr-2 h-4 w-4"/>
                            {isSummarizing ? 'Generating...' : 'Generate Summary'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="image">
            <Card>
                <CardHeader>
                    <CardTitle>Analyze an Image</CardTitle>
                    <CardDescription>Upload a screenshot, diagram, or photo to get an AI analysis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div 
                        className={cn(
                            "relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        )}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('image-upload-input')?.click()}
                      >
                        <input 
                          id="image-upload-input"
                          type="file" 
                          className="hidden"
                          onChange={(e) => handleImageFileChange(e.target.files)}
                          accept="image/*"
                        />
                         {imagePreview ? (
                            <Image src={imagePreview} alt="Image preview" width={200} height={150} className="max-h-48 w-auto object-contain rounded-md" />
                         ) : (
                             <div className="flex flex-col items-center justify-center text-center">
                              <ImageIcon className="w-10 h-10 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-lg font-semibold">
                                Drag and drop an image here
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Or click to browse
                              </p>
                            </div>
                         )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image-prompt">Question about the image (Optional)</Label>
                        <Input id="image-prompt" placeholder="e.g., What are the key takeaways from this slide?" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleAnalyzeImage} disabled={isSummarizing || !imageFile}>
                            <Wand2 className="mr-2 h-4 w-4"/>
                            {isSummarizing ? 'Analyzing...' : 'Analyze Image'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>


      {(isSummarizing || summary) && (
          <Card>
            <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                {isSummarizing ? (
                    <div className="space-y-2">
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-4 w-3/4" />
                    </div>
                ) : (
                    <p className="text-muted-foreground whitespace-pre-wrap">{summary}</p>
                )}
            </CardContent>
        </Card>
      )}

    </div>
  );
}
