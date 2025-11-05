
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  File,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Share2,
  Paperclip,
  Clock,
  Mic,
  BrainCircuit,
  Lightbulb,
  FileQuestion,
  Sparkles,
  Loader2,
  Square,
  FileSignature
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import FloatingChat from '@/components/floating-chat';
import ListenToNote from '@/components/ListenToNote';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function NewNotePage() {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const router = useRouter();

  const handleNoteGenerated = async (title: string, content: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to save notes.'});
      return;
    }
    
    try {
        await addDoc(collection(db, "notes"), {
            title: title,
            content: content,
            date: new Date(),
            color: 'bg-indigo-100 dark:bg-indigo-900/20',
            isImportant: false,
            isCompleted: false,
            userId: user.uid,
        });
        toast({ title: 'Note Saved!', description: 'Your transcribed note has been saved.'});
        router.push('/dashboard/notes');
    } catch(e) {
         toast({ variant: 'destructive', title: 'Error', description: 'Could not save note.'});
    }
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <File className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Notes AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
            <Button>Upgrade</Button>
            <Button variant="ghost">Feedback</Button>
          </div>
        </header>

        <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="self-written">Self Written Notes</TabsTrigger>
            <TabsTrigger value="enhanced">Enhanced Notes</TabsTrigger>
            <TabsTrigger value="transcript">Lecture Transcript</TabsTrigger>
            <TabsTrigger value="audio">Audio Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="self-written" className="flex-1 mt-4">
             <Card className="h-full">
                <CardContent className="p-4 h-full">
                    <Textarea className="h-full w-full border-0 focus-visible:ring-0 resize-none" placeholder="Start writing your notes here..."/>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="transcript" className="flex-1 mt-4">
             <Card className="h-full flex items-center justify-center">
                <CardContent className="p-4 text-center">
                    <ListenToNote onNoteGenerated={handleNoteGenerated} />
                </CardContent>
             </Card>
          </TabsContent>
          {/* Other tab contents can be added here */}
        </Tabs>
      </div>

      {/* Right Sidebar - AI Chat */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
         <FloatingChat isEmbedded={true}>
            <div></div>
        </FloatingChat>
      </div>
    </div>
  );
}
