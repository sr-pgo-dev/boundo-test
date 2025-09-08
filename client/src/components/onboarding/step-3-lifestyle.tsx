import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CompleteOnboardingData } from "@shared/schema";

interface Step3Props {
  data: Partial<CompleteOnboardingData>;
  updateData: (data: Partial<CompleteOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step3Lifestyle({ data, updateData, onNext, onPrev }: Step3Props) {
  const [exerciseTypes, setExerciseTypes] = useState<string[]>(data.exerciseTypes || []);
  const [socialActivities, setSocialActivities] = useState<string[]>(data.socialActivities || []);

  const toggleExercise = (exercise: string) => {
    const newExerciseTypes = exerciseTypes.includes(exercise)
      ? exerciseTypes.filter(e => e !== exercise)
      : [...exerciseTypes, exercise];
    setExerciseTypes(newExerciseTypes);
    updateData({ exerciseTypes: newExerciseTypes });
  };

  const selectDiet = (diet: string) => {
    updateData({ diet: diet as any });
  };

  const selectTravel = (travel: string) => {
    updateData({ travel: travel as any });
  };

  const toggleSocialActivity = (activity: string) => {
    const newSocialActivities = socialActivities.includes(activity)
      ? socialActivities.filter(a => a !== activity)
      : [...socialActivities, activity];
    setSocialActivities(newSocialActivities);
    updateData({ socialActivities: newSocialActivities });
  };

  const exercises = ["gym", "yoga", "running", "hiking", "team-sports"];
  const diets = ["vegetarian", "vegan", "halal", "kosher", "keto", "no-restrictions"];
  const travelStyles = ["frequent", "occasional", "homebody", "nomad"];
  const socialActivitiesList = ["clubbing", "concerts", "museums", "coffee-shops", "fine-dining", "bars"];

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Your lifestyle</h1>
        <p className="text-muted-foreground">Help us understand how you like to live</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Exercise */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Exercise Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {exercises.map((exercise) => (
                <button
                  key={exercise}
                  type="button"
                  onClick={() => toggleExercise(exercise)}
                  className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all ${
                    exerciseTypes.includes(exercise) ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                  }`}
                  data-testid={`button-exercise-${exercise}`}
                >
                  {exercise.charAt(0).toUpperCase() + exercise.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Dietary Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {diets.map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => selectDiet(diet)}
                  className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all ${
                    data.diet === diet ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                  }`}
                  data-testid={`button-diet-${diet}`}
                >
                  {diet.charAt(0).toUpperCase() + diet.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Travel */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Travel Style</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {travelStyles.map((travel) => (
                <button
                  key={travel}
                  type="button"
                  onClick={() => selectTravel(travel)}
                  className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all ${
                    data.travel === travel ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                  }`}
                  data-testid={`button-travel-${travel}`}
                >
                  {travel.charAt(0).toUpperCase() + travel.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Social Activities */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Social Activities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {socialActivitiesList.map((activity) => (
                <button
                  key={activity}
                  type="button"
                  onClick={() => toggleSocialActivity(activity)}
                  className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all ${
                    socialActivities.includes(activity) ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                  }`}
                  data-testid={`button-social-${activity}`}
                >
                  {activity.charAt(0).toUpperCase() + activity.slice(1).replace('-', ' ')}
                </button>
              ))}
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
