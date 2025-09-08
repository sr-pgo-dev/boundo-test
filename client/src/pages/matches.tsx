import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X, MessageCircle } from "lucide-react";

export default function Matches() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Match</h1>
          <p className="text-muted-foreground">Discover amazing people who share your interests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome to Matches!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your onboarding is complete! The matching system would be implemented here.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="lg" data-testid="button-pass">
                <X className="w-5 h-5 mr-2" />
                Pass
              </Button>
              <Button size="lg" data-testid="button-like">
                <Heart className="w-5 h-5 mr-2" />
                Like
              </Button>
              <Button variant="outline" size="lg" data-testid="button-message">
                <MessageCircle className="w-5 h-5 mr-2" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
