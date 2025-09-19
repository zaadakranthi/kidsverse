
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  achievements,
  pointsConfig as initialPointsConfig,
  coinUsageConfig as initialCoinUsageConfig,
  coinPackages as initialCoinPackages,
} from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, UserX, UserCheck, DollarSign, BookOpen, Users as UsersIcon, Eye, Percent, Award, PlusCircle, UserPlus, MessageSquare, Gamepad2, Puzzle, Activity, Handshake, Edit, Trash2, Clapperboard, FileQuestion, Bot, Languages, IndianRupee, Download, Database, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FlaggedContent, Partner, PartnerCourse, CoinUsageConfig, CoinPackage, User, Post, Comment, Game, TeacherClass } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { PartnerCourseDialog } from '@/components/partner-course-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PartnerDialog } from '@/components/partner-dialog';
import { Separator } from '@/components/ui/separator';
import { downloadAsCsv } from '@/lib/utils';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { seedDatabase } from '@/app/admin/actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// MOCK DATA - in a real app this would be fetched from a service
const MOCK_DATA = {
    flaggedContent: [
        { id: 'fc1', contentId: 'p3', contentType: 'video' as const, flaggedBy: { id: 'u3', name: 'Chloe Davis', sudoName: 'art_whiz', avatar: 'https://picsum.photos/seed/u3/100/100' }, reason: 'HARM_CATEGORY_HATE_SPEECH', timestamp: '1 day ago', status: 'pending' as const },
        { id: 'fc2', contentId: 'c1', contentType: 'comment' as const, flaggedBy: { id: 'u2', name: 'Benny Smith', sudoName: 'code_ninja', avatar: 'https://picsum.photos/seed/u2/100/100' }, reason: 'HARM_CATEGORY_HARASSMENT', timestamp: '2 hours ago', status: 'pending' as const }
    ],
    posts: [
        { id: 'p3', content: "Let's break down Shakespeare's..." }
    ],
    comments: [
        { id: 'c1', text: 'Great explanation!' }
    ],
    users: [
        { id: 'u1', role: 'student', name: 'Alex Johnson', sudoName: 'rising_star', email: 'alex.j@example.com', avatar: 'https://picsum.photos/seed/u1/100/100', class: '10th', school: 'Maple High'},
        { id: 'u2', role: 'student', name: 'Benny Smith', sudoName: 'code_ninja', email: 'benny.s@example.com', avatar: 'https://picsum.photos/seed/u2/100/100', class: '9th', school: 'Oakwood Academy'},
    ],
    products: [
        { id: 'prod1', name: 'Premium Notebook Set', category: 'Stationery', price: 450 },
        { id: 'prod2', name: 'Advanced Mathematics Guide', category: 'Books', price: 750 },
        { id: 'prod3', name: 'Mechanical Pencil & Lead Set', category: 'Stationery', price: 250 },
    ],
    teacherClasses: [
        { id: 'tc1', teacher: { id: 'u4', name: 'Mr. Garcia', sudoName: 'prof_garcia', avatar: 'https://picsum.photos/seed/u4/100/100' }, className: 'Advanced Calculus', subject: 'Mathematics', enrolled: 25, status: 'Ongoing' as const, price: 1500 },
        { id: 'tc2', teacher: { id: 'u4', name: 'Mr. Garcia', sudoName: 'prof_garcia', avatar: 'https://picsum.photos/seed/u4/100/100' }, className: 'Shakespeare Deep-Dive', subject: 'English', enrolled: 18, status: 'Upcoming' as const, price: 1200 },
    ],
    games: [
        { id: 'g1', slug: 'math-puzzles', title: 'Math Puzzles', gameType: 'Math Puzzle', creator: { id: 'u4', name: 'Mr. Garcia', sudoName: 'prof_garcia', avatar: 'https://picsum.photos/seed/u4/100/100' }, questions: [ {question: 'q', options: ['a', 'b', 'c', 'd'], correctAnswer: 'a'}]},
        { id: 'g2', slug: 'indian-history-challenge', title: 'Indian History Challenge', gameType: 'Quiz', creator: { id: 'u4', name: 'Mr. Garcia', sudoName: 'prof_garcia', avatar: 'https://picsum.photos/seed/u4/100/100' }, questions: [{question: 'q', options: ['a', 'b', 'c', 'd'], correctAnswer: 'a'}]}
    ],
    partners: [
       { name: 'Publisher A', slug: 'publisher-a', logo: 'https://placehold.co/120x60/white/black?text=Partner+A', description: '...', coursesOffered: 45, studentsEnrolled: 12000, featuredCourses: [ { id: 'fc1', title: 'Interactive Physics Lab', description: '...', imageUrl: 'https://picsum.photos/seed/fc1/600/400', price: 2999, duration: '12 Weeks', mode: 'Online' as const } ]}
    ]
}


