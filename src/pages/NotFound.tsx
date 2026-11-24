import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { OffGridLogo } from '@/components/brand/OffGridLogo';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-glow text-primary-foreground">
          <OffGridLogo size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight tabular-nums text-foreground">404</h1>
          <p className="text-base text-muted-foreground">
            That route does not exist on this peer node.
          </p>
        </div>
        <Button asChild>
          <Link to="/">Return to OffGrid</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
