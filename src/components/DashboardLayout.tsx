
'use client';

import React, { useState } from 'react';
import { Home, BookOpen, Calendar, MessageSquare, Mic, CreditCard, PenTool, GraduationCap, Gamepad2, FileText, Headphones, BookMarked, Upload, Play, Flame } from 'lucide-react';
import { Button } from "@/components/ui/button";

const NavItem = ({ icon: Icon, label, active = false }: { icon: React.ElementType, label: string, active?: boolean }) => {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">STUDY<br/>FETCH</span>
          <div className="ml-auto flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-semibold">3</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={Home} label="Home" active />
          <NavItem icon={BookOpen} label="My Sets" />
          <NavItem icon={Calendar} label="Calendar" />
          
          <div className="pt-4">
            <div className="bg-blue-50 rounded-lg p-3 mb-2 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs">📘</span>
              </div>
              <span className="font-semibold text-sm">Sat MAth</span>
            </div>
          </div>

          <NavItem icon={MessageSquare} label="Chat" />
          <NavItem icon={Mic} label="Live Lecture" />
          <NavItem icon={CreditCard} label="Flashcards" />
          <NavItem icon={PenTool} label="Tests & QuizFetch" />
          <NavItem icon={GraduationCap} label="Tutor Me" />
          <NavItem icon={Gamepad2} label="Arcade" />
          <NavItem icon={FileText} label="Essay Grading" />
          <NavItem icon={BookMarked} label="Explainers" />
          <NavItem icon={Headphones} label="Audio Recap" />
          <NavItem icon={BookMarked} label="Notes & Materials" />
        </nav>

        {/* Upload Button */}
        <div className="p-4 border-t border-gray-200">
          <Button variant="outline" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Tutorials Button */}
        <div className="p-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Play className="w-4 h-4 mr-2" />
            Tutorials
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
