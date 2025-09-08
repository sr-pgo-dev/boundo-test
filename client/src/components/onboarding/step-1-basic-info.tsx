import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MarsStroke, Venus } from "lucide-react";
import type { CompleteOnboardingData } from "@shared/schema";

interface Step1Props {
  data: Partial<CompleteOnboardingData>;
  updateData: (data: Partial<CompleteOnboardingData>) => void;
  onNext: () => void;
}

export function Step1BasicInfo({ data, updateData, onNext }: Step1Props) {
  const { toast } = useToast();
  const [selectedGender, setSelectedGender] = useState(data.gender || "");

  // Fetch countries
  const { data: countries } = useQuery({
    queryKey: ["/api/countries"],
    enabled: true,
  });

  // Fetch states based on selected country
  const { data: states } = useQuery({
    queryKey: ["/api/states", data.country],
    enabled: !!data.country,
  });

  // Fetch cities based on selected country and state
  const { data: cities } = useQuery({
    queryKey: ["/api/cities", data.country, data.state],
    enabled: !!data.country && !!data.state,
  });

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    updateData({ gender });
  };

  const validateAndProceed = () => {
    if (!data.name?.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    if (!data.birthdate) {
      toast({ title: "Error", description: "Date of birth is required", variant: "destructive" });
      return;
    }

    // Validate age
    const birthDate = new Date(data.birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - 
      (today.getMonth() < birthDate.getMonth() || 
       (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

    if (age < 18 || age > 65) {
      toast({ title: "Error", description: "Age must be between 18 and 65", variant: "destructive" });
      return;
    }

    if (!data.gender) {
      toast({ title: "Error", description: "Please select your gender", variant: "destructive" });
      return;
    }

    if (!data.orientation) {
      toast({ title: "Error", description: "Please select your sexual orientation", variant: "destructive" });
      return;
    }

    if (!data.country || !data.state || !data.city) {
      toast({ title: "Error", description: "Please complete your location information", variant: "destructive" });
      return;
    }

    onNext();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Let's get to know you</h1>
        <p className="text-muted-foreground">Tell us about yourself to find your perfect match</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-foreground">What's your name?</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={data.name || ""}
              onChange={(e) => updateData({ name: e.target.value })}
              className="mt-2"
              data-testid="input-name"
            />
          </div>

          <div>
            <Label htmlFor="birthdate" className="text-sm font-medium text-foreground">Date of birth</Label>
            <Input
              id="birthdate"
              type="date"
              value={data.birthdate || ""}
              onChange={(e) => updateData({ birthdate: e.target.value })}
              className="mt-2"
              data-testid="input-birthdate"
            />
            <p className="text-xs text-muted-foreground mt-1">Must be between 18-65 years old</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-4 block">Gender</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGenderSelect('male')}
                className={`p-4 border rounded-md text-center hover:border-ring hover:bg-accent transition-all ${
                  selectedGender === 'male' ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                }`}
                data-testid="button-gender-male"
              >
                <MarsStroke className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="font-medium">Male</div>
              </button>
              <button
                type="button"
                onClick={() => handleGenderSelect('female')}
                className={`p-4 border rounded-md text-center hover:border-ring hover:bg-accent transition-all ${
                  selectedGender === 'female' ? 'bg-primary text-primary-foreground border-primary' : 'border-input'
                }`}
                data-testid="button-gender-female"
              >
                <Venus className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="font-medium">Female</div>
              </button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground">Sexual Orientation</Label>
            <Select 
              value={data.orientation || ""} 
              onValueChange={(value) => updateData({ orientation: value as any })}
            >
              <SelectTrigger className="mt-2" data-testid="select-orientation">
                <SelectValue placeholder="Select your orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">Straight</SelectItem>
                <SelectItem value="gay">Gay</SelectItem>
                <SelectItem value="lesbian">Lesbian</SelectItem>
                <SelectItem value="bisexual">Bisexual</SelectItem>
                <SelectItem value="pansexual">Pansexual</SelectItem>
                <SelectItem value="asexual">Asexual</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Location</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select 
                value={data.country || ""} 
                onValueChange={(value) => updateData({ country: value, state: "", city: "" })}
              >
                <SelectTrigger data-testid="select-country">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country: string) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={data.state || ""} 
                onValueChange={(value) => updateData({ state: value, city: "" })}
                disabled={!data.country}
              >
                <SelectTrigger data-testid="select-state">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {states?.map((state: string) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={data.city || ""} 
                onValueChange={(value) => updateData({ city: value })}
                disabled={!data.state}
              >
                <SelectTrigger data-testid="select-city">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map((city: string) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button onClick={validateAndProceed} className="px-8 py-3" data-testid="button-continue">
          Continue
        </Button>
      </div>
    </div>
  );
}
