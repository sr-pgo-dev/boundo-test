import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CompleteOnboardingData } from "@shared/schema";

export function useOnboarding() {
  const { toast } = useToast();
  const [onboardingData, setOnboardingData] = useState<Partial<CompleteOnboardingData>>({
    // Default values
    ageMin: 22,
    ageMax: 35,
    distance: 25,
    distanceUnit: 'miles',
    longDistance: false,
    interests: [],
    exerciseTypes: [],
    socialActivities: [],
    coreValues: [],
    growthGoals: [],
    petPreferences: [],
    dealbreakers: [],
  });

  const updateOnboardingData = (data: Partial<CompleteOnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const completeMutation = useMutation({
    mutationFn: async (data: CompleteOnboardingData) => {
      const response = await apiRequest('POST', '/api/onboarding/complete', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Your profile has been created successfully!" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to complete onboarding", 
        variant: "destructive" 
      });
    }
  });

  const completeOnboarding = async () => {
    try {
      // Validate required fields
      const requiredFields = {
        name: onboardingData.name,
        birthdate: onboardingData.birthdate,
        gender: onboardingData.gender,
        orientation: onboardingData.orientation,
        country: onboardingData.country,
        state: onboardingData.state,
        city: onboardingData.city,
        interests: onboardingData.interests,
        ageMin: onboardingData.ageMin,
        ageMax: onboardingData.ageMax,
        distance: onboardingData.distance,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => {
          if (key === 'interests') return !value || (value as any[]).length === 0;
          return !value;
        })
        .map(([key]) => key);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      await completeMutation.mutateAsync(onboardingData as CompleteOnboardingData);
    } catch (error) {
      console.error('Onboarding completion error:', error);
      throw error;
    }
  };

  return {
    onboardingData,
    updateOnboardingData,
    completeOnboarding,
    isCompleting: completeMutation.isPending,
    isCompleted: completeMutation.isSuccess,
  };
}
