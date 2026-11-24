import { useState } from 'react';
import { Loader2, Mic, MicOff, PhoneOff, Users, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useP2P } from '@/contexts/P2PContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAvatarColor } from '@/lib/avatar-color';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function VoiceChannelView() {
  const {
    currentServer,
    currentChannel,
    localPeer,
    isInVoiceChannel,
    muted,
    activeVoicePeers,
    toggleMute,
    leaveVoiceChannel,
    joinVoiceChannel,
  } = useP2P();
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!currentServer || !currentChannel || joining) return;
    setJoining(true);
    try {
      await joinVoiceChannel(currentServer.id, currentChannel.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Microphone access is required for voice chat');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    await leaveVoiceChannel();
  };

  if (isInVoiceChannel) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 truncate">
                <Volume2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="truncate">{currentChannel?.name}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground tabular-nums">
                <Users className="w-3.5 h-3.5" />
                {activeVoicePeers.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeVoicePeers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  In channel
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {activeVoicePeers.map((peer) => {
                    const isLocal = peer.id === localPeer?.id;
                    return (
                      <div
                        key={peer.id}
                        className="flex items-center gap-2.5 rounded-lg bg-secondary/50 px-3 py-2"
                      >
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0',
                          getAvatarColor(peer.username)
                        )}>
                          {peer.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate flex-1">
                          {peer.username}{isLocal ? ' (you)' : ''}
                        </span>
                        {isLocal && muted && (
                          <MicOff className="w-4 h-4 text-muted-foreground" aria-label="Muted" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-3 py-2">
              <Button
                type="button"
                variant={muted ? 'secondary' : 'default'}
                size="lg"
                aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
                aria-pressed={muted}
                className="rounded-full w-16 h-16"
                onClick={toggleMute}
              >
                {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {muted ? 'Microphone is muted' : 'Microphone is active'}
              </p>
            </div>

            <Button type="button" variant="destructive" className="w-full" onClick={handleLeave}>
              <PhoneOff className="w-4 h-4 mr-2" /> Leave Voice Channel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            {currentChannel?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect directly with peers in this voice channel using WebRTC audio.
          </p>
          <Button type="button" className="w-full" onClick={handleJoin} disabled={joining}>
            {joining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Joining...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" /> Join Voice Channel
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