export default function AdminPage() {
  const { toast } = useToast();
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>(MOCK_DATA.flaggedContent);
  const [salesCommission, setSalesCommission] = useState(10);
  const [classCommission, setClassCommission] = useState(15);
  const [pointsConfig, setPointsConfig] = useState(initialPointsConfig);
  const [coinUsageConfig, setCoinUsageConfig] = useState<CoinUsageConfig>(initialCoinUsageConfig);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>(initialCoinPackages);
  
  // State for Partner Portal
  const [partners, setPartners] = useState<Partner[]>(MOCK_DATA.partners as Partner[]);
  const [currentPartnerId, setCurrentPartnerId] = useState<string | undefined>(MOCK_DATA.partners[0]?.slug);
  const currentPartner = partners.find(p => p.slug === currentPartnerId);

  // Dialog states for partners
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<PartnerCourse | undefined>(undefined);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<Partner | undefined>(undefined);
  const [isSeeding, setIsSeeding] = useState(false);
  const canSeed = process.env.NEXT_PUBLIC_CAN_SEED_DATABASE === 'true';

  const studentUsers = MOCK_DATA.users.filter(user => user.role === 'student');

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    toast({
      title: "Database Seeding Started",
      description: "Populating Firestore with sample data. This may take a moment...",
    });
    try {
      await seedDatabase();
      toast({
        title: "Database Seeding Successful",
        description: "Your Firestore database has been populated with sample data.",
      });
    } catch (error) {
      console.error("Database seeding failed:", error);
      toast({
        variant: "destructive",
        title: "Database Seeding Failed",
        description: "Could not populate database. Check the console for errors.",
      });
    } finally {
      setIsSeeding(false);
    }
  };


  const handleApprove = (id: string) => {
    toast({
      title: 'Content Approved',
      description: 'The selected content has been marked as safe.',
    });
    setFlaggedContent(flaggedContent.filter(item => item.id !== id));
  };

  const handleReject = (id: string) => {
    setFlaggedContent(prev => prev.filter(item => item.id !== id));
    toast({
      variant: 'destructive',
      title: 'Content Rejected',
      description: 'The selected content has been removed.',
    });
  };

  const getContentPreview = (item: FlaggedContent) => {
    if (item.contentType === 'comment') {
        const comment = MOCK_DATA.comments.find(c => c.id === item.contentId);
        return `Comment: "${comment?.text}"`;
    }
    const post = MOCK_DATA.posts.find(p => p.id === item.contentId);
    return `Post: "${post?.content.substring(0, 50)}..."`;
  }
  
  const handleSaveSalesCommission = () => {
    toast({
        title: "Settings Saved",
        description: `E-commerce commission updated to ${salesCommission}%.`
    })
  }

  const handleSaveClassCommission = () => {
     toast({
        title: "Settings Saved",
        description: `Live class commission updated to ${classCommission}%.`
    })
  }

  const handlePointsConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPointsConfig(prev => ({ ...prev, [name]: Number(value) }));
  }
  
  const handleCoinUsageConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCoinUsageConfig(prev => ({ ...prev, [name]: Number(value) }));
  }


  const handleSavePointsConfig = () => {
    toast({
        title: "Points System Updated",
        description: "The Knowledge Coin reward values have been saved."
    })
  }
  
   const handleSaveCoinUsageConfig = () => {
    toast({
        title: "Coin Costs Updated",
        description: "The coin costs for AI features have been saved."
    })
  }

  // --- Partner Portal Logic ---
  const handleAddCourse = () => {
    setCourseToEdit(undefined);
    setIsCourseDialogOpen(true);
  };

  const handleEditCourse = (course: PartnerCourse) => {
    setCourseToEdit(course);
    setIsCourseDialogOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    setPartners(prevPartners => prevPartners.map(p => 
        p.slug === currentPartnerId 
        ? { ...p, featuredCourses: p.featuredCourses.filter(c => c.id !== courseId) } 
        : p
    ));
    toast({
        variant: 'destructive',
        title: 'Course Deleted',
        description: 'The course has been removed from your listings.'
    })
  };

  const handleSaveCourse = (courseData: Omit<PartnerCourse, 'id'>) => {
    const partnerIndex = partners.findIndex(p => p.slug === currentPartnerId);
    if(partnerIndex === -1) return;

    if(courseToEdit) { // Editing existing course
        const updatedCourses = currentPartner?.featuredCourses.map(c => 
            c.id === courseToEdit.id ? { ...c, ...courseData } : c
        ) ?? [];
         setPartners(prev => prev.map(p => p.slug === currentPartnerId ? { ...p, featuredCourses: updatedCourses } : p));
        toast({ title: "Course Updated", description: "Your course has been successfully updated."});
    } else { // Adding new course
         const newCourse: PartnerCourse = { ...courseData, id: `course-${Date.now()}`};
         setPartners(prev => prev.map(p => p.slug === currentPartnerId ? { ...p, featuredCourses: [...p.featuredCourses, newCourse] } : p));
         toast({ title: "Course Added", description: "Your new course has been listed."});
    }
    setIsCourseDialogOpen(false);
  };

  const handleAddPartner = () => {
    setPartnerToEdit(undefined);
    setIsPartnerDialogOpen(true);
  }

  const handleEditPartner = (partner: Partner) => {
    setPartnerToEdit(partner);
    setIsPartnerDialogOpen(true);
  }

  const handleDeletePartner = (partnerSlug: string) => {
    if (partners.length <= 1) {
        toast({ variant: 'destructive', title: "Cannot Delete", description: "You must have at least one partner." });
        return;
    }
    const newPartners = partners.filter(p => p.slug !== partnerSlug)
    setPartners(newPartners);
    if (currentPartnerId === partnerSlug) {
        setCurrentPartnerId(newPartners[0]?.slug);
    }
    toast({ variant: 'destructive', title: "Partner Deleted", description: "The partner has been removed." });
  }

  const handleSavePartner = (partnerData: Omit<Partner, 'slug' | 'featuredCourses' | 'coursesOffered' | 'studentsEnrolled'>) => {
    if (partnerToEdit) { // Editing existing partner
        setPartners(prev => prev.map(p => p.slug === partnerToEdit.slug ? { ...p, ...partnerData } : p));
        toast({ title: "Partner Updated", description: `${partnerData.name} has been updated.` });
    } else { // Adding new partner
        const newPartner: Partner = {
            ...partnerData,
            slug: partnerData.name.toLowerCase().replace(/\s+/g, '-'),
            featuredCourses: [],
            coursesOffered: 0,
            studentsEnrolled: 0,
        };
        setPartners(prev => [...prev, newPartner]);
        toast({ title: "Partner Added", description: `${newPartner.name} is now an educational partner.` });
    }
    setIsPartnerDialogOpen(false);
  };

    const handleCoinPackageChange = (id: string, field: 'coins' | 'price', value: string) => {
        setCoinPackages(prev =>
            prev.map(p => (p.id === id ? { ...p, [field]: Number(value) } : p))
        );
    };

    const handleAddCoinPackage = () => {
        setCoinPackages(prev => [
            ...prev,
            { id: `cp-${Date.now()}`, coins: 0, price: 0 },
        ]);
    };

    const handleRemoveCoinPackage = (id: string) => {
        if (coinPackages.length > 1) {
            setCoinPackages(prev => prev.filter(p => p.id !== id));
        } else {
            toast({
                variant: 'destructive',
                title: 'Cannot Remove',
                description: 'You must have at least one coin package.',
            });
        }
    };

    const handleSaveCoinPackages = () => {
        toast({
            title: 'Coin Packages Updated',
            description: 'The coin purchase options have been successfully saved.',
        });
    };

    const handleDownloadUsers = () => {
        downloadAsCsv('all_users', MOCK_DATA.users as any);
        toast({ title: 'Downloading Users', description: 'Your user data CSV will be downloaded shortly.' });
    };

    const handleDownloadSubscribers = () => {
        // const subscribers = allUsers.filter(u => u.subscription_status === 'premium');
        // This is a mock implementation
        const subscribers: any[] = [];
        if (subscribers.length > 0) {
            downloadAsCsv('premium_subscribers', subscribers);
            toast({ title: 'Downloading Subscribers', description: 'Your subscriber data CSV will be downloaded shortly.' });
        } else {
            toast({ variant: 'destructive', title: 'No Subscribers', description: 'There are no premium subscribers to download.' });
        }
    };
  
  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-2 md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage content, users, and platform settings.
          </p>
        </div>
        {canSeed ? (
          <Button onClick={handleSeedDatabase} disabled={isSeeding}>
            <Database className="mr-2 h-4 w-4" />
            {isSeeding ? 'Seeding Database...' : 'Seed Database'}
          </Button>
        ) : (
           <Alert variant="destructive" className="max-w-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Seeding Disabled</AlertTitle>
              <AlertDescription>
                To enable database seeding, set the `FIREBASE_SERVICE_ACCOUNT_KEY_JSON` in your `.env` file.
              </AlertDescription>
            </Alert>
        )}
      </div>
      <Tabs defaultValue="content">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7">
          <TabsTrigger value="content">Flagged Content</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="activity">Content & Activity</TabsTrigger>
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
          <TabsTrigger value="points">Points System</TabsTrigger>
          <TabsTrigger value="coin-usage">Coin Usage</TabsTrigger>
          <TabsTrigger value="partners">Partner Portal</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation Queue</CardTitle>
              <CardDescription>
                Review and take action on user-reported content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Flagged By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{getContentPreview(item)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.contentType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-destructive border-destructive">
                          {item.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={item.flaggedBy.avatar} />
                            <AvatarFallback>{item.flaggedBy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {item.flaggedBy.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleApprove(item.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(item.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {flaggedContent.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  The moderation queue is empty.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Student Management</CardTitle>
                        <CardDescription>View and manage student users.</CardDescription>
                    </div>
                    <Button onClick={handleDownloadUsers}>
                        <Download className="mr-2 h-4 w-4" />
                        Download All User Data (CSV)
                    </Button>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>School</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p>{user.sudoName} <span className="text-muted-foreground font-normal">@{user.name}</span></p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.class}</TableCell>
                                    <TableCell>{user.school}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm"><UserCheck className="mr-2 h-4 w-4" /> View</Button>
                                            <Button variant="destructive" size="sm"><UserX className="mr-2 h-4 w-4" /> Ban</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User-Created Games & Quizzes</CardTitle>
              <CardDescription>Monitor all games and quizzes created by users.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DATA.games.map((game) => (
                    <TableRow key={game.slug}>
                      <TableCell className="font-medium">{game.title}</TableCell>
                      <TableCell>
                        <Badge variant={game.questions ? 'default' : 'secondary'}>
                          {game.questions ? 'Quiz' : 'Game'}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={game.creator.avatar} />
                            <AvatarFallback>{game.creator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {game.creator.name}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/brain-games/${game.slug}`}>
                            <Eye className="mr-2 h-4 w-4"/>View Content
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Teacher-Led Classes</CardTitle>
              <CardDescription>An overview of all scheduled and completed classes by teachers.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Class Name</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Enrolled</TableHead>
                          <TableHead>Status</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(MOCK_DATA.teacherClasses as TeacherClass[]).map(tClass => (
                        <TableRow key={tClass.id}>
                            <TableCell className="font-medium">{tClass.className}</TableCell>
                            <TableCell className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                      <AvatarImage src={tClass.teacher.avatar} />
                                      <AvatarFallback>{tClass.teacher.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  {tClass.teacher.name}
                            </TableCell>
                            <TableCell>{tClass.subject}</TableCell>
                            <TableCell>{tClass.enrolled}</TableCell>
                            <TableCell>
                              <Badge variant={
                                tClass.status === 'Ongoing' ? 'default' 
                                : tClass.status === 'Upcoming' ? 'secondary' 
                                : 'outline'
                              }>{tClass.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monetization" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>E-commerce Settings</CardTitle>
                    <CardDescription>Monitor sales and manage commission from the marketplace.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹1,25,430</div>
                                <p className="text-xs text-muted-foreground">+15.2% from last month</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">E-commerce Commission ({salesCommission}%)</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{Math.round(125430 * (salesCommission / 100))}</div>
                                <p className="text-xs text-muted-foreground">Platform earnings from sales</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+235</div>
                                <p className="text-xs text-muted-foreground">+5.1% from last month</p>
                            </CardContent>
                        </Card>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Top Selling Products</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_DATA.products.slice(0,3).map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                                        <TableCell>₹{product.price}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                 <CardFooter className="border-t pt-6">
                    <div className="flex flex-col gap-2 w-full max-w-sm">
                        <Label htmlFor="sales-commission">Set E-commerce Commission Rate</Label>
                        <div className="flex items-center gap-2">
                            <Input id="sales-commission" type="number" value={salesCommission} onChange={e => setSalesCommission(Number(e.target.value))} placeholder="e.g. 10" className="w-24" />
                            <Percent className="h-4 w-4 text-muted-foreground" />
                             <Button onClick={handleSaveSalesCommission} className="ml-auto">Save</Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Paid Live Classes & Subscriptions</CardTitle>
                        <CardDescription>Manage and track revenue from subscriptions and classes.</CardDescription>
                    </div>
                    <Button onClick={handleDownloadSubscribers}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Subscribers (CSV)
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Class Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹59,100</div>
                                <p className="text-xs text-muted-foreground">From all paid classes</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Class Commission ({classCommission}%)</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{Math.round(59100 * (classCommission / 100))}</div>
                                <p className="text-xs text-muted-foreground">Platform earnings from classes</p>
                            </CardContent>
                        </Card>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class Name</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Enrolled</TableHead>
                                <TableHead>Revenue</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {(MOCK_DATA.teacherClasses as TeacherClass[]).map(tClass => (
                               <TableRow key={tClass.id}>
                                   <TableCell className="font-medium">{tClass.className}</TableCell>
                                   <TableCell className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={tClass.teacher.avatar} />
                                            <AvatarFallback>{tClass.teacher.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {tClass.teacher.name}
                                   </TableCell>
                                   <TableCell>₹{tClass.price}</TableCell>
                                   <TableCell className="flex items-center gap-2">
                                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                    {tClass.enrolled}
                                   </TableCell>
                                   <TableCell className="font-medium">₹{tClass.price * tClass.enrolled}</TableCell>
                                   <TableCell>
                                       <Button variant="outline" size="sm">
                                           <Eye className="mr-2 h-4 w-4" /> View Details
                                       </Button>
                                   </TableCell>
                               </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="border-t pt-6">
                    <div className="flex flex-col gap-2 w-full max-w-sm">
                        <Label htmlFor="class-commission">Set Live Class Commission Rate</Label>
                        <div className="flex items-center gap-2">
                            <Input id="class-commission" type="number" value={classCommission} onChange={e => setClassCommission(Number(e.target.value))} placeholder="e.g. 15" className="w-24" />
                             <Percent className="h-4 w-4 text-muted-foreground" />
                             <Button onClick={handleSaveClassCommission} className="ml-auto">Save</Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Coin Packages</CardTitle>
                    <CardDescription>
                        Configure the Knowledge Coin packages available for purchase.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {coinPackages.map((pkg) => (
                        <div key={pkg.id} className="flex items-end gap-4 rounded-lg border p-4">
                            <div className="grid grid-cols-2 gap-4 flex-1">
                                <div className="space-y-2">
                                    <Label htmlFor={`coins-${pkg.id}`}>Coins Amount</Label>
                                    <Input
                                        id={`coins-${pkg.id}`}
                                        type="number"
                                        value={pkg.coins}
                                        onChange={(e) => handleCoinPackageChange(pkg.id, 'coins', e.target.value)}
                                        placeholder="e.g., 1000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`price-${pkg.id}`}>Price (₹)</Label>
                                    <Input
                                        id={`price-${pkg.id}`}
                                        type="number"
                                        value={pkg.price}
                                        onChange={(e) => handleCoinPackageChange(pkg.id, 'price', e.target.value)}
                                        placeholder="e.g., 99"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemoveCoinPackage(pkg.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={handleAddCoinPackage} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Package
                    </Button>
                </CardContent>
                <CardFooter className="border-t pt-6 flex justify-end">
                    <Button onClick={handleSaveCoinPackages}>Save Coin Packages</Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="points">
            <Card>
                <CardHeader>
                    <CardTitle>Knowledge Coins Configuration</CardTitle>
                    <CardDescription>
                        Set the number of Knowledge Coins users earn for different activities.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <PlusCircle className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="createStudyRoom" className="font-semibold">Create an Event</Label>
                                    <p className="text-xs text-muted-foreground">Coins for creating a new study room, debate, etc.</p>
                                </div>
                            </div>
                            <Input id="createStudyRoom" name="createStudyRoom" type="number" value={pointsConfig.createStudyRoom} onChange={handlePointsConfigChange} className="w-24" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <UserPlus className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="studentJoinsRoom" className="font-semibold">Student Joins Event</Label>
                                    <p className="text-xs text-muted-foreground">Coins awarded to host for each student that joins.</p>
                                </div>
                            </div>
                            <Input id="studentJoinsRoom" name="studentJoinsRoom" type="number" value={pointsConfig.studentJoinsRoom} onChange={handlePointsConfigChange} className="w-24" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="askQuestion" className="font-semibold">Ask a Question</Label>
                                    <p className="text-xs text-muted-foreground">Coins awarded for posting a new Q&A in the feed.</p>
                                </div>
                            </div>
                            <Input id="askQuestion" name="askQuestion" type="number" value={pointsConfig.askQuestion} onChange={handlePointsConfigChange} className="w-24" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <Award className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="answerQuestion" className="font-semibold">Answer a Question</Label>
                                    <p className="text-xs text-muted-foreground">Coins awarded for providing a reply to a question.</p>
                                </div>
                            </div>
                            <Input id="answerQuestion" name="answerQuestion" type="number" value={pointsConfig.answerQuestion} onChange={handlePointsConfigChange} className="w-24" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <Clapperboard className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="createVideoPost" className="font-semibold">Create a Video Post</Label>
                                    <p className="text-xs text-muted-foreground">Coins for posting an entertainment or educational video.</p>
                                </div>
                            </div>
                            <Input id="createVideoPost" name="createVideoPost" type="number" value={pointsConfig.createVideoPost} onChange={handlePointsConfigChange} className="w-24" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <FileQuestion className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="createQuiz" className="font-semibold">Create a Quiz</Label>
                                    <p className="text-xs text-muted-foreground">Coins for creating a new quiz for the community.</p>
                                </div>
                            </div>
                            <Input id="createQuiz" name="createQuiz" type="number" value={pointsConfig.createQuiz} onChange={handlePointsConfigChange} className="w-24" />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <Puzzle className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="createBrainGame" className="font-semibold">Create a Brain Game</Label>
                                    <p className="text-xs text-muted-foreground">Coins awarded for creating a new brain game.</p>
                                </div>
                            </div>
                            <Input id="createBrainGame" name="createBrainGame" type="number" value={pointsConfig.createBrainGame} onChange={handlePointsConfigChange} className="w-24" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="playBrainGame" className="font-semibold">Play a Brain Game</Label>
                                    <p className="text-xs text-muted-foreground">Coins awarded for completing a brain game.</p>
                                </div>
                            </div>
                            <Input id="playBrainGame" name="playBrainGame" type="number" value={pointsConfig.playBrainGame} onChange={handlePointsConfigChange} className="w-24" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6 flex justify-end">
                    <Button onClick={handleSavePointsConfig}>Save Point Settings</Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="coin-usage">
            <Card>
                <CardHeader>
                    <CardTitle>Coin Usage Configuration</CardTitle>
                    <CardDescription>
                        Set the number of Knowledge Coins required to use special AI features.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <Bot className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="aiRecommendations" className="font-semibold">AI "For You" Feed</Label>
                                    <p className="text-xs text-muted-foreground">Coins required to get AI-powered recommendations.</p>
                                </div>
                            </div>
                            <Input id="aiRecommendations" name="aiRecommendations" type="number" value={coinUsageConfig.aiRecommendations} onChange={handleCoinUsageConfigChange} className="w-24" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <Languages className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="languageTranslation" className="font-semibold">AI Language Translation</Label>
                                    <p className="text-xs text-muted-foreground">Coins required to use a premium language.</p>
                                </div>
                            </div>
                            <Input id="languageTranslation" name="languageTranslation" type="number" value={coinUsageConfig.languageTranslation} onChange={handleCoinUsageConfigChange} className="w-24" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6 flex justify-end">
                    <Button onClick={handleSaveCoinUsageConfig}>Save Coin Costs</Button>
                </CardFooter>
            </Card>
        </TabsContent>
         <TabsContent value="partners">
             <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Handshake /> Partner Portal</CardTitle>
                            <CardDescription>Manage educational partners and their course listings on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {partners.length > 0 ? (
                                <>
                                    <div className='flex items-center gap-4'>
                                        <Label htmlFor="partner-select" className="whitespace-nowrap">Managing Partner:</Label>
                                        <Select value={currentPartnerId} onValueChange={setCurrentPartnerId}>
                                        <SelectTrigger id="partner-select" className="w-full max-w-xs">
                                            <SelectValue placeholder="Select a partner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {partners.map(p => (
                                            <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                </>
                            ) : null}

                           <Tabs defaultValue="courses" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="courses">Course Management</TabsTrigger>
                                    <TabsTrigger value="settings">Partner Management</TabsTrigger>
                                </TabsList>
                                <TabsContent value="courses" className="pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Courses by {currentPartner?.name ?? '...'}</h3>
                                        <Button onClick={handleAddCourse} disabled={!currentPartner}><PlusCircle className="mr-2 h-4 w-4"/> Add New Course</Button>
                                    </div>
                                     {currentPartner ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Course Title</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentPartner.featuredCourses.map(course => (
                                                    <TableRow key={course.id}>
                                                        <TableCell className="font-medium">{course.title}</TableCell>
                                                        <TableCell className="text-muted-foreground max-w-md truncate">{course.description}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}><Edit className="mr-2 h-4 w-4"/> Edit</Button>
                                                                <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.id)}><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {currentPartner.featuredCourses.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                                            No courses found for this partner.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                     ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <p>No partner selected or available.</p>
                                            <p>Add a partner in the Partner Management tab to get started.</p>
                                        </div>
                                     )}
                                </TabsContent>
                                <TabsContent value="settings" className="pt-4">
                                     <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">All Partners</h3>
                                        <Button onClick={handleAddPartner}><PlusCircle className="mr-2 h-4 w-4"/> Add New Partner</Button>
                                    </div>
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Partner Name</TableHead>
                                                <TableHead>Courses</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {partners.map(p => (
                                                <TableRow key={p.slug}>
                                                    <TableCell className="font-medium">{p.name}</TableCell>
                                                    <TableCell>{p.featuredCourses.length}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => handleEditPartner(p)}><Edit className="mr-2 h-4 w-4"/> Edit</Button>
                                                            <Button variant="destructive" size="sm" onClick={() => handleDeletePartner(p.slug)}><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {partners.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                                        No partners have been added yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                    <PartnerDialog
                        open={isPartnerDialogOpen}
                        onOpenChange={setIsPartnerDialogOpen}
                        onSave={handleSavePartner}
                        partner={partnerToEdit}
                    />
                </Dialog>
                <PartnerCourseDialog 
                    open={isCourseDialogOpen}
                    onOpenChange={setIsCourseDialogOpen}
                    onSave={handleSaveCourse}
                    course={courseToEdit}
                />
            </Dialog>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
