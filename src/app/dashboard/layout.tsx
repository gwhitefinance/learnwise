
'use client';

import { useEffect, useState, useRef } from 'react';
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
  FlaskConical,
  LogOut,
  User,
  Gamepad2,
  Gem,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';


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


// Sample data for sidebar navigation
const sidebarItems = [
    {
      title: "Home",
      icon: <Home />,
      href: "/dashboard",
      id: "dashboard-link",
    },
    {
      title: "Profile",
      icon: <User />,
      href: "/dashboard/profile",
      id: "profile-link",
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
          {
            title: "Upload",
            icon: <UploadCloud />,
            href: "/dashboard/upload",
            id: "upload-link",
          },
      ]
    },
    {
      title: "Study Tools",
      icon: <BookOpen />,
      id: "study-tools-section",
      children: [
        {
            title: "Roadmaps",
            icon: <GitMerge />,
            href: "/dashboard/roadmaps",
            id: "roadmaps-link",
        },
        {
            title: "Practice Quiz",
            icon: <Lightbulb />,
            href: "/dashboard/practice-quiz",
            id: "practice-quiz-link",
        },
        {
            title: "Learning Lab",
            icon: <FlaskConical />,
            href: "/dashboard/learning-lab",
            id: "learning-lab-link",
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
      ]
    },
     {
      title: "AI Tools",
      icon: <Sparkles />,
      id: "ai-tools-section",
      children: [
        {
            title: "AI Chat",
            icon: <BrainCircuit />,
            href: "/dashboard/ai-chat",
            id: "ai-chat-link",
        },
        {
            title: "Analysis",
            icon: <BarChart3 />,
            href: "/dashboard/analysis",
            id: "analysis-link",
        },
      ]
    },
    {
        title: "Shop",
        icon: <ShoppingBag />,
        href: "/dashboard/shop",
        id: "shop-link",
    }
  ];


const SidebarNavItem = ({ item, pathname, setMobileMenuOpen }: { item: any, pathname: string, setMobileMenuOpen: (open: boolean) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = hasChildren ? item.children.some((child: any) => child.href === pathname || pathname.startsWith(child.href + '/')) : item.href === pathname;

    useEffect(() => {
        if (isActive) {
            setIsOpen(true);
        }
    }, [isActive]);

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
                        {item.children.map((child: any) => (
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
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


  useEffect(() => {
    if (!loading && !user) {
      router.push('/signup');
      return;
    }
    if (user) {
        // Automatically create user profile if it doesn't exist
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
                    console.log("Created profile for new user:", user.uid);
                } catch (error) {
                    console.error("Error creating user profile:", error);
                }
            }
        };
        initUserProfile();

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setUserCoins(doc.data().coins || 0);
            }
        });
        
        // This code must run on the client
        const savedPic = localStorage.getItem('profilePic');
        if (savedPic) {
          setProfilePic(savedPic);
        }
        
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications).length);
        }
        
        // Request notification permission
        async function requestPermission() {
          const supported = await isSupported();
          if (!supported) {
              console.log('Firebase Messaging is not supported in this browser.');
              return;
          }
          
          console.log('Requesting permission...');
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              console.log('Notification permission granted.');
              
              const messagingInstance = getMessaging();
              if (messagingInstance) {
                const currentToken = await getToken(messagingInstance, { vapidKey: 'YOUR_VAPID_KEY_HERE' });
              
                if (currentToken) {
                  console.log('FCM Token:', currentToken);
                  // Send the token to your server and update the UI if necessary
                } else {
                  // Show permission request UI
                  console.log('No registration token available. Request permission to generate one.');
                }
              }
            } else {
              console.log('Unable to get permission to notify.');
            }
          } catch (error) {
            console.error('An error occurred while requesting permission. ', error);
          }
        }
        
        requestPermission();
        
        return () => unsubscribe();
    }
  }, [user, loading, router]);


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

  const filteredSidebarItems = sidebarItems.map(item => {
    if (!item.children) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ? item : null;
    }
    const filteredChildren = item.children.filter(child => child.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filteredChildren.length > 0) {
      return { ...item, children: filteredChildren };
    }
    if (item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return item; // Keep the parent if it matches
    }
    return null;
  }).filter(Boolean);

  const isChatPage = pathname.startsWith('/dashboard/ai-chat');


  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div>Loading...</div>
        </div>
    )
  }

  return (
    <>
    <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/*" />
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated gradient background */}
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
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
       {!isChatPage && (
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex h-full flex-col border-r">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                    <Wand2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">LearnWise</h2>
                    <p className="text-xs text-muted-foreground">Study Suite</p>
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
                <div className="space-y-1">
                  <Button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </Button>
                  <Button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6">
                            {profilePic ? (
                                <AvatarImage src={profilePic} alt="User" />
                            ): (
                                <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                            )}
                        </Avatar>
                      <span>{user?.displayName}</span>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Pro
                    </Badge>
                  </Button>
                </div>
              </div>
            </div>
          </div>
       )}

      {/* Sidebar - Desktop */}
      {!isChatPage && (
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex h-full flex-col">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                    <Wand2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">LearnWise</h2>
                    <p className="text-xs text-muted-foreground">Study Suite</p>
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
                <div className="space-y-1">
                  <Button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </Button>
                  <Button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                            {profilePic ? (
                                <AvatarImage src={profilePic} alt="User" />
                            ): (
                                <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                            )}
                        </Avatar>
                      <span>{user?.displayName}</span>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Pro
                    </Badge>
                  </Button>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Main Content */}
      <div className={cn(
          "min-h-screen transition-all duration-300 ease-in-out", 
          sidebarOpen && !isChatPage ? "md:pl-64" : "md:pl-0",
          isChatPage && "md:pl-0"
        )}>
        {!isChatPage && (
          <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Sidebar">
              <PanelLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-xl font-semibold">LearnWise</h1>
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-2xl">
                        <Cloud className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Cloud Storage</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Link href="/dashboard/ai-chat">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-2xl">
                          <MessageSquare className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>AI Chat</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Link>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-2xl relative">
                        <Bell className="h-5 w-5" />
                        {notifications > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {notifications}
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Notifications</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Link href="/dashboard/shop">
                                <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-amber-600">
                                    <Gem className="h-4 w-4" />
                                    <span className="text-sm font-medium">{userCoins}</span>
                                </div>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>Your Coins</TooltipContent>
                    </Tooltip>
                </TooltipProvider>


                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <button>
                        <Avatar className="h-9 w-9 border-2 border-primary cursor-pointer">
                            {profilePic ? (
                                <AvatarImage src={profilePic} alt="User" />
                            ): (
                                <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                            )}
                        </Avatar>
                     </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => router.push('/dashboard/profile')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                      </DropdownMenuItem>
                       <DropdownMenuItem onSelect={() => router.push('/dashboard/shop')}>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>Shop & Rewards</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={triggerFileUpload}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Change Picture</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sign Out</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </div>
          </header>
        )}

        <main className={cn("flex-1", !isChatPage && "p-4 md:p-6")}>
            {children}
        </main>
      </div>
    </div>
    <Toaster />
    </>
  );
}

    