
'use client';

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { app, db } from "@/lib/firebase"
import Link from "next/link"
import { Eye, EyeOff, Loader2, X, Star } from 'lucide-react';
import AIBuddy from '@/components/ai-buddy';
import { cn } from "@/lib/utils"
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, updateDoc, arrayUnion, writeBatch, setDoc, serverTimestamp, doc } from 'firebase/firestore';

const Snowflake = () => {
    const randomX = Math.random() * 100;
    const randomDuration = 5 + Math.random() * 5;
    const randomDelay = Math.random() * 5;
    const randomSize = 0.2 + Math.random() * 0.5;

    return (
        <motion.div
            className="absolute top-0 w-1 h-1 bg-white rounded-full"
            style={{
                left: `${'${randomX}'}vw`,
                scale: randomSize,
            }}
            animate={{
                y: '100vh',
                opacity: [0, 1, 0.5, 0]
            }}
            transition={{
                duration: randomDuration,
                repeat: Infinity,
                delay: randomDelay,
                ease: "linear"
            }}
        />
    );
};

const WinterWonderland = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="absolute inset-0 bg-[#0a1128] -z-10" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="600" fill="#0a1128"/>
        
        <circle cx="100" cy="50" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="200" cy="80" r="1" fill="white" opacity="0.9"/>
        <circle cx="350" cy="40" r="1.2" fill="white" opacity="0.7"/>
        <circle cx="500" cy="70" r="1.3" fill="white" opacity="0.8"/>
        <circle cx="650" cy="50" r="1" fill="white" opacity="0.9"/>
        <circle cx="750" cy="90" r="1.4" fill="white" opacity="0.7"/>
        <circle cx="150" cy="120" r="1" fill="white" opacity="0.8"/>
        <circle cx="400" cy="100" r="1.1" fill="white" opacity="0.9"/>
        <circle cx="600" cy="120" r="1.2" fill="white" opacity="0.7"/>
        <circle cx="250" cy="30" r="1.3" fill="white" opacity="0.8"/>
        
        <defs>
          <linearGradient id="aurora1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'#00ff88',stopOpacity:0.6}} />
            <stop offset="50%" style={{stopColor:'#00ccff',stopOpacity:0.4}} />
            <stop offset="100%" style={{stopColor:'#0088ff',stopOpacity:0.1}} />
          </linearGradient>
          <linearGradient id="aurora2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'#ff00ff',stopOpacity:0.5}} />
            <stop offset="50%" style={{stopColor:'#00ffff',stopOpacity:0.3}} />
            <stop offset="100%" style={{stopColor:'#0066ff',stopOpacity:0.1}} />
          </linearGradient>
        </defs>
        
        <path d="M 0 80 Q 200 100, 400 80 T 800 90 L 800 200 L 0 200 Z" fill="url(#aurora1)" opacity="0.7">
          <animate attributeName="d" 
                   values="M 0 80 Q 200 100, 400 80 T 800 90 L 800 200 L 0 200 Z;
                           M 0 90 Q 200 70, 400 90 T 800 80 L 800 200 L 0 200 Z;
                           M 0 80 Q 200 100, 400 80 T 800 90 L 800 200 L 0 200 Z"
                   dur="8s" repeatCount="indefinite"/>
        </path>
        
        <path d="M 0 120 Q 250 140, 500 120 T 800 130 L 800 250 L 0 250 Z" fill="url(#aurora2)" opacity="0.6">
          <animate attributeName="d" 
                   values="M 0 120 Q 250 140, 500 120 T 800 130 L 800 250 L 0 250 Z;
                           M 0 130 Q 250 110, 500 130 T 800 120 L 800 250 L 0 250 Z;
                           M 0 120 Q 250 140, 500 120 T 800 130 L 800 250 L 0 250 Z"
                   dur="10s" repeatCount="indefinite"/>
        </path>
        
        <ellipse cx="400" cy="580" rx="450" ry="40" fill="#ffffff" opacity="0.9"/>
        <rect x="0" y="560" width="800" height="40" fill="#f0f8ff"/>
        
        <g id="santa-sled" transform="translate(120, 80) scale(2.5)">
          <path d="M -30 15 L -25 20 L 25 20 L 30 15 L 25 10 L -25 10 Z" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
          <path d="M -30 15 Q -35 20, -30 25 L 30 25 Q 35 20, 30 15" fill="#CD853F"/>
          <line x1="-30" y1="15" x2="-35" y2="30" stroke="#654321" strokeWidth="2"/>
          <line x1="30" y1="15" x2="35" y2="30" stroke="#654321" strokeWidth="2"/>
          
          <rect x="-15" y="12" width="10" height="8" fill="#DC143C"/>
          <rect x="-8" y="10" width="8" height="10" fill="#FFD700"/>
          <rect x="3" y="13" width="9" height="7" fill="#0000CD"/>
          
          <ellipse cx="0" cy="8" rx="8" ry="10" fill="#DC143C"/>
          <circle cx="0" cy="0" r="6" fill="#FFE4C4"/>
          <circle cx="-2" cy="-1" r="1" fill="#000"/>
          <circle cx="2" cy="-1" r="1" fill="#000"/>
          <circle cx="0" cy="2" r="1.5" fill="#FF6B6B"/>
          <path d="M -6 -3 Q 0 -8, 6 -3" fill="#DC143C"/>
          <circle cx="0" cy="-6" r="2" fill="#ffffff"/>
          <ellipse cx="0" cy="3" rx="5" ry="3" fill="#ffffff"/>
          <rect x="-1" y="8" width="2" height="4" fill="#000000"/>
          <ellipse cx="-5" cy="10" rx="3" ry="2" fill="#DC143C"/>
          <ellipse cx="5" cy="10" rx="3" ry="2" fill="#DC143C"/>
          
          <line x1="-25" y1="15" x2="-40" y2="10" stroke="#8B4513" strokeWidth="1.5"/>
          <line x1="-25" y1="15" x2="-45" y2="5" stroke="#8B4513" strokeWidth="1.5"/>
          
          <g transform="translate(-50, 5)">
            <ellipse cx="0" cy="5" rx="6" ry="4" fill="#8B4513"/>
            <circle cx="0" cy="0" r="4" fill="#A0522D"/>
            <line x1="-3" y1="-2" x2="-5" y2="-6" stroke="#654321" strokeWidth="1.5"/>
            <line x1="3" y1="-2" x2="5" y2="-6" stroke="#654321" strokeWidth="1.5"/>
            <circle cx="-1" cy="0" r="0.8" fill="#000"/>
            <circle cx="2" cy="1" r="1.2" fill="#FF0000"/>
          </g>
        </g>
        
        <g transform="translate(150, 400)">
          <rect x="-15" y="80" width="30" height="40" fill="#6B4423"/>
          
          <path d="M 0 -80 L -60 0 L -40 0 L -80 60 L -50 60 L -90 120 L 90 120 L 50 60 L 80 60 L 40 0 L 60 0 Z" fill="#0B6623"/>
          <path d="M 0 -80 L -55 0 L -35 0 L -75 60 L -45 60 L -85 120 L 85 120 L 45 60 L 75 60 L 35 0 L 55 0 Z" fill="#228B22" opacity="0.8"/>
          
          <path d="M 0 -90 L -3 -78 L -15 -78 L -6 -70 L -9 -58 L 0 -66 L 9 -58 L 6 -70 L 15 -78 L 3 -78 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          
          <circle cx="-30" cy="20" r="4" fill="#FF0000"/>
          <circle cx="35" cy="30" r="4" fill="#0000FF"/>
          <circle cx="-45" cy="50" r="4" fill="#FFD700"/>
          <circle cx="20" cy="60" r="4" fill="#FF69B4"/>
          <circle cx="-20" cy="80" r="4" fill="#00CED1"/>
          <circle cx="40" cy="90" r="4" fill="#FF4500"/>
          <circle cx="-50" cy="95" r="4" fill="#9370DB"/>
          <circle cx="0" cy="40" r="4" fill="#FF1493"/>
        </g>
        
        <g transform="translate(250, 500)">
          <rect x="0" y="0" width="40" height="35" fill="#DC143C"/>
          <rect x="17" y="0" width="6" height="35" fill="#FFD700"/>
          <rect x="0" y="15" width="40" height="6" fill="#FFD700"/>
          <path d="M 20 0 Q 15 -8, 20 -12 Q 25 -8, 20 0" fill="#FFD700"/>
        </g>
        
        <g transform="translate(520, 510)">
          <rect x="0" y="0" width="35" height="30" fill="#0000CD"/>
          <rect x="15" y="0" width="5" height="30" fill="#FF69B4"/>
          <rect x="0" y="13" width="35" height="5" fill="#FF69B4"/>
          <path d="M 17.5 0 Q 13 -6, 17.5 -10 Q 22 -6, 17.5 0" fill="#FF69B4"/>
        </g>
        
        <g transform="translate(310, 520)">
          <rect x="0" y="0" width="30" height="25" fill="#228B22"/>
          <rect x="13" y="0" width="4" height="25" fill="#FFD700"/>
          <rect x="0" y="11" width="30" height="4" fill="#FFD700"/>
          <path d="M 15 0 Q 11 -5, 15 -8 Q 19 -5, 15 0" fill="#FFD700"/>
        </g>
        
        <circle cx="150" cy="200" r="3" fill="white" opacity="0.8">
          <animate attributeName="cy" values="200;600" dur="8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="320" cy="150" r="2.5" fill="white" opacity="0.9">
          <animate attributeName="cy" values="150;600" dur="10s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="580" cy="180" r="2" fill="white" opacity="0.7">
          <animate attributeName="cy" values="180;600" dur="9s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="450" cy="220" r="3" fill="white" opacity="0.8">
          <animate attributeName="cy" values="220;600" dur="11s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="680" cy="250" r="2.5" fill="white" opacity="0.9">
          <animate attributeName="cy" values="250;600" dur="7s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="90" cy="300" r="2" fill="white" opacity="0.7">
          <animate attributeName="cy" values="300;600" dur="12s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="720" cy="160" r="2.8" fill="white" opacity="0.8">
          <animate attributeName="cy" values="160;600" dur="9.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="220" cy="280" r="2.2" fill="white" opacity="0.9">
          <animate attributeName="cy" values="280;600" dur="10.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="4s" repeatCount="indefinite"/>
        </circle>
        
        <g transform="translate(150, 480)">
          <path d="M 0 0 Q -8 -5, -8 -15 Q -8 -25, 0 -30 Q 8 -25, 8 -15 Q 8 -5, 0 0" fill="#ffffff" stroke="#DC143C" strokeWidth="3"/>
          <line x1="0" y1="0" x2="0" y2="20" stroke="#ffffff" strokeWidth="6"/>
          <line x1="0" y1="0" x2="0" y2="20" stroke="#DC143C" strokeWidth="3" strokeDasharray="4,4"/>
        </g>
        
        <g transform="translate(650, 490)">
          <path d="M 0 0 Q -8 -5, -8 -15 Q -8 -25, 0 -30 Q 8 -25, 8 -15 Q 8 -5, 0 0" fill="#ffffff" stroke="#DC143C" strokeWidth="3"/>
          <line x1="0" y1="0" x2="0" y2="20" stroke="#ffffff" strokeWidth="6"/>
          <line x1="0" y1="0" x2="0" y2="20" stroke="#DC143C" strokeWidth="3" strokeDasharray="4,4"/>
        </g>
        
        <g transform="translate(200, 350)">
          <ellipse cx="-5" cy="0" rx="8" ry="12" fill="#0B6623" transform="rotate(-30 -5 0)"/>
          <ellipse cx="5" cy="0" rx="8" ry="12" fill="#0B6623" transform="rotate(30 5 0)"/>
          <ellipse cx="0" cy="-8" rx="8" ry="12" fill="#0B6623"/>
          <circle cx="0" cy="0" r="3" fill="#DC143C"/>
          <circle cx="-4" cy="2" r="2.5" fill="#DC143C"/>
          <circle cx="4" cy="2" r="2.5" fill="#DC143C"/>
        </g>
        
        <g transform="translate(600, 370)">
          <ellipse cx="-5" cy="0" rx="8" ry="12" fill="#0B6623" transform="rotate(-30 -5 0)"/>
          <ellipse cx="5" cy="0" rx="8" ry="12" fill="#0B6623" transform="rotate(30 5 0)"/>
          <ellipse cx="0" cy="-8" rx="8" ry="12" fill="#0B6623"/>
          <circle cx="0" cy="0" r="3" fill="#DC143C"/>
          <circle cx="-4" cy="2" r="2.5" fill="#DC143C"/>
          <circle cx="4" cy="2" r="2.5" fill="#DC143C"/>
        </g>
        
        <g transform="translate(650, 470)">
          <circle cx="0" cy="20" r="18" fill="#ffffff"/>
          <circle cx="0" cy="-5" r="14" fill="#ffffff"/>
          <circle cx="0" cy="-22" r="10" fill="#ffffff"/>
          <circle cx="-3" cy="-24" r="1.5" fill="#000"/>
          <circle cx="3" cy="-24" r="1.5" fill="#000"/>
          <circle cx="0" cy="-20" r="1" fill="#FF6B00"/>
          <circle cx="0" cy="20" r="2" fill="#000"/>
          <circle cx="0" cy="10" r="2" fill="#000"/>
          <circle cx="0" cy="0" r="2" fill="#000"/>
          <path d="M -12 -22 L -20 -25 L -18 -20" stroke="#654321" strokeWidth="2" fill="none"/>
          <path d="M 12 -22 L 20 -25 L 18 -20" stroke="#654321" strokeWidth="2" fill="none"/>
          <path d="M -8 -32 L 8 -32 L 10 -28 L -10 -28 Z" fill="#000000"/>
          <rect x="-10" y="-32" width="20" height="3" fill="#DC143C"/>
        </g>
        
        <g transform="translate(100, 380)">
          <path d="M -6 0 Q -8 8, -5 12 L 5 12 Q 8 8, 6 0 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
          <circle cx="0" cy="14" r="2" fill="#FFD700"/>
          <path d="M 8 0 Q 10 8, 7 12 L 17 12 Q 20 8, 18 0 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
          <circle cx="12" cy="14" r="2" fill="#FFD700"/>
          <path d="M 0 -5 Q 12 -8, 12 -5" stroke="#DC143C" strokeWidth="3" fill="none"/>
        </g>
        
        <g transform="translate(700, 300)">
          <path d="M 0 -8 L -2 -2 L -8 -2 L -3 2 L -5 8 L 0 4 L 5 8 L 3 2 L 8 -2 L 2 -2 Z" fill="#FFD700" opacity="0.9"/>
        </g>
        
        <g transform="translate(130, 250)">
          <path d="M 0 -6 L -1.5 -1.5 L -6 -1.5 L -2 1.5 L -3.5 6 L 0 3 L 3.5 6 L 2 1.5 L 6 -1.5 L 1.5 -1.5 Z" fill="#FFD700" opacity="0.9"/>
        </g>
        
        <g transform="translate(180, 510)">
          <rect x="0" y="0" width="15" height="25" fill="#DC143C"/>
          <rect x="0" y="25" width="20" height="15" fill="#DC143C"/>
          <rect x="0" y="0" width="15" height="5" fill="#ffffff"/>
          <circle cx="7" cy="2" r="1.5" fill="#228B22"/>
        </g>
        
        <g transform="translate(560, 515)">
          <rect x="0" y="0" width="15" height="25" fill="#228B22"/>
          <rect x="0" y="25" width="20" height="15" fill="#228B22"/>
          <rect x="0" y="0" width="15" height="5" fill="#ffffff"/>
          <circle cx="7" cy="2" r="1.5" fill="#FFD700"/>
        </g>
      </svg>
    </div>
  );
};


