'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Home, BookOpen, Calendar, MessageSquare, Mic, CreditCard, PenTool, GraduationCap, Gamepad2, FileText, Headphones, BookMarked, Upload, ChevronRight, Settings, Bookmark, Play, Flame, ChevronDown } from 'lucide-react';

const NavItem = ({ icon: Icon, label, active = false, isChild = false }: { icon: React.ElementType, label: string, active?: boolean, isChild?: boolean }) => (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50'} ${isChild ? 'pl-10' : ''}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
);

const StudyItem = ({ title, progress }: { title: string, progress: number }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm font-medium text-gray-800">{title}</span>
    <div className="flex items-center gap-2 w-32">
      <Progress value={progress} className="h-1.5" />
      <span className="text-sm font-medium text-gray-600">{progress}%</span>
    </div>
  </div>
);

const MaterialItem = ({ title, date, icon: Icon = FileText }: { title: string, date: string, icon?: React.ElementType }) => (
  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-yellow-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm text-gray-800 truncate">{title}</p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
  </div>
);

const UpcomingItem = ({ title, date, icon: Icon = Gamepad2, iconBg = 'bg-pink-100', iconColor = 'text-pink-600' }: { title: string, date: string, icon?: React.ElementType, iconBg?: string, iconColor?: string }) => (
  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
    <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="flex-1">
      <p className="font-medium text-sm text-gray-800">{title}</p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-400" />
  </div>
);


export default function StudyFetchDashboard() {
  const [activeSet, setActiveSet] = useState('Sat MAth');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Good afternoon, Grady White!</h1>
              <p className="text-gray-600">Which study set are you working on today?</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button className="bg-blue-100 text-blue-900 px-6 py-3 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-200">
              <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
              Sat MAth
            </Button>
            <Button variant="outline" className="border-2 border-dashed border-gray-300 px-6 py-3 rounded-lg flex items-center gap-2 text-gray-600 hover:border-gray-400 hover:bg-gray-50">
              <span className="text-xl">+</span>
              Add Set
            </Button>
            <div className="ml-auto flex gap-3">
              <Button variant="link" className="text-blue-600 flex items-center gap-2">
                <Plus className="w-4 h-4"/>
                Add Set
              </Button>
              <Button variant="link" className="text-blue-600 flex items-center gap-2">
                See All My Sets
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Main Study Set Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Sat MAth</h2>
                    <p className="text-gray-700">9 materials</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="bg-white rounded-lg hover:bg-gray-50">
                    <Bookmark className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="bg-white rounded-lg hover:bg-gray-50">
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <Button variant="outline" className="bg-white justify-between">1 Tests/Quizzes <ChevronDown className="w-4 h-4 ml-auto" /></Button>
                <Button variant="outline" className="bg-blue-100/50 justify-between">0 Explainers</Button>
                <Button variant="outline" className="bg-blue-100/50 justify-between">0 Tutor Me</Button>
                <Button variant="outline" className="bg-white justify-between">2 Arcade <ChevronDown className="w-4 h-4 ml-auto" /></Button>
                <Button variant="outline" className="bg-white justify-between">1 Flashcards <ChevronDown className="w-4 h-4 ml-auto" /></Button>
                <Button variant="outline" className="bg-blue-100/50 justify-between">0 Audio Recap</Button>
              </div>
              
              <Button size="lg" className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 mb-6">
                <Play className="w-5 h-5" />
                <span className="font-semibold">Continue Learning</span>
              </Button>

              <div className="bg-blue-100/50 rounded-xl p-4 space-y-1">
                <StudyItem title="Technical Analysis for Day Trading" progress={0} />
                <StudyItem title="Day Trading Risk Management" progress={0} />
                <StudyItem title="Trading Psychology and Discipline" progress={0} />
                <StudyItem title="Order Types and Execution" progress={0} />
              </div>

              <Button variant="ghost" className="w-full mt-4 text-center text-sm font-medium text-gray-700 hover:text-gray-900">
                View All
              </Button>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-bold">3 day streak!</span>
                  </div>
                  <Button variant="link" className="text-sm">View Leaderboard</Button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Materials</h3>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Plus className="w-3 h-3"/> Upload
                  </Button>
                </div>
                <div className="space-y-3">
                  <MaterialItem title="Risk Management Strategies" date="Nov 6, 2025" />
                  <MaterialItem title="Technical Analysis Tools" date="Nov 6, 2025" />
                  <MaterialItem title="Untitled Lecture" date="Nov 5, 2025" icon={Mic} />
                </div>
                <Button variant="link" className="w-full mt-2 text-sm">View All</Button>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <h3 className="font-bold">Upcoming</h3>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <UpcomingItem title="Technical Analysis for Day..." date="Nov 8" />
                  <UpcomingItem title="Trend-Following Technical ..." date="Nov 8" icon={FileText} iconBg="bg-yellow-100" iconColor="text-yellow-600"/>
                </div>
                <Button variant="link" className="w-full mt-2 text-sm">View All</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
