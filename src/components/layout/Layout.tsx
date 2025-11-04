import { Outlet } from 'react-router-dom';
import { BottomNav } from '../navigation/BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-surface text-primary pb-16">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