const GoogleIcon = () => <svg height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path><path d="M1 1h22v22H1z" fill="none"></path></svg>;

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccessfulLogin = async (user: any) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));

    if (userDoc.empty) {
        await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName || email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            coins: 0,
        });
    }

    const inviteCode = localStorage.getItem('squadInviteCode');
    if (inviteCode) {
        const squadsRef = collection(db, 'squads');
        const q = query(squadsRef, where('inviteCode', '==', inviteCode));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const squadDoc = querySnapshot.docs[0];
            const squadId = squadDoc.id;

            const batch = writeBatch(db);

            const squadRef = doc(db, 'squads', squadId);
            batch.update(squadRef, { members: arrayUnion(user.uid) });

            const memberDetailRef = doc(db, 'squads', squadId, 'memberDetails', user.uid);
            batch.set(memberDetailRef, {
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL || null
            });

            await batch.commit();

            toast({ title: "Squad Joined!", description: `You've been added to ${squadDoc.data().name}.`});
        }
        localStorage.removeItem('squadInviteCode');
    }

    router.push('/dashboard');
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const auth = getAuth(app);
        const result = await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: "Logged In Successfully!",
            description: "Welcome back to your dashboard.",
        });
        await handleSuccessfulLogin(result.user);
    } catch (error: any) {
        let description = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
            description = "Invalid email. No account found with this email address.";
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
             description = "Invalid credentials. Please check your email and password.";
        }
        toast({ variant: "destructive", title: "Login failed", description });
    } finally {
        setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await handleSuccessfulLogin(result.user);
        toast({
            title: "Signed In with Google!",
            description: "Welcome back!",
        });
    } catch (error: any) {
        console.error("Google sign-in error:", error);
        toast({
            variant: "destructive",
            title: "Google Sign-in failed",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
        <WinterWonderland />
        <Link href="/" className="absolute top-4 left-4 z-20">
            <Button variant="ghost" size="icon" className="bg-black/10 hover:bg-black/20 text-gray-800 rounded-full h-10 w-10">
              <X className="h-5 w-5 text-white" />
            </Button>
        </Link>

      <motion.div
        className="w-full max-w-sm bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 z-10 relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="text-center">
            <div className="w-48 h-32 mx-auto -mt-24">
                <AIBuddy hat="Santa Hat" shirt="Ugly Christmas Sweater"/>
            </div>
            <h1 className="text-3xl font-bold mb-2">Happy Holidays!</h1>
        </div>

        <form className="space-y-4 mt-6" onSubmit={handleLogin}>
            <Button type="button" onClick={handleGoogleSignIn} variant="outline" className="h-12 w-full bg-white border-input hover:bg-accent rounded-lg text-base font-bold flex items-center justify-center gap-2">
                <GoogleIcon /> Continue with Google
            </Button>
             <div className="relative my-4 flex items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                <div className="flex-grow border-t border-border"></div>
            </div>
            <div className="space-y-1">
                <Input
                  className="h-12 bg-muted/50 border-input rounded-lg text-base"
                  placeholder="Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="space-y-1">
                <div className="relative">
                    <Input
                      className="h-12 bg-muted/50 border-input rounded-lg text-base pr-10"
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                 <div className="text-right">
                    <Link href="#" className="text-xs font-semibold text-primary hover:underline">
                        Forgot password?
                    </Link>
                </div>
            </div>
            <Button type="submit" className="h-12 w-full bg-primary hover:bg-primary/90 rounded-lg text-base font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin"/> : 'Log In'}
            </Button>

            <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </form>
      </motion.div>
    </div>
  )
}
