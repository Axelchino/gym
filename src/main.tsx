import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/themes.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { syncManager } from './services/syncManager'
import { initializeDatabase } from './services/initializeDatabase'

// Configure React Query with optimal caching settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 min
      gcTime: 10 * 60 * 1000,   // 10 minutes - cache persists for 10 min (garbage collection)
      retry: 2,                  // Retry failed requests 2 times
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab
      refetchOnMount: false,    // Don't refetch on component mount if data is still fresh
    },
  },
})

// Initialize exercise database on app start (critical for templates to work)
initializeDatabase().then(() => {
  console.log('✅ Exercise database initialized');
}).catch((error) => {
  console.error('❌ Failed to initialize exercise database:', error);
});

// Start offline sync manager
syncManager.start();
console.log('🚀 Sync manager started - app now works offline!');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
