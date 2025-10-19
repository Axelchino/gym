# GymTracker Pro - Comprehensive Project Plan

## Project Vision

A premium, data-driven gym analytics and workout tracking application that embodies Apple's design philosophy: **simple on the surface, powerful underneath**. Built as a personal project with no monetization requirements, focusing on exceptional user experience and deep analytics for self-directed lifters.

### Core Philosophy
> "Make it effortless to track, impossible to miss progress, and genuinely enjoyable to use."

### Positioning
The **"Data Scientist's Gym App"** - exceptional analytics, clear progressive overload insights, and structured programming for lifters who want to understand their training, not just log it.

---

## Priority Framework

### 🔴 CRITICAL PRIORITY (Phase 1-3)
- **Offline-first architecture** with cloud sync to profile
- **Comprehensive analytics** with interactive charts (see progress clearly)
- **Weekly/monthly programming** system
- **PR tracking** with notifications
- **Data export** (CSV primarily)
- **Efficient workout logging** (under 3 seconds per set)
- **Exercise library** with demonstrations

### 🟡 HIGH PRIORITY (Phase 4-5)
- **Achievement/milestone system** (gamification for motivation)
- **Video demonstrations** for exercises (high-quality form guides)
- **Multi-user support** with individual profiles

### 🟢 MODERATE PRIORITY (Phase 6)
- **Body measurements tracking** (chest, arms, waist, legs, etc.)
- **Profile customization** and settings

### 🔵 LOW PRIORITY (Phase 7+)
- **RPE/RIR tracking** per set
- **Progressive overload suggestions** (smart, contextual recommendations)

### ⚪ NON-ESSENTIAL (Future Consideration)
- Progress photos and comparisons
- Rest period timers (explicitly not wanted in app)
- Social features beyond basic sharing

---

## Technical Architecture Decisions

### Frontend Stack
- **Framework:** React with TypeScript (type safety, better DX)
- **Styling:** Tailwind CSS (rapid development, consistent design)
- **State Management:** Zustand or Jotai (simpler than Redux, perfect for local-first)
- **Charts:** Recharts (responsive, customizable, React-native)
- **Icons:** Lucide React (consistent, modern icon set)
- **Offline Storage:** IndexedDB via Dexie.js (robust, queryable local database)

### Backend Strategy (Offline-First)
- **Primary:** Local-first with IndexedDB
- **Sync:** Firebase/Supabase for cloud backup and multi-device sync
- **Architecture:** Eventual consistency model (offline changes sync when online)
- **Data ownership:** User controls all data, easy export

### Deployment
- **Web App:** Vercel/Netlify for instant deployment
- **PWA:** Progressive Web App for mobile (install on home screen)
- **Desktop:** Optional Electron wrapper for native desktop experience

---

## Development Phases

## Phase 0: Project Foundation & Setup
**Timeline:** Week 1
**Status:** ✅ COMPLETE

### Objectives
- Set up development environment
- Establish project structure
- Make architectural decisions
- Create design system foundation

### Tasks
1. **Project Initialization**
   - [x] Initialize React + TypeScript + Vite project
   - [x] Configure Tailwind CSS with custom theme
   - [x] Set up ESLint + Prettier for code consistency
   - [x] Configure Git repository and .gitignore

2. **Architecture Setup**
   - [x] Choose and configure state management (Zustand recommended)
   - [x] Set up IndexedDB schema with Dexie.js
   - [x] Design data models (Exercise, Workout, Set, Profile, Achievement)
   - [x] Set up routing structure (React Router) - ✅ COMPLETE

3. **Design System Foundation**
   - [x] Define color palette (OLED black + Coolors palette)
   - [x] Establish typography scale
   - [x] Create reusable component library structure
   - [x] Design icon and spacing system
   - [x] Implement OLED dark theme with enhanced contrast

4. **Development Tools**
   - [x] Set up development server with hot reload
   - [x] Configure build pipeline
   - [x] Set up environment variables (.env)
   - [ ] Create component documentation template - deferred

### Deliverables
- ✅ Working development environment
- ✅ Project structure with clear folder organization
- ✅ Design system documentation
- ✅ Database schema design document

### Technical Decisions Made
- [x] State management library choice - Zustand (deferred to when needed)
- [ ] Backend service (Firebase vs Supabase vs custom) - deferred to Phase 5
- [ ] Authentication strategy - deferred to Phase 5
- [ ] Offline sync approach - deferred to Phase 5

---

## Phase 1: Core Data Layer & Offline Foundation
**Timeline:** Weeks 2-3
**Status:** ✅ COMPLETE
**Dependencies:** Phase 0

### Objectives
- Build robust local database
- Implement offline-first data models
- Create sync mechanism foundation
- Ensure data integrity and performance

### Tasks

1. **Database Schema Implementation**
   - [x] Create `users` table/store (profile data)
   - [x] Create `exercises` table (library with metadata)
   - [x] Create `workouts` table (workout templates)
   - [x] Create `workout_logs` table (completed workouts)
   - [x] Create `sets` table (individual set data)
   - [x] Create `achievements` table (milestone tracking)
   - [x] Create `body_measurements` table (stats over time)
   - [x] Create `programs` table (for multi-week programming)
   - [ ] Create `sync_queue` table (pending sync operations) - deferred to Phase 5

