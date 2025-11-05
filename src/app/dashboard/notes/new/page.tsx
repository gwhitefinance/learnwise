
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Sparkles,
  Clock,
  Mic,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  Plus,
  History,
  Printer,
  Maximize,
  Share2,
  ChevronDown,
  Upload,
  Link as LinkIcon
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
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function NewNotePage() {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('self-written');

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

  const TabButton = ({ name, id, icon }: { name: string, id: string, icon: React.ReactNode }) => (
    <Button
      variant={activeTab === id ? 'secondary' : 'ghost'}
      onClick={() => setActiveTab(id)}
      className={cn(
        "h-9 px-3 py-2 text-sm",
        activeTab === id && 'bg-primary/10 text-primary hover:bg-primary/15'
      )}
    >
      {icon}
      {name}
    </Button>
  );

  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
         <header className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Untitled Lecture</h1>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-blue-500 text-white hover:bg-blue-600">
                <Mic className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="h-9 text-muted-foreground"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
            <Button className="h-9 bg-blue-500 hover:bg-blue-600"><Upload className="h-4 w-4 mr-2"/> Upgrade</Button>
            <Button variant="ghost" className="h-9 text-muted-foreground">Feedback</Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><LinkIcon className="h-4 w-4"/></Button>
          </div>
        </header>
        
        <div className="bg-muted/30 border rounded-lg p-2 space-y-2">
            <div className="flex gap-1">
                <TabButton id="self-written" name="Self Written Notes" icon={<FileText className="h-4 w-4 mr-2" />} />
                <TabButton id="enhanced" name="Enhanced Notes" icon={<Sparkles className="h-4 w-4 mr-2" />} />
                <TabButton id="transcript" name="Lecture Transcript" icon={<Clock className="h-4 w-4 mr-2" />} />
                <TabButton id="audio" name="Audio Files" icon={<Mic className="h-4 w-4 mr-2" />} />
            </div>
            <Separator />
            <div className="flex items-center gap-1 flex-nowrap overflow-x-auto px-2">
                <Select defaultValue="arial">
                    <SelectTrigger className="w-[100px] h-8 text-xs shrink-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="arial">Arial</SelectItem>
                        <SelectItem value="helvetica">Helvetica</SelectItem>
                        <SelectItem value="times">Times New Roman</SelectItem>
                    </SelectContent>
                </Select>
                 <Select defaultValue="11">
                    <SelectTrigger className="w-[60px] h-8 text-xs shrink-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="11">11</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="14">14</SelectItem>
                    </SelectContent>
                </Select>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Bold className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Italic className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Underline className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Strikethrough className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Highlighter className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Palette className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><AlignLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><AlignCenter className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><AlignRight className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><ListOrdered className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><List className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Undo className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Redo className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Plus className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><History className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Printer className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Maximize className="h-4 w-4" /></Button>
            </div>
        </div>

        <div className="flex-1 mt-4">
            {activeTab === 'self-written' && (
                <Card className="h-full">
                    <CardContent className="p-0 h-full">
                        <Textarea className="h-full w-full border-0 focus-visible:ring-0 resize-none text-base p-6" placeholder="Start writing your notes here..."/>
                    </CardContent>
                </Card>
            )}
             {activeTab === 'transcript' && (
                <Card className="h-full flex items-center justify-center">
                    <CardContent className="p-4 text-center">
                        <ListenToNote onNoteGenerated={handleNoteGenerated} />
                    </CardContent>
                </Card>
            )}
            {(activeTab === 'enhanced' || activeTab === 'audio') && (
                <Card className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Content for {activeTab.replace('-', ' ')} goes here.</p>
                </Card>
            )}
        </div>
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
