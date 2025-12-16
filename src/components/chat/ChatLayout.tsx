import { ServerSidebar } from './ServerSidebar';
import { ChannelSidebar } from './ChannelSidebar';
import { MessageArea } from './MessageArea';
import { MembersSidebar } from './MembersSidebar';
import { DMList } from './DMList';
import { DMConversation } from './DMConversation';
import { useP2P } from '@/contexts/P2PContext';

export function ChatLayout() {
  const { currentServer, viewMode } = useP2P();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <ServerSidebar />
      
      {viewMode === 'dms' ? (
        <>
          <DMList />
          <DMConversation />
        </>
      ) : (
        <>
          <ChannelSidebar />
          <MessageArea />
          {currentServer && <MembersSidebar />}
        </>
      )}
    </div>
  );
}
