'use client';

import { useState, useEffect } from 'react';
import { Plus, Flame, Upload, ChevronDown, Calendar, FileText, Mic, LayoutGrid, Settings, LogOut, BarChart3, Bell, Bolt, CircleDollarSign, School, Play, Users, GitMerge, GraduationCap, ClipboardCheck, BarChart, Award, MessageSquare, Briefcase, Share2, BookOpen, ChevronRight, Store, PenTool, BookMarked, Gamepad2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import StudySetCard from '@/components/StudySetCard';
import { Skeleton } from '@/components/ui/skeleton';

type Course = {
  id: string;
  name: string;
};

const Index = () => {
  const [user, loading] = useAuthState(auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(userCourses);
        if (userCourses.length > 0 && !activeCourse) {
            setActiveCourse(userCourses[0]);
        }
        setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, activeCourse]);


  if (loading || dataLoading) {
    return (
        <div className="p-8">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-12 w-full max-w-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Skeleton className="h-[450px] w-full" />
                </div>
                <div className="space-y-8">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Good afternoon, {user?.displayName?.split(' ')[0] || 'User'}! 👋</h1>
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
            {courses.slice(0, 3).map(course => (
                 <button 
                    key={course.id}
                    onClick={() => setActiveCourse(course)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold ${activeCourse?.id === course.id ? 'border-primary-light text-primary-dark dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary-light'}`}
                  >
                    <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                        {course.name.substring(0, 2).toUpperCase()}
                    </span>
                    <span>{course.name}</span>
                </button>
            ))}
            <Link href="/dashboard/courses" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400">
                <Plus className="text-slate-400" />
                <span className="text-sm">Add Set</span>
            </Link>
            <Link href="/dashboard/courses" className="ml-auto flex items-center gap-2 text-sm font-semibold text-primary-light">
              See All
            </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeCourse ? <StudySetCard course={activeCourse} /> : <div className="text-center p-12 bg-muted rounded-2xl">Select a course to see details.</div>}
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
              <Link className="text-sm font-semibold text-primary-light" href="#">View Leaderboard</Link>
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
    </div>
  );
};

export default Index;
