import { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useP2P } from '@/contexts/P2PContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function VoiceChannelView() {
  const { network, currentServer, currentChannel, isInVoiceChannel, muted, toggleMute, leaveVoiceChannel, joinVoiceChannel } = useP2P();
  const [participants, setParticipants] = useState(0);

  useEffect(() => {
    if (!network || !currentServer || !currentChannel) return;
    const unsub = network.addEventListener((event) => {
      if (event.type === 'voice-state-changed') {
        setParticipants(prev => prev + 1);
      }
    });
    return unsub;
  }, [network, currentServer, currentChannel]);

  const handleJoin = () => {
    if (!currentServer || !currentChannel) return;
    joinVoiceChannel(currentServer.id, currentChannel.id);
  };

  const handleLeave = () => {
    leaveVoiceChannel();
  };

  if (isInVoiceChannel) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              {currentChannel?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-4 py-8">
              <Button
                variant={muted ? 'secondary' : 'default'}
                size="lg"
                className="rounded-full w-16 h-16"
                onClick={toggleMute}
              >
                {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {muted ? 'Microphone is muted' : 'Microphone is active'}
            </div>
            <Button variant="destructive" className="w-full" onClick={handleLeave}>
              <PhoneOff className="w-4 h-4 mr-2" /> Leave Voice Channel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            {currentChannel?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are not connected to this voice channel. Press the button below to join.
          </p>
          <Button className="w-full" onClick={handleJoin}>
            <Volume2 className="w-4 h-4 mr-2" /> Join Voice Channel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
