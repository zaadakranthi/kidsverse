
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { teacherClasses as allTeacherClasses } from '@/lib/data';
import { PlusCircle, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { TeacherClass } from '@/lib/types';

export default function MyClassesPage() {
    const { toast } = useToast();
    const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>(allTeacherClasses);


    const handleCreateClass = () => {
        toast({
            title: "Feature Coming Soon",
            description: "The ability to create new classes is under development."
        })
    }

    return (
        <div className="space-y-6">
             <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className='space-y-1'>
                    <h1 className="text-3xl font-bold font-headline">My Classes</h1>
                    <p className="text-muted-foreground">Manage your live classes and view student enrollment.</p>
                </div>
                <Button onClick={handleCreateClass}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Class
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Class Management</CardTitle>
                    <CardDescription>An overview of all your scheduled and completed classes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Students Enrolled</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teacherClasses.map((tClass) => (
                                <TableRow key={tClass.id}>
                                    <TableCell className="font-medium">{tClass.className}</TableCell>
                                    <TableCell>{tClass.subject}</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground"/>
                                        {tClass.enrolled}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            tClass.status === 'Ongoing' ? 'default' 
                                            : tClass.status === 'Upcoming' ? 'secondary' 
                                            : 'outline'
                                        }>{tClass.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/>View</Button>
                                            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                                            <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
