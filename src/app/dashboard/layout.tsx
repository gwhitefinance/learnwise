

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Menu } from 'lucide-react';

const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1m0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1m10-17v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1m0 15h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1"/></svg>;
const CoursesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 5.88V18c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h12c.34 0 .67.09 1 .24V5.88l-2 .88V4H6v14h12V7.5l2-1.62zM12 12.26 6 10v-1.37l6 2.63l6-2.63V10l-6 2.26M13.83 6.43l-6 2.62v-1.5l6-2.62z"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7l-7 7h4zM5 18h14v2H5z"/></svg>;
const AiChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>;
const RoadmapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 10.5c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 1.4.5 2.7 1.3 3.7l-3.8 3.8c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l3.8-3.8c1 .8 2.3 1.3 3.7 1.3 3.3 0 6-2.7 6-6m-6 4c-2.2 0-4-1.8-4-4s1.8-4 4-4s4 1.8 4 4-1.8 4-4 4"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V10h14zM7 12h5v5H7z"/></svg>;
const NotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm2 14h-8v-2h8zm0-4h-8v-2h8zm-3-5V3.5L18.5 9z"/></svg>;
const QuizIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 17h-2v-2h2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41c0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25"/></svg>;
const WhiteboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14zM7 12h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>;

const navItems = [
    { href: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { href: '/dashboard/courses', icon: <CoursesIcon />, label: 'My Courses' },
    { href: '/dashboard/ai-chat', icon: <AiChatIcon />, label: 'AI Chat' },
    { href: '/dashboard/roadmaps', icon: <RoadmapIcon />, label: 'Roadmaps' },
    { href: '/dashboard/calendar', icon: <CalendarIcon />, label: 'Calendar' },
    { href: '/dashboard/notes', icon: <NotesIcon />, label: 'Notes' },
    { href: '/dashboard/practice-quiz', icon: <QuizIcon />, label: 'Practice Quiz' },
    { href: '/dashboard/whiteboard', icon: <WhiteboardIcon />, label: 'Whiteboard' },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [learnerType, setLearnerType] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
        setLearnerType(storedLearnerType);
    }
  }, []);

  const NavLink = ({
    href,
    icon,
    label,
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
  }) => {
    const isActive = pathname === href;
    return (
      <a href={href} className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          isActive ? "bg-secondary" : "hover:bg-slate-800"
      )}>
        
          <div className={isActive ? 'text-text-primary' : 'text-text-secondary'}>{icon}</div>
          <p className={cn("text-base font-medium", isActive ? "text-text-primary" : "text-text-secondary")}>{label}</p>
      </a>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
       <div className="flex items-center gap-3 p-6">
            <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                <AvatarFallback>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=a042581f4e29026704d")'}} />
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <h1 className="text-text-primary text-lg font-bold">Sophia</h1>
                <p className="text-text-secondary text-sm">{learnerType || 'Visual'} Learner</p>
            </div>
        </div>
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
      <div className="mt-auto border-t p-4 border-slate-800">
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            <div className="text-text-secondary"><SettingsIcon /></div>
            <p className="text-base font-medium text-text-secondary">Settings</p>
        </a>
      </div>
    </div>
  );

  if (!isMounted) {
      return null;
  }

  return (
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-800 bg-background lg:flex lg:flex-col">
            <SidebarContent />
        </aside>
        <div className="flex flex-col">
            <header className="flex h-20 items-center justify-between gap-4 bg-background px-8 lg:justify-end">
                 <Sheet>
                    <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0 bg-background border-r border-slate-800 w-72">
                      <SheetHeader>
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        <SheetDescription className="sr-only">Main navigation links for the dashboard.</SheetDescription>
                      </SheetHeader>
                      <SidebarContent />
                    </SheetContent>
                </Sheet>
                 <div className="flex items-center gap-4">
                   <h1 className="text-4xl font-bold text-text-primary flex-1 lg:hidden">Dashboard</h1>
                   <Button>
                        <UploadIcon />
                        <span className="ml-2">Upload Course</span>
                   </Button>
                </div>
            </header>
            <main className="flex-1 p-8 bg-background overflow-y-auto">
                <div className="hidden lg:flex justify-between items-center mb-8">
                  <h1 className="text-4xl font-bold text-text-primary">Dashboard</h1>
                </div>
                {children}
            </main>
             <Toaster />
        </div>
    </div>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutContent>{children}</DashboardLayoutContent>
  );
}
