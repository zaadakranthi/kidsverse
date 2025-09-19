
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { CommandMenu } from '@/components/command-menu';
import { UserNav } from '@/components/user-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="relative flex-1">
        <CommandMenu />
      </div>
      <UserNav />
    </header>
  );
}
