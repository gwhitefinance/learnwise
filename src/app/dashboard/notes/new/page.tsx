
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Underline, Strikethrough, Palette, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Undo, Redo, X, ChevronDown, Mic, Sparkles, Clock, Music, UserPlus, Upload, Info, GitMerge, FileSignature, Plus, History, Printer, Expand, Search, FileText, ArrowRight, Type, GripVertical, Maximize, Square, Globe, GraduationCap, Loader2, MessageSquare, BrainCircuit, Lightbulb, Copy, ImageIcon, Link as LinkIcon, MessageSquarePlus, Paintbrush, Minus, Indent, Outdent, Pilcrow, LineChart, CheckSquare
} from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Draggable from 'react-draggable';
import { generateNoteFromChat, studyPlannerAction } from '@/lib/actions';
import { Textarea } from '@/components/ui/textarea';
import AIBuddy from '@/components/ai-buddy';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Logo from '@/components/Logo';
import Link from 'next/link';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const EditorToolbar = ({ onCommand }: { onCommand: (command: string, value?: string) => void }) => {
    
    return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-t-lg shadow-sm border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap items-center gap-1 text-gray-600 dark:text-gray-300">
        <Button variant="ghost" size="icon" onClick={() => onCommand('undo')} className="w-8 h-8"><Undo size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('redo')} className="w-8 h-8"><Redo size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => window.print()} className="w-8 h-8"><Printer size={16} /></Button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <select onChange={(e) => onCommand('formatBlock', e.target.value)} className="flex items-center gap-1 px-2 py-1.5 rounded bg-transparent text-sm border-none focus:ring-0 appearance-none hover:bg-gray-200 dark:hover:bg-gray-700">
            <option value="p">Normal text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
        </select>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <select onChange={(e) => onCommand('fontName', e.target.value)} className="flex items-center gap-1 px-2 py-1.5 rounded bg-transparent text-sm border-none focus:ring-0 appearance-none hover:bg-gray-200 dark:hover:bg-gray-700 w-24">
            <option>Arial</option>
            <option>Georgia</option>
            <option>Times New Roman</option>
            <option>Verdana</option>
            <option>Courier New</option>
        </select>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <Button variant="ghost" size="icon" onClick={() => onCommand('decreaseFontSize')} className="w-8 h-8"><Minus size={16} /></Button>
        <Input type="text" defaultValue="12" className="w-10 h-8 text-center p-0 border-gray-300 dark:border-gray-600 bg-transparent" onBlur={(e) => onCommand('fontSize', (Math.floor(parseInt(e.target.value) / 3) + 1).toString())}/>
        <Button variant="ghost" size="icon" onClick={() => onCommand('increaseFontSize')} className="w-8 h-8"><Plus size={16} /></Button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <Button variant="ghost" size="icon" onClick={() => onCommand('bold')} className="w-8 h-8"><Bold size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('italic')} className="w-8 h-8"><Italic size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('underline')} className="w-8 h-8"><Underline size={16} /></Button>
        <div className="relative w-8 h-8 flex items-center justify-center">
            <Button variant="ghost" size="icon" className="w-full h-full absolute inset-0"><Palette size={16} /></Button>
            <input type="color" onChange={(e) => onCommand('foreColor', e.target.value)} className="w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="relative w-8 h-8 flex items-center justify-center">
             <Button variant="ghost" size="icon" className="w-full h-full absolute inset-0"><Paintbrush size={16} /></Button>
             <input type="color" onChange={(e) => onCommand('hiliteColor', e.target.value)} className="w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <Button variant="ghost" size="icon" className="w-8 h-8"><LinkIcon size={16} /></Button>
        <Button variant="ghost" size="icon" className="w-8 h-8"><MessageSquarePlus size={16} /></Button>
        <Button variant="ghost" size="icon" className="w-8 h-8"><ImageIcon size={16} /></Button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <Button variant="ghost" size="icon" onClick={() => onCommand('justifyLeft')} className="w-8 h-8"><AlignLeft size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('justifyCenter')} className="w-8 h-8"><AlignCenter size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('justifyRight')} className="w-8 h-8"><AlignRight size={16} /></Button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <Button variant="ghost" size="icon" onClick={() => onCommand('insertUnorderedList')} className="w-8 h-8"><List size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('insertOrderedList')} className="w-8 h-8"><ListOrdered size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('outdent')} className="w-8 h-8"><Outdent size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('indent')} className="w-8 h-8"><Indent size={16} /></Button>
         <Button variant="ghost" size="icon" onClick={() => onCommand('strikeThrough')} className="w-8 h-8"><Strikethrough size={16} /></Button>
    </div>
)};

