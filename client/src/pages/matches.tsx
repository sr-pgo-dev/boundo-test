import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, X, Star, MapPin, Calendar, Users, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CompatibilityDetails {
  sharedInterestsScore: number;
  ageCompatibilityScore: number;
  locationProximityScore: number;
  genderOrientationScore: number;
  astrologyCompatibilityScore: number | null;
  sharedInterests: string[];
}

interface UserProfile {
  firstName: string;
  age: number;
  city: string;
  state: string;
  gender: string;
  orientation: string;
  occupation: string;
  bio: string;
}

interface Match {
  id: string;
  matchedUserId: string;
  compatibilityScore: number;
  isLiked: boolean;
  isPassed: boolean;
  isMatched: boolean;
  matchedUser: UserProfile;
  compatibility: CompatibilityDetails;
}

function CompatibilityBreakdown({ compatibility, totalScore }: { 
  compatibility: CompatibilityDetails; 
  totalScore: number; 
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Compatibility Breakdown</h4>
        <Badge variant={totalScore >= 80 ? "default" : totalScore >= 60 ? "secondary" : "outline"}>
          {totalScore}% Match
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>Interests ({compatibility.sharedInterests.length} shared)</span>
          <span>{compatibility.sharedInterestsScore}%</span>
        </div>
        <Progress value={compatibility.sharedInterestsScore} className="h-1" />
        
        <div className="flex justify-between text-xs">
          <span>Age Compatibility</span>
          <span>{compatibility.ageCompatibilityScore}%</span>
        </div>
        <Progress value={compatibility.ageCompatibilityScore} className="h-1" />
        
        <div className="flex justify-between text-xs">
          <span>Location</span>
          <span>{compatibility.locationProximityScore}%</span>
        </div>
        <Progress value={compatibility.locationProximityScore} className="h-1" />
        
        <div className="flex justify-between text-xs">
          <span>Orientation Match</span>
          <span>{compatibility.genderOrientationScore}%</span>
        </div>
        <Progress value={compatibility.genderOrientationScore} className="h-1" />
        
        {compatibility.astrologyCompatibilityScore !== null && (
          <>
            <div className="flex justify-between text-xs">
              <span>Astrology</span>
              <span>{compatibility.astrologyCompatibilityScore}%</span>
            </div>
            <Progress value={compatibility.astrologyCompatibilityScore} className="h-1" />
          </>
        )}
      </div>
      
      {compatibility.sharedInterests.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium mb-1">Shared Interests:</p>
          <div className="flex flex-wrap gap-1">
            {compatibility.sharedInterests.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="outline" className="text-xs">
                {interest}
              </Badge>
            ))}
            {compatibility.sharedInterests.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{compatibility.sharedInterests.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, onLike, onPass }: { 
  match: Match; 
  onLike: (matchId: string) => void; 
  onPass: (matchId: string) => void; 
}) {
  const { matchedUser, compatibility, compatibilityScore } = match;
  const canRevealPhotos = compatibilityScore >= 68;

  return (
    <Card className="w-full max-w-sm mx-auto" data-testid={`card-match-${match.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold" data-testid={`text-name-${match.id}`}>
              {matchedUser.firstName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span data-testid={`text-age-${match.id}`}>{matchedUser.age}</span>
              <MapPin className="w-3 h-3 ml-1" />
              <span data-testid={`text-location-${match.id}`}>{matchedUser.city}, {matchedUser.state}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-yellow-500" />
              <span className="font-semibold" data-testid={`text-score-${match.id}`}>
                {compatibilityScore}%
              </span>
            </div>
            {compatibility.astrologyCompatibilityScore !== null && (
              <div className="flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600">
                  Astrology
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
          {canRevealPhotos ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-8 h-8 text-pink-600" />
              </div>
              <p className="text-sm text-muted-foreground">Photo available</p>
              <p className="text-xs text-muted-foreground mt-1">
                High compatibility unlocked photos
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-sm text-muted-foreground">Photo locked</p>
              <p className="text-xs text-muted-foreground mt-1">
                Need 68%+ compatibility
              </p>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-1">About</h4>
          <p className="text-sm text-muted-foreground" data-testid={`text-bio-${match.id}`}>
            {matchedUser.bio || `${matchedUser.occupation} from ${matchedUser.city}`}
          </p>
        </div>
        
        <Separator />
        
        <CompatibilityBreakdown 
          compatibility={compatibility} 
          totalScore={compatibilityScore} 
        />
        
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={() => onPass(match.id)}
            data-testid={`button-pass-${match.id}`}
          >
            <X className="w-4 h-4 mr-1 text-red-500" />
            Pass
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-pink-600 hover:bg-pink-700"
            onClick={() => onLike(match.id)}
            data-testid={`button-like-${match.id}`}
          >
            <Heart className="w-4 h-4 mr-1" />
            Like
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Matches() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches'],
    select: (data) => data.filter(match => !match.isLiked && !match.isPassed)
  });

  const likeMutation = useMutation({
    mutationFn: (matchId: string) => 
      apiRequest('POST', `/api/matches/${matchId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      setCurrentMatchIndex(prev => prev + 1);
      toast({
        title: "Match liked!",
        description: "We'll let you know if they like you back.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like match. Please try again.",
        variant: "destructive"
      });
    }
  });

  const passMutation = useMutation({
    mutationFn: (matchId: string) => 
      apiRequest('POST', `/api/matches/${matchId}/pass`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      setCurrentMatchIndex(prev => prev + 1);
      toast({
        title: "Match passed",
        description: "Moving to the next potential match.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to pass match. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleLike = (matchId: string) => {
    likeMutation.mutate(matchId);
  };

  const handlePass = (matchId: string) => {
    passMutation.mutate(matchId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding your matches...</p>
        </div>
      </div>
    );
  }

  const currentMatch = matches[currentMatchIndex];

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-pink-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No More Matches</h2>
          <p className="text-muted-foreground mb-4">
            We're working on finding more compatible matches for you. Check back later!
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Matches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Discover Matches</h1>
          <p className="text-muted-foreground">
            Match {currentMatchIndex + 1} of {matches.length}
          </p>
        </div>
        
        <div className="flex justify-center">
          <MatchCard
            match={currentMatch}
            onLike={handleLike}
            onPass={handlePass}
          />
        </div>
      </div>
    </div>
  );
}
