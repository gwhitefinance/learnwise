
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
        title: "Account Created!",
        description: "Redirecting you to the learner type quiz...",
    });
    
    // Redirect to the learner type quiz
    router.push('/dashboard/learner-type');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
             <div className="flex justify-center mb-6">
                <Link href="/" className="flex items-center gap-2 text-foreground">
                   <BrainCircuit className="h-8 w-8 text-primary" />
                   <span className="font-bold text-2xl">LearnWise</span>
                </Link>
            </div>
            <Card>
                <CardHeader>
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>
                    Start your personalized learning journey today.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSignup}>
                    <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" placeholder="Sophia Chen" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        type="email"
                        placeholder="sophia@example.com"
                        required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                    </div>
                </form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/dashboard" className="underline">
                        Log in
                    </Link>
                </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