2. **Data Models & Types**
   ```typescript
   interface Exercise {
     id: string;
     name: string;
     category: string; // Chest, Back, Legs, etc.
     equipment: string;
     difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
     primaryMuscles: string[];
     secondaryMuscles: string[];
     muscleMap: Record<string, 'primary' | 'secondary'>;
     instructions: string;
     videoUrl?: string;
     imageUrl?: string;
     isCustom: boolean;
     createdAt: Date;
     updatedAt: Date;
   }

   interface WorkoutTemplate {
     id: string;
     userId: string;
     name: string;
     description?: string;
     exercises: WorkoutExercise[];
     isActive: boolean;
     schedule?: {
       daysOfWeek: number[]; // 0-6 (Sun-Sat)
       weekNumber?: number; // For multi-week programs
     };
     createdAt: Date;
     updatedAt: Date;
   }

   interface WorkoutLog {
     id: string;
     userId: string;
     templateId?: string;
     name: string;
     date: Date;
     startTime: Date;
     endTime?: Date;
     duration?: number; // minutes
     totalVolume: number; // calculated
     exercises: LoggedExercise[];
     notes?: string;
     synced: boolean;
     createdAt: Date;
   }

   interface Set {
     id: string;
     workoutLogId: string;
     exerciseId: string;
     setNumber: number;
     weight: number;
     reps: number;
     rpe?: number; // 1-10 scale
     rir?: number; // Reps in Reserve
     isWarmup: boolean;
     isDropSet: boolean;
     isFailure: boolean;
     completed: boolean;
     notes?: string;
     timestamp: Date;
   }

   interface PersonalRecord {
     id: string;
     userId: string;
     exerciseId: string;
     type: 'weight' | 'reps' | 'volume' | '1rm';
     value: number;
     reps?: number; // for weight PRs
     date: Date;
     workoutLogId: string;
     previousRecord?: number;
   }
   ```

3. **IndexedDB Implementation**
   - [x] Set up Dexie.js configuration
   - [x] Create database migration system
   - [x] Implement CRUD operations for each entity
   - [x] Add indexes for query optimization
   - [x] Create database utility functions

4. **Data Service Layer**
   - [x] Create `ExerciseService` (CRUD + search)
   - [ ] Create `WorkoutService` (templates + logs) - basic structure, needs completion in Phase 2
   - [ ] Create `SetService` (logging + history) - deferred to Phase 2
   - [ ] Create `AnalyticsService` (calculations + aggregations) - deferred to Phase 3
   - [ ] Create `SyncService` (offline queue + sync logic) - deferred to Phase 5

5. **Offline Queue System**
   - [ ] Implement operation queue for offline changes - deferred to Phase 5
   - [ ] Create conflict resolution strategy - deferred to Phase 5
   - [ ] Add retry logic for failed syncs - deferred to Phase 5
   - [ ] Build sync status indicator - deferred to Phase 5

### Deliverables
- ✅ Fully functional local database with all tables
- ✅ Complete data models with TypeScript types
- ✅ Service layer for data operations
- ✅ Offline queue system ready for sync
- ✅ Database seed data (default exercises)

### Technical Milestones
- Can store and retrieve workout data offline
- Database queries are performant (<50ms for common operations)
- Data integrity maintained across operations

---

## Phase 2: Essential Workout Tracking
**Timeline:** Weeks 4-6
**Status:** 🟡 IN PROGRESS
**Dependencies:** Phase 1

### What's Complete So Far
- ✅ React Router with 5 main pages
- ✅ Bottom navigation with route highlighting
- ✅ Layout component with consistent structure
- ✅ OLED dark theme implementation
- ✅ Exercise Library page with intelligent search (191+ exercises)
- ✅ Multi-field search (name, category, primary/secondary muscles)
- ✅ Grouped search results (primary matches first, secondary below)
- ✅ Comprehensive exercise coverage for all equipment
- ✅ Placeholder pages for all main features

### Objectives
- Build core workout logging interface
- Create exercise library browser
- Implement workout templates
- Achieve <3 second set logging

### Tasks

1. **Exercise Library**
   - [x] Create exercise database (191+ exercises covering all equipment) ✅
   - [x] Build exercise card component ✅
   - [x] Implement multi-field search (name, category, muscles) ✅
   - [x] Add grouped search results (primary/secondary matches) ✅
   - [x] Include functional training exercises (sledgehammer, tire) ✅
   - [x] **EXPANSION:** Scrape and process 1,146 additional exercises ✅
   - [x] Implement AI-powered muscle classification (Wing→Lats, Hip→Glutes, etc.) ✅
   - [x] Add movement type classification (compound/isolation/stretch/cardio) ✅
   - [x] Generate template instructions for all exercises ✅
   - [x] Implement popularity ranking system (1-100 scale) ✅
   - [x] **Manual ranking refinement with 3-factor scoring (Popularity + Effectiveness → Final Score)** ✅
   - [x] Integrate 1,146 enhanced exercises into app ✅
   - [x] Implement multi-keyword search with relevance scoring ✅
   - [x] Add sort by popularity (integrated into relevance scoring) ✅
   - [ ] **See [exercisesProjectPlan.md](../../exercisesProjectPlan.md) for detailed exercise library expansion tasks**
   - [ ] Add category/muscle group filters
   - [ ] Add movement type filters (compound/isolation/stretch)
   - [ ] Create exercise detail modal (instructions, form cues)
   - [ ] Add custom exercise creation flow
   - [ ] Implement exercise favoriting
   - [ ] Add muscle diagram visualization

2. **Workout Template Builder**
   - [x] Create template list view ✅
   - [x] Build template creation flow ✅
   - [ ] Implement drag-and-drop exercise ordering
   - [x] Add exercise selection from library ✅
   - [x] Set target sets/reps for each exercise ✅
   - [x] Set warmup sets and target RIR per exercise ✅
   - [x] Add workout notes and instructions ✅
   - [x] Template editing functionality ✅
   - [ ] Create template duplication feature

