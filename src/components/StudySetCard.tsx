
'use client';

import { Bookmark, Settings, Play, ChevronDown, PenTool, BookMarked, GraduationCap, Gamepad2, Headphones, Plus, ArrowRight, FileText, Trophy, Eye, Copy, Zap } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Course = {
  id: string;
  name: string;
};

type QuizResult = {
    id: string;
    score: number;
    timestamp: { toDate: () => Date };
};

type Note = {
    id: string;
    title: string;
};

const StudySetCard = ({ course, quizResults, notes }: { course: Course, quizResults: QuizResult[], notes: Note[] }) => {
    return (
        <div className="bg-gradient-to-br from-primary to-indigo-700 p-8 rounded-3xl shadow-2xl shadow-blue-500/40 text-white">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold">{course.name}</h2>
                    <p className="text-indigo-200">9 materials</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                        <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <button className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4 text-left w-full hover:bg-white/30 transition-colors">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-200 text-rose-600 font-bold"><PenTool className="w-5 h-5" /></div>
                            <div className="flex-1">Tests/Quizzes</div>
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                        <DropdownMenuLabel>Recent Scores</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {quizResults.length > 0 ? quizResults.map(result => (
                            <DropdownMenuItem key={result.id} className="flex justify-between">
                                <span>{format(result.timestamp.toDate(), 'MMM d, yyyy')}</span>
                                <span className="font-bold">{result.score}%</span>
                            </DropdownMenuItem>
                        )) : <DropdownMenuItem disabled>No recent quizzes</DropdownMenuItem>}
                        <DropdownMenuSeparator />
                         <Link href="/dashboard/practice-quiz">
                            <DropdownMenuItem>
                                <Plus className="w-4 h-4 mr-2"/> Take a new quiz
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
                
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <button className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4 text-left w-full hover:bg-white/30 transition-colors">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200 text-green-600 font-bold"><FileText className="w-5 h-5" /></div>
                            <div className="flex-1">Notes</div>
                             <ChevronDown className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                     <DropdownMenuContent className="w-64">
                        <DropdownMenuLabel>Recent Notes</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notes.length > 0 ? notes.map(note => (
                            <Link href="/dashboard/notes" key={note.id}>
                                <DropdownMenuItem className="truncate">{note.title}</DropdownMenuItem>
                            </Link>
                        )) : <DropdownMenuItem disabled>No recent notes</DropdownMenuItem>}
                        <DropdownMenuSeparator />
                         <Link href="/dashboard/notes/new">
                            <DropdownMenuItem>
                                <Plus className="w-4 h-4 mr-2"/> Add new note
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4 text-left w-full hover:bg-white/30 transition-colors">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-200 text-pink-600 font-bold"><Gamepad2 className="w-5 h-5" /></div>
                          <div className="flex-1">Arcade</div>
                          <ChevronDown className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <Link href="/dashboard/games/memory-match"><DropdownMenuItem>Memory Match</DropdownMenuItem></Link>
                        <Link href="/dashboard/games/city-run"><DropdownMenuItem>City Run</DropdownMenuItem></Link>
                        <Link href="/dashboard/games/trivia-blaster"><DropdownMenuItem>Trivia Blaster</DropdownMenuItem></Link>
                        <DropdownMenuSeparator />
                        <Link href="/dashboard/games">
                            <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2"/> See all games
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4 text-left w-full hover:bg-white/30 transition-colors">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-teal-200 text-teal-600 font-bold"><Copy className="w-5 h-5" /></div>
                            <div className="flex-1">Flashcards</div>
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                        <DropdownMenuLabel>Key Concepts</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {/* Future: Add recent session info here */}
                        <DropdownMenuItem disabled>No recent sessions</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href="/dashboard/key-concepts">
                            <DropdownMenuItem>
                                <Plus className="w-4 h-4 mr-2" /> Start New Session
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/dashboard/crunch-time" className="w-full">
                                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4 hover:bg-white/30 transition-colors">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-200 text-orange-600 font-bold"><Zap className="w-5 h-5" /></div>
                                <div className="flex-1">Crunch Time</div>
                                </div>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Upload any study material and get a personalized study guide in seconds.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-600 font-bold"><Headphones className="w-5 h-5" /></div>
                  <div className="flex-1">Audio Recap</div>
                </div>
            </div>
            <Link href={`/dashboard/courses?courseId=${course.id}`} className="w-full bg-white text-primary font-bold py-4 px-6 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg">
                <Play className="w-6 h-6" />
                <span>Continue Learning</span>
            </Link>
        </div>
    );
};

export default StudySetCard;