const LiveLecturePanel = ({ show, setShow, onNoteGenerated, onTranscriptUpdate, onAudioUpdate }: { show: boolean, setShow: (show: boolean) => void, onNoteGenerated: (content: string) => void, onTranscriptUpdate: (text: string) => void, onAudioUpdate: (url: string | null) => void }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

    const finalTranscriptRef = useRef('');
    const recognitionRef = useRef<any>(null);
    const nodeRef = useRef(null);
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
                let currentFinalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        currentFinalTranscript += event.results[i][0].transcript + ' ';
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                finalTranscriptRef.current += currentFinalTranscript;
                setCurrentTranscript(finalTranscriptRef.current + interimTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    toast({ variant: 'destructive', title: 'Voice recognition error.' });
                }
                setIsListening(false);
            };
            
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [toast]);

    const toggleListening = async () => {
        if (!recognitionRef.current) {
            toast({ variant: 'destructive', title: 'Voice input not supported in this browser.' });
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setCurrentTranscript('');
            finalTranscriptRef.current = '';
            setCurrentAudioUrl(null);
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks: Blob[] = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const url = URL.createObjectURL(audioBlob);
                    setCurrentAudioUrl(url);
                    onAudioUpdate(url); // Pass URL to parent
                    stream.getTracks().forEach(track => track.stop());
                };
                
                (recognitionRef.current as any).mediaRecorder = mediaRecorder;
                mediaRecorder.start();

            } catch (err) {
                 toast({ variant: 'destructive', title: 'Microphone access denied.' });
                 return;
            }

            recognitionRef.current.start();
            setIsListening(true);
        }
    };
    
    const handleStopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            if((recognitionRef.current as any).mediaRecorder) {
                (recognitionRef.current as any).mediaRecorder.stop();
            }
        }
        onTranscriptUpdate(finalTranscriptRef.current);
        setIsListening(false);
    }
    
    const handleGenerateNote = async () => {
        if (!currentTranscript.trim()) {
            toast({ variant: 'destructive', title: 'No text to summarize.' });
            return;
        }
        setIsProcessing(true);
        try {
            const result = await generateNoteFromChat({
                messages: [{ role: 'user', content: currentTranscript }]
            });
            onNoteGenerated(`<h2>${result.title}</h2><p>${result.note.replace(/\\n/g, '<br/>')}</p>`);
            setShow(false);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error generating note.' });
        } finally {
            setIsProcessing(false);
        }
    };


    if (!show) return null;

    return (
        <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
            <div ref={nodeRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-auto max-h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col">
                 <header className="drag-handle cursor-move flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Live Lecture Recording</h3>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
                             <Mic size={16} className="mr-1" />
                            Default
                         </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
                             <Globe size={16} className="mr-1" />
                            EN
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400">
                            <Maximize size={16} />
                         </Button>
                    </div>
                </header>
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {!isListening && !currentTranscript && !currentAudioUrl ? (
                        <>
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Mic size={32} className="text-gray-500" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Click to start recording</h4>
                            <Button onClick={toggleListening} className="mt-4" size="lg">
                                <Mic className="mr-2" />
                                Start Recording
                            </Button>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col">
                             <div className="flex-1 overflow-y-auto p-2 border-b mb-4">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-left">{currentTranscript || 'Listening...'}</p>
                            </div>
                            {currentAudioUrl && (
                                <div className="mb-4">
                                    <audio controls src={currentAudioUrl} className="w-full" />
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-4">
                                {isListening ? (
                                    <Button onClick={handleStopRecording} size="lg" className="rounded-full bg-red-500 hover:bg-red-600">
                                        <Square className="mr-2" /> Stop Recording
                                    </Button>
                                ) : (
                                    <Button onClick={handleGenerateNote} size="lg" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <FileSignature className="mr-2" />}
                                        Generate Note
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Draggable>
    );
};

const ChatHomeScreen = ({ onStartChatWithPrompt, customizations }: { onStartChatWithPrompt: (prompt: string) => void, customizations: Record<string, string> }) => {
    const [user] = useAuthState(auth);

    const conversationStarters = [
        { icon: <FileText className="h-5 w-5" />, text: "Generate summary about this material" },
        { icon: <BrainCircuit className="h-5 w-5" />, text: "Explain the difficult parts of this" },
        { icon: <Lightbulb className="h-5 w-5" />, text: "Generate study questions for this" },
    ];

    return (
        <div className="p-6 text-center h-full flex flex-col justify-center">
            <h3 className="font-semibold text-lg">Hello, {user?.displayName?.split(' ')[0] || 'there'}!</h3>
            <div className="mt-6 space-y-3">
                {conversationStarters.map(starter => (
                    <Button key={starter.text} variant="outline" className="w-full justify-between h-auto py-3" onClick={() => onStartChatWithPrompt(starter.text)}>
                        {starter.text}
                        {starter.icon}
                    </Button>
                ))}
            </div>
            <button className="text-sm text-muted-foreground mt-4 hover:underline">View More</button>
            <div className="mt-6">
                <Button variant="secondary" className="rounded-full"><Sparkles className="h-4 w-4 mr-2"/> Personalities & Skillsets</Button>
            </div>
        </div>
    );
};


export default function NewNotePage() {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showLiveLecture, setShowLiveLecture] = useState(false);
    const [lectureTranscript, setLectureTranscript] = useState('');
    const [lectureAudioUrl, setLectureAudioUrl] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const { toast } = useToast();
    const [isChatVisible, setIsChatVisible] = useState(true);
    
    // This state will hold the raw HTML content for saving.
    const [editorContent, setEditorContent] = useState('');

    const handleCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };
    
    const handleNoteGenerated = (noteHtml: string) => {
        if (editorRef.current) {
            const currentContent = editorRef.current.innerHTML;
            const newContent = currentContent + '<br>' + noteHtml;
            editorRef.current.innerHTML = newContent;
        }
    };

    const handleSendMessage = async (prompt?: string) => {
        const messageContent = prompt || chatInput.trim();
        if (!messageContent) return;
    
        const userMessage: Message = { role: 'user', content: messageContent };
        setChatHistory(prev => [...prev, userMessage]);
        setChatInput('');
        setIsChatLoading(true);
    
        try {
          const response = await studyPlannerAction({
            history: [...chatHistory, userMessage],
            courseContext: editorRef.current?.innerText || '', // Use innerText for context
          });
          const aiMessage: Message = { role: 'ai', content: response.text };
          setChatHistory(prev => [...prev, aiMessage]);
    
        } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not get a response from the AI.'})
        } finally {
          setIsChatLoading(false);
        }
    };
    
    const handleStartChatWithPrompt = (prompt: string) => {
        setChatHistory([]); // Start a new chat
        handleSendMessage(prompt);
    }
    
    return (
        <div className="flex h-screen overflow-hidden">
             <main className="flex-1 flex flex-col bg-background-light dark:bg-gray-900/50">
                <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <Link href="/dashboard/notes">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400">
                                    <X size={20} />
                                </Button>
                            </Link>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Untitled Lecture</h1>
                            <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-full">
                                <ChevronDown size={16} />
                            </button>
                             <button onClick={() => setShowLiveLecture(true)} className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 ml-2">
                                <Mic size={16}/>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsChatVisible(!isChatVisible)}>
                                <MessageSquare className="mr-2 h-4 w-4"/>
                                {isChatVisible ? 'Hide Chat' : 'Show Chat'}
                            </Button>
                            <Button variant="outline" className="text-sm">
                                <UserPlus className="mr-2 h-4 w-4"/> Share
                            </Button>
                            <Button className="text-sm bg-blue-600 hover:bg-blue-700">
                                <Upload className="mr-2 h-4 w-4"/> Upgrade
                            </Button>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex flex-col p-6 overflow-y-auto relative">
                     <LiveLecturePanel show={showLiveLecture} setShow={setShowLiveLecture} onNoteGenerated={handleNoteGenerated} onTranscriptUpdate={setLectureTranscript} onAudioUpdate={setLectureAudioUrl} />
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm flex-1 flex flex-col">
                        <EditorToolbar onCommand={handleCommand} />
                         <div 
                             ref={editorRef}
                             contentEditable="true" 
                             className="relative flex-1 p-8 prose prose-lg max-w-none dark:prose-invert outline-none" 
                             suppressContentEditableWarning={true}
                             data-placeholder="Start writing note here..."
                         >
                         </div>
                    </div>
                </div>
            </main>
             {isChatVisible && (
                <aside className="w-96 flex-shrink-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
                    <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400" onClick={() => setIsChatVisible(false)}>
                            <X size={20}/>
                        </Button>
                        <Button variant="secondary" size="sm" className="rounded-full font-semibold">
                            Chat History
                        </Button>
                    </header>
                    <ScrollArea className="flex-1">
                        {chatHistory.length === 0 ? (
                            <ChatHomeScreen onStartChatWithPrompt={handleStartChatWithPrompt} customizations={{}} />
                        ) : (
                            <div className="p-4 space-y-4">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={cn("flex items-end gap-2", msg.role === 'user' ? 'justify-end' : '')}>
                                        {msg.role === 'ai' && <div className="w-6 h-6 flex-shrink-0"><AIBuddy className="w-full h-full" /></div>}
                                        <div className={cn("p-3 rounded-2xl max-w-[85%] text-sm prose dark:prose-invert prose-p:my-0 prose-headings:my-0 prose-table:my-0", msg.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex items-end gap-2">
                                        <div className="w-6 h-6 flex-shrink-0"><AIBuddy className="w-full h-full" /></div>
                                        <div className="p-3 rounded-2xl max-w-[85%] text-sm bg-muted rounded-bl-none animate-pulse">
                                            ...
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                        <div className="relative">
                            <Textarea 
                                placeholder="Ask your AI tutor anything..." 
                                className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg p-4 pr-12 text-base resize-none"
                                rows={1}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <Button size="icon" className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700" onClick={() => handleSendMessage()} disabled={isChatLoading}>
                                <ArrowRight size={16}/>
                            </Button>
                        </div>
                    </footer>
                </aside>
            )}
        </div>
    );
}
