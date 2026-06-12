import { useState, useEffect, lazy, Suspense } from 'react';
import { Sidebar } from '../components/Sidebar';
import { WatermarkBackground } from '../components/WatermarkBackground';
import { CommandPalette } from '../components/CommandPalette';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { AnimatePresence, motion } from 'motion/react';
import { Event } from '../types';
import { useAuth } from '../AuthContext';
import { useSearchParams, Outlet, useLocation } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

// Lazy load modals
const CreateEvent = lazy(() => import('../components/CreateEvent').then(m => ({ default: m.CreateEvent })));
const EventDetails = lazy(() => import('../components/EventDetails').then(m => ({ default: m.EventDetails })));
const ManageAttendees = lazy(() => import('../components/ManageAttendees').then(m => ({ default: m.ManageAttendees })));
const OnboardingWizard = lazy(() => import('../components/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const FeedbackModal = lazy(() => import('../components/FeedbackModal').then(m => ({ default: m.FeedbackModal })));

function RouteTransition({ children, locationKey }: { children: React.ReactNode, locationKey: string }) {
  return (
    <motion.div
      key={locationKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export function RootLayout() {
  const { profile: userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<Event | null>(null);
  const [managingEvent, setManagingEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

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
        onSearchClick={() => setIsCommandPaletteOpen(true)}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area next to Sidebar */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 relative z-10 transition-all duration-300">
        <AnnouncementBanner />
        
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 pt-20 md:pt-8">
          <AnimatePresence mode="wait">
             <RouteTransition locationKey={location.pathname}>
               {/* Context provider logic for Modals is now handled in App or passed down if necessary */}
               {/* The Outlet renders the child routes from react-router */}
               <Outlet context={{ setSelectedEvent, setManagingEvent, setEditingEvent, setIsCreateModalOpen }} />
             </RouteTransition>
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
