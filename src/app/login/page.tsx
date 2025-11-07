
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
import { collection, query, where, getDocs, updateDoc, arrayUnion, writeBatch, setDoc, serverTimestamp } from 'firebase/firestore';


const GoogleIcon = () => <svg height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path><path d="M1 1h22v22H1z" fill="none"></path></svg>;

const Leaf = () => {
    const [style, setStyle] = useState({});
    const [id, setId] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const x = Math.random() * window.innerWidth;
            const y = -50;
            const rotate = Math.random() * 360;
            const size = Math.random() * 15 + 10;
            const fallDuration = Math.random() * 5 + 8; // Slower fall
            const swayDuration = Math.random() * 2 + 3;

            setStyle({
                left: `${x}px`,
                top: `${y}px`,
                transform: `rotate(${rotate}deg)`,
                width: `${size}px`,
                height: `${size}px`,
                animation: `fall ${fallDuration}s linear infinite, sway ${swayDuration}s ease-in-out infinite`,
            });
            setId(Math.random());
        }
    }, []);

    const leafColors = ["#D2691E", "#FF8C00", "#CD853F", "#B8860B"];
    const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];

    return (
        <motion.div
            className="absolute"
            initial={{ 
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0, 
                y: -50,
                rotate: Math.random() * 360 
            }}
            animate={{ y: typeof window !== 'undefined' ? window.innerHeight + 50 : 0 }}
            transition={{
                duration: Math.random() * 5 + 8,
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
                ease: "linear"
            }}
        >
             <motion.svg width="24" height="24" viewBox="0 0 24 24" fill={leafColor}
                animate={{
                    x: [0, -20, 20, -20, 0],
                    rotate: [0, 10, -10, 10, 0],
                }}
                transition={{
                    duration: Math.random() * 4 + 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
             >
                <path d="M12 2L12 8 M12 2 C16 4 20 8 22 12 C20 16 16 20 12 22 C8 20 4 16 2 12 C4 8 8 4 12 2Z" />
            </motion.svg>
        </motion.div>
    )
}

const FallingLeaves = () => {
    const [leaves, setLeaves] = useState<number[]>([]);
    useEffect(() => {
        setLeaves(Array.from({ length: 30 }, (_, i) => i));
    }, []);
    return <div className="absolute inset-0 pointer-events-none z-0">{leaves.map(i => <Leaf key={i} />)}</div>
}

const StringLights = () => (
    <svg className="absolute top-0 left-0 w-full h-auto z-0" viewBox="0 0 800 150">
        <path d="M 0 80 Q 200 100 400 90 Q 600 80 800 100" stroke="#654321" strokeWidth="3" fill="none"/>
        {[...Array(9)].map((_, i) => {
            const cx = 100 + i * 70;
            const cy = 80 + 15 * Math.sin(i * Math.PI / 4);
            const delay = (i * 0.2) + 's';
            return (
                <g key={i}>
                    <line x1={cx} y1={cy - 8} x2={cx} y2={cy} stroke="#654321" strokeWidth="2"/>
                    <circle cx={cx} cy={cy} r="8" fill={i % 2 === 0 ? "#FF6B35" : "#FFA500"}>
                        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin={delay}/>
                    </circle>
                </g>
            )
        })}
    </svg>
);

const Turkey = () => (
  <motion.div
    className="absolute bottom-[-50px] right-[-60px] w-[300px] h-[300px] z-0"
    animate={{
        y: [0, -10, 0, 5, 0],
        rotate: [0, 2, -2, 2, 0],
    }}
    transition={{
        duration: 8,
        repeat: Infinity,
        easings: "easeInOut"
    }}
  >
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(100, 100) scale(0.8)">
            <ellipse cx="-50" cy="-20" rx="25" ry="60" fill="#8B4513" transform="rotate(-30 -50 -20)"/>
            <ellipse cx="-35" cy="-25" rx="25" ry="65" fill="#D2691E" transform="rotate(-15 -35 -25)"/>
            <ellipse cx="-15" cy="-30" rx="25" ry="70" fill="#CD853F" transform="rotate(0 -15 -30)"/>
            <ellipse cx="5" cy="-30" rx="25" ry="70" fill="#FF8C00" transform="rotate(0 5 -30)"/>
            <ellipse cx="25" cy="-25" rx="25" ry="65" fill="#D2691E" transform="rotate(15 25 -25)"/>
            <ellipse cx="40" cy="-20" rx="25" ry="60" fill="#8B4513" transform="rotate(30 40 -20)"/>
            <ellipse cx="0" cy="20" rx="55" ry="65" fill="#8B4513"/>
            <ellipse cx="-20" cy="25" rx="25" ry="35" fill="#654321"/>
            <circle cx="0" cy="-25" r="28" fill="#A0522D"/>
            <path d="M 0 -20 L 12 -15 L 0 -10 Z" fill="#FFA500"/>
            <ellipse cx="5" cy="-5" rx="8" ry="15" fill="#DC143C"/>
            <path d="M 0 -35 Q 8 -30 6 -20" stroke="#DC143C" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <circle cx="-5" cy="-28" r="4" fill="white"/>
            <circle cx="-4" cy="-28" r="2" fill="black"/>
        </g>
    </svg>
  </motion.div>
);

const Pumpkins = () => (
    <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-0">
        <div className="absolute bottom-5 left-10 w-48 h-48">
            <svg viewBox="0 0 200 200">
                <ellipse cx="100" cy="120" rx="60" ry="65" fill="#FF8C00"/>
                <ellipse cx="100" cy="120" rx="55" ry="65" fill="#FF7F00"/>
                <line x1="100" y1="55" x2="100" y2="120" stroke="#8B4513" strokeWidth="5"/>
                <path d="M 100 55 Q 90 50 95 45 Q 100 48 105 45 Q 110 50 100 55" fill="#228B22"/>
            </svg>
        </div>
    </div>
)

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
        await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: "Logged In Successfully!",
            description: "Welcome back to your dashboard.",
        });
        router.push('/dashboard');
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
    <div className="flex items-center justify-center min-h-screen bg-[#FFF8E7] p-4 relative overflow-hidden">
        <FallingLeaves />
        <StringLights />
        <Pumpkins />
        <Turkey />
        
       <Link href="/" className="absolute top-4 left-4 z-20">
            <Button variant="ghost" size="icon" className="bg-black/10 hover:bg-black/20 text-gray-800 rounded-full h-10 w-10">
              <X className="h-5 w-5" />
            </Button>
        </Link>

      <motion.div 
        className="w-full max-w-sm bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 z-10 relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="text-center">
            <div className="w-48 h-32 mx-auto -mt-24">
                <AIBuddy />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        </div>
        
        <form className="space-y-4 mt-6" onSubmit={handleLogin}>
            <Button type="button" onClick={handleGoogleSignIn} variant="outline" className="h-12 w-full bg-white border-gray-300 hover:bg-gray-100 rounded-lg text-base font-bold flex items-center justify-center gap-2">
                <GoogleIcon /> Continue with Google
            </Button>
             <div className="relative my-4 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-xs">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <div className="space-y-1">
                <Input
                  className="h-12 bg-gray-100 border-gray-300 rounded-lg text-base"
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
                      className="h-12 bg-gray-100 border-gray-300 rounded-lg text-base pr-10"
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                 <div className="text-right">
                    <Link href="#" className="text-xs font-semibold text-blue-500 hover:underline">
                        Forgot password?
                    </Link>
                </div>
            </div>
            <Button type="submit" className="h-12 w-full bg-blue-500 text-white hover:bg-blue-600 rounded-lg text-base font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin"/> : 'Log In'}
            </Button>
            
            <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </form>
      </motion.div>
    </div>
  )
}
