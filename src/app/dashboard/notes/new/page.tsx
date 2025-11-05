
'use client';

import React from 'react';
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
} from 'lucide-react';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { Input } from '@/components/ui/input';

const navItems = [
    { icon: <Home size={20} />, label: 'Home', href: '#' },
    { icon: <BookCopy size={20} />, label: 'My Sets', href: '#' },
    { icon: <Calendar size={20} />, label: 'Calendar', href: '#' },
];

const activeNavItem = "Sat MAth";

const toolItems = [
    { icon: <MessageSquare size={20}/>, label: "Chat" },
    { icon: <Mic size={20}/>, label: "Live Lecture" },
    { icon: <FlaskConical size={20}/>, label: "Flashcards" },
    { icon: <Edit size={20}/>, label: "Tests & QuizFetch" },
    { icon: <GraduationCap size={20}/>, label: "Tutor Me" },
    { icon: <Gamepad2 size={20}/>, label: "Arcade" },
    { icon: <FileSignature size={20}/>, label: "Essay Grading" },
    { icon: <Clapperboard size={20}/>, label: "Explainers" },
    { icon: <Music size={20}/>, label: "Audio Recap" },
    { icon: <BookCopy size={20}/>, label: "Notes & Materials" },
];

const notes = [
    { title: "Technical Analysis Tools" },
    { title: "Risk Management Strate..." },
];

const EditorToolbar = () => (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <button className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">Arial <ChevronDown className="h-4 w-4" /></button>
            <button className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">11 <ChevronDown className="h-4 w-4" /></button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Bold size={16} /></button>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Italic size={16} /></button>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Underline size={16} /></button>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Strikethrough size={16} /></button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Highlighter size={16} /></button>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Palette size={16} /></button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><AlignLeft size={16} /></button>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><AlignCenter size={16} /></button>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><AlignRight size={16} /></button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><List size={16} /></button>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><ListOrdered size={16} /></button>
        </div>
    </div>
);


export default function NewNotePage() {
    // This is a static representation of your HTML structure.
    // To make it interactive, we would need to add state and event handlers.
    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-gray-900/50 text-gray-800 dark:text-gray-200">
            <main className="flex-1 flex flex-col bg-background-light dark:bg-gray-900/50">
                <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Untitled Lecture</h1>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <ChevronDown size={16} />
                            </Button>
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
                                <img alt="User avatar" className="w-8 h-8 rounded-full" src="https://lh3.googleusercontent.com/a/ACg8ocK1Or_s9UKOF6_LUS-Uz5m4nlB4RqSHSc7boFluG5jdVHIXW9HfPGqkyHrcD33sPB0zGSlfG7ov9jz9AfHzm_WpU_AgKC0wAWNfUjsKkHaa--gWuzMcn__AF4VDk-csCtGG_UG2yrzsKIfWGHZd_daSMwV-ipBz4M-pPQ_U4qrHXMqDAeUaKUxGlJm5TUa4lsLX6TWgkpfEATti1OpT3mjBF6DcJaF2sesr5emRVV0wLxLldnb8xiPmdFmwL476G8_9LuqF1hL5ULnl"/>
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">G</span>
                                <span className="absolute bottom-0 right-0 bg-gray-500 text-white text-[10px] px-1 rounded-full">2</span>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm flex-1 flex flex-col">
                        <div className="border-b border-gray-200 dark:border-gray-800 px-4">
                            <nav className="flex items-center -mb-px">
                                <a className="flex items-center gap-2 px-3 py-3 border-b-2 border-primary text-primary font-semibold text-sm" href="#">
                                    <FileText size={16}/>
                                    Self Written Notes
                                </a>
                                <a className="flex items-center gap-2 px-3 py-3 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm" href="#">
                                    <Sparkles size={16}/>
                                    Enhanced Notes
                                </a>
                                <a className="flex items-center gap-2 px-3 py-3 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm" href="#">
                                    <Clock size={16}/>
                                    Lecture Transcript
                                </a>
                                <a className="flex items-center gap-2 px-3 py-3 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm" href="#">
                                    <Mic size={16}/>
                                    Audio Files
                                </a>
                            </nav>
                        </div>
                        <EditorToolbar/>
                        <div className="flex-1 p-6 flex items-center justify-center">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-6">
                                <span className="material-symbols-outlined text-gray-400">drag_indicator</span>
                                <span className="text-gray-500 dark:text-gray-400">Start Recording</span>
                                <button className="bg-primary text-white p-3 rounded-full">
                                    <Mic />
                                </button>
                                <button className="text-gray-500 dark:text-gray-400">
                                    <Sparkles/>
                                </button>
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
                            <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg"><ArrowRight size={16}/></Button>
                        </div>
                        <div className="flex items-center justify-between mt-2 px-2">
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Upload size={16}/></Button>
                                <Button size="icon" className="h-8 w-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><Users size={16}/></Button>
                                <Button size="icon" className="h-8 w-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><GraduationCap size={16}/></Button>
                                <Button variant="secondary" size="sm" className="h-8 gap-1.5"><FileText size={16}/>Using 1 material(s)</Button>
                            </div>
                             <Button variant="ghost" size="icon" className="h-8 w-8"><Mic size={16}/></Button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
