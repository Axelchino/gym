import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-charts': ['recharts'],
          'vendor-db': ['dexie'],
          'vendor-icons': ['lucide-react'],

          // Exercise data - lazy loaded only when ExerciseLibrary is visited
          // This is automatically handled by dynamic import in ExerciseLibrary.tsx
        },
      },
    },
    // Increase chunk size warning limit (we know about the exercise data)
    chunkSizeWarningLimit: 1000,
  },
})
