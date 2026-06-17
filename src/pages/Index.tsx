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
        <title>OffGrid | P2P communities, off the grid</title>
        <meta name="description" content="Private peer-to-peer communities with encrypted chat, local-first storage, and no central server." />
      </Helmet>
      <P2PProvider>
        <ChatApp />
      </P2PProvider>
    </>
  );
};

export default Index;
