
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { coinUsageConfig } from '@/lib/data';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SecretCodeDialog } from './secret-code-dialog';
import { Star, Database, Languages, LogOut } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { locales } from '@/lib/locales';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from './ui/skeleton';
import { signOutFromApp } from '@/lib/services/auth';

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


export function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, authLoading } = useAuth();
  const [isSecretCodeDialogOpen, setSecretCodeDialogOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleLanguageChange = (langCode: keyof typeof locales) => {
    if (!user) return;
    // English and Hindi are free
    if (langCode === 'en' || langCode === 'hi') {
        setLanguage(langCode);
        return;
    }
    
    // All other languages require coins
    if (user.coins < coinUsageConfig.languageTranslation) {
        toast({
            variant: 'destructive',
            title: 'Not Enough Coins',
            description: `You need ${coinUsageConfig.languageTranslation} coins to use the ${locales[langCode].language_name} language.`,
        });
        return;
    }
    
    // In a real app, you would debit the coins here.
    // For now, we'll just show a success message.
    setLanguage(langCode);
    toast({
        title: 'Language Unlocked!',
        description: `Enjoy EduVerse in ${locales[langCode].language_name}.`
    });
  }
  
  const handleAuthSuccess = () => {
    setSecretCodeDialogOpen(false);
    router.push('/parental-controls');
  }

  const handleSignOut = async () => {
    try {
      await signOutFromApp();
      toast({
        title: 'Signed Out',
        description: "You have been successfully signed out."
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: "There was an error signing out. Please try again."
      });
    }
  }

  if (authLoading || !mounted) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign In
        </Link>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <div className="flex items-center pt-2 gap-1">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold">
                  {user.coins} Knowledge Coins
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/subscription">Subscription</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setSecretCodeDialogOpen(true);
              }}
            >
              Parental Controls
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
           <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <span>Language</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {Object.entries(locales).map(([langCode, lang]) => (
                  <DropdownMenuItem key={langCode} onSelect={() => handleLanguageChange(langCode as keyof typeof locales)}>
                    {lang.language_name} 
                    {(langCode !== 'en' && langCode !== 'hi') && <Star className="ml-auto h-3 w-3 text-yellow-500"/>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SecretCodeDialog
        open={isSecretCodeDialogOpen}
        onOpenChange={setSecretCodeDialogOpen}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
