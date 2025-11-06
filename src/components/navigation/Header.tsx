import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Plus, Dumbbell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border-subtle">
      <div className="mx-auto px-6 py-4" style={{ maxWidth: '1280px' }}>
        <div className="flex items-center justify-between gap-6">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-2 group">
            <Dumbbell className="text-brand-blue opacity-50 group-hover:opacity-100 transition-opacity" size={24} strokeWidth={1.5} />
            <span className="text-lg font-semibold text-primary tracking-tight">GymTracker Pro</span>
          </Link>

          {/* Search - Center */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted opacity-50" size={16} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search exercises..."
                className="w-full pl-10 pr-4 py-2 bg-card text-primary text-sm border border-card rounded-md focus:outline-none focus:border-brand-blue/50 transition-colors placeholder:text-muted"
              />
            </div>
          </div>

          {/* Actions - Right */}
          <div className="flex items-center gap-3">
            {/* Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-md hover:bg-surface-accent transition-colors"
              title="Profile"
            >
              <User className="text-secondary opacity-50 hover:opacity-100 transition-opacity" size={20} strokeWidth={1.5} />
            </button>

            {/* Start Workout - Primary CTA */}
            <button
              onClick={() => navigate('/workout')}
              className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-md hover:bg-brand-blue/90 transition-colors"
            >
              <Plus size={18} strokeWidth={2} />
              Start Workout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
