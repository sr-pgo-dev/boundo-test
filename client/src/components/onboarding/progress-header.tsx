import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export function ProgressHeader({ currentStep, totalSteps, onBack }: ProgressHeaderProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <Button 
            variant="ghost" 
            onClick={onBack}
            disabled={currentStep === 1}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <span className="text-sm font-medium text-muted-foreground" data-testid="text-step-counter">
            {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
            data-testid="progress-bar"
          />
        </div>
      </div>
    </div>
  );
}
