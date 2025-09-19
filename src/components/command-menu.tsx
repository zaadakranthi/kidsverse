
'use client';

import * as React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Search, User, BookCopy, BrainCircuit, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/use-search';
import { Post, Game, Tutor } from '@/lib/types';
import { getPosts } from '@/lib/services/posts';
import { getGames } from '@/lib/services/games';
import { getTutors } from '@/lib/services/users';

const subjects = [
  { name: 'Mathematics', slug: 'mathematics' },
  { name: 'Science', slug: 'science' },
  { name: 'English', slug: 'english' },
  { name: 'History', slug: 'history' },
  { name: 'Geography', slug: 'geography' },
  { name: 'Biology', slug: 'biology' },
  { name: 'Chemistry', slug: 'chemistry' },
  { name: 'Physics', slug: 'physics' },
];

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const router = useRouter();
  
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [games, setGames] = React.useState<Game[]>([]);
  const [tutors, setTutors] = React.useState<Tutor[]>([]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  React.useEffect(() => {
    if (open) {
      const fetchSearchData = async () => {
        const [fetchedPosts, fetchedGames, fetchedTutors] = await Promise.all([
          getPosts(),
          getGames(),
          getTutors()
        ]);
        setPosts(fetchedPosts);
        setGames(fetchedGames);
        setTutors(fetchedTutors);
      };
      fetchSearchData();
    }
  }, [open]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  }

  const filteredTutors = tutors.filter(tutor => tutor.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3);
  const filteredGames = games.filter(game => game.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3);
  const filteredSubjects = subjects.filter(subject => subject.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3);
  const filteredPosts = posts.filter(post => post.content.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3);

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground md:w-[300px] lg:w-[400px]"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="truncate">Search for videos, questions...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
            placeholder="Type a command or search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {filteredTutors.length > 0 && (
            <CommandGroup heading="Tutors">
              {filteredTutors.map(tutor => (
                  <CommandItem key={tutor.userId} onSelect={() => runCommand(() => router.push('/tutors'))}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <span>{tutor.name}</span>
                  </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredGames.length > 0 && (
            <CommandGroup heading="Brain Games">
                {filteredGames.map(game => (
                    <CommandItem key={game.id} onSelect={() => runCommand(() => router.push(`/brain-games/${game.slug}`))}>
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        <span>{game.title}</span>
                    </CommandItem>
                ))}
            </CommandGroup>
          )}

          {filteredSubjects.length > 0 && (
             <CommandGroup heading="Subjects">
                {filteredSubjects.map(subject => (
                     <CommandItem key={subject.slug} onSelect={() => runCommand(() => router.push(`/subjects/${subject.slug}`))}>
                        <BookCopy className="mr-2 h-4 w-4" />
                        <span>{subject.name}</span>
                    </CommandItem>
                ))}
            </CommandGroup>
          )}
          
           {filteredPosts.length > 0 && (
            <CommandGroup heading="Posts">
                {filteredPosts.map(post => (
                    <CommandItem key={post.id} onSelect={() => runCommand(() => router.push('/'))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>{post.content.substring(0, 50)}...</span>
                    </CommandItem>
                ))}
            </CommandGroup>
           )}

        </CommandList>
      </CommandDialog>
    </>
  );
}
