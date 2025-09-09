
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Wand2, Link, Image as ImageIcon, Copy, Lightbulb, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { generateSummary } from '@/ai/flows/note-summary-flow';
import { generateTutoringSession } from '@/ai/flows/image-tutoring-flow';
import type { TutoringSessionOutput } from '@/ai/schemas/image-tutoring-schema';
import { generateFlashcardsFromNote } from '@/ai/flows/note-to-flashcard-flow';
import { scrapeWebpageTool } from '@/ai/tools/web-scraper-tool';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';

type Flashcard = {
    front: string;
    back: string;
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [tutoringSession, setTutoringSession] = useState<TutoringSessionOutput | null>(null);
  const [learnerType, setLearnerType] = useState<string | null>(null);

  // Practice question state
  const [selectedPracticeAnswer, setSelectedPracticeAnswer] = useState<string | null>(null);
  const [practiceAnswerFeedback, setPracticeAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);


  // Flashcard states
  const [isFlashcardDialogOpen, setFlashcardDialogOpen] = useState(false);
  const [isFlashcardLoading, setFlashcardLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  useEffect(() => {
    const storedLearnerType = localStorage.getItem('learnerType');
    setLearnerType(storedLearnerType ?? 'Unknown');
  }, []);
  
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
      
      setIsLoading(true);
      setSummary('');
      setTutoringSession(null);

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
          setIsLoading(false);
      }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      toast({ variant: 'destructive', title: 'No image selected', description: 'Please upload an image.' });
      return;
    }
    
    setIsLoading(true);
    setSummary('');
    setTutoringSession(null);
    setPracticeAnswerFeedback(null);
    setSelectedPracticeAnswer(null);


    try {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = async (e) => {
            const imageDataUri = e.target?.result as string;
            const result = await generateTutoringSession({ 
                imageDataUri, 
                prompt: imagePrompt,
                learnerType: (learnerType as any) ?? 'Reading/Writing'
            });
            setTutoringSession(result);
            toast({ title: 'Tutor is Ready!', description: 'The AI has analyzed your image.' });
            setIsLoading(false);
        };
        reader.onerror = (error) => {
            throw error;
        }
    } catch (error) {
        console.error("Failed to analyze image:", error);
        toast({ variant: 'destructive', title: 'Image Analysis Failed', description: 'Could not process the image.' });
        setIsLoading(false);
    }
  };
  
  const handleGenerateFlashcards = async (concepts: string[]) => {
    const content = `Based on my homework, please create flashcards for these key concepts: ${concepts.join(', ')}.`;
    setFlashcardDialogOpen(true);
    setFlashcardLoading(true);
    setFlashcards([]);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    try {
        const result = await generateFlashcardsFromNote({
            noteContent: content,
            learnerType: (learnerType as any) ?? 'Reading/Writing'
        });
        setFlashcards(result.flashcards);
    } catch(error) {
        console.error("Failed to generate flashcards:", error);
        toast({
            variant: 'destructive',
            title: 'Flashcard Generation Failed',
        });
        setFlashcardDialogOpen(false);
    } finally {
        setFlashcardLoading(false);
    }
  };

  const handleCheckPracticeAnswer = () => {
      if (!selectedPracticeAnswer || !tutoringSession) return;
      const isCorrect = selectedPracticeAnswer === tutoringSession.practiceQuestion.answer;
      setPracticeAnswerFeedback(isCorrect ? 'correct' : 'incorrect');
  }

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
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Analysis & Tutoring</h1>
        <p className="text-muted-foreground">
          Upload your course materials to get instant AI-powered summaries and guided explanations.
        </p>
      </div>
      
      <Tabs defaultValue="image">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image">Image Tutoring</TabsTrigger>
            <TabsTrigger value="text-url">Text & URL Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="image">
            <Card>
                <CardHeader>
                    <CardTitle>AI Tutor</CardTitle>
                    <CardDescription>Upload a screenshot of your homework for a personalized walkthrough.</CardDescription>
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
                                Drag and drop a worksheet or slide here
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Or click to browse
                              </p>
                            </div>
                         )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image-prompt">What do you need help with? (Optional)</Label>
                        <Input id="image-prompt" placeholder="e.g., 'Explain the quadratic formula' or 'Walk me through question 3'" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleAnalyzeImage} disabled={isLoading || !imageFile}>
                            <Wand2 className="mr-2 h-4 w-4"/>
                            {isLoading ? 'Thinking...' : 'Start Tutoring Session'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="text-url">
            <Card>
                <CardHeader>
                    <CardTitle>Summarize from Text or URL</CardTitle>
                    <CardDescription>Paste text or enter a URL to generate a summary.</CardDescription>
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
                        <Button onClick={handleGenerateSummary} disabled={isLoading || (!textContent && !url)}>
                            <Wand2 className="mr-2 h-4 w-4"/>
                            {isLoading ? 'Generating...' : 'Generate Summary'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>


      {isLoading && (
        <Card>
            <CardHeader><CardTitle>AI Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <Skeleton className="h-4 w-3/4" />
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-2/3" />
            </CardContent>
        </Card>
      )}

      {summary && !isLoading && (
          <Card>
            <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{summary}</p>
            </CardContent>
          </Card>
      )}

      {tutoringSession && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Conceptual Explanation</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{tutoringSession.conceptualExplanation}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Step-by-Step Walkthrough</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{tutoringSession.stepByStepWalkthrough}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                 <Card>
                    <CardHeader><CardTitle>Key Concepts</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <ul className="list-disc list-inside text-muted-foreground">
                            {tutoringSession.keyConcepts.map(c => <li key={c}>{c}</li>)}
                        </ul>
                         <Button variant="outline" className="w-full mt-4" onClick={() => handleGenerateFlashcards(tutoringSession.keyConcepts)}>
                            <Copy className="mr-2 h-4 w-4"/> Review Flashcards
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Practice Question</CardTitle></CardHeader>
                    <CardContent>
                        <p className="font-semibold mb-4">{tutoringSession.practiceQuestion.question}</p>
                         <RadioGroup value={selectedPracticeAnswer ?? ''} onValueChange={setSelectedPracticeAnswer} disabled={!!practiceAnswerFeedback}>
                            <div className="space-y-4">
                            {tutoringSession.practiceQuestion.options?.map((option, index) => {
                                const isCorrect = option === tutoringSession.practiceQuestion.answer;
                                const isSelected = option === selectedPracticeAnswer;
                                
                                return (
                                <Label key={index} htmlFor={`q-opt-${index}`} className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                                    practiceAnswerFeedback === null && (isSelected ? "border-primary bg-primary/10" : "border-border hover:bg-muted"),
                                    practiceAnswerFeedback !== null && isCorrect && "border-green-500 bg-green-500/10",
                                    practiceAnswerFeedback !== null && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                                )}>
                                    <RadioGroupItem value={option} id={`q-opt-${index}`} />
                                    <span>{option}</span>
                                    {practiceAnswerFeedback !== null && isCorrect && <CheckCircle className="h-5 w-5 text-green-500 ml-auto"/>}
                                    {practiceAnswerFeedback !== null && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500 ml-auto"/>}
                                </Label>
                                )
                            })}
                            </div>
                        </RadioGroup>
                         {practiceAnswerFeedback === null && (
                            <Button className="w-full mt-4" onClick={handleCheckPracticeAnswer} disabled={!selectedPracticeAnswer}>Check Answer</Button>
                         )}
                    </CardContent>
                </Card>
                 <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardHeader><CardTitle className="text-amber-700">Personalized Advice</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{tutoringSession.personalizedAdvice}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}

    </div>
    
    <Dialog open={isFlashcardDialogOpen} onOpenChange={setFlashcardDialogOpen}>
        <DialogContent className="max-w-xl">
             <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Copy className="text-blue-500" />
                    Flashcards
                </DialogTitle>
            </DialogHeader>
            <div className="py-4">
                {isFlashcardLoading ? (
                    <div className="flex items-center justify-center h-52">
                        <p className="animate-pulse">Generating your flashcards...</p>
                    </div>
                ) : flashcards.length > 0 ? (
                    <div className="space-y-4">
                         <div className="text-center text-sm text-muted-foreground">
                            Card {currentFlashcardIndex + 1} of {flashcards.length}
                        </div>
                        <div
                            className="relative w-full h-64 cursor-pointer"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <AnimatePresence>
                                <motion.div
                                    key={isFlipped ? 'back' : 'front'}
                                    initial={{ rotateY: isFlipped ? 180 : 0 }}
                                    animate={{ rotateY: 0 }}
                                    exit={{ rotateY: isFlipped ? 0 : -180 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute w-full h-full p-6 flex items-center justify-center text-center rounded-lg border bg-card text-card-foreground shadow-sm"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <p className="text-xl font-semibold">
                                        {isFlipped ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="flex justify-center items-center gap-4">
                            <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.max(0, prev - 1))}} disabled={currentFlashcardIndex === 0}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => setIsFlipped(!isFlipped)}>
                                <RefreshCw className="mr-2 h-4 w-4"/> Flip Card
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.min(flashcards.length - 1, prev + 1))}} disabled={currentFlashcardIndex === flashcards.length - 1}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-52">
                        <p>No flashcards were generated.</p>
                    </div>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button>Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
