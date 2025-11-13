
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
    <div className="flex items-center justify-center h-screen w-screen relative overflow-hidden text-black">
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
