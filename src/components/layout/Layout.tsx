import { Outlet } from 'react-router-dom';
import { Header } from '../navigation/Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-surface text-primary">
      {/* Top header navigation */}
      <Header />

      {/* Main content - Centered container with 1280px max width */}
      <main className="mx-auto px-6 py-8" style={{ maxWidth: '1280px' }}>
        <Outlet />
      </main>
    </div>
  );
}
