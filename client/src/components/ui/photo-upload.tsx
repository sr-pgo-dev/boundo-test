import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  orderIndex: number;
  onPhotoUpload: (file: File | null) => void;
}

export function PhotoUpload({ orderIndex, onPhotoUpload }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('orderIndex', orderIndex.toString());
      
      const response = await apiRequest('POST', '/api/photos/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      toast({ title: "Success", description: "Photo uploaded successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to upload photo. Please try again.", 
        variant: "destructive" 
      });
      console.error('Upload error:', error);
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Invalid file", 
        description: "Please select an image file", 
        variant: "destructive" 
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "File too large", 
        description: "Please select an image smaller than 5MB", 
        variant: "destructive" 
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Update parent component
    onPhotoUpload(file);

    // Upload file
    setIsUploading(true);
    uploadMutation.mutate(file, {
      onSettled: () => setIsUploading(false)
    });
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      {preview ? (
        <div className="relative group">
          <img 
            src={preview} 
            alt={`Photo ${orderIndex}`}
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="mr-2"
              data-testid={`button-remove-photo-${orderIndex}`}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={triggerFileSelect}
              data-testid={`button-change-photo-${orderIndex}`}
            >
              Change
            </Button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-sm">Uploading...</div>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-border rounded-lg p-8 text-center min-h-48 flex flex-col justify-center items-center cursor-pointer hover:border-primary hover:bg-accent transition-all"
          onClick={triggerFileSelect}
          data-testid={`photo-upload-zone-${orderIndex}`}
        >
          <Camera className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">Photo {orderIndex}</p>
          <p className="text-xs text-muted-foreground">Required</p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        data-testid={`input-photo-${orderIndex}`}
      />
    </div>
  );
}
