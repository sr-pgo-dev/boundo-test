import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, Palette, Book, Plane } from "lucide-react";
import type { CompleteOnboardingData } from "@shared/schema";

interface Step2Props {
  data: Partial<CompleteOnboardingData>;
  updateData: (data: Partial<CompleteOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const interestCategories = [
  {
    category: "health",
    title: "Health & Fitness",
    icon: Dumbbell,
    interests: ["fitness", "yoga", "hiking"]
  },
  {
    category: "creative",
    title: "Creative",
    icon: Palette,
    interests: ["art", "music", "photography", "cooking"]
  },
  {
    category: "intellectual",
    title: "Intellectual",
    icon: Book,
    interests: ["reading", "learning", "technology"]
  },
  {
    category: "adventure",
    title: "Adventure & Entertainment",
    icon: Plane,
    interests: ["travel", "sports", "movies", "gaming"]
  }
];

export function Step2Interests({ data, updateData, onNext, onPrev }: Step2Props) {
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<Array<{category: string, interest: string}>>(
    data.interests || []
  );

  const toggleInterest = (category: string, interest: string) => {
    const existingIndex = selectedInterests.findIndex(
      item => item.category === category && item.interest === interest
    );

    let newInterests;
    if (existingIndex > -1) {
      newInterests = selectedInterests.filter((_, index) => index !== existingIndex);
    } else {
      newInterests = [...selectedInterests, { category, interest }];
    }

    setSelectedInterests(newInterests);
    updateData({ interests: newInterests });
  };

  const isInterestSelected = (category: string, interest: string) => {
    return selectedInterests.some(
      item => item.category === category && item.interest === interest
    );
  };

  const validateAndProceed = () => {
    if (selectedInterests.length === 0) {
      toast({ title: "Error", description: "Please select at least one interest", variant: "destructive" });
      return;
    }
    onNext();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">What are your interests?</h1>
        <p className="text-muted-foreground">Select all that apply to help us find your perfect matches</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {interestCategories.map(({ category, title, icon: Icon, interests }) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <Icon className="w-5 h-5 text-primary mr-3" />
                  {title}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interests.map((interest) => {
                    const isSelected = isInterestSelected(category, interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(category, interest)}
                        className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all ${
                          isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                        }`}
                        data-testid={`button-interest-${interest}`}
                      >
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev} className="px-8 py-3" data-testid="button-back">
          Back
        </Button>
        <Button onClick={validateAndProceed} className="px-8 py-3" data-testid="button-continue">
          Continue
        </Button>
      </div>
    </div>
  );
}
