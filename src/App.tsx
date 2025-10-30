import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { WorkoutLogger } from './pages/WorkoutLogger';
import { Program } from './pages/Program';
import { Analytics } from './pages/Analytics';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import UXDemo from './pages/UXDemo';
import ThreeModesDemo from './pages/ThreeModesDemo';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DevTestPanel } from './components/DevTestPanel';
import { useEffect } from 'react';
import { initializeDatabase } from './services/initializeDatabase';

function App() {
  useEffect(() => {
    // Initialize database with exercises on app load
    initializeDatabase().catch((error) => {
      console.error('Database initialization failed:', error);
    });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/auth" element={<Auth />} />

          {/* UX Demo - accessible without auth */}
          <Route path="/ux-demo" element={<UXDemo />} />
          <Route path="/3-modes" element={<ThreeModesDemo />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="workout" element={<WorkoutLogger />} />
            <Route path="program" element={<Program />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="exercises" element={<ExerciseLibrary />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>

        {/* Dev Test Panel - Always visible in dev mode */}
        {import.meta.env.DEV && <DevTestPanel />}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
