
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Partner } from '@/lib/types';
import Image from 'next/image';

const partnerFormSchema = z.object({
  name: z.string().min(3, 'Partner name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  logo: z.string().url('Please enter a valid logo URL.'),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

type PartnerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (partnerData: PartnerFormValues) => void;
  partner?: Partner;
};

export function PartnerDialog({
  open,
  onOpenChange,
  onSave,
  partner,
}: PartnerDialogProps) {
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
  });

  useEffect(() => {
    if (open) {
      if (partner) {
        form.reset({
            name: partner.name,
            description: partner.description,
            logo: partner.logo
        });
      } else {
        form.reset({
          name: '',
          description: '',
          logo: `https://placehold.co/120x60/e9e9e9/1c1c1c?text=New+Partner&random=${Date.now()}`,
        });
      }
    }
  }, [partner, form, open]);
  
  const logoPreview = form.watch('logo');

  function onSubmit(data: PartnerFormValues) {
    onSave(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{partner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
          <DialogDescription>
            Manage the educational partners on the platform.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., QuantumLeap Academy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief, engaging description of the partner." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {logoPreview && (
                <div>
                    <Label>Logo Preview</Label>
                    <div className="mt-2 p-4 rounded-md border bg-muted flex items-center justify-center">
                        <Image src={logoPreview} alt="Logo preview" width={120} height={60} className="object-contain"/>
                    </div>
                </div>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Partner</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
