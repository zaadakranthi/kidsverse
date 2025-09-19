
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/services/auth';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691c-1.645 3.119-2.625 6.637-2.625 10.309C3.681 31.363 5.5 35.089 8.134 37.892l6.19-4.853c-1.393-1.815-2.22-3.98-2.22-6.223c0-2.31.898-4.52 2.408-6.216l-6.203-4.801z"
      />
      <path
        fill="#4CAF50"
        d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-6.19-4.853C29.183 40.233 26.75 42 24 42c-4.757 0-8.836-2.83-10.636-6.836l-6.203 4.801C10.151 44.259 16.6 48 24 48z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083L43.595 20L42 20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 4.853c3.433-3.162 5.594-7.818 5.594-13.424c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}


export default function LoginPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      toast({
        title: 'Successfully signed in!',
        description: 'Welcome back to EduVerse.',
      });
      router.push('/');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: 'There was an error signing in with Google. Please try again.',
      });
    } finally {
        setIsSigningIn(false);
    }
  };

  if (authLoading || user) {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
            <div className="text-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Bot className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-headline">Welcome to EduVerse</CardTitle>
          <CardDescription>Sign in to continue your learning journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoogleSignIn} disabled={isSigningIn}>
            {isSigningIn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <GoogleIcon className="mr-2 h-5 w-5" />
            )}
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  );
}
