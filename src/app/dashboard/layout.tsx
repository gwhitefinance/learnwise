

'use client';

import React, { useEffect, useState, useRef, createContext, useContext, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Clock,
  Eye,
  Archive,
  ArrowUpDown,
  MoreHorizontal,
  Type,
  CuboidIcon,
  X,
  GraduationCap,
  Calendar,
  GitMerge,
  BrainCircuit,
  UploadCloud,
  ClipboardPenLine,
  BarChart3,
  PenSquare,
  ChevronRight,
  ChevronLeft,
  FlaskConical,
  LogOut,
  User,
  Gamepad2,
  ShoppingBag,
  Shield,
  Podcast,
  BookMarked,
  Wind,
  Copy,
  KeySquare,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


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
import { auth, db, getMessaging, isSupported } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getToken } from 'firebase/messaging';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { RewardProvider } from '@/context/RewardContext';
import RewardPopup from '@/components/RewardPopup';
import FloatingChat from '@/components/floating-chat';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import DashboardLoading from './loading';
import { CallProvider } from '@/context/CallContext';
import CallView from '@/components/CallView';
import IncomingCall from '@/components/IncomingCall';
import TazCoinIcon from '@/components/TazCoinIcon';

type SidebarChild = {
  title: string;
  icon: React.ReactElement;
  href: string;
  id: string;
};

type SidebarItem = {
  title: string;
  icon: React.ReactElement;
  id: string;
  href?: string;
  children?: SidebarChild[];
  isHighSchoolOnly?: boolean;
};

const sidebarItems: SidebarItem[] = [
    {
      title: "Home",
      icon: <Home />,
      href: "/dashboard",
      id: "dashboard-link",
    },
    {
      title: "Workspace",
      icon: <LayoutGrid />,
      id: "workspace-section",
      children: [
          {
            title: "Courses",
            icon: <GraduationCap />,
            href: "/dashboard/courses",
            id: "courses-link",
          },
          {
            title: "Roadmaps",
            icon: <GitMerge />,
            href: "/dashboard/roadmaps",
            id: "roadmaps-link",
          },
          {
            title: "Calendar",
            icon: <Calendar />,
            href: "/dashboard/calendar",
            id: "calendar-link",
          },
          {
            title: "Notes",
            icon: <ClipboardPenLine />,
            href: "/dashboard/notes",
            id: "notes-link",
          },
      ]
    },
    {
      title: "Study Tools",
      icon: <BookOpen />,
      id: "study-tools-section",
      children: [
        {
            title: "Practice Quiz",
            icon: <Lightbulb />,
            href: "/dashboard/practice-quiz",
            id: "practice-quiz-link",
        },
        {
            title: "Whiteboard",
            icon: <PenSquare />,
            href: "/dashboard/whiteboard",
            id: "whiteboard-link",
        },
        {
            title: "Games",
            icon: <Gamepad2 />,
            href: "/dashboard/games",
            id: "games-link",
        },
        {
            title: "Learning Squad",
            icon: <Users />,
            href: "/dashboard/learning-squad",
            id: "learning-squad-link",
        },
      ]
    },
     {
      title: "AI Tools",
      icon: <Sparkles />,
      id: "ai-tools-section",
      children: [
        {
            title: "Analysis",
            icon: <BarChart3 />,
            href: "/dashboard/analysis",
            id: "analysis-link",
        },
        {
            title: "Upload",
            icon: <UploadCloud />,
            href: "/dashboard/upload",
            id: "upload-link",
        },
        {
            title: "Mindfulness",
            icon: <Wind />,
            href: "/dashboard/mindfulness",
            id: "mindfulness-link",
        },
        {
            title: "Podcasts",
            icon: <Podcast />,
            href: "/dashboard/podcasts",
            id: "podcasts-link",
        },
      ]
    },
    {
        title: "SAT Prep",
        icon: <BookMarked />,
        href: "/dashboard/sat-prep",
        id: "sat-prep-link",
        isHighSchoolOnly: true,
    },
    {
        title: "College Prep",
        icon: <GraduationCap />,
        href: "/dashboard/college-prep",
        id: "college-prep-link",
        isHighSchoolOnly: true,
    },
  ];

