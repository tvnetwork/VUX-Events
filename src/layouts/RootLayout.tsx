/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
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
import { AnimatePresence } from 'motion/react';
import { Event } from '../types';

export function RootLayout({ initialTab = 'events' }: { initialTab?: 'events' | 'calendars' | 'discover' | 'settings' }) {
  const [activeTab, setActiveTab] = useState<'events' | 'calendars' | 'discover' | 'settings'>(initialTab);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [managingEvent, setManagingEvent] = useState<Event | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return <Dashboard onEventClick={setSelectedEvent} onCreateClick={() => setIsCreateModalOpen(true)} />;
      case 'discover':
        return <Discover onCreateClick={() => setIsCreateModalOpen(true)} />;
      case 'calendars':
        return <Calendars />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onEventClick={setSelectedEvent} onCreateClick={() => setIsCreateModalOpen(true)} />;
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
        />
        
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-12 md:py-16">
          {renderContent()}
        </main>
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onTabChange={setActiveTab}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateEvent onClose={() => setIsCreateModalOpen(false)} />
        )}
        
        {selectedEvent && (
          <EventDetails 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
            onManage={setManagingEvent}
          />
        )}

        {managingEvent && (
          <ManageAttendees 
            event={managingEvent} 
            onClose={() => setManagingEvent(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
