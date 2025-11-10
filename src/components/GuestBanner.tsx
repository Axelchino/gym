import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export function GuestBanner() {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('guest-banner-dismissed') === 'true';
  });

  function handleDismiss() {
    setIsDismissed(true);
    localStorage.setItem('guest-banner-dismissed', 'true');
  }

  if (isDismissed) return null;

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
      <div className="mx-auto px-6 py-3" style={{ maxWidth: '1280px' }}>
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon + Message */}
          <div className="flex items-center gap-3">
            <AlertCircle size={20} strokeWidth={1.5} className="flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-sm font-medium">
                You're using Guest Mode - workouts won't be saved
              </span>
              <span className="text-xs text-purple-200">
                Data will be lost when you refresh or close the browser
              </span>
            </div>
          </div>

          {/* Right: CTA + Dismiss */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-1.5 text-sm font-semibold bg-white text-purple-700 rounded-md hover:bg-purple-50 transition-colors whitespace-nowrap"
            >
              Sign Up to Save
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-purple-600 rounded transition-colors"
              title="Dismiss"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
