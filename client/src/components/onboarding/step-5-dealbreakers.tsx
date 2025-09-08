import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { CompleteOnboardingData } from "@shared/schema";

interface Step5Props {
  data: Partial<CompleteOnboardingData>;
  updateData: (data: Partial<CompleteOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step5Dealbreakers({ data, updateData, onNext, onPrev }: Step5Props) {
  const [dealbreakers, setDealbreakers] = useState<string[]>(data.dealbreakers || []);

  const toggleDealbreaker = (dealbreaker: string) => {
    const newDealbreakers = dealbreakers.includes(dealbreaker)
      ? dealbreakers.filter(d => d !== dealbreaker)
      : [...dealbreakers, dealbreaker];
    setDealbreakers(newDealbreakers);
    updateData({ dealbreakers: newDealbreakers });
  };

  const dealbreakerCategories = [
    {
      title: "Habits & Lifestyle",
      items: ["smoking", "heavy-drinking", "drug-use", "party-lifestyle"]
    },
    {
      title: "Relationship",
      items: ["wants-kids-soon", "doesnt-want-kids", "online-only", "long-distance"]
    },
    {
      title: "Financial",
      items: ["significant-debt", "unemployed", "lives-with-parents"]
    },
    {
      title: "Personal",
      items: ["extreme-politics", "very-religious", "social-media-obsessed", "workaholic"]
    }
  ];

  const getDealBreakerLabel = (item: string) => {
    const labels: Record<string, string> = {
      "smoking": "Smoking",
      "heavy-drinking": "Heavy Drinking",
      "drug-use": "Drug Use",
      "party-lifestyle": "Party Lifestyle",
      "wants-kids-soon": "Wants Kids Soon",
      "doesnt-want-kids": "Doesn't Want Kids",
      "online-only": "Online Only",
      "long-distance": "Long Distance",
      "significant-debt": "Significant Debt",
      "unemployed": "Unemployed",
      "lives-with-parents": "Lives with Parents",
      "extreme-politics": "Extreme Politics",
      "very-religious": "Very Religious",
      "social-media-obsessed": "Social Media Obsessed",
      "workaholic": "Workaholic"
    };
    return labels[item] || item;
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">What are your dealbreakers?</h1>
        <p className="text-muted-foreground">Help us filter out incompatible matches</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dealbreakerCategories.map(({ title, items }) => (
              <div key={title} className="space-y-3">
                <h3 className="font-semibold text-foreground mb-3">{title}</h3>
                {items.map((item) => (
                  <label 
                    key={item}
                    className="flex items-center space-x-3 p-3 hover:bg-accent rounded-md cursor-pointer"
                  >
                    <Checkbox
                      checked={dealbreakers.includes(item)}
                      onCheckedChange={() => toggleDealbreaker(item)}
                      className="w-4 h-4"
                      data-testid={`checkbox-dealbreaker-${item}`}
                    />
                    <span className="text-sm">{getDealBreakerLabel(item)}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev} className="px-8 py-3" data-testid="button-back">
          Back
        </Button>
        <Button onClick={onNext} className="px-8 py-3" data-testid="button-continue">
          Continue
        </Button>
      </div>
    </div>
  );
}
