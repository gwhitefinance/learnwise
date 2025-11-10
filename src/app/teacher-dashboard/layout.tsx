'use client';

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Home, Users, BookOpen, BarChart3, LogOut, PanelLeft, Bell, Settings, FilePlus, ChevronRight, MessageSquare, Podcast, ClipboardCheck, Award, Share2, Briefcase, GraduationCap, Link as LinkIcon, Folder, GitMerge, BrainCircuit, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import DashboardLoading from '@/app/dashboard/loading';
import Logo from '@/components/Logo';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';


type SidebarChild = {
  title: string;
  href: string;
  icon: React.ReactElement;
};

type SidebarItem = {
  title: string;
  icon: React.ReactElement;
  href?: string;
  children?: SidebarChild[];
};

const sidebarItems: SidebarItem[] = [
    { title: "Dashboard", icon: <Home className="h-5 w-5" />, href: "/teacher-dashboard" },
    { 
        title: "Workspace", 
        icon: <Briefcase className="h-5 w-5" />,
        children: [
            { title: "Students", href: "/teacher-dashboard/students", icon: <Users className="h-5 w-5" /> },
            { title: "Content", href: "/teacher-dashboard/content", icon: <BookOpen className="h-5 w-5" /> },
            { title: "Classes", href: "/teacher-dashboard/classes", icon: <GraduationCap className="h-5 w-5" /> },
            { title: "Assessments", href: "/teacher-dashboard/assessments", icon: <ClipboardCheck className="h-5 w-5" /> },
        ]
    },
    {
        title: "Engagement",
        icon: <Sparkles className="h-5 w-5" />,
        children: [
            { title: "Incentives", href: "/teacher-dashboard/incentives", icon: <Award className="h-5 w-5" /> },
            { title: "Communication", href: "/teacher-dashboard/communication", icon: <MessageSquare className="h-5 w-5" /> },
            { title: "Collaboration", href: "/teacher-dashboard/collaboration", icon: <Users className="h-5 w-5" /> },
        ]
    },
    { 
        title: "Analytics", 
        icon: <BarChart3 className="h-5 w-5" />, 
        href: "/teacher-dashboard/analytics" 
    },
    {
        title: "Integrations",
        icon: <Share2 className="h-5 w-5" />,
        href: "/teacher-dashboard/integrations",
    },
];

const SidebarNavItem = ({ item, pathname }: { item: SidebarItem, pathname: string }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const hasChildren = item.children && item.children.length > 0;
    
    const isActive = hasChildren 
        ? item.children?.some(child => pathname.startsWith(child.href)) 
        : pathname === item.href;

    React.useEffect(() => {
        if (isActive) {
            setIsOpen(true);
        }
    }, [isActive, pathname]);

    if (hasChildren) {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                 <CollapsibleTrigger asChild>
                    <button className={cn(
                          "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}>
                        <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.title}</span>
                        </div>
                        <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="py-1 pl-8">
                    <div className="flex flex-col space-y-1">
                        {item.children?.map((child: SidebarChild) => (
                             <Link
                                key={child.href}
                                href={child.href || '#'}
                                className={cn(
                                "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium",
                                pathname.startsWith(child.href) ? "text-primary" : "hover:bg-muted text-muted-foreground",
                                )}
                            >
                                {child.icon}
                                <span>{child.title}</span>
                            </Link>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        )
    }

    return (
        <Link href={item.href || '#'} >
            <div className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all hover:bg-muted",
                pathname === item.href && "bg-primary/10 text-primary"
            )}>
                {item.icon}
                {item.title}
            </div>
        </Link>
    )
}

export default function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    if (loading) {
        return <DashboardLoading />;
    }

    return (
        <div className="flex min-h-screen bg-muted/40">
             <aside className={cn(
                "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out md:flex",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-full flex-col">
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                        <div>
                            <h2 className="font-semibold">Taz</h2>
                            <p className="text-xs text-muted-foreground">Teacher Portal</p>
                        </div>
                        <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                            <Logo className="size-5" />
                        </div>
                        </div>
                    </div>
                     <div className="px-3 py-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input type="search" placeholder="Search..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
                        </div>
                    </div>
                    <ScrollArea className="flex-1 px-3 py-2">
                        <nav className="space-y-1">
                            {sidebarItems.map(item => (
                                <SidebarNavItem key={item.title} item={item} pathname={pathname} />
                            ))}
                        </nav>
                    </ScrollArea>
                     <div className="border-t p-3">
                         <div className="space-y-2">
                            <Button onClick={() => auth.signOut()} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium">
                                <LogOut className="h-5 w-5" /> 
                                <span>Sign Out</span>
                            </Button>
                            <div className="w-full p-2 rounded-2xl hover:bg-muted cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user?.photoURL ?? undefined} />
                                        <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-semibold text-sm truncate">{user?.displayName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            <div className={cn(
                "flex flex-1 flex-col transition-all duration-300 ease-in-out",
                sidebarOpen ? "md:pl-64" : "md:pl-0"
            )}>
                 <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
                    <Button variant="ghost" size="icon" className="md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <PanelLeft className="h-5 w-5" />
                    </Button>
                    <div className="ml-auto flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Bell className="h-5 w-5"/>
                        </Button>
                         <Button variant="ghost" size="icon" className="rounded-full">
                            <Settings className="h-5 w-5"/>
                        </Button>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL ?? undefined} />
                            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                </header>
                <main className="flex-1 p-6">{children}</main>
            </div>
            <Toaster />
        </div>
    );
}
