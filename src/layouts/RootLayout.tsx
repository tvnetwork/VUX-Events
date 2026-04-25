/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Dashboard } from '../pages/Dashboard';
import { WatermarkBackground } from '../components/WatermarkBackground';
import { Discover } from '../pages/Discover';
import { Calendars } from '../pages/Calendars';
import { Settings } from '../pages/Settings';
import { CommandPalette } from '../components/CommandPalette';
import { CreateEvent } from '../components/CreateEvent';
import { EventDetails } from '../components/EventDetails';
import { ManageAttendees } from '../components/ManageAttendees';
import { OnboardingWizard } from '../components/OnboardingWizard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AnimatePresence } from 'motion/react';
import { Event } from '../types';
import { useAuth } from '../AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function RootLayout({ initialTab = 'events' }: { initialTab?: 'events' | 'calendars' | 'discover' | 'settings' | 'admin' }) {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'events' | 'calendars' | 'discover' | 'settings' | 'admin'>(initialTab);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [managingEvent, setManagingEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check for event ID in URL
  useEffect(() => {
    const eventId = searchParams.get('event');
    if (eventId) {
      const fetchEvent = async () => {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setSelectedEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
        }
        // Clear the param after opening
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('event');
        setSearchParams(newParams);
      };
      fetchEvent();
    }
  }, [searchParams, setSearchParams]);

  // Show onboarding if profile exists but onboarding is not completed
  useEffect(() => {
    if (profile && profile.onboardingCompleted === false) {
      setShowOnboarding(true);
    }
  }, [profile]);

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return <Dashboard onEventClick={setSelectedEvent} onCreateClick={() => setIsCreateModalOpen(true)} onEditEvent={setEditingEvent} />;
      case 'discover':
        return <Discover onCreateClick={() => setIsCreateModalOpen(true)} onEventClick={setSelectedEvent} />;
      case 'calendars':
        return <Calendars onEditEvent={setEditingEvent} />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Dashboard onEventClick={setSelectedEvent} onCreateClick={() => setIsCreateModalOpen(true)} onEditEvent={setEditingEvent} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#0b0b0f]">
      <WatermarkBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onSearchClick={() => setIsCommandPaletteOpen(true)}
          onCreateClick={() => setIsCreateModalOpen(true)}
          onLoginClick={() => {}}
        />
        
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-12 md:py-16">
          {renderContent()}
        </main>
        <Footer />
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onTabChange={setActiveTab}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <AnimatePresence>
        {(isCreateModalOpen || editingEvent) && (
          <CreateEvent 
            eventToEdit={editingEvent} 
            onClose={() => {
              setIsCreateModalOpen(false);
              setEditingEvent(null);
            }} 
          />
        )}
        
        {selectedEvent && (
          <EventDetails 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
            onManage={setManagingEvent}
            onEdit={setEditingEvent}
          />
        )}

        {managingEvent && (
          <ManageAttendees 
            event={managingEvent} 
            onClose={() => setManagingEvent(null)} 
          />
        )}

        {showOnboarding && (
          <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
