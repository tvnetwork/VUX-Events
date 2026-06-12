import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './AuthContext';
import { ScrollToTop } from './components/ScrollToTop';
import { PageShell } from './components/PageShell';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Event } from './types';

// Lazy load pages for performance
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const RootLayout = lazy(() => import('./layouts/RootLayout').then(m => ({ default: m.RootLayout })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Security = lazy(() => import('./pages/Security').then(m => ({ default: m.Security })));
const DMCA = lazy(() => import('./pages/DMCA').then(m => ({ default: m.DMCA })));
const Help = lazy(() => import('./pages/Help').then(m => ({ default: m.Help })));
const Discover = lazy(() => import('./pages/Discover').then(m => ({ default: m.Discover })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const Developer = lazy(() => import('./pages/Developer').then(m => ({ default: m.Developer })));
const NotFound = lazy(() => import('./pages/NotFound'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const EventDetails = lazy(() => import('./components/EventDetails').then(m => ({ default: m.EventDetails })));
const MFAModal = lazy(() => import('./components/auth/MFAModal').then(m => ({ default: m.MFAModal })));
const Embed = lazy(() => import('./pages/Embed').then(m => ({ default: m.Embed })));

function RouteTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function LoadingFallback() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#07070a]">
      <div className="space-y-6 flex flex-col items-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 animate-pulse">Loading platform</p>
      </div>
    </div>
  );
}

// Wrapper for components rendered inside RootLayout's Outlet
function DashboardWrapper() {
  const context = useOutletContext<any>();
  return <Dashboard onViewEvent={context.setSelectedEvent} onManageAttendees={context.setManagingEvent} onEditEvent={context.setEditingEvent} onCreateClick={() => context.setIsCreateModalOpen(true)} />;
}

function DiscoverWrapperInsideRoot() {
  const context = useOutletContext<any>();
  return <Discover onViewEvent={context.setSelectedEvent} />;
}

function AppContent() {
  const { user, profile, loading, mfaVerified } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  // MFA Gateway
  if (user && profile?.security?.twoFactorEnabled && !mfaVerified) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <MFAModal />
      </Suspense>
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
      <Route path="/" element={<RouteTransition>{user ? <RootLayout /> : <Landing />}</RouteTransition>}>
        {user && (
          <>
            <Route index element={<DashboardWrapper />} />
            <Route path="discover" element={<DiscoverWrapperInsideRoot />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="developer" element={<Developer />} />
            {profile?.email?.toLowerCase() === 'oladoyeheritage445@gmail.com'.toLowerCase() && (
               <Route path="admin" element={<AdminDashboard />} />
            )}
          </>
        )}
      </Route>

      {!user && (
         <Route path="/discover" element={<DiscoverWrapper />} />
      )}

      <Route path="/embed" element={<Suspense fallback={<LoadingFallback />}><Embed /></Suspense>} />
      <Route path="/help" element={<RouteTransition><PageShell><Help /></PageShell></RouteTransition>} />
      <Route path="/terms" element={<RouteTransition><PageShell><Terms /></PageShell></RouteTransition>} />
      <Route path="/privacy" element={<RouteTransition><PageShell><Privacy /></PageShell></RouteTransition>} />
      <Route path="/security" element={<RouteTransition><PageShell><Security /></PageShell></RouteTransition>} />
      <Route path="/dmca" element={<RouteTransition><PageShell><DMCA /></PageShell></RouteTransition>} />
      <Route path="/pricing" element={<RouteTransition><ComingSoon /></RouteTransition>} />
      <Route path="/synchronization" element={<RouteTransition><ComingSoon /></RouteTransition>} />
      <Route path="/upgrade" element={<RouteTransition><ComingSoon /></RouteTransition>} />
      <Route path="*" element={<RouteTransition><NotFound /></RouteTransition>} />
    </Routes>
  );
}

// Guest Discover Wrapper
function DiscoverWrapper() {
  const { user } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const eventId = searchParams.get('event');
  
  if (user) {
    return <Navigate to="/discover" replace />;
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
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <AppContent />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
