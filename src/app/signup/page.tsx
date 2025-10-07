
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
    const [text, setText] = useState('');
    const fullText = "Ready to start tutorin!";
    
    useEffect(() => {
        let i = 0;
        const typingInterval = setInterval(() => {
            if(i < fullText.length) {
                setText(prev => prev + fullText.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, []);

    return (
        <div className="speech-bubble-typing">
            <p className="text-xl">
                {text}
                <span className="typing-cursor"></span>
            </p>
        </div>
    );
};

const HalloweenBackground = () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 400" className="opacity-80">
            {/* Ground */}
            <path d="M0 400 L0 320 C 100 300, 300 340, 400 320 L400 400 Z" fill="#2c1f21" />

            {/* Gravestone 1 */}
            <path d="M100 320 L100 260 A 20 20 0 0 1 140 260 L140 320 Z" fill="#4a4a4a" />
            <text x="120" y="290" fontFamily="serif" fontSize="20" fill="#333" textAnchor="middle">RIP</text>
            
            {/* Gravestone 2 (crooked) */}
            <g transform="rotate(-5 280 320)">
                <path d="M260 320 L260 270 Q 280 250 300 270 L300 320 Z" fill="#555555" />
            </g>

            {/* Pumpkin 1 */}
            <ellipse cx="60" cy="330" rx="30" ry="25" fill="#f57d00"/>
            <rect x="55" y="305" width="10" height="10" fill="green"/>
            <path d="M50 325 L45 320" stroke="black" strokeWidth="2" />
            <path d="M70 325 L75 320" stroke="black" strokeWidth="2" />

            {/* Pumpkin 2 */}
            <ellipse cx="200" cy="340" rx="25" ry="20" fill="#f57d00"/>
            <rect x="195" y="320" width="10" height="8" fill="darkgreen"/>
            <path d="M190 335 L185 330" stroke="black" strokeWidth="2" />
            <path d="M210 335 L215 330" stroke="black" strokeWidth="2" />

             {/* Pumpkin 3 (small) */}
            <ellipse cx="330" cy="335" rx="18" ry="15" fill="#f57d00"/>
            <rect x="326" y="320" width="8" height="6" fill="green"/>
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
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-background p-6">
      
      <div className="hidden lg:flex w-1/2 items-center justify-center relative">
          <div className="relative w-[400px] h-[400px] bg-neutral-900 rounded-2xl flex items-center justify-center">
            <HalloweenBackground />
            <div className="relative z-10">
                <AIBuddy isStatic={true} className="w-64 h-64" />
            </div>
            <div className="absolute top-1/2 -translate-y-full left-[calc(50%_+_90px)] z-20">
                <TypingBubble />
            </div>
          </div>
      </div>

      <div className="w-full max-w-md lg:w-1/2">
        <div className="text-center lg:text-left mb-8">
            <h2 className="mt-6 text-3xl font-bold">Create Your Account</h2>
            <p className="mt-2 text-muted-foreground">Join Tutorin to start learning smarter.</p>
        </div>

        <div className="space-y-4">
             <Button variant="outline" className="w-full h-12">
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSignUp}>
                <div className="grid gap-4 md:grid-cols-2">
                    <Input
                        placeholder="First Name"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-12"
                    />
                    <Input
                        placeholder="Last Name"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12"
                    />
                </div>
              <Input
                placeholder="example@email.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
              <Input
                placeholder="Password (min. 8 characters)"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />

              <Button type="submit" className="h-12 w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground pt-4">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
        </div>
      </div>
    </div>
  )
}
