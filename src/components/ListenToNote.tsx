
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, FileSignature } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateNoteFromChat } from '@/lib/actions';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface ListenToNoteProps {
  onNoteGenerated: (title: string, content: string) => void;
}

const ListenToNote: React.FC<ListenToNoteProps> = ({ onNoteGenerated }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => prev + finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'no-speech') {
             toast({ variant: 'destructive', title: 'Voice recognition error.' });
        }
        setIsListening(false);
      };
      
       recognitionRef.current.onend = () => {
         setIsListening(false);
      };

    }
  }, [toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({ variant: 'destructive', title: 'Voice input not supported in this browser.' });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript(''); // Clear previous transcript
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  const handleGenerateNote = async () => {
      if (!transcript.trim()) {
          toast({ variant: 'destructive', title: 'No text to summarize.' });
          return;
      }
      setIsProcessing(true);
      try {
          const result = await generateNoteFromChat({
              messages: [{ role: 'user', content: transcript }]
          });
          onNoteGenerated(result.title, result.note);
          setTranscript('');
      } catch (e) {
          console.error(e);
          toast({ variant: 'destructive', title: 'Error generating note.'});
      } finally {
          setIsProcessing(false);
      }
  }

  return (
    <Card className="w-full">
        <CardHeader>
            <CardTitle>Listen to Lecture</CardTitle>
            <CardDescription>Record audio and have the AI turn it into a summarized note.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex gap-4 items-start">
                <div className="flex flex-col gap-2">
                    <Button onClick={toggleListening} size="icon" className={`h-12 w-12 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary'}`}>
                        {isListening ? <Square className="h-6 w-6"/> : <Mic className="h-6 w-6"/>}
                    </Button>
                     <Button onClick={handleGenerateNote} variant="secondary" size="icon" className="h-12 w-12 rounded-full" disabled={!transcript || isProcessing}>
                        {isProcessing ? <Loader2 className="h-6 w-6 animate-spin"/> : <FileSignature className="h-6 w-6" />}
                    </Button>
                </div>
                <Textarea 
                    value={transcript} 
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Your transcribed lecture will appear here..."} 
                    className="h-32 flex-1"
                />
            </div>
        </CardContent>
    </Card>
  );
};

export default ListenToNote;

