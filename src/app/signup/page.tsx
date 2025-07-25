
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { useTransition, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const { signup, user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(async () => {
            try {
                await signup(email, password, fullName);
                toast({ title: 'Account Created', description: 'Welcome! You are now logged in.' });
                router.push('/dashboard');
            } catch (error: any) {
                 let errorMessage = 'An unexpected error occurred.';
                if (error.code) {
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            errorMessage = 'This email is already in use by another account.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'Please enter a valid email address.';
                            break;
                        case 'auth/weak-password':
                            errorMessage = 'The password is too weak. Please use at least 6 characters.';
                            break;
                        default:
                             errorMessage = 'Failed to create an account. Please try again later.';
                             break;
                    }
                }
                toast({ title: 'Signup Failed', description: errorMessage, variant: 'destructive' });
            }
        });
    };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center gap-3 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">ShiftWise</h1>
          </Link>
          <h2 className="text-2xl font-bold">Create an Account</h2>
          <p className="text-muted-foreground">
            Start optimizing your schedules in minutes.
          </p>
        </div>
        <Card>
            <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" required value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}/>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Create Account
            </Button>
            <p className="text-xs text-muted-foreground text-center">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>.
            </p>
          </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
