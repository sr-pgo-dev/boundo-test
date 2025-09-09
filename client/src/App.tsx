import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Matches from "@/pages/matches";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Navigation from "@/components/navigation";
import { useEffect } from "react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user && location !== "/login" && location !== "/register") {
        setLocation("/login");
      } else if (user && (location === "/" || location === "/login" || location === "/register")) {
        if (user.onboardingCompleted) {
          setLocation("/matches");
        } else {
          setLocation("/onboarding");
        }
      }
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/onboarding">
          <ProtectedRoute component={Onboarding} />
        </Route>
        <Route path="/matches">
          <ProtectedRoute component={Matches} />
        </Route>
        <Route path="/settings">
          <ProtectedRoute component={Settings} />
        </Route>
        <Route path="/">
          {user ? (
            user.onboardingCompleted ? (
              <ProtectedRoute component={Matches} />
            ) : (
              <ProtectedRoute component={Onboarding} />
            )
          ) : (
            <Login />
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
      {user && <Navigation />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen">
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
