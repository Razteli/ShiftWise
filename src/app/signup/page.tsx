
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
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(() => {
            // TODO: Implement actual signup logic
            console.log('Signup form submitted');
            // For now, just simulate a network request
            return new Promise(resolve => setTimeout(resolve, 1000));
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
              <Input id="name" type="text" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
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
