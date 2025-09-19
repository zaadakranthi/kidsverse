
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { products as allProducts, users } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Star, Database, PlusCircle, User } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SellItemDialog } from '@/components/sell-item-dialog';
import { Product } from '@/lib/types';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';

const categories = [
  'All', 'Stationery', 'Books', 'Study Materials', 'Notes'
];

export default function ShopPage() {
  const { user: currentUser } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [products, setProducts] = useState(allProducts);
  const { toast } = useToast();
  const [isSellItemDialogOpen, setSellItemDialogOpen] = useState(false);

  const filteredProducts = products.filter(product => {
    const categoryMatch = categoryFilter === 'All' || product.category.toLowerCase() === categoryFilter.toLowerCase();
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handleBuy = (productName: string, price: number) => {
    if (!currentUser) return;
    if (currentUser.coins < price) {
        toast({
            variant: 'destructive',
            title: "Not Enough Coins",
            description: `You need ${price} Knowledge Coins to buy ${productName}.`,
        });
        return;
    }

    toast({
        title: "Parental Approval Required",
        description: `A request to purchase ${productName} has been sent to your parent for approval.`,
    });
  };
  
  const handleSellItem = (item: Omit<Product, 'id' | 'seller' | 'created_at' | 'updated_at' | 'image_url'>) => {
     if (!currentUser) return;
     const newProduct: Product = {
        ...item,
        id: `prod-${Date.now()}`,
        seller: {
            id: currentUser.id,
            name: currentUser.name,
            sudoName: currentUser.sudoName,
            avatar: currentUser.avatar,
        },
        image_url: `https://picsum.photos/seed/new${Date.now()}/400/400`,
        created_at: new Date(),
        updated_at: new Date(),
        stock: 1, // Assume user sells one item at a time
     }
    setProducts(prev => [newProduct, ...prev]);
    toast({
        title: "Item Listed!",
        description: `${item.name} has been listed for sale in the marketplace.`
    });
    setSellItemDialogOpen(false);
  }

  const getProductImageHint = (category: string) => {
    switch (category) {
        case 'Stationery': return 'stationery items';
        case 'Books': return 'text books';
        case 'Study Materials': return 'study notes';
        case 'Notes': return 'handwritten notes';
        default: return 'educational product';
    }
  }

  if (!currentUser) {
      return <div>Loading...</div>
  }

  return (
    <Dialog open={isSellItemDialogOpen} onOpenChange={setSellItemDialogOpen}>
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className='space-y-1'>
            <h1 className="text-3xl font-bold font-headline">EduVerse Marketplace</h1>
            <p className="text-muted-foreground">Buy and sell educational items with Knowledge Coins!</p>
        </div>
        <div className='flex gap-4 items-center'>
            <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold">
                <Database className="h-5 w-5 text-primary" />
                <span>{currentUser.coins} Coins</span>
            </div>
             <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Sell an Item
                </Button>
            </DialogTrigger>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Input 
            placeholder="Search for products..." 
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-0">
                 <div className="relative aspect-square w-full">
                    <Image 
                        src={product.image_url} 
                        alt={product.name} 
                        fill
                        className="object-cover"
                        data-ai-hint={getProductImageHint(product.category)}
                    />
                 </div>
                 <div className='p-4 space-y-2'>
                    <Badge variant="secondary">{product.category}</Badge>
                    <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 h-10 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={product.seller.avatar} />
                            <AvatarFallback>{product.seller.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>Sold by {product.seller.sudoName}</span>
                    </div>
                 </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center">
                <div className="flex flex-col">
                    <div className="font-bold text-lg flex items-center gap-1">
                        <Database className="h-5 w-5 text-primary" />
                        <span>{product.price}</span>
                    </div>
                    <span className="text-xs text-muted-foreground -mt-1">approx. ₹{product.price/10}</span>
                </div>
                <Button size="sm" onClick={() => handleBuy(product.name, product.price)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <h3 className="text-xl font-medium">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
    <SellItemDialog 
        onSellItem={handleSellItem}
    />
    </Dialog>
  );
}
