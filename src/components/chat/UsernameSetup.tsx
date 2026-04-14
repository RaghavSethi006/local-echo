import { useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Shield, Wifi, Lock, Users } from 'lucide-react';

export function UsernameSetup() {
  const { initialize, hasStoredIdentity, restoreSession } = useP2P();
  const [username, setUsername] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsInitializing(true);
    try {
      await initialize(username.trim());
      toast.success('Welcome to P2P Chat!');
    } catch (error) {
      toast.error('Failed to initialize. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await restoreSession();
      toast.success('Session restored! Your chats are back.');
    } catch (error) {
      toast.error('Failed to restore session. Please create a new one.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl gradient-primary flex items-center justify-center shadow-glow animate-float">
            <Wifi className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">P2P Chat</h1>
            <p className="text-muted-foreground mt-2">
              Cloudless, decentralized, encrypted
            </p>
          </div>
        </div>

        {/* Setup Form */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Choose your username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="h-12 text-lg"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                This name will be visible to other peers in servers you join.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity"
              disabled={isInitializing}
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </form>

          {hasStoredIdentity && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={handleRestore}
                variant="outline"
                className="w-full h-12 text-base"
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Resume Previous Session
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Your previous chats and servers are still saved locally.
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">E2E Encrypted</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Wifi className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Peer-to-Peer</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Lock className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">No Cloud</p>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-center text-muted-foreground">
          All data stays on your device. Messages persist locally between sessions.
        </p>
      </div>
    </div>
  );
}
