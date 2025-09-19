
'use client';

import Link from 'next/link';
import {
  Home,
  User,
  BookCopy,
  Users,
  ShoppingCart,
  Settings,
  Bot,
  Shield,
  Star,
  BrainCircuit,
  BookMarked,
  Clapperboard,
  GraduationCap,
  Heart,
  Rocket,
  Trophy,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import { SearchProvider } from '@/hooks/use-search';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { locales } from '@/lib/locales';

function IndianFlagIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 21 15"
            className={className}
            fill="none"
        >
            <path fill="#F93" d="M0 0h21v5H0z" />
            <path fill="#FFF" d="M0 5h21v5H0z" />
            <path fill="#128807" d="M0 10h21v5H0z" />
            <circle cx="10.5" cy="7.5" r="2" stroke="#008" strokeWidth="0.5" />
            <circle cx="10.5" cy="7.5" r="0.5" fill="#008" />
            <path
                stroke="#008"
                strokeWidth="0.1"
                d="M10.5 5.5v4M12.5 7.5h-4M11.9 6.1l-2.8 2.8M11.9 8.9l-2.8-2.8"
            />
        </svg>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = locales[language];

  return (
    <SearchProvider>
      <SidebarProvider>
          <Sidebar>
            <SidebarHeader className="p-4">
              <Link
                href="/"
                className="flex items-center gap-2"
                prefetch={false}
              >
                <div className="p-1.5 bg-primary rounded-lg">
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold font-headline">EduVerse</h1>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <Home />
                      {t.home}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {user && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/profile">
                      <User />
                      {t.profile}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                )}
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/chat">
                      <MessageSquare />
                      Chat
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/entertainment">
                      <Clapperboard />
                      {t.entertainment}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/quests">
                      <Rocket />
                      Quests
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/brain-games">
                      <BrainCircuit />
                      {t.brain_games}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/leaderboards">
                      <Trophy />
                      Leaderboards
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/subjects">
                      <BookCopy />
                      {t.subjects}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/tutors">
                      <GraduationCap />
                      {t.tutors}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/study-rooms">
                      <Users />
                      {t.study_rooms}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/shop">
                      <ShoppingCart />
                      {t.shop}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/subscription">
                      <Star />
                      {t.subscription}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {user?.role === 'teacher' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/my-classes">
                        <BookMarked />
                        {t.my_classes}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {user?.role === 'admin' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin">
                        <Shield />
                        {t.admin}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings />
                    {t.settings}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        <SidebarInset>
            <div className='flex justify-center items-center gap-2 py-1.5 bg-background text-foreground/80 text-xs font-medium'>
                <IndianFlagIcon className="w-4 h-auto" />
                Made in India, Made for India
                <Heart className="w-3 h-3 fill-red-500 text-red-500" />
            </div>
          <Header />
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  );
}
