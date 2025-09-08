import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { ProgressHeader } from "@/components/onboarding/progress-header";
import { Step1BasicInfo } from "@/components/onboarding/step-1-basic-info";
import { Step2Interests } from "@/components/onboarding/step-2-interests";
import { Step3Lifestyle } from "@/components/onboarding/step-3-lifestyle";
import { Step4Values } from "@/components/onboarding/step-4-values";
import { Step5Dealbreakers } from "@/components/onboarding/step-5-dealbreakers";
import { Step6PartnerPreferences } from "@/components/onboarding/step-6-partner-preferences";
import { Step7Photos } from "@/components/onboarding/step-7-photos";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { 
    onboardingData, 
    updateOnboardingData, 
    completeOnboarding, 
    isCompleting,
    isCompleted 
  } = useOnboarding();

  const totalSteps = 7;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding();
      setCurrentStep(8); // Show completion screen
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const goToMatches = () => {
    setLocation('/matches');
  };

  if (isCompleted || currentStep === 8) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to the community!</h1>
                <p className="text-muted-foreground mb-8">Your profile has been created successfully. Let's find your perfect match!</p>
                <Button onClick={goToMatches} className="px-8 py-3" data-testid="button-start-matching">
                  Start Matching
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    const stepProps = {
      data: onboardingData,
      updateData: updateOnboardingData,
      onNext: nextStep,
      onPrev: prevStep,
      onComplete: handleComplete,
      isCompleting,
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicInfo {...stepProps} />;
      case 2:
        return <Step2Interests {...stepProps} />;
      case 3:
        return <Step3Lifestyle {...stepProps} />;
      case 4:
        return <Step4Values {...stepProps} />;
      case 5:
        return <Step5Dealbreakers {...stepProps} />;
      case 6:
        return <Step6PartnerPreferences {...stepProps} />;
      case 7:
        return <Step7Photos {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ProgressHeader 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        onBack={prevStep}
      />
      
      <div className="max-w-2xl mx-auto px-6 py-8">
        {renderStep()}
      </div>
    </div>
  );
}
