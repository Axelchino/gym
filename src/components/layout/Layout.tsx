import { Outlet } from 'react-router-dom';
import { Header } from '../navigation/Header';
import { GuestBanner } from '../GuestBanner';
import { useAuth } from '../../contexts/AuthContext';

export function Layout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface text-primary">
      {/* Top header navigation */}
      <Header />

      {/* Guest mode banner - only shown for unauthenticated users */}
      {!user && <GuestBanner />}

      {/* Main content - Centered container with 1536px max width */}
      <main className="mx-auto px-3 sm:px-6 py-4 sm:py-8" style={{ maxWidth: '1536px' }}>
        <Outlet />
      </main>
    </div>
  );
}