3. **Active Workout Interface**
   - [x] Build workout start flow (from template or blank) ✅
   - [x] Create exercise card for active workout ✅
   - [x] Implement set logging interface (weight + reps + RIR) ✅
   - [x] Add set completion checkmarks ✅
   - [x] Set type indicators (Warmup/Normal/Failure) with color coding ✅
   - [x] Edit completed workouts from Dashboard ✅
   - [ ] Display previous workout data (side-by-side)
   - [x] Add/remove sets dynamically ✅
   - [x] Show rest timer (optional, non-intrusive) ✅
   - [ ] Add exercise notes during workout
   - [x] Calculate volume in real-time ✅
   - [x] Build workout summary screen ✅
   - [x] Warning for uncompleted sets before saving ✅

4. **Performance Optimization**
   - [ ] Optimize set logging to <3 seconds
   - [ ] Implement keyboard shortcuts (Enter to log, Tab to next)
   - [ ] Add touch-optimized input fields (large tap targets)
   - [ ] Pre-fill fields with last workout data
   - [ ] Cache frequently accessed data

5. **UI Components**
   - [x] Create `SetRow` component (weight/reps/RIR inputs, set type cycling) ✅
   - [x] Build `ExerciseCard` component ✅
   - [ ] Create `MuscleDiagram` component
   - [x] Design `BottomNav` component ✅
   - [ ] Build `TopNav` with profile access
   - [x] Create `WorkoutTimer` component ✅
   - [x] Create `Layout` component ✅
   - [x] Create `TemplateBuilder` component ✅
   - [x] Create `ExerciseSelector` component (with enhanced search) ✅
   - [x] Create `WorkoutEditModal` component ✅

### Deliverables
- ✅ Complete exercise library with 1,146 exercises covering all equipment
- ✅ Intelligent multi-field search with result grouping and relevance scoring
- ✅ Workout template builder with exercise selection and configuration
- ✅ Functional workout logging interface
- ✅ Real-time workout tracking with volume calculation
- ✅ Set logging with weight/reps/RIR tracking
- ✅ Rest timer with configurable duration
- ✅ Unit toggle (kg/lbs) with persistent settings
- ✅ Dumbbell weight calculation (2x multiplier)

### User Experience Milestones
- User can create a workout template in <2 minutes
- User can start and log a full workout efficiently
- Interface is usable one-handed on mobile
- Previous workout data is always visible

---

## Phase 3: Analytics Engine & Visualization
**Timeline:** Weeks 7-9
**Status:** Not Started
**Dependencies:** Phase 2

### Objectives
- Build comprehensive analytics system
- Create interactive progress visualizations
- Implement PR detection and tracking
- Provide actionable training insights

### Tasks

1. **Analytics Calculation Engine**
   - [ ] Calculate total volume (weight × reps × sets)
   - [ ] Calculate volume by muscle group
   - [ ] Estimate 1RM from rep maxes (Brzycki formula)
   - [ ] Detect personal records (weight, reps, volume, 1RM)
   - [ ] Calculate training frequency (workouts per week)
   - [ ] Track workout consistency (streak calculations)
   - [ ] Calculate progressive overload trends
   - [ ] Aggregate weekly/monthly statistics

2. **Personal Records System**
   - [ ] Implement PR detection algorithm
   - [ ] Store PR history per exercise
   - [ ] Create PR comparison logic (new vs previous)
   - [ ] Build PR notification system
   - [ ] Design PR history timeline
   - [ ] Track multiple PR types (weight, reps, volume, 1RM)
   - [ ] Create PR celebration animations

3. **Data Visualization Components**
   - [ ] **Strength Progression Chart**
     - Line chart showing weight progression over time
     - Per-exercise or aggregated view
     - Date range selector (1M, 3M, 6M, 1Y, All)

   - [ ] **Volume Progression Chart**
     - Bar chart showing weekly/monthly volume
     - Color-coded by muscle group
     - Trend line overlay

   - [ ] **1RM Tracking Chart**
     - Line chart for estimated 1RM over time
     - Multiple exercises on same chart
     - PR markers highlighted

   - [ ] **Training Frequency Heatmap**
     - Calendar heatmap showing workout days
     - Color intensity = volume/intensity
     - Streak indicators

   - [ ] **Muscle Group Balance Chart**
     - Radar chart showing volume distribution
     - Identify under-trained muscle groups

   - [ ] **Body Measurements Chart**
     - Line chart for weight, measurements
     - Multiple metrics on same timeline

4. **Dashboard Views**
   - [ ] **Home Dashboard**
     - Quick stats (streak, weekly volume, recent PRs)
     - Upcoming scheduled workouts
     - Recent workout summary

   - [ ] **Progress Dashboard**
     - All analytics charts
     - Sortable/filterable by exercise, date, muscle group
     - Export chart data

   - [ ] **Exercise Detail Analytics**
     - Per-exercise progression charts
     - PR history for that exercise
     - Set records across rep ranges
     - Volume trends for that exercise

5. **Insights & Recommendations**
   - [ ] Generate weekly summary statistics
   - [ ] Identify training imbalances
   - [ ] Suggest under-trained muscle groups
   - [ ] Calculate recovery time between muscle groups
   - [ ] Provide progressive overload readiness score

