import { P2PProvider, useP2P } from '@/contexts/P2PContext';
import { UsernameSetup } from '@/components/chat/UsernameSetup';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { Helmet } from 'react-helmet-async';

function ChatApp() {
  const { isInitialized } = useP2P();

  if (!isInitialized) {
    return <UsernameSetup />;
  }

  return <ChatLayout />;
}

const Index = () => {
  return (
    <>
      <Helmet>
        <title>P2P Chat - Cloudless Discord Clone</title>
        <meta name="description" content="A decentralized, peer-to-peer chat application with end-to-end encryption. No servers, no cloud - just direct communication." />
      </Helmet>
      <P2PProvider>
        <ChatApp />
      </P2PProvider>
    </>
  );
};

export default Index;
