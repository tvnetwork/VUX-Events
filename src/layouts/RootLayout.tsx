/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Sidebar } from '../components/Sidebar';
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
    <div className="w-full py-32 flex flex-col items-center justify-center space-y-4">
       <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
       <p className="text-sm font-medium text-white/40">Loading content...</p>
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

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans flex">
      {/* Dynamic ambient background is handled by individual pages, but Watermark remains for texture */}
      <WatermarkBackground />

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
        onSearchClick={() => setIsCommandPaletteOpen(true)}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area next to Sidebar */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 relative z-10 transition-all duration-300">
        <AnnouncementBanner />
        
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 pt-20 md:pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Suspense fallback={<TabLoading />}>
                {activeTab === 'events' && (
                  <Dashboard 
                    onViewEvent={setSelectedEvent} 
                    onManageAttendees={setManagingEvent}
                    onEditEvent={setEditingEvent}
                    onCreateClick={() => setIsCreateModalOpen(true)}
                  />
                )}
                {activeTab === 'discover' && (
                  <Discover onViewEvent={setSelectedEvent} />
                )}
                {activeTab === 'profile' && (
                  <Profile onViewEvent={setSelectedEvent} />
                )}
                {activeTab === 'settings' && (
                  <Settings />
                )}
                {activeTab === 'admin' && (
                  <AdminDashboard />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
        
        <Footer onAuthClick={() => {}} />
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectEvent={setSelectedEvent}
      />

      <AnimatePresence>
        {isCreateModalOpen && (
          <Suspense fallback={null}>
            <CreateEvent 
              onClose={() => {
                setIsCreateModalOpen(false);
                setEditingEvent(null);
              }}
              eventToEdit={editingEvent || undefined}
            />
          </Suspense>
        )}

        {selectedEvent && (
          <Suspense fallback={null}>
            <EventDetails 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)}
              onManageAttendees={() => {
                setSelectedEvent(null);
                setManagingEvent(selectedEvent);
              }}
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

        {showOnboarding && userProfile && (
          <Suspense fallback={null}>
            <OnboardingWizard 
              profile={userProfile} 
              onComplete={() => setShowOnboarding(false)} 
            />
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
