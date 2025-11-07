'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import Link from 'next/link';
import AIBuddy from '@/components/ai-buddy';
import { Eye, EyeOff, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';

const GoogleIcon = () => <svg height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path><path d="M1 1h22v22H1z" fill="none"></path></svg>;
const AppleIcon = () => <svg height="24" viewBox="0 0 24 24" width="24"><path d="M19.393 10.252c-.042-2.391 1.638-3.987 1.702-4.045-.042.018-1.42.864-2.815 2.44-1.332 1.492-2.205 3.73-1.93 5.95-.004.053 1.22 1.613 2.833 1.649 1.63-.031 2.083-1.077 2.1-1.11-.022-.01-1.802-1.002-1.89-3.884zm-5.46-2.298c-.85-.92-1.393-2.22-1.258-3.528-1.11.08-2.31.574-3.153 1.488-.868.916-1.584 2.22-1.474 3.572.98.173 2.132.695 3.03 1.54.787.727 1.28 1.94 1.47 3.23.11.724.238 1.44.43 2.12.062.215.13.43.203.642.067.18.15.34.25.49.12.18.26.31.42.41l.13.07c.045.023.09.04.14.06.23.09.49.15.77.16.05.004.1.004.15.004.05 0 .1 0 .15-.004.28-.01.54-.07.77-.16.05-.02.09-.03.14-.06l.13-.07c.16-.1.3-.23.42-.41.1-.15.18-.31.25-.49.07-.21.14-.42.2-.64.19-.68.32-1.4.43-2.12.16-1.07.57-2.11 1.23-2.92-1.1-.69-2.48-1.03-3.82-.9z"></path></svg>;
const CleverIcon = () => <svg height="24" viewBox="0 0 24 24" width="24" fill="none"><path d="M22.012 9.421a2.804 2.804 0 0 1 .098 3.513c-.91 1.46-2.522 2.65-4.482 2.65a4.852 4.852 0 0 1-4.707-3.328 4.792 4.792 0 0 1-.77-2.733c0-.98.293-1.894.794-2.65a4.852 4.852 0 0 1 4.683-3.328c1.96 0 3.573 1.19 4.482 2.65l-.098.226Z" fill="#29ADDF"></path><path d="m11.533 21.9-2.85-4.144a2.81 2.81 0 0 1-.955-1.912c0-.957.488-1.78 1.229-2.317.74-.538 1.718-.816 2.827-.816 1.034 0 1.95.235 2.706.726l.122-.098-1.558-2.674c-1.484-.24-3.14-.142-4.771.38-2.02.65-3.618 1.94-4.505 3.56a2.804 2.804 0 0 1 .098 3.513l6.56 10.632a2.81 2.81 0 0 1-1.903-.765Z" fill="#29ADDF"></path></svg>;
const ClasslinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 18 18"><path d="M9,2.8c-3.1,0-5.7,2.6-5.7,5.7s2.6,5.7,5.7,5.7s5.7-2.6,5.7-5.7S12.1,2.8,9,2.8z M9,13.2c-2.6,0-4.7-2.1-4.7-4.7s2.1-4.7,4.7-4.7s4.7,2.1,4.7,4.7S11.6,13.2,9,13.2z" fill="#00adee"></path><path d="M14,14.6c0,1.2-0.9,2.1-2.1,2.1H6.1c-1.2,0-2.1-0.9-2.1-2.1V13h1.1v1.6c0,0.6,0.5,1.1,1.1,1.1h5.7c0.6,0,1.1-0.5,1.1-1.1V13h1.1V14.6z" fill="#00adee"></path><path d="M12.9,3.5c1.2,0,2.1-0.9,2.1-2.1c0-0.6-0.5-1.1-1.1-1.1h-0.2H6.1c-0.6,0-1.1,0.5-1.1,1.1c0,1.2,0.9,2.1,2.1,2.1H12.9z" fill="#00adee"></path><path d="M9.6,9.2c-0.1-0.3-0.4-0.4-0.6-0.4c-0.3,0-0.6,0.2-0.6,0.4C8.3,9.4,8.4,9.6,9,9.6C9.5,9.6,9.7,9.4,9.6,9.2z" fill="#00adee"></path><path d="M10.1,8.1L10.1,8.1C10.1,8.1,10.1,8.1,10.1,8.1C10,7.6,9.5,7.2,9,7.2s-1,0.4-1,0.9c0,0.5,0.4,0.9,0.9,0.9l0,0h0.1l0,0c0,0,0,0,0,0c0.5,0,0.9-0.4,1-0.9L10.1,8.1z M9.1,8.5c-0.2,0-0.4-0.2-0.4-0.4c0-0.2,0.2-0.4,0.4-0.4c0.2,0,0.4,0.2,0.4,0.4C9.5,8.3,9.3,8.5,9.1,8.5z" fill="#00adee"></path><path d="M9.5,10.1c-0.2-0.2-0.5-0.2-0.7,0c0,0,0,0,0,0c-0.2,0.2-0.2,0.5,0,0.7c0,0,0,0,0,0C9,11,9.3,11,9.5,10.8c0,0,0,0,0,0C9.7,10.6,9.7,10.3,9.5,10.1z" fill="#00adee"></path></svg>;

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [hasEightChars, setHasEightChars] = useState(false);
  const [hasOneNumber, setHasOneNumber] = useState(false);

  useEffect(() => {
    setHasEightChars(password.length >= 8);
    setHasOneNumber(/\d/.test(password));
  }, [password]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasEightChars || !hasOneNumber) {
        toast({
            variant: "destructive",
            title: "Password requirements not met",
            description: "Please ensure your password is at least 8 characters long and contains a number.",
        });
        return;
    }

    setIsLoading(true);
    try {
        const auth = getAuth(app);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const displayName = email.split('@')[0];

        await updateProfile(user, { displayName });

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            coins: 0,
        });

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
                    displayName: displayName,
                    photoURL: user.photoURL || null
                });

                await batch.commit();

                toast({ title: "Squad Joined!", description: `You've been added to ${squadDoc.data().name}.`});
            }
            localStorage.removeItem('squadInviteCode');
        }

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
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-8">
            <Logo className="h-8 w-8" />
            <span className="text-2xl font-bold">Tutorin</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">The best all-in-one learning tool</h1>
        <p className="text-gray-500 mb-8">Sign up and study or teach for free.</p>
        
        <div className="space-y-4">
            <p className="font-semibold text-gray-700">Continue with</p>
            <div className="flex justify-between gap-2">
                <Button variant="outline" className="h-14 w-full flex-1 rounded-2xl"><GoogleIcon /></Button>
                <Button variant="outline" className="h-14 w-full flex-1 rounded-2xl"><AppleIcon /></Button>
                <Button variant="outline" className="h-14 w-full flex-1 rounded-2xl"><CleverIcon /></Button>
                <Button variant="outline" className="h-14 w-full flex-1 rounded-2xl"><ClasslinkIcon /></Button>
            </div>
        </div>

        <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form className="space-y-6" onSubmit={handleSignUp}>
            <div className="space-y-2">
                <label className="font-semibold text-gray-700">Email</label>
                <Input
                  className="h-14 bg-gray-100 border-transparent rounded-2xl text-base"
                  placeholder="example@email.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="font-semibold text-gray-700">Password</label>
                <div className="relative">
                    <Input
                      className="h-14 bg-gray-100 border-transparent rounded-2xl text-base pr-12"
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
                        {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold mb-2">Password requirements</p>
                <div className="flex flex-wrap gap-2 text-sm">
                    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full", hasEightChars ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                        {hasEightChars ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        <span>8 characters</span>
                    </div>
                     <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full", hasOneNumber ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                        {hasOneNumber ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        <span>1 number</span>
                    </div>
                </div>
            </div>

            <Button type="submit" className="h-14 w-full bg-[#14E2B5] text-black hover:bg-[#14E2B5]/90 rounded-full text-lg font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin"/> : 'Sign up'}
            </Button>
            
            <div className="text-center">
                <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-black hover:underline">
                        Log In
                    </Link>
                </p>
                <p className="text-xs text-gray-400 mt-6">
                    By signing up you agree to our{' '}
                    <Link href="#" className="underline">Terms of Service</Link> and{' '}
                    <Link href="#" className="underline">Privacy Policy</Link>
                </p>
            </div>
        </form>
      </div>
    </div>
  )
}
