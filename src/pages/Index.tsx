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
        <title>Local Echo | Private peer-to-peer communities</title>
        <meta name="description" content="Private peer-to-peer communities with encrypted chat, local-first storage, and no central message server." />
      </Helmet>
      <P2PProvider>
        <ChatApp />
      </P2PProvider>
    </>
  );
};

export default Index;
