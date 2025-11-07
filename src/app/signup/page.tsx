
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
import { Eye, EyeOff, X, Check, Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';

const testimonials = [
  { rating: 5, text: "THIS APP IS SO HELPFUL. I'm so glad I've been introduced to this app. I don't like long sessions and Knowt just gets straight to the point! 100% recommend", author: "@hayatreviews" },
  { rating: 5, text: "This is honestly beating Quizlet. Knowt is an awesome alternative to the money-hungry Quizlet.", author: "@Zachary76841" },
  { rating: 5, text: "Unbelievable. This is hands down the best tool I have ever used in my life!! i just can't believe more people don't know about this (thank you Reddit).", author: "@BMarieMarris" },
  { rating: 5, text: "Knowt is the best flashcard app. Imagine the functionality of Anki with the ease of use of Quizlet wrapped into a free application. Thats Knowt. 10/10", author: "@dogyogurt12" },
  { rating: 5, text: "Knowt CHANGED MY LIFE. The most amazing app ever and I owe it all my successes. Not only are quiz and studying features free that aren't on quizlet, but they have amazing resources for AP tests.", author: "@knowt" },
  { rating: 5, text: "i could marry this app. thought I had no hope in passing my ap's, especially ap macro, but after I downloaded this app not even 15 days before the exam i somehow managed to get a 5 on ap macro?? This app does miracles", author: "@user123" },
  { rating: 5, text: "Saved me for my AP exam. This the reason I passed my AP exam. I had no idea what my teacher was teaching fr and this would be my first Ap exam and I swear I would fail if it wasn't for this app...", author: "@gamedestoer" },
  { rating: 5, text: "Quizlet is Doomed! This is one of my favorite apps. I'm memorizing speeches so much faster. It seems Quizlet has a scrappy competitor snapping at its heels...", author: "@BullMoose2020" },
];

const TestimonialCard = ({ rating, text, author }: { rating: number, text: string, author: string }) => (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
            ))}
        </div>
        <p className="text-white/80 text-sm mb-2">{text}</p>
        <p className="text-white/50 text-xs font-medium">{author}</p>
    </div>
);


const TestimonialGrid = () => {
    const duplicatedTestimonials = [...testimonials, ...testimonials];
    return (
        <div className="absolute inset-0 h-full w-full overflow-hidden">
            <div className="grid grid-cols-4 gap-8">
                {[...Array(4)].map((_, colIndex) => (
                    <motion.div
                        key={colIndex}
                        className="flex flex-col gap-8"
                        animate={{ y: ['-50%', '0%'] }}
                        transition={{ duration: 40 + colIndex * 10, repeat: Infinity, ease: 'linear' }}
                    >
                        {duplicatedTestimonials.map((testimonial, index) => (
                            <TestimonialCard key={`${colIndex}-${index}`} {...testimonial} />
                        ))}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};


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
    <div className="flex items-center justify-center min-h-screen bg-gray-800 p-4 relative overflow-hidden">
      <TestimonialGrid />
      <motion.div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="text-center">
            <div className="w-48 h-32 mx-auto -mt-24">
                <AIBuddy />
            </div>
            <h1 className="text-3xl font-bold mb-2">Join the party.</h1>
        </div>
        
        <form className="space-y-4 mt-6" onSubmit={handleSignUp}>
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
            </div>

             <div className="flex flex-wrap gap-2 text-xs">
                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full", hasEightChars ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                    {hasEightChars ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>8 characters</span>
                </div>
                 <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full", hasOneNumber ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                    {hasOneNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>1 number</span>
                </div>
            </div>

            <Button type="submit" className="h-12 w-full bg-blue-500 text-white hover:bg-blue-600 rounded-lg text-base font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin"/> : 'Sign up'}
            </Button>
            
            <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-blue-500 hover:underline">
                        Log In
                    </Link>
                </p>
                 <p className="text-xs text-gray-400 mt-4">
                    By signing up you agree to our{' '}
                    <Link href="#" className="underline">Terms</Link> and{' '}
                    <Link href="#" className="underline">Privacy Policy</Link>
                </p>
            </div>
        </form>
      </motion.div>
    </div>
  )
}
