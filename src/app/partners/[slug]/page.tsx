
'use client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { partners } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Clock, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import React from 'react';

export default function PartnerPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const partner = partners.find((p) => p.slug === slug);

  if (!partner) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full bg-muted">
            <Image 
                src={`https://picsum.photos/seed/${partner.slug}/1200/300`} 
                alt={`${partner.name} banner`}
                fill
                className="object-cover"
                data-ai-hint="office building"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute bottom-6 left-6 flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-md">
                    <Image 
                        src={partner.logo} 
                        alt={`${partner.name} logo`}
                        width={120}
                        height={60}
                        className="object-contain"
                    />
                </div>
                <h1 className="text-4xl font-bold text-white font-headline tracking-tight">{partner.name}</h1>
             </div>
        </div>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Courses Offered</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{partner.coursesOffered}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Students Enrolled</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{partner.studentsEnrolled.toLocaleString()}</div>
                </CardContent>
            </Card>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">About {partner.name}</h2>
            <p className="text-muted-foreground">{partner.description}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Featured Courses</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partner.featuredCourses.map((course) => (
            <Card key={course.id} className="flex flex-col transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                <CardHeader className="p-0 relative">
                     <div className="relative aspect-video w-full">
                        <Image 
                            src={course.imageUrl} 
                            alt={course.title}
                            fill
                            className="object-cover rounded-t-lg"
                            data-ai-hint="students learning"
                         />
                    </div>
                     <Badge className="absolute top-2 right-2">{course.mode}</Badge>
                </CardHeader>
              <CardContent className="p-4 flex-grow space-y-2">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="mt-2 line-clamp-3">{course.description}</CardDescription>
                 <div className="pt-2 flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4"/>
                        <span className="font-semibold text-foreground">₹{course.price.toLocaleString()}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4"/>
                        <span>{course.duration}</span>
                    </div>
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Button className="w-full">View Course</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
