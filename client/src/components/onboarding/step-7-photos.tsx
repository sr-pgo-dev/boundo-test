import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { useToast } from "@/hooks/use-toast";
import { Info, Check } from "lucide-react";

interface Step7Props {
  onPrev: () => void;
  onComplete: () => void;
  isCompleting: boolean;
}

export function Step7Photos({ onPrev, onComplete, isCompleting }: Step7Props) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<{ [key: number]: File | null }>({
    1: null,
    2: null,
    3: null
  });
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const handlePhotoUpload = (orderIndex: number, file: File | null) => {
    setPhotos(prev => ({ ...prev, [orderIndex]: file }));
  };

  const validateAndComplete = () => {
    const uploadedPhotos = Object.values(photos).filter(photo => photo !== null);
    
    if (uploadedPhotos.length < 3) {
      toast({ 
        title: "Error", 
        description: "Please upload all 3 required photos", 
        variant: "destructive" 
      });
      return;
    }

    if (!privacyConsent) {
      toast({ 
        title: "Error", 
        description: "Please consent to the privacy policy", 
        variant: "destructive" 
      });
      return;
    }

    onComplete();
  };

  const photoGuidelines = [
    "Solo photos only (no group pictures)",
    "Clear face visible (no sunglasses or hats covering face)",
    "Recent photos (within 2 years)",
    "High quality and well-lit"
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Show your best self</h1>
        <p className="text-muted-foreground">Upload exactly 3 photos to complete your profile</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((orderIndex) => (
              <PhotoUpload
                key={orderIndex}
                orderIndex={orderIndex}
                onPhotoUpload={(file) => handlePhotoUpload(orderIndex, file)}
                data-testid={`photo-upload-${orderIndex}`}
              />
            ))}
          </div>

          {/* Photo Guidelines */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center">
              <Info className="w-4 h-4 text-primary mr-2" />
              Photo Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {photoGuidelines.map((guideline, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                  {guideline}
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="border border-border rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <Checkbox
                checked={privacyConsent}
                onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
                className="w-4 h-4 mt-1"
                data-testid="checkbox-privacy-consent"
              />
              <div className="text-sm">
                <span className="font-medium text-foreground">Privacy Consent</span>
                <p className="text-muted-foreground mt-1">
                  I consent to my photos being displayed to potential matches and understand that I can remove them at any time from my profile settings.
                </p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev} className="px-8 py-3" data-testid="button-back">
          Back
        </Button>
        <Button 
          onClick={validateAndComplete} 
          className="px-8 py-3" 
          disabled={isCompleting}
          data-testid="button-complete"
        >
          {isCompleting ? "Completing..." : "Complete Profile"}
        </Button>
      </div>
    </div>
  );
}
