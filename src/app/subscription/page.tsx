
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { partners as initialPartners, coinPackages as initialCoinPackages } from '@/lib/data';
import { CheckCircle, Star, Database, Award, Handshake, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { User, Partner, CoinPackage } from '@/lib/types';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';

export default function SubscriptionPage() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(authUser);
  const [localPartners, setLocalPartners] = useState<Partner[]>(initialPartners);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>(initialCoinPackages);
  
  if (!currentUser) {
      return <div>Loading...</div>
  }

  const isStudentPremium = currentUser.subscription_status === 'premium';
  const isTeacherPremium = currentUser.role === 'teacher' && currentUser.subscription_status === 'premium';
  const allPartnersPaid = localPartners.every(p => p.one_time_fee_paid);
  
  const handleUpgrade = (costInRupees: number) => {
    // In a real app, this would redirect to a payment gateway
    // For now, we just grant the subscription
    setCurrentUser(prev => prev ? ({ 
        ...prev, 
        subscription_status: 'premium',
          transactions: [{ id: `tx-sub-${Date.now()}`, type: 'spend', description: 'Premium Subscription', amount: costInRupees, date: format(new Date(), 'PPP'), paymentMethod: 'cash' }, ...prev.transactions]
    }) : null);

    toast({
      title: 'Congratulations!',
      description: `You have successfully upgraded to Premium.`,
    });
  };

  const handlePayRegistrationFee = (partnerSlug: string) => {
    setLocalPartners(prev => prev.map(p => 
        p.slug === partnerSlug ? {...p, one_time_fee_paid: true } : p
    ));
    const partner = localPartners.find(p => p.slug === partnerSlug);
    toast({
        title: "Registration Complete!",
        description: `${partner?.name} is now a registered partner on EduVerse.`
    });
  }

  const handleBuyCoins = (amount: number, price: number) => {
    setCurrentUser(prev => prev ? ({ 
        ...prev, 
        coins: prev.coins + amount,
        transactions: [{ id: `tx-buy-${Date.now()}`, type: 'earn', description: `Bought ${amount} coins`, amount: amount, date: format(new Date(), 'PPP'), paymentMethod: 'cash' }, ...prev.transactions]
    }) : null);
    toast({
        title: "Purchase Successful!",
        description: `You have bought ${amount} Knowledge Coins for ₹${price}.`
    })
  }

  const studentBenefits = [
    'Ad-free experience',
    'AI-powered "For You" feed',
    'Unlock all languages for translation',
    'Premium Student badge on your profile',
  ];

  const teacherBenefits = [
    'Ad-free experience',
    'Enhanced analytics for your classes',
    'Priority support',
    'Premium Teacher badge on your profile',
    'Ability to host paid live classes',
  ];
  
  const partnerBenefits = [
    'List your courses on the EduVerse platform',
    'Access to a wide student audience',
    'Detailed analytics on course performance',
    'Official "EduVerse Partner" badge',
    'Priority placement in search results',
  ];
  
  const studentPlanPrice = { rupees: 49, coins: 490 };
  const teacherPlanPrice = { rupees: 99, coins: 990 };


  const renderStudentView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className={isStudentPremium && currentUser.role === 'student' ? 'border-2 border-primary' : ''}>
            <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Student Premium Plan</span>
                 {isStudentPremium && currentUser.role === 'student' && <Badge><Star className="mr-2 h-4 w-4" />Active</Badge>}
            </CardTitle>
            <CardDescription>
                Get the best of EduVerse with an AI-powered experience.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="text-center">
                <span className="text-5xl font-bold">₹{studentPlanPrice.rupees}</span>
                <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3">
                {studentBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-muted-foreground">{benefit}</span>
                </li>
                ))}
            </ul>
            </CardContent>
            <CardFooter className="flex-col gap-2">
            {isStudentPremium && currentUser.role === 'student' ? (
                <Button disabled className="w-full">You are already subscribed</Button>
            ) : (
                <Button className="w-full" onClick={() => handleUpgrade(studentPlanPrice.rupees)} disabled={currentUser.role !== 'student'}>
                    <IndianRupee className="mr-2 h-4 w-4" /> Pay ₹{studentPlanPrice.rupees}/month
                </Button>
            )}
            </CardFooter>
        </Card>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Buy Knowledge Coins</CardTitle>
                    <CardDescription>Purchase coins to redeem for premium features or items in the marketplace.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {coinPackages.map(pack => (
                        <div key={pack.id} className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-semibold flex items-center gap-2">
                                    <Database className="h-5 w-5 text-primary" />
                                    {pack.coins.toLocaleString()} Coins
                                </p>
                                <p className="text-sm text-muted-foreground">One-time purchase</p>
                            </div>
                            <Button onClick={() => handleBuyCoins(pack.coins, pack.price)} disabled={currentUser.role !== 'student'}>Buy for ₹{pack.price}</Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
  );

  const renderTeacherView = () => (
     <Card
        className={ isTeacherPremium ? 'border-2 border-primary' : '' }
    >
        <CardHeader>
        <CardTitle className="flex items-center justify-between">
            <span>
                Teacher Premium Plan
            </span>
            {isTeacherPremium && (
            <Badge>
                <Star className="mr-2 h-4 w-4" />
                Active
            </Badge>
            )}
        </CardTitle>
        <CardDescription>
            Unlock powerful tools to enhance your classes and earnings.
        </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="text-center">
            <span className="text-5xl font-bold">₹{teacherPlanPrice.rupees}</span>
            <span className="text-muted-foreground">/month</span>
        </div>
        <ul className="space-y-3">
            {teacherBenefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">{benefit}</span>
            </li>
            ))}
        </ul>
        </CardContent>
        <CardFooter>
        {isTeacherPremium ? (
            <Button disabled className="w-full">
            You are already subscribed
            </Button>
        ) : (
            <Button className="w-full" onClick={() => handleUpgrade(teacherPlanPrice.rupees)} disabled={currentUser.role !== 'teacher'}>
                <Star className="mr-2 h-4 w-4" />
                Upgrade for ₹{teacherPlanPrice.rupees}/month
            </Button>
        )}
        </CardFooter>
    </Card>
  );

  const renderAdminView = () => {
    const unpaidPartner = localPartners.find(p => !p.one_time_fee_paid);

    return (
     <Card
        className={ allPartnersPaid ? 'border-2 border-primary' : '' }
    >
        <CardHeader>
        <CardTitle className="flex items-center justify-between">
            <span>
            {unpaidPartner ? 'Educational Partner Registration' : 'All Partners Registered' }
            </span>
            {allPartnersPaid && (
            <Badge>
                <Handshake className="mr-2 h-4 w-4" />
                Completed
            </Badge>
            )}
        </CardTitle>
        <CardDescription>
            {unpaidPartner
            ? `Register ${unpaidPartner.name} as an official educational partner to list courses on EduVerse.`
            : 'All partners on the platform have paid their registration fee.'}
        </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="text-center">
            <span className="text-5xl font-bold">₹499</span>
            <span className="text-muted-foreground">/one-time fee</span>
        </div>
        <ul className="space-y-3">
            {partnerBenefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">{benefit}</span>
            </li>
            ))}
        </ul>
        </CardContent>
        <CardFooter>
        {allPartnersPaid ? (
            <Button disabled className="w-full">
                All Registration Fees Paid
            </Button>
        ) : (
            unpaidPartner && <Button className="w-full" onClick={() => handlePayRegistrationFee(unpaidPartner.slug)} >
                <Handshake className="mr-2 h-4 w-4" />
                Pay for {unpaidPartner.name}
            </Button>
        )}
        </CardFooter>
    </Card>
    )
  };


  const renderContent = () => {
    if (currentUser.role === 'admin') {
      return (
        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admin">Admin View</TabsTrigger>
            <TabsTrigger value="student">Student Preview</TabsTrigger>
            <TabsTrigger value="teacher">Teacher Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="admin" className="mt-6">{renderAdminView()}</TabsContent>
          <TabsContent value="student" className="mt-6">{renderStudentView()}</TabsContent>
          <TabsContent value="teacher" className="mt-6">{renderTeacherView()}</TabsContent>
        </Tabs>
      );
    }
    
    switch (currentUser.role) {
      case 'student':
        return renderStudentView();
      case 'teacher':
        return renderTeacherView();
      default:
        return <p>No subscription options available for your role.</p>;
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2 text-center">
        <Star className="mx-auto h-12 w-12 text-yellow-400" />
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          EduVerse Plans & Services
        </h1>
        <p className="text-xl text-muted-foreground">
          Unlock the full potential of your learning and teaching journey.
        </p>
         {(currentUser.role === 'student' || currentUser.role === 'admin' || currentUser.role === 'teacher') && (
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-lg font-semibold">
                <Database className="h-6 w-6 text-primary" />
                <span>Your Balance: {currentUser.coins.toLocaleString()} Coins</span>
            </div>
         )}
      </div>
      {renderContent()}
    </div>
  );
}
