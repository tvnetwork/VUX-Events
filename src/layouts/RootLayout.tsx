/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from '../components/Navbar';
import { WatermarkBackground } from '../components/WatermarkBackground';
import { CommandPalette } from '../components/CommandPalette';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { AnimatePresence, motion } from 'motion/react';
import { Event } from '../types';
import { useAuth } from '../AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

// Lazy load tabs
const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Discover = lazy(() => import('../pages/Discover').then(m => ({ default: m.Discover })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));
const Profile = lazy(() => import('../pages/Profile').then(m => ({ default: m.Profile })));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Lazy load modals
const CreateEvent = lazy(() => import('../components/CreateEvent').then(m => ({ default: m.CreateEvent })));
const EventDetails = lazy(() => import('../components/EventDetails').then(m => ({ default: m.EventDetails })));
const ManageAttendees = lazy(() => import('../components/ManageAttendees').then(m => ({ default: m.ManageAttendees })));
const OnboardingWizard = lazy(() => import('../components/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const FeedbackModal = lazy(() => import('../components/FeedbackModal').then(m => ({ default: m.FeedbackModal })));

function TabLoading() {
  return (
    <div className="w-full py-32 flex flex-col items-center justify-center space-y-6">
       <Loader2 className="w-8 h-8 animate-spin text-indigo-500/20" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/5">Loading content</p>
    </div>
  );
}

export function RootLayout({ initialTab = 'events' }: { initialTab?: 'events' | 'discover' | 'settings' | 'profile' | 'admin' }) {
  const { profile: userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'events' | 'discover' | 'settings' | 'profile' | 'admin'>(initialTab);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<Event | null>(null);
  const [managingEvent, setManagingEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Check for event ID in URL
  useEffect(() => {
    const eventId = searchParams.get('event');
    const feedbackId = searchParams.get('feedback');

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

    if (feedbackId) {
      const fetchFeedbackEvent = async () => {
        const eventDoc = await getDoc(doc(db, 'events', feedbackId));
        if (eventDoc.exists()) {
          setFeedbackEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
        }
        // Clear the param after opening
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('feedback');
        setSearchParams(newParams);
      };
      fetchFeedbackEvent();
    }
  }, [searchParams, setSearchParams]);

  // Show onboarding if profile exists but onboarding is not completed
  useEffect(() => {
    if (userProfile && userProfile.onboardingCompleted === false) {
      setShowOnboarding(true);
    }
  }, [userProfile]);

  const renderContent = () => {
    return (
      <Suspense fallback={<TabLoading />}>
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, x: 10 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.2 }}
        >
          {(() => {
            switch (activeTab) {
              case 'events':
                return <Dashboard onEventClick={setSelectedEvent} onCreateClick={() => setIsCreateModalOpen(true)} onEditEvent={setEditingEvent} />;
              case 'discover':
                return <Discover onCreateClick={() => setIsCreateModalOpen(true)} onEventClick={setSelectedEvent} />;
              case 'settings':
                return <Settings />;
              case 'profile':
                return <Profile />;
              case 'admin':
                return <AdminDashboard />;
              default:
                return <Dashboard onEventClick={setSelectedEvent} onCreateClick={() => setIsCreateModalOpen(true)} onEditEvent={setEditingEvent} />;
            }
          })()}
        </motion.div>
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#0b0b0f]">
      <WatermarkBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <AnnouncementBanner />
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
        <Footer onAuthClick={() => setIsCreateModalOpen(true)} />
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onTabChange={setActiveTab}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <AnimatePresence>
        {(isCreateModalOpen || editingEvent) && (
          <Suspense fallback={null}>
            <CreateEvent 
              eventToEdit={editingEvent} 
              onClose={() => {
                setIsCreateModalOpen(false);
                setEditingEvent(null);
              }} 
            />
          </Suspense>
        )}
        
        {selectedEvent && (
          <Suspense fallback={null}>
            <EventDetails 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)} 
              onManage={setManagingEvent}
              onEdit={setEditingEvent}
            />
          </Suspense>
        )}

        {managingEvent && (
          <Suspense fallback={null}>
            <ManageAttendees 
              event={managingEvent} 
              onClose={() => setManagingEvent(null)} 
            />
          </Suspense>
        )}

        {showOnboarding && (
          <Suspense fallback={null}>
            <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
          </Suspense>
        )}

        {feedbackEvent && (
          <Suspense fallback={null}>
            <FeedbackModal 
              event={feedbackEvent} 
              onClose={() => setFeedbackEvent(null)} 
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