### Deliverables
- ✅ Complete analytics calculation engine
- ✅ 6+ interactive visualization charts
- ✅ PR detection and tracking system
- ✅ Comprehensive progress dashboard
- ✅ Exercise-level analytics views

### Analytics Milestones
- All charts render in <500ms
- Users can see clear progress trends
- PR notifications feel rewarding
- Insights are actionable and accurate

---

## Phase 4: Programming & Scheduling System
**Timeline:** Weeks 10-12
**Status:** Not Started
**Dependencies:** Phase 3

### Objectives
- Build weekly/monthly programming system
- Implement workout scheduling
- Create program templates
- Support progressive overload planning

### Tasks

1. **Program Data Model**
   ```typescript
   interface Program {
     id: string;
     userId: string;
     name: string;
     description: string;
     duration: number; // weeks
     daysPerWeek: number;
     weeks: ProgramWeek[];
     goal: 'strength' | 'hypertrophy' | 'endurance' | 'general';
     isActive: boolean;
     startDate?: Date;
     createdAt: Date;
     updatedAt: Date;
   }

   interface ProgramWeek {
     weekNumber: number;
     name?: string; // e.g., "Deload Week", "Peak Week"
     workouts: WorkoutTemplate[];
     notes?: string;
   }
   ```

2. **Program Builder Interface**
   - [ ] Create multi-week program editor
   - [ ] Build week-by-week workout assignment
   - [ ] Add drag-and-drop workout scheduling
   - [ ] Implement program duplication
   - [ ] Add program templates (Push/Pull/Legs, Upper/Lower, etc.)
   - [ ] Create deload week support
   - [ ] Add progressive overload planning (% increases)

3. **Calendar & Scheduling**
   - [ ] Build monthly calendar view
   - [ ] Display scheduled workouts on calendar
   - [ ] Add workout rescheduling (drag-and-drop)
   - [ ] Show completed vs planned workouts
   - [ ] Create workout reminders/notifications
   - [ ] Handle missed workouts gracefully
   - [ ] Support rest days in programming

4. **Program Templates**
   - [ ] Create 3+ pre-built programs:
     - [ ] Push/Pull/Legs (6-day split)
     - [ ] Upper/Lower (4-day split)
     - [ ] Full Body (3-day)
   - [ ] Add program description and goals
   - [ ] Include exercise selection guidelines
   - [ ] Provide progression recommendations

5. **Workout History & Analytics Integration**
   - [ ] Link completed workouts to program weeks
   - [ ] Show program completion percentage
   - [ ] Track adherence (completed vs planned)
   - [ ] Calculate program effectiveness metrics
   - [ ] Generate program reports

### Deliverables
- ✅ Multi-week program builder
- ✅ Calendar scheduling system
- ✅ 3+ pre-built program templates
- ✅ Program tracking and adherence metrics

### Programming Milestones
- Users can create 12-week programs easily
- Calendar view shows clear workout schedule
- Programs adapt to missed workouts
- Pre-built templates get users started quickly

---

## Phase 5: Multi-User & Profile System
**Timeline:** Weeks 13-14
**Status:** Not Started
**Dependencies:** Phase 1-4

### Objectives
- Implement multi-user support
- Build profile management
- Add cloud sync and authentication
- Enable cross-device data access

### Tasks

1. **Authentication System**
   - [ ] Choose auth provider (Firebase Auth / Supabase Auth)
   - [ ] Implement email/password signup
   - [ ] Add Google OAuth (optional)
   - [ ] Build login flow
   - [ ] Create password reset flow
   - [ ] Add session management
   - [ ] Implement "remember me" functionality

2. **User Profile**
   - [ ] Build profile creation onboarding
   - [ ] Add profile settings page
   - [ ] Personal stats form:
     - [ ] Name, age, height
     - [ ] Starting weight, current weight
     - [ ] Training goal (strength/hypertrophy/endurance)
     - [ ] Experience level (beginner/intermediate/advanced)
     - [ ] Unit preferences (kg/lbs, cm/ft)
   - [ ] Profile picture upload (optional)
   - [ ] Settings management (theme, notifications, privacy)

3. **Cloud Sync Implementation**
   - [ ] Set up Firebase/Supabase backend
   - [ ] Implement sync service
   - [ ] Create sync conflict resolution
   - [ ] Add sync status indicators (synced/syncing/offline)
   - [ ] Build initial data upload flow
   - [ ] Implement incremental sync
   - [ ] Add manual "Sync Now" button

4. **Multi-Device Support**
   - [ ] Test cross-device sync
   - [ ] Implement device management (list of logged-in devices)
   - [ ] Add "logout all devices" functionality
   - [ ] Handle simultaneous edits gracefully

5. **Data Migration & Backup**
   - [ ] Create data import flow (from local to cloud)
   - [ ] Implement automatic cloud backup
   - [ ] Add manual backup download (JSON/CSV)
   - [ ] Build data restore functionality

### Deliverables
- ✅ Working authentication system
- ✅ Complete profile management
- ✅ Cloud sync for all user data
- ✅ Cross-device data access
- ✅ Backup and restore functionality

### Multi-User Milestones
- Users can create accounts in <1 minute
- Data syncs reliably across devices
- Offline changes sync when reconnected
- No data loss during sync conflicts

---

## Phase 6: Enhancement Features
**Timeline:** Weeks 15-17
**Status:** Not Started
**Dependencies:** Phase 5

### Objectives
- Add achievement/milestone system
- Integrate video demonstrations
- Implement body measurements tracking
- Polish UI/UX

### Tasks

