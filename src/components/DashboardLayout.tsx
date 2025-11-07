
'use client';

import React, { useState } from 'react';
import { Home, BookOpen, Calendar, MessageSquare, Mic, CreditCard, PenTool, GraduationCap, Gamepad2, FileText, Headphones, BookMarked, Upload, ChevronRight, Settings, Bookmark, Play, Flame, ChevronDown } from 'lucide-react';
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
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
