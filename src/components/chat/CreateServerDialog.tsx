import { useState } from 'react';
import { useP2P } from '@/contexts/P2PContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Server, Loader2 } from 'lucide-react';

interface CreateServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateServerDialog({ open, onOpenChange }: CreateServerDialogProps) {
  const { createServer } = useP2P();
  const [serverName, setServerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!serverName.trim()) {
      toast.error('Please enter a server name');
      return;
    }

    setIsCreating(true);
    try {
      await createServer(serverName.trim());
      toast.success(`Server "${serverName}" created!`);
      setServerName('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create server');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Create a Server
          </DialogTitle>
          <DialogDescription>
            Create a new P2P server. You'll become the host and can invite others to join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="serverName">Server Name</Label>
            <Input
              id="serverName"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="My Awesome Server"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">P2P Server</strong> — This server exists only while you're online. 
              Messages are transmitted directly between peers with end-to-end encryption.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Server'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
