
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
} from 'lucide-react';
import {
  Bell,
  Search,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/courses', icon: Book, label: 'My Courses' },
    { href: '/dashboard/notes', icon: Palette, label: 'Visual Tools' },
    { href: '/dashboard/roadmaps', icon: Users, label: 'Community' },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
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
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
  }) => {
    const isActive = pathname === href;
    return (
      <Link href={href}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className="w-full justify-start text-base font-medium py-6"
        >
          <Icon className="mr-3 h-5 w-5" />
          {label}
        </Button>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
       <div className="flex items-center gap-3 p-4">
            <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                <AvatarFallback>
                    <User />
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <h1 className="text-lg font-bold text-card-foreground">Sophia</h1>
                <p className="text-sm text-muted-foreground">{learnerType} Learner</p>
            </div>
        </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
      <div className="mt-auto border-t p-4">
        <Link href="#">
          <Button variant="ghost" className="w-full justify-start text-base font-medium py-6">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card lg:block">
            <SidebarContent />
        </div>
        <div className="flex flex-col">
            <header className="flex h-20 items-center justify-end gap-4 border-b bg-background px-8">
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
                    <SheetContent side="left" className="flex flex-col p-0">
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