1. **Achievement System**
   - [ ] Define achievement types:
     - [ ] Workout milestones (10, 50, 100, 500 workouts)
     - [ ] Volume milestones (100k, 500k, 1M lbs lifted)
     - [ ] Consistency streaks (7, 30, 100, 365 days)
     - [ ] PR achievements (first PR, 10 PRs, etc.)
     - [ ] Strength milestones (bench 225, squat 315, deadlift 405)
   - [ ] Create achievement badge designs
   - [ ] Implement achievement detection logic
   - [ ] Build achievement notification system
   - [ ] Design achievements showcase page
   - [ ] Add progress toward locked achievements

2. **Video Demonstrations**
   - [ ] Source or create exercise videos (50+ exercises)
   - [ ] Set up video hosting (YouTube embed or CDN)
   - [ ] Add video player to exercise detail modal
   - [ ] Implement multiple angles (optional)
   - [ ] Add video playback controls
   - [ ] Optimize video loading (lazy load)

3. **Body Measurements Tracking**
   - [ ] Create measurements data model:
     - [ ] Weight (daily/weekly)
     - [ ] Body fat % (optional)
     - [ ] Neck, chest, arms (L/R)
     - [ ] Waist, hips
     - [ ] Thighs, calves (L/R)
   - [ ] Build measurement input form
   - [ ] Create measurement history timeline
   - [ ] Add measurement progress charts
   - [ ] Calculate measurement trends
   - [ ] Compare measurements over time

4. **UI/UX Polish**
   - [ ] Add loading states and skeletons
   - [ ] Implement error boundaries
   - [ ] Add success/error toast notifications
   - [ ] Create empty states for new users
   - [ ] Add onboarding tooltips
   - [ ] Implement smooth transitions/animations
   - [ ] Optimize for mobile (touch gestures)
   - [ ] Add keyboard shortcuts documentation

5. **Data Export Enhancement**
   - [ ] CSV export for all data types
   - [ ] JSON export for complete backup
   - [ ] PDF workout reports (optional)
   - [ ] Export analytics charts as images
   - [ ] Add export scheduling (automatic weekly exports)

### Deliverables
- ✅ Complete achievement system with 20+ achievements
- ✅ Video demonstrations for 50+ exercises
- ✅ Body measurements tracking with charts
- ✅ Polished UI with animations and feedback
- ✅ Enhanced data export options

### Enhancement Milestones
- Achievements feel rewarding and motivating
- Videos load quickly and play smoothly
- UI feels premium and responsive
- Users understand all features intuitively

---

## Phase 7: Optimization & Low-Priority Features
**Timeline:** Weeks 18-20
**Status:** Not Started
**Dependencies:** Phase 6

### Objectives
- Add RPE/RIR tracking
- Implement smart progressive overload suggestions
- Performance optimization
- Accessibility improvements

### Tasks

1. **RPE/RIR Tracking**
   - [ ] Add RPE scale (1-10) to set logging
   - [ ] Add RIR (Reps in Reserve) option
   - [ ] Create RPE/RIR input UI (slider or quick buttons)
   - [ ] Store RPE/RIR with set data
   - [ ] Display RPE trends in analytics
   - [ ] Add RPE-based auto-regulation (optional)

2. **Progressive Overload Suggestions (Low Priority)**
   - [ ] Analyze workout history patterns
   - [ ] Detect stagnation (same weight for 3+ weeks)
   - [ ] Calculate suggested weight increase
   - [ ] Provide contextual suggestions:
     - "You've done 135lbs for 3 weeks. Try 140lbs for 10 reps."
     - "Hit 12 reps last time. Add 5lbs or try 14 reps."
   - [ ] Show suggestion confidence level
   - [ ] Allow users to accept/dismiss suggestions
   - [ ] Track suggestion success rate

3. **Performance Optimization**
   - [ ] Audit bundle size, implement code splitting
   - [ ] Optimize database queries (add indexes)
   - [ ] Implement virtual scrolling for long lists
   - [ ] Add image optimization and lazy loading
   - [ ] Cache API responses
   - [ ] Reduce re-renders (React.memo, useMemo)
   - [ ] Lighthouse audit: target 90+ scores

4. **Accessibility (A11y)**
   - [ ] Add ARIA labels to all interactive elements
   - [ ] Ensure keyboard navigation works everywhere
   - [ ] Add screen reader support
   - [ ] Test with accessibility tools (axe, WAVE)
   - [ ] Support high contrast mode
   - [ ] Ensure WCAG 2.1 AA compliance

5. **PWA Enhancements**
   - [ ] Add service worker for offline caching
   - [ ] Implement "Add to Home Screen" prompt
   - [ ] Create app icons (multiple sizes)
   - [ ] Add splash screens
   - [ ] Enable background sync for offline changes
   - [ ] Add push notifications (optional)

### Deliverables
- ✅ RPE/RIR tracking system
- ✅ Smart progressive overload suggestions
- ✅ Optimized performance (Lighthouse 90+)
- ✅ Full accessibility compliance
- ✅ Enhanced PWA functionality

### Optimization Milestones
- App loads in <2 seconds on 3G
- All interactions feel instant (<100ms)
- Works perfectly offline
- Accessible to users with disabilities

---

## Technical Documentation

### Directory Structure

