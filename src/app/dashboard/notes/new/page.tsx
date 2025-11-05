'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
  Search,
  Home,
  BookCopy,
  Calendar,
  MessageSquare,
  FlaskConical,
  Edit,
  GraduationCap,
  Gamepad2,
  FileSignature,
  Clapperboard,
  Music,
  Plus,
  FolderPlus,
  Flame,
  ChevronDown,
  Upload,
  Link as LinkIcon,
  Bell,
  Info,
  Users,
  ArrowRight,
  X,
  Globe,
  ArrowUp,
  MicOff,
  ImageIcon,
  Undo,
  Redo,
  Printer,
  Expand,
  Type,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

const EditorToolbar = ({ onCommand }: { onCommand: (command: string, value?: string) => void }) => (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="px-4 pt-2">
            <nav className="flex items-center">
                <a className="flex items-center gap-2 px-3 py-2 rounded-t-md bg-white dark:bg-gray-900 text-primary font-semibold text-sm" href="#">
                    <FileText size={16}/>
                    Self Written Notes
                </a>
                <a className="flex items-center gap-2 px-3 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm" href="#">
                    <Sparkles size={16}/>
                    Enhanced Notes
                </a>
                <a className="flex items-center gap-2 px-3 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm" href="#">
                    <Clock size={16}/>
                    Lecture Transcript
                </a>
                <a className="flex items-center gap-2 px-3 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm" href="#">
                    <Music size={16}/>
                    Audio Files
                </a>
            </nav>
        </div>
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <select onChange={(e) => onCommand('fontSize', e.target.value)} className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">
                    <option value="3">Normal</option>
                    <option value="4">Subtitle</option>
                    <option value="5">Heading</option>
                    <option value="6">Title</option>
                </select>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button onClick={() => onCommand('bold')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Bold size={18} /></button>
                <button onClick={() => onCommand('italic')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Italic size={18} /></button>
                <button onClick={() => onCommand('underline')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Underline size={18} /></button>
                <button onClick={() => onCommand('strikeThrough')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Strikethrough size={18} /></button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <input type="color" onChange={(e) => onCommand('hiliteColor', e.target.value)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8" />
                <input type="color" onChange={(e) => onCommand('foreColor', e.target.value)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8" />
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button onClick={() => onCommand('justifyLeft')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><AlignLeft size={18} /></button>
                <button onClick={() => onCommand('justifyCenter')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><AlignCenter size={18} /></button>
                <button onClick={() => onCommand('justifyRight')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><AlignRight size={18} /></button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button onClick={() => onCommand('insertUnorderedList')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><List size={18} /></button>
                <button onClick={() => onCommand('insertOrderedList')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><ListOrdered size={18} /></button>
                 <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button onClick={() => onCommand('undo')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Undo size={18} /></button>
                <button onClick={() => onCommand('redo')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Redo size={18} /></button>
                 <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Plus size={18} /></button>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Clock size={18} /></button>
                <button onClick={() => window.print()} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Printer size={18} /></button>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Expand size={18} /></button>
            </div>
        </div>
    </div>
);


export default function NewNotePage() {
    const editorRef = useRef<HTMLDivElement>(null);
    
    const handleCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };
    
    return (
        <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 flex flex-col bg-background-light dark:bg-gray-900/50">
                <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Untitled Lecture</h1>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button className="gap-2 text-sm font-semibold"><Users size={16}/>Share</Button>
                            <Button className="gap-2 text-sm font-semibold"><Sparkles size={16}/>Upgrade</Button>
                            <Button variant="outline" className="gap-2 text-sm font-semibold"><Info size={16}/>Feedback</Button>
                             <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Button variant="ghost" size="icon"><LinkIcon size={16}/></Button>
                                <Button variant="ghost" size="icon"><Upload size={16}/></Button>
                            </div>
                            <div className="relative">
                                <Image alt="User avatar" className="w-8 h-8 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1Or_s9UKOF6_LUS-Uz5m4nlB4RqSHSc7boFluG5jdVHIXW9HfPGqkyHrcD33sPB0zGSlfG7ov9jz9AfHzm_WpU_AgKC0wAWNfUjsKkHaa--gWuzMcn__AF4VDk-csCtGG_UG2yrzsKIfWGHZd_daSMwV-ipBz4M-pPQ_U4qrHXMqDAeUaKUxGlJm5TUa4lsLX6TWgkpfEATti1OpT3mjBF6DcJaF2sesr5emRVV0wLxLldnb8xiPmdFmwL476G8_9LuqF1hL5ULnl" width={32} height={32}/>
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">G</span>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm flex-1 flex flex-col">
                         <EditorToolbar onCommand={handleCommand} />
                        <div className="flex-1 p-8 prose prose-lg max-w-none dark:prose-invert">
                           <div 
                             ref={editorRef}
                             contentEditable="true" 
                             className="w-full h-full outline-none" 
                             suppressContentEditableWarning={true}
                           >
                           </div>
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
                            <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg"><ArrowUp size={16}/></Button>
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