const SidebarNavItem = ({ item, pathname, setMobileMenuOpen }: { item: SidebarItem, pathname: string, setMobileMenuOpen: (open: boolean) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    const getIsActive = (item: SidebarItem): boolean => {
        if (!item.href && !item.children) return false;
        
        if (item.href) {
            return pathname === item.href || pathname.startsWith(item.href + '/');
        }
        
        if (item.children) {
            return item.children.some(child => pathname === child.href || pathname.startsWith(child.href + '/'));
        }
        
        return false;
    };

    const isActive = getIsActive(item);
    
    useEffect(() => {
        if (isActive) {
            setIsOpen(true);
        }
    }, [isActive, item.children, pathname]);

    if (hasChildren) {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} id={item.id}>
                 <CollapsibleTrigger asChild>
                    <button className={cn(
                          "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
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
                                key={child.title}
                                href={child.href || '#'}
                                id={child.id}
                                className={cn(
                                "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium",
                                (pathname === child.href || pathname.startsWith(child.href + '/')) ? "text-primary" : "hover:bg-muted text-muted-foreground",
                                )}
                                onClick={() => setMobileMenuOpen(false)}
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
        <Link
            href={item.href || '#'}
            id={item.id}
            className={cn(
            "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
            pathname === item.href ? "bg-primary/10 text-primary" : "hover:bg-muted",
            )}
            onClick={() => setMobileMenuOpen(false)}
        >
            <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.title}</span>
            </div>
        </Link>
    )
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userCoins, setUserCoins] = useState<number>(0);
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  
  const isFocusLayout = pathname.startsWith('/dashboard/sat-prep/study-session');
  
  const [showTopBar, setShowTopBar] = useState(false);

  useEffect(() => {
    const shouldShow = pathname !== '/dashboard' && !pathname.startsWith('/dashboard/notes/new') && !pathname.startsWith('/dashboard/sat-prep/practice-test');
    setShowTopBar(shouldShow);
  }, [pathname]);

  useEffect(() => {
    setIsMounted(true);
    const storedGradeLevel = localStorage.getItem('onboardingGradeLevel');
    setGradeLevel(storedGradeLevel);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!loading && !user) {
      router.push('/signup');
      return;
    }
    if (user) {
        const initUserProfile = async () => {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                try {
                    await setDoc(userRef, {
                        displayName: user.displayName || "New User",
                        email: user.email,
                        createdAt: serverTimestamp(),
                        coins: 0,
                    });
                } catch (error) {
                    console.error("Error creating user profile:", error);
                }
            }
        };
        initUserProfile();

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUserCoins(data.coins || 0);
            }
        });
        
        const savedPic = user.photoURL || localStorage.getItem('profilePic');
        if (savedPic) {
          setProfilePic(savedPic);
        }
        
        async function requestPermission() {
          const supported = await isSupported();
          if (!supported) return;
          try {
            await Notification.requestPermission();
          } catch (error) {
            console.error('An error occurred while requesting permission. ', error);
          }
        }
        
        requestPermission();
        
        return () => unsubscribe();
    }
  }, [user, loading, router, isMounted]);


  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  }
  
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePic(result);
        localStorage.setItem('profilePic', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  }

  const currentSidebarItems = sidebarItems.filter(item => 
      !item.isHighSchoolOnly || (item.isHighSchoolOnly && isMounted && gradeLevel === 'High School')
  );


  const filteredSidebarItems = currentSidebarItems.map(item => {
    if (item.children) {
      const filteredChildren = item.children.filter(child => child.title.toLowerCase().includes(searchQuery.toLowerCase()));
      if (filteredChildren.length > 0) {
        return { ...item, children: filteredChildren };
      }
      if (item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return { ...item, children: [] };
      }
      return null;
    }
    return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ? item : null;
  }).filter((item): item is SidebarItem => item !== null);

  if (loading || !isMounted) {
    return <DashboardLoading />;
  }

  const userProfileDisplay = (
    <div className="w-full p-2 rounded-2xl hover:bg-muted cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                {profilePic ? (
                    <AvatarImage src={profilePic} alt="User" />
                ): (
                    <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                )}
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-sm truncate">{user?.displayName}</p>
            </div>
             <Badge variant="outline" className="flex items-center gap-1.5 shrink-0">
                <TazCoinIcon className="h-4 w-4" /> {userCoins}
            </Badge>
        </div>
    </div>
);


  return (
    <>
      <div className={cn(
          "relative min-h-screen overflow-hidden bg-background"
      )}>
        <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/*" />
        
        {!isFocusLayout && (
          <motion.div
              className="absolute inset-0 -z-10 opacity-20"
              animate={{
              background: [
                  "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
                  "radial-gradient(circle at 30% 70%, rgba(233, 30, 99, 0.5) 0%, rgba(81, 45, 168, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
                  "radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.5) 0%, rgba(32, 119, 188, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
                  "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
              ],
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
        )}

        {mobileMenuOpen && !isFocusLayout && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {!isFocusLayout && (
          <div
              className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
              )}
          >
              <div className="flex h-full flex-col border-r">
              <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                  <div>
                      <h2 className="font-semibold">Tutor Taz</h2>
                      <p className="text-xs text-muted-foreground">Study Suite</p>
                  </div>
                  <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                      <Logo className="size-5" />
                  </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                  </Button>
              </div>

              <div className="px-3 py-2">
                  <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
              </div>

              <ScrollArea className="flex-1 px-3 py-2">
                  <div className="space-y-1">
                  {filteredSidebarItems.length > 0 ? filteredSidebarItems.map((item) => (
                      <div key={item.title} className="mb-1">
                          <SidebarNavItem item={item} pathname={pathname} setMobileMenuOpen={setMobileMenuOpen} />
                      </div>
                  )) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">No results found.</div>
                  )}
                  </div>
              </ScrollArea>

              <div className="border-t p-3">
                  <div className="space-y-1">
                  <Button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium">
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                      </Button>
                  {userProfileDisplay}
                  </div>
              </div>
              </div>
          </div>
        )}

        {!isFocusLayout && (
            <div
                className={cn(
                "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out md:flex",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                <div className="p-4">
                    <div className="flex items-center gap-3">
                    <div>
                        <h2 className="font-semibold">Tutorin</h2>
                        <p className="text-xs text-muted-foreground">Study Suite</p>
                    </div>
                    <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                        <Logo className="size-5" />
                    </div>
                    </div>
                </div>

                <div className="px-3 py-2">
                    <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-3 py-2">
                    <div className="space-y-1">
                    {filteredSidebarItems.length > 0 ? filteredSidebarItems.map((item: any) => (
                        <div key={item.title} className="mb-1">
                            <SidebarNavItem item={item} pathname={pathname} setMobileMenuOpen={setMobileMenuOpen} />
                        </div>
                    )) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">No results found.</div>
                    )}
                    </div>
                </ScrollArea>

                <div className="border-t p-3">
                    <div className="space-y-2">
                    <Button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium">
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </Button>
                    {userProfileDisplay}
                    </div>
                </div>
                </div>
            </div>
        )}

        <div className={cn(
            "flex flex-col min-h-screen transition-all duration-300 ease-in-out relative", 
            sidebarOpen && !isFocusLayout ? "md:pl-64" : "md:pl-0",
            isFocusLayout && 'md:pl-0 w-full'
        )}>
             {!isFocusLayout && (
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="fixed top-1/2 -translate-y-1/2 z-40 bg-background border h-8 w-8 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:bg-muted"
                    style={{ left: sidebarOpen ? 'calc(16rem - 1rem)' : '1rem' }}
                >
                    <ChevronLeft className={cn("h-4 w-4 text-muted-foreground transition-transform", !sidebarOpen && "rotate-180")} />
                </button>
            )}

            {showTopBar && (
                <div className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h2 className="font-semibold">Tutor Taz</h2>
                    <div className="ml-auto flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/upload')}>
                            <UploadCloud className="mr-2 h-4 w-4" /> Quick Upload
                        </Button>
                        <div className="flex items-center gap-2 bg-muted p-1 pr-3 rounded-full">
                            <TazCoinIcon className="h-6 w-6"/>
                            <span className="font-bold text-sm">{userCoins}</span>
                        </div>
                         <Button variant="ghost" size="icon" className="rounded-full">
                            <Bell className="h-5 w-5"/>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                 <Avatar className="h-9 w-9 cursor-pointer">
                                    <AvatarImage src={profilePic ?? undefined} alt="User" />
                                    <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild><Link href="/dashboard/profile">Profile</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/dashboard/shop">Shop & Rewards</Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={triggerFileUpload}>Change Picture</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">Sign Out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}

            <main className={cn(
                "flex-1 flex flex-col relative",
                showTopBar ? "p-4 md:p-6" : ""
            )}>
              <FloatingChat isHidden={isFocusLayout || pathname === '/dashboard/notes/new'}>
                {React.cloneElement(children as React.ReactElement)}
              </FloatingChat>
            </main>
        </div>
      </div>
      <RewardPopup />
      <CallView />
      <IncomingCall />
      <Toaster />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RewardProvider>
        <Suspense fallback={<DashboardLoading />}>
            <CallProvider>
              <DashboardLayoutContent>{children}</DashboardLayoutContent>
            </CallProvider>
        </Suspense>
    </RewardProvider>
  )
}