```
src/
├── components/
│   ├── common/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── MuscleDiagram.tsx
│   │   └── StatCard.tsx
│   ├── analytics/              # Analytics & charts
│   │   ├── ProgressChart.tsx
│   │   ├── VolumeChart.tsx
│   │   ├── PRList.tsx
│   │   └── AnalyticsDashboard.tsx
│   ├── workout/                # Workout tracking
│   │   ├── WorkoutLogger.tsx
│   │   ├── SetRow.tsx
│   │   ├── ExerciseCard.tsx
│   │   └── WorkoutSummary.tsx
│   ├── library/                # Exercise library
│   │   ├── ExerciseLibrary.tsx
│   │   ├── ExerciseDetail.tsx
│   │   └── ExerciseSearch.tsx
│   ├── program/                # Programming system
│   │   ├── ProgramBuilder.tsx
│   │   ├── WeekView.tsx
│   │   └── CalendarView.tsx
│   ├── profile/                # User profile
│   │   ├── ProfileSettings.tsx
│   │   ├── MeasurementsTracker.tsx
│   │   └── AchievementsView.tsx
│   └── navigation/             # App navigation
│       ├── TopNav.tsx
│       ├── BottomNav.tsx
│       └── Sidebar.tsx
├── services/                   # Business logic layer
│   ├── database.ts             # IndexedDB setup (Dexie)
│   ├── exerciseService.ts      # Exercise CRUD
│   ├── workoutService.ts       # Workout operations
│   ├── analyticsService.ts     # Calculations & stats
│   ├── syncService.ts          # Cloud sync logic
│   ├── authService.ts          # Authentication
│   └── exportService.ts        # Data export
├── stores/                     # State management (Zustand)
│   ├── useWorkoutStore.ts
│   ├── useExerciseStore.ts
│   ├── useUserStore.ts
│   └── useSyncStore.ts
├── hooks/                      # Custom React hooks
│   ├── useOfflineStatus.ts
│   ├── useWorkoutTimer.ts
│   ├── useDebounce.ts
│   └── useAnalytics.ts
├── types/                      # TypeScript type definitions
│   ├── exercise.ts
│   ├── workout.ts
│   ├── program.ts
│   └── user.ts
├── utils/                      # Utility functions
│   ├── calculations.ts         # Volume, 1RM, etc.
│   ├── dateHelpers.ts
│   ├── formatters.ts
│   └── validators.ts
├── data/                       # Static data
│   ├── exerciseLibrary.ts      # Default exercises
│   ├── programTemplates.ts     # Pre-built programs
│   └── achievements.ts         # Achievement definitions
├── styles/                     # Global styles
│   └── globals.css             # Tailwind + custom CSS
├── App.tsx                     # Root component
└── main.tsx                    # Entry point
```

---

## Data Export Format

### CSV Export Structure

**Workout History (workout_history.csv)**
```csv
Date,Workout Name,Exercise,Set,Weight (kg),Reps,RPE,Volume,Notes
2024-01-15,Push Day A,Bench Press,1,80,8,7,640,
2024-01-15,Push Day A,Bench Press,2,80,8,8,640,
2024-01-15,Push Day A,Bench Press,3,80,7,9,560,Tough set
```

**Personal Records (personal_records.csv)**
```csv
Date,Exercise,Record Type,Value,Reps,Previous Record,Improvement
2024-01-15,Bench Press,Weight,85kg,5,80kg,5kg
2024-01-20,Squat,Volume,5400kg,-,5100kg,300kg
```

**Body Measurements (measurements.csv)**
```csv
Date,Weight,Body Fat %,Chest,Left Arm,Right Arm,Waist,Hips,Left Thigh,Right Thigh
2024-01-01,75.5,15.2,100,35,35.5,80,95,58,58.5
2024-01-08,76.0,15.0,101,35.5,36,79.5,95.5,58.5,59
```

### JSON Export Structure (Complete Backup)
```json
{
  "exportDate": "2024-01-20T12:00:00Z",
  "version": "1.0",
  "user": {
    "profile": { ... },
    "settings": { ... }
  },
  "exercises": [ ... ],
  "workouts": [ ... ],
  "programs": [ ... ],
  "achievements": [ ... ],
  "measurements": [ ... ]
}
```

---

## Analytics Calculations Reference

### Volume Calculation
```typescript
// Set Volume = Weight × Reps
const setVolume = weight * reps;

// Exercise Volume = Sum of all sets
const exerciseVolume = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);

// Workout Volume = Sum of all exercises
const workoutVolume = exercises.reduce((sum, ex) => sum + ex.volume, 0);

// Weekly Volume = Sum of all workouts in week
const weeklyVolume = workouts
  .filter(w => isThisWeek(w.date))
  .reduce((sum, w) => sum + w.volume, 0);
```

### 1RM Estimation (Brzycki Formula)
```typescript
function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
}

// Alternative: Epley Formula
function calculate1RMEpley(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}
```

### Personal Record Detection
```typescript
function detectPR(currentSet: Set, history: Set[]): PR | null {
  const prTypes: PR[] = [];

  // Weight PR (same or more reps)
  const weightPR = history.every(s =>
    s.weight < currentSet.weight ||
    (s.weight === currentSet.weight && s.reps < currentSet.reps)
  );
  if (weightPR) prTypes.push({ type: 'weight', value: currentSet.weight });

  // Rep PR (at same weight)
  const sameWeightSets = history.filter(s => s.weight === currentSet.weight);
  const repPR = sameWeightSets.every(s => s.reps < currentSet.reps);
  if (repPR) prTypes.push({ type: 'reps', value: currentSet.reps });

  // Volume PR
  const currentVolume = currentSet.weight * currentSet.reps;
  const volumePR = history.every(s => (s.weight * s.reps) < currentVolume);
  if (volumePR) prTypes.push({ type: 'volume', value: currentVolume });

  // 1RM PR
  const current1RM = calculate1RM(currentSet.weight, currentSet.reps);
  const previous1RM = Math.max(...history.map(s => calculate1RM(s.weight, s.reps)));
  if (current1RM > previous1RM) {
    prTypes.push({ type: '1rm', value: current1RM });
  }

  return prTypes.length > 0 ? prTypes : null;
}
```

