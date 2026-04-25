import { useAuth } from '../AuthContext';
import { Navbar } from './Navbar';
import { LandingNavbar } from './LandingNavbar';
import { useState } from 'react';
import { AuthModal } from './AuthModal';
import { Footer } from './Footer';
import { useNavigate } from 'react-router-dom';
import { WatermarkBackground } from './WatermarkBackground';

interface PageShellProps {
  children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === 'discover') {
      navigate('/discover');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#0b0b0f] via-[#1a1023] to-[#0b0b0f]">
      <WatermarkBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          activeTab="" 
          onTabChange={handleTabChange}
          onSearchClick={() => navigate('/')}
          onCreateClick={() => user ? navigate('/') : setIsAuthOpen(true)}
          onLoginClick={() => setIsAuthOpen(true)}
        />
        
        <main className="flex-1">
          {children}
        </main>

        <Footer onAuthClick={() => setIsAuthOpen(true)} />
      </div>

      {isAuthOpen && (
        <AuthModal onClose={() => setIsAuthOpen(false)} />
      )}
    </div>
  );
}
