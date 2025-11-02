
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Github } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { app, db } from "@/lib/firebase" // Import the initialized app
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import AIBuddy from "@/components/ai-buddy"
import { collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';


const TypingBubble = () => {
    const [typedText, setTypedText] = useState('');
    const textToType = "Tutorin!";
    const baseText = "Ready to start ";
    
    useEffect(() => {
        const typingInterval = setInterval(() => {
            setTypedText(prev => {
                if (prev.length < textToType.length) {
                    return textToType.substring(0, prev.length + 1);
                } else {
                    clearInterval(typingInterval);
                    return prev;
                }
            });
        }, 150);

        return () => clearInterval(typingInterval);
    }, []);

    return (
        <div className="speech-bubble-typing">
            <p className="text-xl">
                {baseText}
                <span className="font-semibold text-blue-500">{typedText}</span>
                <span className="typing-cursor"></span>
            </p>
        </div>
    );
};


export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    if (!email || !password) {
        if (!email) setEmailError("Please enter your email.");
        if (!password) setPasswordError("Please enter your password.");
        return;
    }

    setIsLoading(true);
    try {
        const auth = getAuth(app);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        toast({
            title: "Logged In Successfully!",
            description: "Welcome back to your dashboard.",
        });

        // Check for a pending squad invitation
        const inviteCode = localStorage.getItem('squadInviteCode');
        if (inviteCode) {
            const squadsRef = collection(db, 'squads');
            const q = query(squadsRef, where('inviteCode', '==', inviteCode));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const squadDoc = querySnapshot.docs[0];
                await updateDoc(squadDoc.ref, {
                    members: arrayUnion(user.uid)
                });
                toast({ title: "Squad Joined!", description: `You've been added to ${squadDoc.data().name}.`});
            }
            localStorage.removeItem('squadInviteCode');
        }

        router.push('/dashboard');
    } catch (error: any) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/invalid-email':
                setEmailError("Invalid email. No account found with this email address.");
                break;
            case 'auth/wrong-password':
                setPasswordError("Invalid password. Please check your password and try again.");
                break;
            case 'auth/invalid-credential':
                 setEmailError("Invalid credentials. Please check your email and password.");
                 setPasswordError("Invalid credentials. Please check your email and password.");
                 break;
            default:
                setEmailError("An unexpected error occurred. Please try again.");
                console.error("Login error:", error);
        }
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left Section */}
      <div className="relative hidden w-7/12 flex-col items-center justify-center p-8 lg:flex">
        <div className="relative w-full max-w-4xl h-[700px] bg-neutral-900 rounded-2xl flex flex-col items-center justify-center">
             <div className="absolute top-20 text-center text-white w-full">
                <h1 className="text-6xl font-bold">Welcome Back</h1>
            </div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                    <AIBuddy isStatic={true} className="w-64 h-64" />
                    <div className="absolute top-1/2 -translate-y-full left-[calc(100%_-_80px)]">
                         <TypingBubble />
                    </div>
                </div>
            </div>
          </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full items-center justify-center bg-black p-6 lg:w-5/12">
        <div className="w-full max-w-md">
            <h2 className="mb-2 text-3xl font-bold text-white">Log In to Tutorin</h2>
            <p className="mb-8 text-gray-400">Enter your details to continue.</p>

            <div className="mb-8 grid gap-4">
              <Button variant="outline" className="h-12 border-gray-800 bg-gray-900 text-white hover:bg-gray-800">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
            </Button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-black px-2 text-gray-400">Or</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Input
                  className="h-12 border-gray-800 bg-gray-900 text-white placeholder:text-gray-400"
                  placeholder="example@email.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>

              <div className="space-y-2">
                <Input
                  className="h-12 border-gray-800 bg-gray-900 text-white placeholder:text-gray-400"
                  placeholder="YourbestPasword"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              </div>

              <Button type="submit" className="h-12 w-full bg-white text-black hover:bg-gray-100" disabled={isLoading}>
                {isLoading ? 'Logging In...' : 'Log In'}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-white hover:underline font-semibold">
                  Sign Up
                </Link>
              </p>
            </form>
        </div>
      </div>
    </div>
  )
}