### Progressive Overload Detection (Low Priority)
```typescript
function suggestProgressiveOverload(exerciseHistory: WorkoutLog[]): Suggestion | null {
  const recentWorkouts = exerciseHistory.slice(-4); // Last 4 workouts

  if (recentWorkouts.length < 3) return null;

  // Check if weight has been stagnant for 3+ workouts
  const weights = recentWorkouts.map(w => w.sets[0].weight);
  const allSame = weights.every(w => w === weights[0]);

  if (!allSame) return null;

  // Check if reps are consistently hit
  const repsConsistent = recentWorkouts.every(w =>
    w.sets.every(s => s.reps >= s.targetReps)
  );

  if (repsConsistent) {
    const currentWeight = weights[0];
    const suggestedWeight = currentWeight * 1.025; // 2.5% increase
    const targetReps = recentWorkouts[0].sets[0].targetReps;

    return {
      type: 'weight_increase',
      message: `You've hit ${targetReps} reps at ${currentWeight}kg for 3 workouts. Try ${suggestedWeight}kg for ${targetReps - 2} reps.`,
      confidence: 0.85,
      suggestedWeight,
      suggestedReps: targetReps - 2
    };
  }

  return null;
}
```

---

## Design System

### Color Palette (Dark Mode Primary)

```css
/* Primary Colors */
--primary-blue: #3b82f6;      /* Accent, CTAs */
--primary-purple: #8b5cf6;    /* Secondary accent */
--primary-green: #10b981;     /* Success, PR highlights */
--primary-yellow: #fbbf24;    /* Warnings, secondary muscles */
--primary-red: #ef4444;       /* Errors, delete actions */

/* Neutral Colors (Dark Mode) */
--gray-50: #f9fafb;           /* Lightest (rarely used) */
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;          /* Muted text */
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;          /* Cards, elevated surfaces */
--gray-800: #1f2937;          /* Secondary background */
--gray-900: #111827;          /* Primary background */
--gray-950: #030712;          /* Deepest backgrounds */

/* Semantic Colors */
--success: var(--primary-green);
--warning: var(--primary-yellow);
--error: var(--primary-red);
--info: var(--primary-blue);
```

### Typography Scale

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px - labels, captions */
--text-sm: 0.875rem;    /* 14px - secondary text */
--text-base: 1rem;      /* 16px - body text */
--text-lg: 1.125rem;    /* 18px - emphasized text */
--text-xl: 1.25rem;     /* 20px - small headings */
--text-2xl: 1.5rem;     /* 24px - card titles */
--text-3xl: 1.875rem;   /* 30px - section headings */
--text-4xl: 2.25rem;    /* 36px - page titles */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing Scale (Tailwind Default)
```
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
6: 1.5rem (24px)
8: 2rem (32px)
12: 3rem (48px)
16: 4rem (64px)
```

### Component Patterns

**Button Variants:**
- Primary: Blue background, white text (CTAs)
- Secondary: Gray background, white text (less important actions)
- Outline: Transparent bg, border, colored text (tertiary actions)
- Ghost: Transparent bg, colored text on hover (minimal actions)

**Card Shadows:**
- Elevated: `shadow-lg` (main content cards)
- Subtle: `shadow-md` (nested cards, items)
- Flat: `shadow-sm` or none (list items)

**Border Radius:**
- Small: `rounded-lg` (8px) - buttons, inputs
- Medium: `rounded-xl` (12px) - cards
- Large: `rounded-2xl` (16px) - modals, major sections
- Full: `rounded-full` - badges, avatars

---

## Success Metrics

### Key Performance Indicators (KPIs)

**User Experience:**
- Set logging time: <3 seconds ✅
- App load time: <2 seconds on 3G
- Chart render time: <500ms
- Lighthouse Performance Score: 90+

**Data Integrity:**
- Zero data loss incidents
- Sync success rate: >99%
- Backup reliability: 100%

**User Engagement (Personal Use):**
- Workout logging consistency (goal: 4+ per week)
- Feature usage (analytics viewed weekly)
- Data export usage

---

## Future Considerations (Post-v1.0)

### Potential Future Features
- **Advanced Programming**
  - Auto-regulation based on RPE/RIR
  - Periodization support (linear, undulating, block)
  - Deload week automation

- **Social Features (Optional)**
  - Share workouts with friends
  - Community program library
  - Achievement comparisons

- **AI/ML Features**
  - Form analysis via computer vision
  - Injury risk prediction
  - Personalized program recommendations

- **Integrations**
  - Wearable devices (Apple Watch, Garmin)
  - Nutrition apps (MyFitnessPal)
  - Fitness communities (Strava)

- **Advanced Analytics**
  - Muscle SRA (Stimulus-Recovery-Adaptation) tracking
  - Fatigue management scores
  - Volume landmarks (MEV, MRV)

---

## Resources & References

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)
- [Dexie.js](https://dexie.org/)

### Inspiration & Research
- **Compass Artifact 1:** Comprehensive fitness app market analysis
- **Strong App:** Minimalist workout tracking excellence
- **Hevy App:** Modern UI with social features
- **Fitbod:** AI-powered programming

### Design Resources
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://m3.material.io/)
- [Lucide Icons](https://lucide.dev/)

---

## Version Control & Branching Strategy

### Git Workflow
```
main (production)
  ├── develop (integration branch)
      ├── feature/workout-logger
      ├── feature/analytics-dashboard
      ├── feature/program-builder
      └── fix/sync-bug
