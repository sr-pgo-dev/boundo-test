import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DualSlider } from "@/components/ui/dual-slider";
import { useToast } from "@/hooks/use-toast";
import type { CompleteOnboardingData } from "@shared/schema";

interface Step6Props {
  data: Partial<CompleteOnboardingData>;
  updateData: (data: Partial<CompleteOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step6PartnerPreferences({ data, updateData, onNext, onPrev }: Step6Props) {
  const { toast } = useToast();
  const [distance, setDistance] = useState(data.distance || 25);

  const handleAgeRangeChange = (values: [number, number]) => {
    updateData({ ageMin: values[0], ageMax: values[1] });
  };

  const handleDistanceChange = (values: [number]) => {
    setDistance(values[0]);
    updateData({ distance: values[0] });
  };

  const selectTimeline = (timeline: string) => {
    updateData({ meetingTimeline: timeline as any });
  };

  const validateAndProceed = () => {
    if (!data.ageMin || !data.ageMax) {
      toast({ title: "Error", description: "Please set your age range preferences", variant: "destructive" });
      return;
    }

    if (data.ageMin >= data.ageMax) {
      toast({ title: "Error", description: "Minimum age must be less than maximum age", variant: "destructive" });
      return;
    }

    onNext();
  };

  const timelineOptions = [
    { value: "1-2-weeks", label: "1-2 Weeks" },
    { value: "1-month", label: "1 Month" },
    { value: "2-3-months", label: "2-3 Months" },
    { value: "when-ready", label: "When it Feels Right" }
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Who are you looking for?</h1>
        <p className="text-muted-foreground">Set your preferences for potential matches</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Age Range */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Age Range</h3>
            <div className="px-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-muted-foreground">18</span>
                <span className="text-lg font-semibold text-primary" data-testid="text-age-range">
                  {data.ageMin || 22} - {data.ageMax || 35}
                </span>
                <span className="text-sm font-medium text-muted-foreground">65</span>
              </div>
              <DualSlider
                value={[data.ageMin || 22, data.ageMax || 35]}
                onValueChange={handleAgeRangeChange}
                min={18}
                max={65}
                step={1}
                className="w-full"
                data-testid="slider-age-range"
              />
            </div>
          </div>

          {/* Distance */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Distance</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <DualSlider
                  value={[distance]}
                  onValueChange={handleDistanceChange}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                  data-testid="slider-distance"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>1</span>
                  <span>100+</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-primary" data-testid="text-distance">
                  {distance}
                </span>
                <Select 
                  value={data.distanceUnit || "miles"} 
                  onValueChange={(value) => updateData({ distanceUnit: value as any })}
                >
                  <SelectTrigger className="w-20" data-testid="select-distance-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="miles">miles</SelectItem>
                    <SelectItem value="km">km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label className="flex items-center mt-4 space-x-3">
              <Checkbox
                checked={data.longDistance || false}
                onCheckedChange={(checked) => updateData({ longDistance: checked as boolean })}
                className="w-4 h-4"
                data-testid="checkbox-long-distance"
              />
              <span className="text-sm">Open to long-distance relationships</span>
            </label>
          </div>

          {/* Meeting Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Meeting Timeline</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {timelineOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectTimeline(value)}
                  className={`p-3 border rounded-md text-sm hover:border-ring hover:bg-accent transition-all ${
                    data.meetingTimeline === value ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                  }`}
                  data-testid={`button-timeline-${value}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Physical Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Physical Preferences (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-foreground">Height Preference</Label>
                <Select 
                  value={data.heightPreference || ""} 
                  onValueChange={(value) => updateData({ heightPreference: value as any })}
                >
                  <SelectTrigger className="mt-2" data-testid="select-height-preference">
                    <SelectValue placeholder="No preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-preference">No preference</SelectItem>
                    <SelectItem value="shorter">Shorter than me</SelectItem>
                    <SelectItem value="similar">Similar height</SelectItem>
                    <SelectItem value="taller">Taller than me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Body Type</Label>
                <Select 
                  value={data.bodyTypePreference || ""} 
                  onValueChange={(value) => updateData({ bodyTypePreference: value as any })}
                >
                  <SelectTrigger className="mt-2" data-testid="select-body-type">
                    <SelectValue placeholder="No preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-preference">No preference</SelectItem>
                    <SelectItem value="slim">Slim</SelectItem>
                    <SelectItem value="athletic">Athletic</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="curvy">Curvy</SelectItem>
                    <SelectItem value="plus-size">Plus Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
