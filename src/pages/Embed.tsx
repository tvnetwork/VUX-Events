import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VUXEventWidget } from '../sdk/VUXEventWidget';

export function Embed() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const theme = searchParams.get('theme') as 'dark' | 'light' || 'dark';
  const apiKey = searchParams.get('apiKey') || 'vux_test_123';
  
  // For the embed, we allow passing user data via query params for guest RSVPs
  const userName = searchParams.get('userName');
  const userEmail = searchParams.get('userEmail');

  const currentUser = userName && userEmail ? { name: userName, email: userEmail } : undefined;

  // Render a clean background without standard VUX navigation
  useEffect(() => {
    document.body.style.background = theme === 'dark' ? '#0b0b0f' : '#f9fafb';
    return () => {
      document.body.style.background = '';
    };
  }, [theme]);

  if (!eventId) {
    return (
      <div className="flex items-center justify-center h-screen w-full text-red-500 font-bold">
        Missing eventId parameter in URL.
      </div>
    );
  }

  return (
    <div className="w-full h-screen p-4 flex items-center justify-center overflow-hidden">
      <VUXEventWidget 
        eventId={eventId} 
        apiKey={apiKey} 
        theme={theme}
        currentUser={currentUser}
      />
    </div>
  );
}
