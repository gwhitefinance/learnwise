
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

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/courses', icon: Book, label: 'Courses' },
    { href: '/dashboard/roadmaps', icon: GitMerge, label: 'Roadmaps' },
    { href: '/dashboard/notes', icon: FileText, label: 'Notes' },
    { href: '/dashboard/learner-type', icon: TestTube, label: 'Learner Type' },
    { href: '/dashboard/ai-chat', icon: Bot, label: 'AI Chat' },
    { href: '/dashboard/analysis', icon: BrainCircuit, label: 'AI Analysis' },
    { href: '/dashboard/upload', icon: Upload, label: 'Upload' },
    { href: '/dashboard/whiteboard', icon: Brush, label: 'Whiteboard' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { setTheme } = useTheme();

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
          className="w-full justify-start"
        >
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <h1 className="text-xl font-bold">LearnWise</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
      <div className="mt-auto border-t p-2">
        <Link href="#">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
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
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
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
               <SheetHeader className="p-4 border-b">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add a search bar here if needed */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar>
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Sophia</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    sophia@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
