import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Star, Info, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

interface UserAstrology {
  sunSign: string;
  enableAstrologyMatching: boolean;
}

// Astrology sign information
const SIGN_INFO: Record<string, { name: string; symbol: string; dates: string; traits: string[] }> = {
  aries: {
    name: 'Aries',
    symbol: '♈',
    dates: 'Mar 21 - Apr 19',
    traits: ['Adventurous', 'Confident', 'Energetic', 'Independent']
  },
  taurus: {
    name: 'Taurus',
    symbol: '♉',
    dates: 'Apr 20 - May 20',
    traits: ['Reliable', 'Patient', 'Practical', 'Devoted']
  },
  gemini: {
    name: 'Gemini',
    symbol: '♊',
    dates: 'May 21 - Jun 20',
    traits: ['Curious', 'Adaptable', 'Communicative', 'Witty']
  },
  cancer: {
    name: 'Cancer',
    symbol: '♋',
    dates: 'Jun 21 - Jul 22',
    traits: ['Emotional', 'Caring', 'Intuitive', 'Protective']
  },
  leo: {
    name: 'Leo',
    symbol: '♌',
    dates: 'Jul 23 - Aug 22',
    traits: ['Generous', 'Warm-hearted', 'Creative', 'Dramatic']
  },
  virgo: {
    name: 'Virgo',
    symbol: '♍',
    dates: 'Aug 23 - Sep 22',
    traits: ['Analytical', 'Practical', 'Helpful', 'Perfectionist']
  },
  libra: {
    name: 'Libra',
    symbol: '♎',
    dates: 'Sep 23 - Oct 22',
    traits: ['Diplomatic', 'Fair', 'Social', 'Charming']
  },
  scorpio: {
    name: 'Scorpio',
    symbol: '♏',
    dates: 'Oct 23 - Nov 21',
    traits: ['Passionate', 'Intense', 'Mysterious', 'Determined']
  },
  sagittarius: {
    name: 'Sagittarius',
    symbol: '♐',
    dates: 'Nov 22 - Dec 21',
    traits: ['Optimistic', 'Freedom-loving', 'Philosophical', 'Adventurous']
  },
  capricorn: {
    name: 'Capricorn',
    symbol: '♑',
    dates: 'Dec 22 - Jan 19',
    traits: ['Ambitious', 'Disciplined', 'Responsible', 'Practical']
  },
  aquarius: {
    name: 'Aquarius',
    symbol: '♒',
    dates: 'Jan 20 - Feb 18',
    traits: ['Independent', 'Humanitarian', 'Innovative', 'Eccentric']
  },
  pisces: {
    name: 'Pisces',
    symbol: '♓',
    dates: 'Feb 19 - Mar 20',
    traits: ['Compassionate', 'Intuitive', 'Artistic', 'Gentle']
  }
};

function AstrologyProfile({ astrology }: { astrology: UserAstrology }) {
  const signInfo = SIGN_INFO[astrology.sunSign];
  
  if (!signInfo) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Your Astrology Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-6xl mb-2" data-testid="text-sign-symbol">
            {signInfo.symbol}
          </div>
          <h3 className="text-2xl font-bold" data-testid="text-sign-name">
            {signInfo.name}
          </h3>
          <p className="text-muted-foreground" data-testid="text-sign-dates">
            {signInfo.dates}
          </p>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="font-medium mb-2">Key Traits</h4>
          <div className="flex flex-wrap gap-2">
            {signInfo.traits.map((trait) => (
              <Badge key={trait} variant="secondary" data-testid={`badge-trait-${trait.toLowerCase()}`}>
                {trait}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                About Astrology Matching
              </p>
              <p className="text-purple-700 dark:text-purple-200">
                When enabled, astrology compatibility adds 20% weight to your match scores based on 
                traditional astrological compatibility between sun signs.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AstrologySettings({ astrology, onUpdate }: { 
  astrology: UserAstrology; 
  onUpdate: (enabled: boolean) => void; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Matching Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-medium">Enable Astrology Matching</h4>
            <p className="text-sm text-muted-foreground">
              Include astrology compatibility in your match calculations
            </p>
          </div>
          <Switch
            checked={astrology.enableAstrologyMatching}
            onCheckedChange={onUpdate}
            data-testid="switch-astrology-matching"
          />
        </div>
        
        {astrology.enableAstrologyMatching && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Astrology matching is enabled
              </p>
            </div>
            <p className="text-sm text-green-700 dark:text-green-200 mt-1">
              Your matches will include astrological compatibility scores based on your {SIGN_INFO[astrology.sunSign]?.name} sun sign.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: astrology, isLoading } = useQuery<UserAstrology>({
    queryKey: ['/api/astrology']
  });

  const updateAstrologyMutation = useMutation({
    mutationFn: (enableAstrologyMatching: boolean) => 
      apiRequest('PUT', '/api/astrology', { enableAstrologyMatching }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/astrology'] });
      toast({
        title: "Settings updated",
        description: "Your astrology preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update astrology preferences. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAstrologyToggle = (enabled: boolean) => {
    updateAstrologyMutation.mutate(enabled);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!astrology) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Settings Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Unable to load your astrology profile. Please complete your onboarding first.
          </p>
          <Button onClick={() => window.location.href = '/onboarding'}>
            Complete Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings & Preferences</h1>
          <p className="text-muted-foreground">
            Customize your matching experience
          </p>
        </div>
        
        <div className="space-y-6">
          <AstrologyProfile astrology={astrology} />
          <AstrologySettings 
            astrology={astrology} 
            onUpdate={handleAstrologyToggle}
          />
          
          {/* Account Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-medium">Signed in as</h3>
                  <p className="text-sm text-muted-foreground">{user?.username}</p>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                variant="destructive" 
                onClick={logout}
                className="w-full flex items-center gap-2"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}