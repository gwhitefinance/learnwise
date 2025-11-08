
'use client';

import { Plus, Flame, Upload, ChevronDown, Calendar, FileText, Mic, LayoutGrid, Bookmark, Settings, LogOut, BarChart3, Bell, Bolt, CircleDollarSign, School, Play, Users, GitMerge, GraduationCap, ClipboardCheck, BarChart, Award, MessageSquare, Briefcase, Share2, BookOpen, ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import Logo from "@/components/Logo";

const StudySetCard = () => {
    return (
        <div className="bg-gradient-to-br from-primary to-indigo-700 p-8 rounded-3xl shadow-2xl shadow-blue-500/40 text-white">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Sat Math</h2>
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
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">1</div>
                    <div className="flex-1">Tests/Quizzes</div>
                    <ChevronDown />
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">0</div>
                    <div className="flex-1">Explainers</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">2</div>
                    <div className="flex-1">Arcade</div>
                    <ChevronDown />
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">1</div>
                    <div className="flex-1">Flashcards</div>
                    <ChevronDown />
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">0</div>
                    <div className="flex-1">Tutor Me</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">0</div>
                    <div className="flex-1">Audio Recap</div>
                </div>
            </div>
            <button className="w-full bg-white text-primary font-bold py-4 px-6 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg">
                <Play className="text-2xl" />
                <span>Continue Learning</span>
            </button>
        </div>
    )
}

const Index = () => {
  return (
    <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Good afternoon, Grady White! 👋</h1>
                    <p className="text-slate-500 dark:text-slate-400">Which study set are you working on today?</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-surface-dark p-2 pl-3 pr-4 rounded-full shadow-md shadow-blue-500/10">
                        <Bolt className="text-amber-500 text-2xl" />
                        <span className="font-bold text-slate-900 dark:text-white">12,500 XP</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-surface-dark p-2 pl-3 pr-4 rounded-full shadow-md shadow-blue-500/10">
                        <CircleDollarSign className="text-yellow-400 text-2xl" />
                        <span className="font-bold text-slate-900 dark:text-white">3,200</span>
                    </div>
                    <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-md shadow-blue-500/10">
                        <Bell className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>
            </header>
            <div className="flex items-center gap-2 border-b border-blue-200/80 dark:border-slate-700 mb-8">
                <button className="flex items-center gap-2 px-4 py-3 border-b-2 border-primary text-primary-dark dark:text-blue-400 font-semibold">
                    <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">SM</span>
                    <span>Sat Math</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-primary-light">
                    <span className="bg-green-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">B</span>
                    <span>Biology</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-primary-light">
                    <span className="bg-purple-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">H</span>
                    <span>History</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400">
                    <Plus className="text-slate-400" />
                    <span className="text-sm">Add Set</span>
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <StudySetCard />
                    <div className="mt-8 bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-md shadow-blue-500/10">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Progress</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-slate-600 dark:text-slate-300">Technical Analysis for Day Trading</span>
                                <div className="flex items-center gap-2 w-24 text-right">
                                    <div className="w-full bg-blue-100 dark:bg-slate-600 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-sky-400 to-blue-500 h-2.5 rounded-full" style={{width: "75%"}}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">75%</span>
                                </div>
                            </li>
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-slate-600 dark:text-slate-300">Day Trading Risk Management</span>
                                <div className="flex items-center gap-2 w-24 text-right">
                                    <div className="w-full bg-blue-100 dark:bg-slate-600 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-sky-400 to-blue-500 h-2.5 rounded-full" style={{width: "40%"}}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">40%</span>
                                </div>
                            </li>
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-slate-600 dark:text-slate-300">Trading Psychology and Discipline</span>
                                <div className="flex items-center gap-2 w-24 text-right">
                                    <div className="w-full bg-blue-100 dark:bg-slate-600 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2.5 rounded-full" style={{width: "10%"}}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">10%</span>
                                </div>
                            </li>
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-slate-600 dark:text-slate-300">Order Types and Execution</span>
                                <div className="flex items-center gap-2 w-24 text-right">
                                    <div className="w-full bg-blue-100 dark:bg-slate-600 rounded-full h-2.5">
                                    </div>
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">0%</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-md shadow-blue-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Flame className="text-orange-500 text-4xl" />
                            <div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">3 day streak!</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Keep up the good work.</p>
                            </div>
                        </div>
                        <a className="text-sm font-semibold text-primary-light" href="#">View Leaderboard</a>
                    </div>
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-md shadow-blue-500/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Materials</h3>
                            <button className="flex items-center gap-2 text-sm font-semibold text-primary-light bg-blue-500/10 px-3 py-2 rounded-xl hover:bg-blue-500/20">
                                <Upload className="text-base" />
                                  Upload
                            </button>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4">
                                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-slate-800/60 rounded-xl">
                                    <FileText className="text-blue-500 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Risk Management</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Nov 6, 2025</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-slate-800/60 rounded-xl">
                                    <FileText className="text-blue-500 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Technical Analysis</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Nov 6, 2025</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-slate-800/60 rounded-xl">
                                    <Mic className="text-blue-500 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Untitled Lecture</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Nov 5, 2025</p>
                                </div>
                            </li>
                        </ul>
                        <button className="w-full text-center mt-6 text-sm font-semibold text-primary-light">View All</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
};

export default Index;

    