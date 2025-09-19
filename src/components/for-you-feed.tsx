
'use client';

import { recommendContent } from '@/ai/flows/recommend-content';
import { coinUsageConfig } from '@/lib/data';
import { Post, User } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Terminal, Star } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { PostCard } from './post-card';
import { useLanguage } from '@/hooks/use-language';
import { translateText } from '@/ai/flows/translate-text';
import { Button } from './ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getPosts } from '@/lib/services/posts';

type TranslatedPost = Post & {
    originalContent: string;
    originalSubject: string;
}

const sponsorUser: User = {
    id: 'u5',
    name: 'Sponsor Brand',
    sudoName: 'sponsor_brand',
    email: 'contact@sponsor.com',
    role: 'admin',
    avatar: 'https://placehold.co/100x100/e2e8f0/e2e8f0',
    class: '',
    school: '',
    syllabus: '',
    area: '',
    state: '',
    languages: [],
    sports: [],
    willing_to_tutor: false,
    coins: 0,
    transactions: [],
    achievements: [],
    following: [],
    parental_controls: {
      max_screen_time: 0,
      history_enabled: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
};

const sponsoredPost: Post = {
    id: 'sp1',
    authorInfo: {
        id: sponsorUser.id,
        name: sponsorUser.name,
        sudoName: sponsorUser.sudoName,
        avatar: sponsorUser.avatar,
    },
    timestamp: 'Sponsored',
    type: 'video',
    content: 'Unlock your potential with the new "Future Genius" learning tablet. Faster, smarter, and designed for students. Available now in the marketplace!',
    imageUrl: 'https://picsum.photos/seed/sp1/600/400',
    likes: 1340,
    comments: [],
    commentsCount: 0,
    shares: 250,
    subject: 'Tech for Students',
    class: 'All',
    isSponsored: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};


export function ForYouFeed() {
  const { user } = useAuth();
  const [localUser, setLocalUser] = useState<User | null>(user);
  const [recommendations, setRecommendations] = useState<Post[]>([]);
  const [translatedRecommendations, setTranslatedRecommendations] = useState<TranslatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const { toast } = useToast();
  
  const languageName = useMemo(() => t.language_name, [t]);
  
  const useAiRecommendations = localUser && localUser.coins >= coinUsageConfig.aiRecommendations;

  const getRecommendations = async () => {
      if (!localUser) {
        setLoading(false);
        return;
      };

      try {
        setLoading(true);
        setError(null);
        
        let finalPosts: Post[];

        if (useAiRecommendations) {
            // In a real app, you would transact the coin debit here.
            // For this demo, we assume it's "debited" upon successful load.
            const result = await recommendContent({
              studentClass: localUser.class,
              studentSchool: localUser.school,
              studentInterests: ['Cricket', 'Coding'], // Hardcoded for now
              recentActivity: ['Mathematics', 'Physics'], // Hardcoded for this example
              contentTypes: ['video', 'qa'],
              numberOfRecommendations: 5,
            });
            
            // Map the recommendation output to the Post type to use PostCard
            finalPosts = result.map((item, index) => {
                return {
                    id: `rec-${index}`,
                    authorInfo: {
                        id: `user-rec-${index}`,
                        name: item.source,
                        sudoName: item.source.toLowerCase().replace(' ', '_'),
                        avatar: `https://picsum.photos/seed/rec-user-${index}/100/100`
                    },
                    timestamp: 'Just now',
                    type: item.contentType,
                    content: item.reason, // Use reason as main content for the card
                    imageUrl: item.url,
                    likes: Math.floor(Math.random() * 200),
                    comments: [],
                    commentsCount: 0,
                    shares: Math.floor(Math.random() * 50),
                    subject: item.title, // Use title as subject
                    class: localUser.class,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Post;
            });
        } else {
            // Fallback for users with not enough coins
            const allPosts = await getPosts();
            finalPosts = allPosts.slice(0, 5);
        }
        
        // Intersperse a sponsored post
        if (finalPosts.length > 2) {
            finalPosts.splice(2, 0, sponsoredPost);
        } else {
            finalPosts.push(sponsoredPost);
        }

        setRecommendations(finalPosts);
      } catch (e: any) {
        console.error(e);
        setError('Failed to load AI recommendations. Showing recent posts instead.');
        // Fallback to showing all posts if recommendation engine fails
        const allPosts = await getPosts();
        const fallbackPosts = [...allPosts].slice(0, 5);
        if (fallbackPosts.length > 2) {
            fallbackPosts.splice(2, 0, sponsoredPost);
        } else {
            fallbackPosts.push(sponsoredPost);
        }
        setRecommendations(fallbackPosts);
      } finally {
        setLoading(false);
      }
    }


  useEffect(() => {
    if (user) {
        setLocalUser(user);
    }
    getRecommendations();
  }, [useAiRecommendations, user]);

  useEffect(() => {
    async function getTranslations() {
        if (language === 'en' || recommendations.length === 0 || !localUser) {
            setTranslatedRecommendations(recommendations.map(p => ({...p, originalContent: p.content, originalSubject: p.subject })));
            return;
        }

        setTranslating(true);
        try {
            if (localUser.coins < coinUsageConfig.languageTranslation) {
                toast({
                    variant: 'destructive',
                    title: 'Not Enough Coins',
                    description: `You need ${coinUsageConfig.languageTranslation} coins to use translation.`,
                });
                 setTranslatedRecommendations(recommendations.map(p => ({...p, originalContent: p.content, originalSubject: p.subject })));
                 return;
            }
             // In a real app, you would transact the coin debit here.
            
            const translated = await Promise.all(recommendations.map(async (post) => {
                 if (post.isSponsored) {
                    return {
                        ...post,
                        originalContent: post.content,
                        originalSubject: post.subject,
                    }
                }
                const [contentTranslation, subjectTranslation] = await Promise.all([
                    translateText({ text: post.content, targetLanguage: languageName }),
                    translateText({ text: post.subject, targetLanguage: languageName }),
                ]);

                return {
                    ...post,
                    content: contentTranslation.translation,
                    subject: subjectTranslation.translation,
                    originalContent: post.content,
                    originalSubject: post.subject,
                };
            }));
            setTranslatedRecommendations(translated);
        } catch (e) {
            console.error('Translation failed', e);
            // Fallback to original content if translation fails
            setTranslatedRecommendations(recommendations.map(p => ({...p, originalContent: p.content, originalSubject: p.subject })));
        } finally {
            setTranslating(false);
        }

    }
    getTranslations();
  }, [language, languageName, recommendations, toast, localUser])

  if (loading || translating) {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <PostCard.Skeleton key={i} />
            ))}
        </div>
    );
  }

  if (!localUser) return null;

  return (
    <div className="space-y-4">
       {error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                    <AlertTitle>Recommendations Unavailable</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        )}
        {!useAiRecommendations && (
             <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>Want Better Recommendations?</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                   <div>
                     <p>Get an AI-powered feed for just {coinUsageConfig.aiRecommendations} coins per use!</p>
                     <p className="text-xs">Your current balance: {localUser.coins} coins.</p>
                   </div>
                   <Button asChild><Link href="/subscription">Buy Coins</Link></Button>
                </AlertDescription>
            </Alert>
        )}
      {translatedRecommendations.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
