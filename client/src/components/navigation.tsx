import { Link, useLocation } from 'wouter';
import { Heart, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    {
      href: '/matches',
      label: 'Matches',
      icon: Heart,
      active: location === '/matches'
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      active: location === '/settings'
    }
  ];

  // Don't show navigation on onboarding pages
  if (location === '/' || location === '/onboarding') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="flex space-x-8 py-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2 px-4",
                    item.active && "text-pink-600 bg-pink-50 dark:bg-pink-900/20"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}