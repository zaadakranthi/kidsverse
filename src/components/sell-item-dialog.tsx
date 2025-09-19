
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Product } from '@/lib/types';

const itemFormSchema = z.object({
  name: z.string().min(3, 'Item name must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  price: z.coerce.number().min(1, 'Price must be at least 1 coin.'),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

const defaultValues: ItemFormValues = {
  name: '',
  description: '',
  category: '',
  price: 0,
};

type SellItemDialogProps = {
  onSellItem: (item: Omit<Product, 'id' | 'seller' | 'created_at' | 'updated_at' | 'image_url' | 'stock'>) => void;
};

const categories = ['Stationery', 'Books', 'Study Materials', 'Notes'];

export function SellItemDialog({
  onSellItem,
}: SellItemDialogProps) {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: defaultValues,
  });

  function onSubmit(data: ItemFormValues) {
    onSellItem(data);
    form.reset();
  }

  return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sell an Item in the Marketplace</DialogTitle>
          <DialogDescription>
            List your own study notes or unused stationery for other students to buy using their Knowledge Coins.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., My History Notes (Chapter 5)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief description of your item."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (in Knowledge Coins)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            <DialogFooter>
              <Button type="submit">List Item</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
  );
}
