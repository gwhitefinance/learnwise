
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  ArrowRight,
  ImageIcon,
  Globe,
  GraduationCap,
  FileText,
  MicOff,
  Undo,
  Redo,
  X,
  ChevronDown,
  Mic,
  Sparkles,
  Clock,
  Music,
  UserPlus,
  Upload,
  Info,
  GitMerge,
  Link,
  Plus,
  History,
  Printer,
  Expand,
  Search
} from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

const EditorToolbar = ({ onCommand }: { onCommand: (command: string, value?: string) => void }) => (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 border-b border-gray-200 dark:border-gray-800">
            <nav className="flex items-center -mb-px">
                <a className="flex items-center gap-2 px-3 py-3 border-b-2 border-primary text-primary font-semibold text-sm" href="#">
                    <FileText size={16} /> Self Written Notes
                </a>
                <a className="flex items-center gap-2 px-3 py-3 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm" href="#">
                    <Sparkles size={16} /> Enhanced Notes
                </a>
                <a className="flex items-center gap-2 px-3 py-3 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm" href="#">
                    <Clock size={16} /> Lecture Transcript
                </a>
                <a className="flex items-center gap-2 px-3 py-3 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm" href="#">
                    <Music size={16} /> Audio Files
                </a>
            </nav>
        </div>
        <div className="p-4">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <select onChange={(e) => onCommand('fontName', e.target.value)} className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm border-none focus:ring-0">
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Verdana">Verdana</option>
                </select>
                <select onChange={(e) => onCommand('fontSize', e.target.value)} className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm border-none focus:ring-0">
                    <option value="3">11</option>
                    <option value="4">14</option>
                    <option value="5">18</option>
                    <option value="6">24</option>
                </select>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button onClick={() => onCommand('bold')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><Bold size={18} /></button>
                <button onClick={() => onCommand('italic')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><Italic size={18} /></button>
                <button onClick={() => onCommand('underline')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><Underline size={18} /></button>
                <button onClick={() => onCommand('strikeThrough')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><Strikethrough size={18} /></button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><Palette size={18} /></button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button onClick={() => onCommand('justifyLeft')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><AlignLeft size={18} /></button>
                <button onClick={() => onCommand('justifyCenter')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><AlignCenter size={18} /></button>
                <button onClick={() => onCommand('justifyRight')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><AlignRight size={18} /></button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button onClick={() => onCommand('insertUnorderedList')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><List size={18} /></button>
                <button onClick={() => onCommand('insertOrderedList')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><ListOrdered size={18} /></button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button onClick={() => onCommand('undo')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><Undo size={18} /></button>
                <button onClick={() => onCommand('redo')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><Redo size={18} /></button>
                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><Plus size={18} /></button>
                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><History size={18} /></button>
                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><Printer size={18} /></button>
                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><Expand size={18} /></button>
            </div>
        </div>
    </div>
);


export default function NewNotePage() {
    const editorRef = useRef<HTMLDivElement>(null);
    const [editorContent, setEditorContent] = useState('');
    const history = useRef<{ content: string }[]>([]);
    const historyIndex = useRef(-1);

    const executeCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            setEditorContent(editorRef.current.innerHTML);
        }
        editorRef.current?.focus();
    };
    
    const handleCommand = (command: string, value?: string) => {
        if (command === 'undo') {
            handleUndo();
        } else if (command === 'redo') {
            handleRedo();
        } else {
            executeCommand(command, value);
            if (editorRef.current) {
                const newContent = editorRef.current.innerHTML;
                if (newContent !== history.current[historyIndex.current]?.content) {
                    const newHistory = history.current.slice(0, historyIndex.current + 1);
                    newHistory.push({ content: newContent });
                    history.current = newHistory;
                    historyIndex.current++;
                }
            }
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            if (newContent !== history.current[historyIndex.current]?.content) {
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
    
    return (
        <div className="flex h-screen overflow-hidden">
             <main className="flex-1 flex flex-col bg-background-light dark:bg-gray-900/50">
                <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Untitled Lecture</h1>
                            <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                                <ChevronDown size={16} />
                            </button>
                            <button className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 ml-2">
                                <Mic size={16}/>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="text-sm">
                                <UserPlus className="mr-2 h-4 w-4"/> Share
                            </Button>
                            <Button className="text-sm">
                                <Upload className="mr-2 h-4 w-4"/> Upgrade
                            </Button>
                            <Button variant="outline" className="text-sm">
                                <Info className="mr-2 h-4 w-4"/> Feedback
                            </Button>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <GitMerge size={16} />
                                </button>
                                <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <FileText size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm flex-1 flex flex-col">
                        <EditorToolbar onCommand={handleCommand} />
                        <div 
                         ref={editorRef}
                         contentEditable="true" 
                         className="flex-1 p-8 prose prose-lg max-w-none dark:prose-invert outline-none" 
                         suppressContentEditableWarning={true}
                         onInput={handleInput}
                        >
                        </div>
                    </div>
                </div>
            </main>
            <aside className="w-80 flex-shrink-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
                 <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400">
                        <X size={20} />
                    </Button>
                    <Button variant="secondary" size="sm" className="rounded-full font-semibold">
                        Chat History
                    </Button>
                </header>
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-w-xs">
                                <p className="text-sm">write me some notes for photosynthesis</p>
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="p-3">
                                <span className="animate-pulse text-gray-400">...</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="relative">
                            <Input className="w-full bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg py-3 pl-4 pr-12 focus:ring-primary focus:border-primary" placeholder="Ask your AI tutor anything..."/>
                            <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg"><ArrowRight size={16}/></Button>
                        </div>
                        <div className="flex items-center justify-between mt-2 px-2">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400"><ImageIcon size={16}/></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><Globe size={16}/></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><GraduationCap size={16}/></Button>
                                <Button variant="secondary" size="sm" className="h-8 gap-1.5"><FileText size={16}/>Using 1 material(s)</Button>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400"><MicOff size={16}/></Button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
