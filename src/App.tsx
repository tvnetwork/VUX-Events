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
import { Discover } from './pages/Discover';
import { LandingNavbar } from './components/LandingNavbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PageShell } from './components/PageShell';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0b0b0f]">
        <Loader2 className="w-8 h-8 animate-spin text-white/10" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <RootLayout /> : <Landing />} />
      <Route path="/discover" element={<DiscoverWrapper />} />
      <Route path="/terms" element={<PageShell><Terms /></PageShell>} />
      <Route path="/privacy" element={<PageShell><Privacy /></PageShell>} />
      <Route path="/security" element={<PageShell><Security /></PageShell>} />
      <Route path="/dmca" element={<PageShell><DMCA /></PageShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DiscoverWrapper() {
  const { user } = useAuth();
  
  if (user) {
    return <RootLayout initialTab="discover" />;
  }

  return (
    <PageShell>
      <div className="pt-32 pb-20 px-6 max-w-[1280px] mx-auto">
        <Discover />
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

