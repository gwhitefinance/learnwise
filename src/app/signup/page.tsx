
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { app, db } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import Link from "next/link"
import AIBuddy from "@/components/ai-buddy"

const TypingBubble = () => {
    const [typedText, setTypedText] = useState('');
    const textToType = "Tutorin!";
    
    useEffect(() => {
        let i = 0;
        const typingInterval = setInterval(() => {
            if(i < textToType.length) {
                setTypedText(prev => prev + textToType.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 150);

        return () => clearInterval(typingInterval);
    }, []);

    return (
        <div className="speech-bubble-typing">
            <p className="text-xl">
                Ready to start <span className="font-semibold text-blue-500">{typedText}</span>
                <span className="typing-cursor"></span>
            </p>
        </div>
    );
};

const HalloweenBackground = () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 400" className="opacity-80">
            {/* -- Sky & Stars -- */}
            <rect width="400" height="400" fill="#0d1a26" />
            <g className="crescent-moon">
                <circle cx="350" cy="50" r="20" fill="#f0e68c" />
                <circle cx="340" cy="45" r="20" fill="#0d1a26" />
            </g>

            <circle cx="50" cy="80" r="1" fill="white" />
            <circle cx="150" cy="40" r="1.5" fill="white" />
            <circle cx="250" cy="90" r="1" fill="white" />
            <circle cx="320" cy="150" r="1" fill="white" />
            <circle cx="80" cy="180" r="1.2" fill="white" />
            
            {/* -- Bats -- */}
            <g className="bat-1">
              <path d="M10 10 C 15 5, 25 5, 30 10 L 20 15 Z" fill="black" />
            </g>
            <g className="bat-2">
              <path d="M50 30 C 55 25, 65 25, 70 30 L 60 35 Z" fill="black" />
            </g>
             <g className="bat-3">
              <path d="M100 20 C 105 15, 115 15, 120 20 L 110 25 Z" fill="black" />
            </g>

            {/* -- Trees -- */}
            <path d="M380 320 L370 250 L360 320 M370 250 L350 220 M370 250 L390 230" stroke="#222" strokeWidth="3" fill="none" />
            <path d="M20 320 L30 240 L40 320 M30 240 L10 210 M30 240 L50 220" stroke="#222" strokeWidth="4" fill="none" />

            {/* -- Ground -- */}
            <path d="M0 400 L0 320 C 100 300, 300 340, 400 320 L400 400 Z" fill="#2c1f21" />

            {/* -- Ghost -- */}
             <g className="ghost">
                <path d="M150 320 Q 170 280, 190 320 L180 315 L170 320 L160 315 Z" fill="white" />
                <circle cx="165" cy="305" r="3" fill="black" />
                <circle cx="175" cy="305" r="3" fill="black" />
            </g>

            {/* -- Gravestones -- */}
            <path d="M100 320 L100 260 A 20 20 0 0 1 140 260 L140 320 Z" fill="#4a4a4a" />
            <text x="120" y="290" fontFamily="serif" fontSize="20" fill="#333" textAnchor="middle">RIP</text>
            <g transform="rotate(-5 280 320)">
                <path d="M260 320 L260 270 Q 280 250 300 270 L300 320 Z" fill="#555555" />
            </g>

            {/* -- Pumpkins -- */}
            <g>
              <ellipse cx="60" cy="330" rx="30" ry="25" fill="#f57d00"/>
              <rect x="55" y="305" width="10" height="10" fill="green"/>
              <g className="pumpkin-face">
                <path d="M50 325 L45 320" stroke="black" strokeWidth="2" />
                <path d="M70 325 L75 320" stroke="black" strokeWidth="2" />
                <path d="M55 335 Q 60 340 65 335" stroke="black" strokeWidth="2" fill="none" />
                <g className="pumpkin-glow-1">
                    <path d="M50 325 L45 320" stroke="yellow" strokeWidth="2" />
                    <path d="M70 325 L75 320" stroke="yellow" strokeWidth="2" />
                </g>
              </g>
            </g>
            <g>
                <ellipse cx="200" cy="340" rx="25" ry="20" fill="#f57d00"/>
                <rect x="195" y="320" width="10" height="8" fill="darkgreen"/>
                 <g className="pumpkin-face">
                    <path d="M190 335 L185 330" stroke="black" strokeWidth="2" />
                    <path d="M210 335 L215 330" stroke="black" strokeWidth="2" />
                    <rect x="193" y="340" width="14" height="3" fill="black" />
                    <g className="pumpkin-glow-2">
                       <path d="M190 335 L185 330" stroke="yellow" strokeWidth="2" />
                       <path d="M210 335 L215 330" stroke="yellow" strokeWidth="2" />
                    </g>
                </g>
            </g>
            <ellipse cx="330" cy="335" rx="18" ry="15" fill="#f57d00"/>
            <rect x="326" y="320" width="8" height="6" fill="green"/>

            {/* -- Spider Web -- */}
            <g transform="translate(0, 0)">
                <path d="M 0 0 L 50 50" stroke="#aaa" strokeWidth="0.5" />
                <path d="M 25 0 L 50 50" stroke="#aaa" strokeWidth="0.5" />
                <path d="M 50 0 L 50 50" stroke="#aaa" strokeWidth="0.5" />
                <path d="M 0 25 L 50 50" stroke="#aaa" strokeWidth="0.5" />
                <path d="M 0 50 L 50 50" stroke="#aaa" strokeWidth="0.5" />
                <path d="M 0 10 Q 10 10, 10 0" stroke="#aaa" strokeWidth="0.5" fill="none" />
                <path d="M 0 20 Q 20 20, 20 0" stroke="#aaa" strokeWidth="0.5" fill="none" />
                <path d="M 0 30 Q 30 30, 30 0" stroke="#aaa" strokeWidth="0.5" fill="none" />
                <path d="M 0 40 Q 40 40, 40 0" stroke="#aaa" strokeWidth="0.5" fill="none" />
                <path d="M 10 50 Q 50 40, 50 10" stroke="#aaa" strokeWidth="0.5" fill="none" />
                <path d="M 20 50 Q 50 30, 50 20" stroke="#aaa" strokeWidth="0.5" fill="none" />
            </g>
        </svg>
    </div>
);


export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !firstName || !lastName) {
        toast({
            variant: "destructive",
            title: "Missing fields",
            description: "Please fill out all fields.",
        });
        return;
    }
    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Your password must be at least 8 characters long.',
      })
      return
    }

    setIsLoading(true);
    try {
        const auth = getAuth(app);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`
        });

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: `${firstName} ${lastName}`,
            email: user.email,
            createdAt: serverTimestamp(),
            coins: 0,
            level: 1,
            xp: 0,
        });

        toast({
            title: "Account Created!",
            description: "Welcome to Tutorin. Let's get you set up.",
        });
        router.push('/onboarding/grade-level');

    } catch (error: any) {
        let description = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/email-already-in-use') {
            description = "This email address is already in use. Please try another one or log in.";
        } else {
             console.error("Sign up error:", error);
        }
        
        toast({
            variant: "destructive",
            title: "Sign-up failed",
            description: description,
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left Section */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center p-8 lg:flex">
        <div className="relative w-full max-w-2xl h-[700px] bg-neutral-900 rounded-2xl flex flex-col items-center justify-center">
            <HalloweenBackground />
             <div className="absolute top-16 text-center text-white w-full">
                <h1 className="text-5xl font-bold">Welcome to Tutorin</h1>
            </div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                    <AIBuddy isStatic={true} className="w-64 h-64" />
                    <div className="absolute top-1/2 -translate-y-1/2 left-[calc(100%_-_80px)]">
                         <TypingBubble />
                    </div>
                </div>
            </div>
          </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full items-center justify-center bg-black p-6 lg:w-1/2">
        <div className="w-full max-w-md">
            <h2 className="mb-2 text-3xl font-bold text-white">Sign Up Account</h2>
            <p className="mb-8 text-gray-400">Enter your personal data to create your account.</p>

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
                Sign up with Google
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

            <form className="space-y-4" onSubmit={handleSignUp}>
                <div className="grid gap-4 md:grid-cols-2">
                    <Input
                        className="h-12 border-gray-800 bg-gray-900 text-white placeholder:text-gray-400"
                        placeholder="First Name"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                        className="h-12 border-gray-800 bg-gray-900 text-white placeholder:text-gray-400"
                        placeholder="Last Name"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
              <Input
                 className="h-12 border-gray-800 bg-gray-900 text-white placeholder:text-gray-400"
                placeholder="example@email.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="space-y-2">
                <Input
                    className="h-12 border-gray-800 bg-gray-900 text-white placeholder:text-gray-400"
                    placeholder="YourBestPassword"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                 <p className="text-xs text-gray-500">Must be at least 8 characters.</p>
              </div>

              <Button type="submit" className="h-12 w-full bg-white text-black hover:bg-gray-100" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 pt-8">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-white hover:underline">
                Log in
              </Link>
            </p>
        </div>
      </div>
    </div>
  )
}
