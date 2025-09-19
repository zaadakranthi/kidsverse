

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { users as allUsers, products } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Eye, BarChart2, Bell, Ban, ShoppingCart, Users as UsersIcon, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { SecretCodeDialog } from '@/components/secret-code-dialog';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Product, User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';


const availableSubjects = [
  'Mathematics', 'Science', 'English', 'History', 'Geography', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'Art', 'Music'
];
const availableFeatures = [
    { id: 'social', label: 'Social Feed & Q&A', icon: UsersIcon},
    { id: 'shop', label: 'E-commerce Shop', icon: ShoppingCart},
];

type PurchaseRequest = {
    id: string;
    product: Product;
    status: 'pending';
}

const initialPurchaseRequests: PurchaseRequest[] = [
    { id: 'pr1', product: products[0], status: 'pending' },
    { id: 'pr2', product: products[2], status: 'pending' },
]

export default function ParentalControlsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSecretCodeDialogOpen, setSecretCodeDialogOpen] = useState(true);

  const [currentUser, setCurrentUser] = useState(user);
  const [users, setUsers] = useState(allUsers);


  const [screenTime, setScreenTime] = useState(
    currentUser?.parental_controls.max_screen_time ?? 120
  );
  const [historyEnabled, setHistoryEnabled] = useState(
    currentUser?.parental_controls.history_enabled ?? true
  );
  
  const [restrictedSubjects, setRestrictedSubjects] = useState<Record<string, boolean>>({
    'History': false,
    'Art': false,
  });

  const [restrictedFeatures, setRestrictedFeatures] = useState<Record<string, boolean>>({
    'shop': false, // Shop is not blocked by default
    'social': false,
  });

  const [realtimeNotifications, setRealtimeNotifications] = useState(true);
  const [purchaseRequests, setPurchaseRequests] = useState(initialPurchaseRequests);

  useEffect(() => {
    if (!loading && user) {
        setCurrentUser(user);
    }
  }, [user, loading]);

  const handleSuccessfulAuth = () => {
    setIsAuthenticated(true);
    setSecretCodeDialogOpen(false);
  }

  const handleSaveChanges = () => {
    // In a real app, you'd save this to a backend.
    console.log('Saving parental controls:', { screenTime, historyEnabled });
    toast({
      title: 'Settings Saved',
      description: 'Your parental control settings have been updated.',
    });
  };

  const activityLogs = [
    { id: 1, action: 'Watched a video on "Algebra Basics"', timestamp: '2 hours ago' },
    { id: 2, action: 'Commented on a post in "Biology Buffs"', timestamp: '3 hours ago' },
    { id: 3, action: 'Spent 300 coins on "Premium Notebook Set"', timestamp: '1 day ago' },
    { id: 4, action: 'Joined "Physics Phantoms" study room', timestamp: '2 days ago' },
  ];

  const handleSubjectRestrictionChange = (subject: string, checked: boolean) => {
    setRestrictedSubjects(prev => ({ ...prev, [subject]: checked }));
  }

  const handleFeatureRestrictionChange = (featureId: string, checked: boolean) => {
    setRestrictedFeatures(prev => ({ ...prev, [featureId]: checked }));
  }

  const handlePurchaseRequest = (requestId: string, approved: boolean) => {
    const request = purchaseRequests.find(r => r.id === requestId);
    if (!request || !currentUser) return;

    if (approved) {
        if (currentUser.coins < request.product.price) {
           toast({
               variant: 'destructive',
               title: "Purchase Failed",
               description: `Child does not have enough coins for ${request.product.name}. You can buy more coins in the Subscription tab.`,
           });
           return; // Don't remove the request, let the parent buy coins and try again.
       }
       
       setCurrentUser(prev => prev ? ({ ...prev, coins: prev.coins - request.product.price }) : null);
       
       setUsers(prevUsers => prevUsers.map(u => 
            u.id === request.product.seller.id 
            ? { ...u, coins: u.coins + request.product.price } 
            : u
        ));

        toast({
            title: `Request Approved`,
            description: `${request.product.name} has been purchased and coins transferred.`,
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Request Denied',
            description: `The purchase request for ${request.product.name} has been denied.`,
        });
    }
    
    setPurchaseRequests(purchaseRequests.filter(r => r.id !== requestId));
  }

  if (loading || !currentUser) {
    // Or a loading state
    return <div className="text-center p-8">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <SecretCodeDialog 
              open={isSecretCodeDialogOpen} 
              onOpenChange={(isOpen) => {
                if (!isOpen && !isAuthenticated) {
                  router.back();
                }
                setSecretCodeDialogOpen(isOpen);
              }} 
              onSuccess={handleSuccessfulAuth}
           />
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Parental Controls</h1>
        <p className="text-muted-foreground">
          Manage and monitor your child's activity on EduVerse.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Avatar className='h-10 w-10'>
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
            <p>{currentUser.name}</p>
            <p className='text-sm font-normal text-muted-foreground'>{currentUser.class} @ {currentUser.school}</p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Purchase Requests</CardTitle>
            <CardDescription>Approve or deny your child's purchase requests from the shop.</CardDescription>
        </CardHeader>
        <CardContent>
            {purchaseRequests.length > 0 ? (
                 <div className="space-y-4">
                    {purchaseRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between rounded-lg border p-4">
                           <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 rounded-md">
                                    <AvatarImage src={request.product.image_url} className="object-cover" />
                                    <AvatarFallback>{request.product.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{request.product.name}</p>
                                    <p className="text-sm text-primary font-semibold">{request.product.price} Coins <span className="text-xs text-muted-foreground font-normal">(approx. ₹{request.product.price / 10})</span></p>
                                </div>
                           </div>
                           <div className="flex gap-2">
                                <Button size="sm" onClick={() => handlePurchaseRequest(request.id, true)}>
                                    <CheckCircle className="mr-2 h-4 w-4"/> Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handlePurchaseRequest(request.id, false)}>
                                    <XCircle className="mr-2 h-4 w-4"/> Deny
                                </Button>
                           </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">No Pending Requests</h3>
                    <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                        You'll see your child's purchase requests here when they try to buy items from the shop.
                    </p>
                </div>
            )}
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Screen Time Limit</CardTitle>
            <CardDescription>
              Set a daily limit for app usage. The app will automatically log out
              when the time is up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="screen-time-slider" className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>Daily Limit</span>
              </Label>
              <span className="font-bold tabular-nums">
                {Math.floor(screenTime / 60)}h {screenTime % 60}m
              </span>
            </div>
            <Slider
              id="screen-time-slider"
              min={30}
              max={240}
              step={15}
              value={[screenTime]}
              onValueChange={(value) => setScreenTime(value[0])}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Monitoring</CardTitle>
            <CardDescription>
              Enable or disable the tracking of your child's activity history.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-6">
            <Label htmlFor="history-switch" className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <span>Monitor Activity History</span>
            </Label>
            <Switch
              id="history-switch"
              checked={historyEnabled}
              onCheckedChange={setHistoryEnabled}
            />
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Content & Subject Restrictions</CardTitle>
            <CardDescription>
              Control which subjects and features your child can access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h4 className='font-medium mb-2'>Features</h4>
                <div className="space-y-2">
                    {availableFeatures.map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor={`feature-${feature.id}`} className={cn("flex items-center gap-2", feature.id === 'shop' && "text-muted-foreground")}>
                                <feature.icon className="h-5 w-5 text-muted-foreground" />
                                <span>{feature.id === 'shop' ? 'E-commerce Shop (Always Enabled)' : `Block "${feature.label}"`}</span>
                            </Label>
                            <Switch
                                id={`feature-${feature.id}`}
                                checked={restrictedFeatures[feature.id] ?? false}
                                onCheckedChange={(checked) => handleFeatureRestrictionChange(feature.id, checked)}
                                disabled={feature.id === 'shop'}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <Separator />
            <div>
                <h4 className='font-medium mb-2'>Subjects</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {availableSubjects.map((subject) => (
                        <div key={subject} className="flex items-center justify-between">
                            <Label htmlFor={`subject-${subject.toLowerCase()}`} className="text-sm">
                                Block "{subject}"
                            </Label>
                            <Switch
                                id={`subject-${subject.toLowerCase()}`}
                                checked={restrictedSubjects[subject] ?? false}
                                onCheckedChange={(checked) => handleSubjectRestrictionChange(subject, checked)}
                            />
                        </div>
                    ))}
                </div>
            </div>
          </CardContent>
      </Card>
       <Card>
          <CardHeader>
            <CardTitle>Parental Notifications</CardTitle>
            <CardDescription>
              Receive alerts about your child's activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="notification-switch" className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span>Real-time Usage Notifications</span>
                </Label>
                <Switch
                  id="notification-switch"
                  checked={realtimeNotifications}
                  onCheckedChange={setRealtimeNotifications}
                />
            </div>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>A log of your child's recent activities on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            {historyEnabled ? (
                <div className="space-y-4">
                    {activityLogs.map((log, index) => (
                        <div key={log.id}>
                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">{log.action}</p>
                                    <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                                </div>
                            </div>
                            {index < activityLogs.length - 1 && <Separator className="mt-4" />}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                    <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">History Monitoring is Off</h3>
                    <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                        To see your child's activity log, enable usage monitoring in the settings above.
                    </p>
                </div>
            )}
        </CardContent>
      </Card>


      <CardFooter className="flex justify-end p-0">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </CardFooter>
    </div>
  );
}
