/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Landing } from './pages/Landing';
import { RootLayout } from './layouts/RootLayout';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Security } from './pages/Security';
import { DMCA } from './pages/DMCA';
import { Help } from './pages/Help';
import { Discover } from './pages/Discover';
import { LandingNavbar } from './components/LandingNavbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PageShell } from './components/PageShell';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { EventDetails } from './components/EventDetails';
import { Event } from './types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

import { AdminDashboard } from './pages/AdminDashboard';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0b0b0f]">
        <Loader2 className="w-8 h-8 animate-spin text-white/10" />
      </div>
    );
  }

  // Check for shared event links
  const searchParams = new URLSearchParams(window.location.search);
  const eventId = searchParams.get('event');

  if (eventId && !user) {
    return <DiscoverWrapper />;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <RootLayout /> : <Landing />} />
      <Route path="/discover" element={<DiscoverWrapper />} />
      <Route path="/help" element={<PageShell><Help /></PageShell>} />
      <Route path="/terms" element={<PageShell><Terms /></PageShell>} />
      <Route path="/privacy" element={<PageShell><Privacy /></PageShell>} />
      <Route path="/security" element={<PageShell><Security /></PageShell>} />
      <Route path="/dmca" element={<PageShell><DMCA /></PageShell>} />
      <Route path="/admin" element={user ? <RootLayout initialTab="admin" /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DiscoverWrapper() {
  const { user } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const eventId = searchParams.get('event');
  
  if (user) {
    return <RootLayout initialTab="discover" />;
  }

  // Handle viewing a specific event as a guest
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setSelectedEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
        }
      };
      fetchEvent();
    }
  }, [eventId]);

  return (
    <PageShell>
      <div className="pt-32 pb-20 px-6 max-w-[1280px] mx-auto">
        <Discover onEventClick={setSelectedEvent} />
        <AnimatePresence>
          {selectedEvent && (
            <EventDetails 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

