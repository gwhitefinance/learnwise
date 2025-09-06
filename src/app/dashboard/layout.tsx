
'use client';

import {
  Book,
  Bot,
  LayoutDashboard,
  FileText,
  GitMerge,
  Menu,
  Settings,
  Sun,
  Moon,
  User,
  TestTube,
  Upload,
  Brush,
  BrainCircuit,
  Lightbulb,
  Calendar,
  Users,
  Palette,
  Atom,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useTheme } from 'next-themes';


const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/courses', icon: Book, label: 'My Courses' },
    { href: '/dashboard/notes', icon: FileText, label: 'Notes' },
    { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
    { href: '/dashboard/practice-quiz', icon: Lightbulb, label: 'Practice Quiz' },
    { href: '/dashboard/roadmaps', icon: GitMerge, label: 'Roadmaps' },
    { href: '/dashboard/ai-chat', icon: BrainCircuit, label: 'AI Chat' },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [learnerType, setLearnerType] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setTheme('dark'); 
    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
        setLearnerType(storedLearnerType);
    }
  }, [setTheme]);

  const NavLink = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
  }) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          isActive ? "bg-secondary text-primary-foreground" : "text-muted-foreground hover:bg-slate-800 hover:text-primary-foreground"
      )}>
        
          <Icon className="h-5 w-5" />
          <p className="text-base font-medium">{label}</p>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
       <div className="flex items-center gap-3 p-6">
            <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                <AvatarFallback>
                    <User />
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <h1 className="text-lg font-bold text-card-foreground">Sophia</h1>
                <p className="text-sm text-muted-foreground">{learnerType || 'Visual'} Learner</p>
            </div>
        </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
      <div className="mt-auto border-t p-4 border-slate-800">
        <Link href="#">
          <Button variant="ghost" className="w-full justify-start text-base font-medium py-3 text-muted-foreground hover:text-primary-foreground">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Button>
        </Link>
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
                    <SheetContent side="left" className="flex flex-col p-0 bg-background border-r border-slate-800">
                      <SheetHeader className="p-4 sr-only">
                        <SheetTitle>Menu</SheetTitle>
                        <SheetDescription>Main navigation links for the dashboard.</SheetDescription>
                      </SheetHeader>
                      <SidebarContent />
                    </SheetContent>
                </Sheet>
                 <div className="flex items-center gap-4">
                   <Button>
                        <Upload className="mr-2 h-4 w-4" /> Upload Course
                   </Button>
                </div>
            </header>
            <main className="flex-1 p-8 bg-background">
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
