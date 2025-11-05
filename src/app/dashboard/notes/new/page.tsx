

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Underline, Strikethrough, Palette, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Undo, Redo, X, ChevronDown, Mic, Sparkles, Clock, Music, UserPlus, Upload, Info, GitMerge, Link as LinkIcon, Plus, History, Printer, Expand, Search, FileText, ArrowRight, Type, GripVertical, Maximize, Square, Globe, GraduationCap, FileSignature, Loader2, MessageSquare, BrainCircuit, Lightbulb, Copy, ImageIcon
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

const EditorToolbar = ({ onCommand, activeTab, setActiveTab }: { onCommand: (command: string, value?: string) => void, activeTab: string, setActiveTab: (tab: string) => void }) => {
    
    const tabs = [
        { id: 'self-written', label: 'Self Written Notes', icon: <FileText size={16} /> },
        { id: 'lecture-transcript', label: 'Lecture Transcript', icon: <Clock size={16} /> },
        { id: 'audio-files', label: 'Audio Files', icon: <Music size={16} /> },
    ];
    
    return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-t-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex items-center -mb-px">
                 {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-3 border-b-2 font-semibold text-sm transition-colors ${
                            activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
        <div className="p-2 flex items-center space-x-1 text-gray-500 dark:text-gray-400 overflow-x-auto">
                <select onChange={(e) => onCommand('fontName', e.target.value)} className="flex items-center gap-1 px-2 py-1.5 rounded bg-transparent text-sm border-none focus:ring-0 appearance-none">
                    <option>Arial</option>
                    <option>Georgia</option>
                    <option>Times New Roman</option>
                    <option>Verdana</option>
                </select>
                <select onChange={(e) => onCommand('fontSize', e.target.value)} className="flex items-center gap-1 px-2 py-1.5 rounded bg-transparent text-sm border-none focus:ring-0 appearance-none">
                    <option value="3">12</option>
                    <option value="4">14</option>
                    <option value="5">18</option>
                    <option value="6">24</option>
                </select>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <Button variant="ghost" size="icon" onClick={() => onCommand('bold')} className="w-8 h-8"><Bold size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => onCommand('italic')} className="w-8 h-8"><Italic size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => onCommand('underline')} className="w-8 h-8"><Underline size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => onCommand('strikeThrough')} className="w-8 h-8"><Strikethrough size={16} /></Button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                 <input type="color" onChange={(e) => onCommand('foreColor', e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent" />
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <Button variant="ghost" size="icon" onClick={() => onCommand('justifyLeft')} className="w-8 h-8"><AlignLeft size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => onCommand('justifyCenter')} className="w-8 h-8"><AlignCenter size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => onCommand('justifyRight')} className="w-8 h-8"><AlignRight size={16} /></Button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <Button variant="ghost" size="icon" onClick={() => onCommand('insertUnorderedList')} className="w-8 h-8"><List size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => onCommand('insertOrderedList')} className="w-8 h-8"><ListOrdered size={16} /></Button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <Button variant="ghost" size="icon" onClick={() => onCommand('undo')} className="w-8 h-8"><Undo size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => onCommand('redo')} className="w-8 h-8"><Redo size={16} /></Button>
        </div>
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
            onNoteGenerated(`<h2>${result.title}</h2><p>${result.note.replace(/\n/g, '<br/>')}</p>`);
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
            <AIBuddy className="w-2 h-2 mx-auto mb-4" {...customizations} />
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
    const [editorContent, setEditorContent] = useState('');
    const history = useRef<{ content: string }[]>([]);
    const historyIndex = useRef(-1);
    const [showLiveLecture, setShowLiveLecture] = useState(false);
    
    const [activeToolbarTab, setActiveToolbarTab] = useState('self-written');
    const [lectureTranscript, setLectureTranscript] = useState('');
    const [lectureAudioUrl, setLectureAudioUrl] = useState<string | null>(null);

    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [user] = useAuthState(auth);
    const { toast } = useToast();

    const handleCommand = (command: string, value?: string) => {
        if (command === 'fontName' || command === 'fontSize') {
            document.execCommand(command, false, value);
        } else if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
            document.execCommand(command, false);
        } else {
             document.execCommand(command, false, value);
        }
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            if (history.current[historyIndex.current]?.content !== newContent) {
                const newHistory = history.current.slice(0, historyIndex.current + 1);
                newHistory.push({ content: newContent });
                history.current = newHistory;
                historyIndex.current++;
            }
        }
        editorRef.current?.focus();
    };

    const handleInput = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            if (history.current[historyIndex.current]?.content !== newContent) {
                const newHistory = history.current.slice(0, historyIndex.current + 1);
                newHistory.push({ content: newContent });
                history.current = newHistory;
                historyIndex.current++;
            }
            setEditorContent(newContent);
        }
    };
    
    const handleUndo = () => {
        if (historyIndex.current > 0) {
            historyIndex.current--;
            const newContent = history.current[historyIndex.current].content;
            setEditorContent(newContent);
            if (editorRef.current) {
                editorRef.current.innerHTML = newContent;
            }
        }
    };

    const handleRedo = () => {
        if (historyIndex.current < history.current.length - 1) {
            historyIndex.current++;
            const newContent = history.current[historyIndex.current].content;
            setEditorContent(newContent);
            if (editorRef.current) {
                editorRef.current.innerHTML = newContent;
            }
        }
    };

    const handleNoteGenerated = (noteHtml: string) => {
        if (editorRef.current) {
            const currentContent = editorRef.current.innerHTML;
            const newContent = currentContent + '<br>' + noteHtml;
            editorRef.current.innerHTML = newContent;
            setEditorContent(newContent); 
        }
    };

    const handleSendMessage = async (prompt?: string) => {
        const messageContent = prompt || chatInput.trim();
        if (!messageContent || !user) return;
    
        const userMessage: Message = { role: 'user', content: messageContent };
        const newHistory = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setChatInput('');
        setIsChatLoading(true);
    
        try {
          const response = await studyPlannerAction({
            history: newHistory,
            courseContext: editorContent,
          });
          const aiMessage: Message = { role: 'ai', content: response.text };
          setChatHistory(prev => [...prev, aiMessage]);
    
        } catch (error) {
          console.error(error);
          setChatHistory(chatHistory); // Revert on error
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
                        <EditorToolbar onCommand={handleCommand} activeTab={activeToolbarTab} setActiveTab={setActiveToolbarTab} />
                         {activeToolbarTab === 'self-written' && (
                             <div 
                                 ref={editorRef}
                                 contentEditable="true" 
                                 className="flex-1 p-8 prose prose-lg max-w-none dark:prose-invert outline-none" 
                                 suppressContentEditableWarning={true}
                                 onInput={handleInput}
                                 dangerouslySetInnerHTML={{ __html: editorContent }}
                             >
                             </div>
                         )}
                         {activeToolbarTab === 'lecture-transcript' && (
                            <div className="flex-1 p-8 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {lectureTranscript || "No transcript recorded yet."}
                            </div>
                        )}
                        {activeToolbarTab === 'audio-files' && (
                             <div className="flex-1 p-8">
                                {lectureAudioUrl ? (
                                    <audio controls src={lectureAudioUrl} className="w-full" />
                                ) : (
                                    <p className="text-gray-500">No audio recorded yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <aside className="w-96 flex-shrink-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
                 <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <div />
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
                                     {msg.role === 'ai' && <div className="w-10 h-10 flex-shrink-0"><AIBuddy className="w-full h-full" /></div>}
                                    <div className={cn("p-3 rounded-2xl max-w-[85%] text-sm prose dark:prose-invert prose-p:my-0 prose-headings:my-0 prose-table:my-0", msg.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex items-end gap-2">
                                    <div className="w-10 h-10 flex-shrink-0"><AIBuddy className="w-full h-full" /></div>
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
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400"><ImageIcon size={16}/></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><Globe size={16}/></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><GraduationCap size={16}/></Button>
                            <Button variant="secondary" size="sm" className="h-8 gap-1.5"><FileText size={16}/>Using 1 material(s)</Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400"><Mic className="h-4 w-4"/></Button>
                    </div>
                </footer>
            </aside>
        </div>
    );
}
