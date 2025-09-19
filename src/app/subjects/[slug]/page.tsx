
'use client';

import { notFound } from 'next/navigation';
import { posts as initialPosts, addPost } from '@/lib/data';
import { PostCard } from '@/components/post-card';
import {
  FlaskConical,
  PencilRuler,
  Globe,
  Dna,
  Beaker,
  Atom,
  Computer,
  Palette,
  Music,
  Landmark,
  BookOpen,
  BookHeart,
  Film,
  Lightbulb,
  Newspaper,
  Leaf,
  Scale,
  DollarSign,
  Soup
} from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import { useState } from 'react';
import { Post } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const subjectDetails: Record<string, { name: string, icon: React.ElementType }> = {
    mathematics: { name: 'Mathematics', icon: PencilRuler },
    science: { name: 'Science', icon: FlaskConical },
    english: { name: 'English', icon: BookOpen },
    history: { name: 'History', icon: Landmark },
    geography: { name: 'Geography', icon: Globe },
    biology: { name: 'Biology', icon: Dna },
    chemistry: { name: 'Chemistry', icon: Beaker },
    physics: { name: 'Physics', icon: Atom },
    'computer-science': { name: 'Computer Science', icon: Computer },
    art: { name: 'Art', icon: Palette },
    music: { name: 'Music', icon: Music },
    mythology: { name: 'Mythology', icon: BookHeart },
    entertainment: { name: 'Entertainment', icon: Film },
    'general-knowledge': { name: 'General Knowledge', icon: Lightbulb },
    'current-affairs': { name: 'Current Affairs', icon: Newspaper },
    'environmental-science': { name: 'Environmental Science', icon: Leaf },
    civics: { name: 'Civics', icon: Scale },
    economics: { name: 'Economics', icon: DollarSign },
    cooking: { name: 'Cooking', icon: Soup },
};


export default function SubjectPage({ params }: { params: { slug: string } }) {
  const { user: currentUser } = useAuth();
  const { slug } = params;
  const { searchQuery } = useSearch();
  const subject = subjectDetails[slug];
  const [posts, setPosts] = useState(() => initialPosts.filter(p => p.subject.toLowerCase() === subject?.name.toLowerCase()));

  if (!subject) {
    notFound();
  }

  const filteredPosts = posts.filter(post => {
      const subjectMatch = post.subject.toLowerCase() === subject.name.toLowerCase();
      const searchMatch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) || post.user.name.toLowerCase().includes(searchQuery.toLowerCase());
      return subjectMatch && searchMatch;
  });

  const Icon = subject.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Icon className="h-10 w-10 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline">{subject.name}</h1>
            <p className="text-muted-foreground">
                Browse all posts and questions for {subject.name}.
            </p>
        </div>
      </div>
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <h3 className="text-xl font-medium">No posts found for {subject.name}</h3>
            <p className="text-muted-foreground">Try adjusting your search or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
