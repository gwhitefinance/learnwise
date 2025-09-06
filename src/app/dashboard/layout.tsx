
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useTheme } from 'next-themes';
import { Upload, Menu } from 'lucide-react';

const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1m0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1m10-17v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1m0 15h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1"/></svg>;
const CoursesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 5.88V18c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h12c.34 0 .67.09 1 .24V5.88l-2 .88V4H6v14h12V7.5l2-1.62zM12 12.26 6 10v-1.37l6 2.63l6-2.63V10l-6 2.26M13.83 6.43l-6 2.62v-1.5l6-2.62z"/></svg>;
const VisualToolsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 17.013H5V15h2zM7 13H5V11h2zM7 9H5V7h2zm4-2H9V5h2zm0 4H9V9h2zm0 4H9V13h2zm0 4H9V17h2zM19 9h-2V7h2zm-4 4h-2V9h2zm4-4h-2V5h2zm-4 8h-2V13h2zm4 4h-2V17h2zm0-4h-2V13h2z"/></svg>;
const CommunityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3s1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5S5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5m8 0c-.29 0-.62.02-.97.05c1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7l-7 7h4zM5 18h14v2H5z"/></svg>;


const navItems = [
    { href: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { href: '/dashboard/courses', icon: <CoursesIcon />, label: 'My Courses' },
    { href: '/dashboard/visual-tools', icon: <VisualToolsIcon />, label: 'Visual Tools' },
    { href: '/dashboard/community', icon: <CommunityIcon />, label: 'Community' },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [learnerType, setLearnerType] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
        setLearnerType(storedLearnerType);
    }
  }, [setTheme]);

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
      <nav className="flex-1 space-y-2 p-4">
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
                       <SheetHeader className="p-4">
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
            <main className="flex-1 p-8 bg-background">
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
