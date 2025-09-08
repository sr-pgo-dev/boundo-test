import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dog, Cat, Ban, AlertTriangle } from "lucide-react";
import type { CompleteOnboardingData } from "@shared/schema";

interface Step4Props {
  data: Partial<CompleteOnboardingData>;
  updateData: (data: Partial<CompleteOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step4Values({ data, updateData, onNext, onPrev }: Step4Props) {
  const { toast } = useToast();
  const [coreValues, setCoreValues] = useState<string[]>(data.coreValues || []);
  const [growthGoals, setGrowthGoals] = useState<string[]>(data.growthGoals || []);
  const [petPreferences, setPetPreferences] = useState<string[]>(data.petPreferences || []);

  const toggleValue = (value: string) => {
    const newValues = coreValues.includes(value)
      ? coreValues.filter(v => v !== value)
      : coreValues.length < 5 
        ? [...coreValues, value]
        : coreValues;

    if (coreValues.length >= 5 && !coreValues.includes(value)) {
      toast({ title: "Maximum reached", description: "You can select up to 5 core values", variant: "destructive" });
      return;
    }

    setCoreValues(newValues);
    updateData({ coreValues: newValues });
  };

  const selectKids = (kids: string) => {
    updateData({ kids: kids as any });
  };

  const toggleGrowthGoal = (goal: string) => {
    const newGoals = growthGoals.includes(goal)
      ? growthGoals.filter(g => g !== goal)
      : [...growthGoals, goal];
    setGrowthGoals(newGoals);
    updateData({ growthGoals: newGoals });
  };

  const togglePet = (pet: string) => {
    const newPets = petPreferences.includes(pet)
      ? petPreferences.filter(p => p !== pet)
      : [...petPreferences, pet];
    setPetPreferences(newPets);
    updateData({ petPreferences: newPets });
  };

  const values = ["family", "career", "spiritual", "adventure", "creativity", "honesty", "loyalty", "independence", "balance"];
  const kidsOptions = ["want-soon", "eventually", "maybe", "dont-want", "already-have", "open-to-partner"];
  const growthGoalsList = ["fitness", "career", "mental-health", "financial", "creativity", "travel"];

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Your values matter</h1>
        <p className="text-muted-foreground">Share what's important to you in life and relationships</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Core Values */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Core Values (Select up to 5)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {values.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleValue(value)}
                  className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all ${
                    coreValues.includes(value) ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                  }`}
                  data-testid={`button-value-${value}`}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Kids Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Kids & Family</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {kidsOptions.map((kids) => (
                <button
                  key={kids}
                  type="button"
                  onClick={() => selectKids(kids)}
                  className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all ${
                    data.kids === kids ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                  }`}
                  data-testid={`button-kids-${kids}`}
                >
                  {kids === "want-soon" && "Want Soon (1-2 yrs)"}
                  {kids === "eventually" && "Eventually (3+ yrs)"}
                  {kids === "maybe" && "Maybe"}
                  {kids === "dont-want" && "Don't Want"}
                  {kids === "already-have" && "Already Have"}
                  {kids === "open-to-partner" && "Open to Partner Having"}
                </button>
              ))}
            </div>
          </div>

          {/* Growth Goals */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Growth Goals</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {growthGoalsList.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGrowthGoal(goal)}
                  className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all ${
                    growthGoals.includes(goal) ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                  }`}
                  data-testid={`button-growth-${goal}`}
                >
                  {goal.charAt(0).toUpperCase() + goal.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Pet Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Pet Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => togglePet('dogs')}
                className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all flex flex-col items-center ${
                  petPreferences.includes('dogs') ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                }`}
                data-testid="button-pet-dogs"
              >
                <Dog className="w-5 h-5 mb-1" />
                Dogs
              </button>
              <button
                type="button"
                onClick={() => togglePet('cats')}
                className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all flex flex-col items-center ${
                  petPreferences.includes('cats') ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                }`}
                data-testid="button-pet-cats"
              >
                <Cat className="w-5 h-5 mb-1" />
                Cats
              </button>
              <button
                type="button"
                onClick={() => togglePet('no-pets')}
                className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all flex flex-col items-center ${
                  petPreferences.includes('no-pets') ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                }`}
                data-testid="button-pet-no-pets"
              >
                <Ban className="w-5 h-5 mb-1" />
                No Pets
              </button>
              <button
                type="button"
                onClick={() => togglePet('allergic')}
                className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all flex flex-col items-center ${
                  petPreferences.includes('allergic') ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                }`}
                data-testid="button-pet-allergic"
              >
                <AlertTriangle className="w-5 h-5 mb-1" />
                Allergic
              </button>
            </div>
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
