
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

type SecretCodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const SECRET_CODE = '1234'; // Hardcoded for this example

export function SecretCodeDialog({ open, onOpenChange, onSuccess }: SecretCodeDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code === SECRET_CODE) {
      toast({
        title: 'Access Granted',
        description: 'You can now manage parental controls.',
      });
      onSuccess();
    } else {
      setError('Incorrect secret code. Please try again.');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setCode('');
      setError(null);
    }
    onOpenChange(isOpen);
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Secret Code</DialogTitle>
          <DialogDescription>
            Please enter the 4-digit parent code to access these settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secret-code" className="text-right">
                PIN
              </Label>
              <Input
                id="secret-code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="col-span-3"
                maxLength={4}
                placeholder="****"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Unlock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
