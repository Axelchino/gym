# GymTracker Pro

> The Data Scientist's Gym App - Exceptional analytics, structured programming, and progressive overload insights for self-directed lifters.

**Production URL:** https://gym-tracker-five-kappa.vercel.app

## Project Vision

A premium, data-driven gym analytics and workout tracking application that embodies Apple's design philosophy: **simple on the surface, powerful underneath**. Built as a personal project focused on exceptional user experience and deep analytics.

## Current Status

**Phase 5: Multi-User & Cloud Sync - COMPLETE (Deployed 2025-10-23)**

✅ **Core Features Available:**
- Google OAuth & Email/Password Authentication
- Cloud-first database with Supabase
- 1,146+ exercise library with intelligent search
- Workout template builder with CSV import/export
- Active workout logging with PR detection
- Comprehensive analytics dashboard with charts
- Multi-week program builder and calendar
- Cross-device data synchronization
- User profiles with preferences

⚠️ **Known Issues:**
- Exercise library needs UX improvements (pending user feedback)

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL) + IndexedDB via Dexie.js
- **Authentication:** Supabase Auth (Google OAuth + Email/Password)
- **Deployment:** Vercel
- **Icons:** Lucide React
- **Charts:** Recharts

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The app runs on `http://localhost:5173`

## Project Structure

```
src/
├── components/         # React components (future)
├── services/          # Business logic layer
│   ├── database.ts    # Dexie database setup
│   └── exerciseService.ts
├── types/             # TypeScript type definitions
│   ├── exercise.ts
│   ├── workout.ts
│   ├── user.ts
│   └── program.ts
├── data/              # Static data & seed files
│   └── exercises.ts   # 229 default exercises
├── App.tsx           # Root component (demo page)
└── main.tsx          # Entry point
```

## Features Roadmap

### Phase 0: Foundation ✅ COMPLETE
- React + TypeScript + Vite setup
- Tailwind CSS configuration
- Design system foundation

### Phase 1: Data Layer ✅ COMPLETE
- IndexedDB schema with Dexie.js
- Complete data models
- Exercise library (1,146 exercises)
- Database service layer

### Phase 2: Workout Tracking ✅ COMPLETE
- Exercise library browser with intelligent search
- Workout template builder
- Active workout logging interface
- Set logging with PR detection
- CSV import/export

### Phase 3: Analytics & Visualization ✅ COMPLETE
- Progress charts (Recharts)
- PR detection and tracking system
- Volume/strength analytics
- Interactive dashboards
- Workout streak tracking

### Phase 4: Programming System ✅ COMPLETE
- Multi-week program builder
- Calendar scheduling with adherence tracking
- 4 pre-built program templates
- Custom program creation

### Phase 5: Multi-User & Cloud Sync ✅ COMPLETE (Deployed)
- Supabase authentication (Google OAuth + Email/Password)
- Cloud-first database architecture
- Cross-device data synchronization
- User profiles with preferences
- Production deployment on Vercel

### Phase 6: Gamification & Social Features (Next)
- Achievement system
- Friend system with template sharing
- Quest/challenge system
- Video demonstrations

## Core Principles

1. **Offline-first** - Works perfectly without internet
2. **Data ownership** - Users control their data completely
3. **Performance** - Fast is a feature (set logging <3 seconds)
4. **Simplicity** - Simple surface, powerful underneath
5. **Zero data loss** - Robust data integrity

## License

Personal project - not for commercial use

## Documentation

Full project plan and technical specs available in `../projectplan.md`
