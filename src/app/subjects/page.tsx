
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Book,
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

const subjects = [
  { name: 'Mathematics', slug: 'mathematics', icon: PencilRuler },
  { name: 'Science', slug: 'science', icon: FlaskConical },
  { name: 'English', slug: 'english', icon: BookOpen },
  { name: 'History', slug: 'history', icon: Landmark },
  { name: 'Geography', slug: 'geography', icon: Globe },
  { name: 'Biology', slug: 'biology', icon: Dna },
  { name: 'Chemistry', slug: 'chemistry', icon: Beaker },
  { name: 'Physics', slug: 'physics', icon: Atom },
  { name: 'Computer Science', slug: 'computer-science', icon: Computer },
  { name: 'Art', slug: 'art', icon: Palette },
  { name: 'Music', slug: 'music', icon: Music },
  { name: 'Mythology', slug: 'mythology', icon: BookHeart },
  { name: 'Entertainment', slug: 'entertainment', icon: Film },
  { name: 'General Knowledge', slug: 'general-knowledge', icon: Lightbulb },
  { name: 'Current Affairs', slug: 'current-affairs', icon: Newspaper },
  { name: 'Environmental Science', slug: 'environmental-science', icon: Leaf },
  { name: 'Civics', slug: 'civics', icon: Scale },
  { name: 'Economics', slug: 'economics', icon: DollarSign },
  { name: 'Cooking', slug: 'cooking', icon: Soup },
];

export default function SubjectsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Subjects</h1>
        <p className="text-muted-foreground">
          Explore content across all available subjects.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {subjects.map((subject) => (
          <Link key={subject.slug} href={`/subjects/${subject.slug}`} passHref>
            <Card className="transition-colors cursor-pointer h-full transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:bg-accent hover:text-accent-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {subject.name}
                </CardTitle>
                <subject.icon className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  View all posts and videos related to {subject.name}.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