```

### Commit Convention
```
feat: Add PR detection algorithm
fix: Resolve sync conflict issue
docs: Update README with setup instructions
style: Format code with Prettier
refactor: Extract analytics calculations
test: Add unit tests for volume calculations
chore: Update dependencies
```

---

## Project Timeline Summary

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|--------------|
| **Phase 0** | Week 1 | Setup | Project foundation, architecture |
| **Phase 1** | Weeks 2-3 | Data Layer | Database, models, offline foundation |
| **Phase 2** | Weeks 4-6 | Workout Tracking | Exercise library, logging, templates |
| **Phase 3** | Weeks 7-9 | Analytics | Charts, PRs, insights, dashboard |
| **Phase 4** | Weeks 10-12 | Programming | Multi-week programs, scheduling |
| **Phase 5** | Weeks 13-14 | Multi-User | Auth, profiles, cloud sync |
| **Phase 6** | Weeks 15-17 | Enhancements | Achievements, videos, measurements |
| **Phase 7** | Weeks 18-20 | Optimization | RPE/RIR, suggestions, performance |

**Total Estimated Timeline:** 20 weeks (~5 months)

---

## Guiding Principles

This is a personal project focused on building an exceptional user experience for self-directed lifters. The goal is to create something genuinely useful and enjoyable, without the pressure of monetization or feature bloat.

**Core Principles:**
1. **Simplicity first** - Every feature must earn its place
2. **Data integrity** - Never lose user data, ever
3. **Offline-first** - Work perfectly without internet
4. **Performance** - Fast is a feature
5. **User ownership** - Users own their data completely
6. **No monetization** - Personal project, focus on quality over revenue

---

_Last Updated: 2025-10-18_
_Project Status: Phase 2 - Nearly Complete (90%)_
_Current Focus: Core workout tracking complete, ready for Phase 3 (Analytics)_

### Recent Updates (2025-10-18)
- ✅ Completed routing setup with React Router
- ✅ Implemented OLED black theme with Coolors palette
- ✅ Built comprehensive Exercise Library with 191+ exercises
- ✅ Implemented intelligent search (name, category, primary/secondary muscles)
- ✅ Added grouped search results (primary matches on top, secondary below)
- ✅ Included all equipment: barbell, dumbbells, cable/DAP, machines, bands, tire, sledgehammer
- ✅ Created navigation system and app structure
- ✅ **EXPANSION:** Scraped 1,315 exercises from FitnessProgramer.com
- ✅ **ENHANCEMENT:** Processed and enhanced exercises to 1,146 unique exercises with:
  - AI-powered muscle classification (fixed Wing→Lats, Hip→Glutes, Leg→Quads/etc.)
  - Movement type classification (compound/isolation/stretch/cardio/mobility)
  - Popularity ranking system (1-100 scale)
  - Manual ranking refinement (3-factor scoring: Popularity + Effectiveness → Final Score)
  - Template instructions for each exercise
  - 100% classification success rate
- ✅ **INTEGRATION COMPLETE:** All 1,146 exercises integrated into app with:
  - Multi-keyword search with AND logic (e.g., "dumbbell back")
  - Smart relevance scoring (exact matches > partial matches > popularity)
  - Results grouped by primary vs secondary muscle involvement
  - Equipment matching in search
  - Single-target muscle exercises get bonus points
- ✅ Created [exercisesProjectPlan.md](../../exercisesProjectPlan.md) for tracking exercise library tasks
- ✅ **WORKOUT LOGGER COMPLETE:** Full workout tracking system implemented:
  - Active workout interface with real-time stats (volume, sets, duration)
  - Set logging with weight, reps, RIR, and notes
  - Dumbbell weight calculation (2x multiplier)
  - Rest timer with collapsible UI
  - Unit toggle (kg/lbs) with persistent user settings
  - Exercise addition/removal during workout
  - Dynamic set management (add/update/delete)
  - Workout save/cancel confirmation modals
- ✅ **TEMPLATE SYSTEM COMPLETE:** Full workout template functionality:
  - Template builder modal with exercise selection
  - Configure target sets/reps/rest/warmup sets/target RIR per exercise
  - Exercise details display (name, equipment, movement type)
  - Template list view with exercise previews and hover tooltips
  - Start workout from template (auto-populates exercises and sets)
  - Template editing with in-place updates
  - Template deletion with confirmation
  - Template storage in IndexedDB
- ✅ **ADVANCED SET TRACKING:** Enhanced set management features:
  - Set type indicators (W=Warmup, N=Normal, UF=Until Failure)
  - Color-coded borders (Orange/Blue/Red) for visual distinction
  - Click to cycle set types (W → N → UF)
  - Uncompleted set warnings before saving workouts
  - Edit completed workouts from Dashboard
  - Full workout edit modal with all set controls
- ✅ **ENHANCED SEARCH:** Improved exercise discovery:
  - Plural form handling (legs, arms, shoulders, traps)
  - Muscle group aliases (delts, lats, pecs, quads, hams, bis, tris)
  - Comprehensive muscle mappings (legs→quads/hams/glutes/calves)
  - Smart search expansion for all common terms
- 🟡 Next: Add category/muscle group filters, analytics dashboard (Phase 3)
