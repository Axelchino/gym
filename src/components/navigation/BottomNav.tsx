import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Calendar, TrendingUp, Library, User } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/workout', icon: Dumbbell, label: 'Workout' },
    { to: '/program', icon: Calendar, label: 'Program' },
    { to: '/analytics', icon: TrendingUp, label: 'Progress' },
    { to: '/exercises', icon: Library, label: 'Exercises' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-elevated border-t border-border-subtle z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-brand-purple text-white'
                  : 'text-secondary hover:text-primary border-2 border-transparent hover:border-border-medium'
              }`
            }
          >
            <Icon size={24} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
