
'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState, useRef, ChangeEvent, ReactNode } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { doc, setDoc, Timestamp, collection } from 'firebase/firestore';
import { Progress } from './ui/progress';

type AddStoryDialogProps = {
  children: ReactNode;
};

export function AddStoryDialog({ children }: AddStoryDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [caption, setCaption] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTaskRef = useRef<UploadTask | null>(null);

  const cleanup = (showToast = false) => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
      uploadTaskRef.current = null;
    }
    setFile(null);
    setMediaPreview(null);
    setCaption('');
    setMediaType(null);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setOpen(false); // Close the dialog on cleanup
    if (showToast) {
       toast({
        title: 'Upload Canceled',
      });
    }
  };


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        const type = selectedFile.type.startsWith('image/') ? 'image' : 'video';
        setMediaType(type);

        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please select an image or video file.',
        });
      }
    }
  };

  const handlePostStory = async () => {
    if (!file || !mediaType || !user) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: "Please select a file to upload.",
        });
        return;
    };

    setIsUploading(true);
    setUploadProgress(0);
    
    const storyId = doc(collection(db, 'stories')).id;
    const storagePath = `stories/${user.id}/${storyId}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTaskRef.current = uploadTask;

    uploadTask.on('state_changed', 
      (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
      },
      (error) => {
          setIsUploading(false);
          uploadTaskRef.current = null;
          if (error.code !== 'storage/canceled') {
              console.error("Upload failed:", error);
              toast({
                  variant: 'destructive',
                  title: 'Upload Failed',
                  description: error.code === 'storage/unauthorized' 
                    ? 'Permission denied. Check your storage rules in Firebase.'
                    : 'There was a problem uploading your story. Please try again.'
              });
          }
      },
      async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            const newStoryData = {
                id: storyId,
                userId: user.id,
                username: user.sudoName,
                userAvatar: user.avatar,
                type: mediaType,
                url: downloadURL,
                caption: caption,
                duration: mediaType === 'image' ? 5000 : 15000,
                createdAt: Timestamp.now(),
            };
            
            const storyDocRef = doc(db, 'stories', storyId);
            await setDoc(storyDocRef, newStoryData);

            toast({
                title: 'Story Posted!',
                description: 'Your new story is now live.',
            });
            // Cleanup only after everything is successful
            cleanup(false);
          } catch(dbError) {
              console.error("Firestore update failed:", dbError);
               toast({
                  variant: 'destructive',
                  title: 'Database Error',
                  description: 'Your file was uploaded, but we failed to post the story.'
              });
              setIsUploading(false);
          } finally {
             uploadTaskRef.current = null;
          }
      }
    );
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (isUploading && !isOpen) {
        // Don't close if uploading
        return;
    }
    if (!isOpen) {
       cleanup(false);
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent 
        onEscapeKeyDown={(e) => {
            if (isUploading) e.preventDefault();
        }}
        onInteractOutside={(e) => {
            if (isUploading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Create a New Story</DialogTitle>
          <DialogDescription>
            Share a photo or video that will disappear in 24 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!mediaPreview ? (
            <div
              className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 transition-colors hover:bg-muted"
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="font-semibold">Click to upload an image or video</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF or MP4</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
          ) : (
            <div className="relative">
              {mediaType === 'image' ? (
                <Image
                  src={mediaPreview}
                  alt="Story preview"
                  width={400}
                  height={400}
                  className="w-full rounded-md object-contain max-h-[300px]"
                />
              ) : (
                <video src={mediaPreview} className="w-full rounded-md max-h-[300px]" controls />
              )}
              {!isUploading && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full"
                  onClick={() => { setMediaPreview(null); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
           {isUploading && (
              <div className="space-y-2">
                  <p className="text-sm text-center font-medium">Uploading... {Math.round(uploadProgress)}%</p>
                  <Progress value={uploadProgress} />
              </div>
           )}
          <Input
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={!mediaPreview || isUploading}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => cleanup(isUploading)} disabled={isUploading && uploadProgress > 0 && uploadProgress < 100}>
            {isUploading ? 'Cancel Upload' : 'Cancel'}
          </Button>
          <Button onClick={handlePostStory} disabled={!mediaPreview || isUploading}>
            {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : 'Post Story'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
