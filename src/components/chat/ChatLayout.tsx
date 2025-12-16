import { ServerSidebar } from './ServerSidebar';
import { ChannelSidebar } from './ChannelSidebar';
import { MessageArea } from './MessageArea';
import { MembersSidebar } from './MembersSidebar';
import { useP2P } from '@/contexts/P2PContext';

export function ChatLayout() {
  const { currentServer } = useP2P();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <ServerSidebar />
      <ChannelSidebar />
      <MessageArea />
      {currentServer && <MembersSidebar />}
    </div>
  );
}
