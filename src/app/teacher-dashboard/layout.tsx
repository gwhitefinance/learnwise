
'use client';

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Home, Users, BookOpen, BarChart3, LogOut, PanelLeft, Bell, Settings, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import DashboardLoading from '@/app/dashboard/loading';
import Logo from '@/components/Logo';

const sidebarItems = [
    { title: "Dashboard", icon: <Home className="h-5 w-5" />, href: "/teacher-dashboard" },
    { title: "Students", icon: <Users className="h-5 w-5" />, href: "/teacher-dashboard/students" },
    { title: "Classes", icon: <BookOpen className="h-5 w-5" />, href: "/teacher-dashboard/classes" },
    { title: "Content", icon: <FilePlus className="h-5 w-5" />, href: "/teacher-dashboard/content" },
    { title: "Analytics", icon: <BarChart3 className="h-5 w-5" />, href: "/teacher-dashboard/analytics" },
];

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
                            <h2 className="font-semibold">Teacher Portal</h2>
                            <p className="text-xs text-muted-foreground">Tutorin for Educators</p>
                        </div>
                        <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                            <Logo className="size-5" />
                        </div>
                        </div>
                    </div>
                    <nav className="flex-1 px-3 py-2 space-y-1">
                        {sidebarItems.map(item => (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname === item.href && "bg-muted text-primary"
                                )}>
                                    {item.icon}
                                    {item.title}
                                </div>
                            </Link>
                        ))}
                    </nav>
                     <div className="border-t p-3">
                        <Button onClick={() => auth.signOut()} className="w-full justify-start">
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
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
                    <h1 className="text-xl font-semibold">Dashboard</h1>
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
