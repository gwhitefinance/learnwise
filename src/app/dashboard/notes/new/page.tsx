
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Draggable from 'react-draggable';


export default function NewNotePage() {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('self-written');
  const editorRef = useRef<HTMLDivElement>(null);

  const [historyStack, setHistoryStack] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    document.execCommand("styleWithCSS", false);
  }, []);

  const applyStyle = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateHistory();
  };

  const updateHistory = () => {
    const currentContent = editorRef.current?.innerHTML || '';
    if (currentContent !== historyStack[historyIndex]) {
        const newHistory = historyStack.slice(0, historyIndex + 1);
        newHistory.push(currentContent);
        setHistoryStack(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        if(editorRef.current) {
            editorRef.current.innerHTML = historyStack[newIndex];
        }
    }
  };

  const redo = () => {
    if (historyIndex < historyStack.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        if(editorRef.current) {
            editorRef.current.innerHTML = historyStack[newIndex];
        }
    }
  };

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

  const colors = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ffffff'];


  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
         <header className="flex justify-between items-center mb-4 flex-wrap bg-card p-2 px-4">
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Untitled Lecture</h1>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-blue-500 text-white hover:bg-blue-600 rounded-full">
                    <Mic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="h-9 text-muted-foreground"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
                <Button className="h-9 bg-blue-500 hover:bg-blue-600 rounded-full">Upgrade</Button>
                <Button variant="ghost" className="h-9 text-muted-foreground">Feedback</Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><LinkIcon className="h-4 w-4"/></Button>
            </div>
        </header>
        
        <div className="bg-card p-2 space-y-2">
            <div className="flex gap-1 flex-wrap">
                <TabButton id="self-written" name="Self Written Notes" icon={<FileText className="h-4 w-4 mr-2" />} />
                <TabButton id="enhanced" name="Enhanced Notes" icon={<Sparkles className="h-4 w-4 mr-2" />} />
                <TabButton id="transcript" name="Lecture Transcript" icon={<Clock className="h-4 w-4 mr-2" />} />
                <TabButton id="audio" name="Audio Files" icon={<Mic className="h-4 w-4 mr-2" />} />
            </div>
            <div className="flex items-center gap-1 flex-nowrap overflow-x-auto px-2">
                <Select defaultValue="Arial" onValueChange={(value) => applyStyle('fontName', value)}>
                    <SelectTrigger className="w-[120px] h-8 text-xs shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                    </SelectContent>
                </Select>
                 <Select defaultValue="3" onValueChange={(value) => applyStyle('fontSize', value)}>
                    <SelectTrigger className="w-[70px] h-8 text-xs shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1 (8pt)</SelectItem>
                        <SelectItem value="2">2 (10pt)</SelectItem>
                        <SelectItem value="3">3 (12pt)</SelectItem>
                        <SelectItem value="4">4 (14pt)</SelectItem>
                        <SelectItem value="5">5 (18pt)</SelectItem>
                        <SelectItem value="6">6 (24pt)</SelectItem>
                        <SelectItem value="7">7 (36pt)</SelectItem>
                    </SelectContent>
                </Select>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => applyStyle('bold')}><Bold className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => applyStyle('italic')}><Italic className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => applyStyle('underline')}><Underline className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => applyStyle('strikeThrough')}><Strikethrough className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                 <Popover>
                    <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Highlighter className="h-4 w-4" /></Button></PopoverTrigger>
                    <PopoverContent side="bottom" className="w-auto p-2"><div className="flex gap-1">{colors.map(c => (<button key={c} onClick={() => applyStyle('hiliteColor', c)} className={`w-6 h-6 rounded-full border-2 ${c === '#ffffff' ? 'border-gray-400' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}</div></PopoverContent>
                </Popover>
                 <Popover>
                    <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Palette className="h-4 w-4" /></Button></PopoverTrigger>
                    <PopoverContent side="bottom" className="w-auto p-2"><div className="flex gap-1">{colors.map(c => (<button key={c} onClick={() => applyStyle('foreColor', c)} className={`w-6 h-6 rounded-full border-2 ${c === '#ffffff' ? 'border-gray-400' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}</div></PopoverContent>
                </Popover>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => applyStyle('justifyLeft')}><AlignLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => applyStyle('justifyCenter')}><AlignCenter className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => applyStyle('justifyRight')}><AlignRight className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => applyStyle('insertOrderedList')}><ListOrdered className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => applyStyle('insertUnorderedList')}><List className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={undo}><Undo className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={redo}><Redo className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Plus className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><History className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Maximize className="h-4 w-4" /></Button>
            </div>
        </div>

        <div className="flex-1 mt-4 relative">
            {activeTab === 'self-written' && (
                <Card className="h-full">
                    <CardContent className="p-0 h-full">
                        <div
                            ref={editorRef}
                            contentEditable
                            onInput={updateHistory}
                            className="h-full w-full border-0 focus-visible:ring-0 focus-visible:outline-none resize-none text-base p-6"
                            placeholder="Start writing your notes here..."
                        />
                    </CardContent>
                </Card>
            )}
             {activeTab === 'transcript' && (
                <div className="h-full w-full flex items-center justify-center">
                    <Draggable>
                        <div className="cursor-move">
                            <ListenToNote onNoteGenerated={handleNoteGenerated} />
                        </div>
                    </Draggable>
                </div>
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
