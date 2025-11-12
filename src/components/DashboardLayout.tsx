'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Brush,
  Camera,
  ChevronDown,
  Cloud,
  Code,
  Crown,
  Download,
  FileText,
  Grid,
  Heart,
  Home,
  ImageIcon,
  Layers,
  LayoutGrid,
  Lightbulb,
  Menu,
  MessageSquare,
  Palette,
  PanelLeft,
  Play,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  Trash,
  TrendingUp,
  Users,
  Video,
  Wand2,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// --- FIX: Moved component definitions to the top ---

// You might need to create these components if they don't exist
const Storefront = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 7.5-.001-.001M12 12.5-.001-.001M12 17.5-.001-.001"/><path d="M3 21V5.7a2.2 2.2 0 0 1 2.2-2.2h13.6a2.2 2.2 0 0 1 2.2 2.2V21"/><path d="M6 21h12"/>
  </svg>
);

const BarChart3 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
  </svg>
);
// --- End Fix ---


const sidebarItems = [
  {
    title: "Dashboard",
    icon: <LayoutGrid />,
    href: "/dashboard",
  },
  {
    title: "My Sets",
    icon: <Bookmark />,
    href: "/my-sets",
  },
  {
    title: "Statistics",
    icon: <BarChart3 />, // This now works
    href: "/statistics",
  },
  {
    title: "Store",
    icon: <Storefront />, // This now works
    href: "/store",
  }
];

const SidebarNavItem = ({ item, pathname }: { item: { title: string, icon: React.ReactNode, href: string }, pathname: string }) => {
  const isActive = pathname === item.href;
  return (
    <Link href={item.href} className={cn(
        "flex items-center gap-4 p-3 rounded-xl font-semibold transition-all",
        isActive ? "bg-primary/10 text-primary" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
    )}>
      {item.icon}
      <span className="hidden lg:inline">{item.title}</span>
    </Link>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  }

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading skeleton
  }

  return (
    <div className="flex h-screen overflow-hidden font-display bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 antialiased">
      <aside className="w-20 lg:w-64 flex-shrink-0 bg-white dark:bg-zinc-900/50 p-4 transition-all duration-300">
        <div className="flex flex-col h-full">
          <div className="text-primary font-bold text-2xl mb-12 hidden lg:flex items-center gap-2">
            <span className="material-symbols-outlined text-4xl">school</span>
            <span>Learnify</span>
          </div>
          <div className="text-primary font-bold text-2xl mb-12 flex lg:hidden items-center justify-center">
            <span className="material-symbols-outlined text-4xl">school</span>
          </div>
          <nav className="space-y-2">
            {sidebarItems.map(item => <SidebarNavItem key={item.href} item={item} pathname={pathname} />)}
          </nav>
          <div className="mt-auto">
            <a className="flex items-center gap-4 p-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800" href="#">
              <Settings />
              <span className="hidden lg:inline">Settings</span>
            </a>
            <button onClick={handleSignOut} className="flex items-center gap-4 p-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 w-full">
              <LogOut />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
}