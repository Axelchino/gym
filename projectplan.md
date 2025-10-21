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
**Status:** ✅ COMPLETE
**Dependencies:** Phase 2

### Objectives
- Build comprehensive analytics system
- Create interactive progress visualizations
- Implement PR detection and tracking
- Provide actionable training insights

### Tasks

1. **Analytics Calculation Engine**
   - [x] Calculate total volume (weight × reps × sets) ✅
   - [x] Calculate volume by muscle group ✅
   - [x] Estimate 1RM from rep maxes (Brzycki formula) ✅
   - [x] Detect personal records (weight, reps, volume, 1RM) ✅
   - [x] Calculate training frequency (workouts per week) ✅
   - [x] Track workout consistency (streak calculations) ✅
   - [x] Calculate progressive overload trends ✅
   - [x] Aggregate weekly/monthly statistics ✅

2. **Personal Records System**
   - [x] Implement PR detection algorithm ✅
   - [x] Store PR history per exercise ✅
   - [x] Create PR comparison logic (new vs previous) ✅
   - [x] Build PR notification system ✅
   - [x] Design PR history timeline ✅
   - [x] Track multiple PR types (weight, reps, volume, 1RM) ✅
   - [x] Create PR celebration animations ✅

3. **Data Visualization Components**
   - [x] **Strength Progression Chart** ✅
     - Line chart showing weight progression over time
     - Per-exercise view with exercise selector
     - Time filter (7d, 30d, 90d, All)

   - [x] **Volume Progression Chart** ✅
     - Bar chart showing workout-by-workout volume
     - Time-based filtering
     - Responsive design

   - [x] **1RM Tracking Chart** ✅
     - Line chart for estimated 1RM over time
     - Per-exercise tracking with dual-axis chart
     - Weight and 1RM on same chart

   - [ ] **Training Frequency Heatmap & Calendar** - MOVE TO PHASE 3.5 (HIGH PRIORITY)
     - Calendar heatmap showing workout days (like Hevy's consistency calendar)
     - Mark workout days in blue/color coded
     - Show weekly streak counter prominently (e.g., "31 weeks streak")
     - Click date to see that day's session details
     - Add missed workout retroactively
     - Rest days since last workout indicator
     - **Rationale**: PDF research emphasizes this is critical for intermediate lifter engagement

   - [ ] **Muscle Group Balance Chart** - deferred to Phase 6
     - Radar chart showing volume distribution
     - Identify under-trained muscle groups

   - [ ] **Body Measurements Chart** - deferred to Phase 6
     - Line chart for weight, measurements
     - Multiple metrics on same timeline

4. **Dashboard Views**
   - [ ] **Home Dashboard** - deferred (using existing Dashboard page)
     - Quick stats (streak, weekly volume, recent PRs)
     - Upcoming scheduled workouts
     - Recent workout summary

   - [x] **Progress Dashboard** ✅
     - All analytics charts
     - Time-based filtering (7d, 30d, 90d, all)
     - PR timeline with full history
     - Exercise-specific progression charts
     - Overall statistics (workouts, volume, PRs, streak)

   - [x] **Exercise Detail Analytics** ✅
     - Per-exercise progression charts
     - Exercise selector dropdown
     - Weight and 1RM tracking over time
     - Volume trends for selected exercise

   - [ ] **Aggregated Progress Reports** (inspired by Alpha Progression) - HIGH PRIORITY
     - Weekly, monthly, and yearly summary reports
     - Report metrics: total workouts, hours trained, training frequency by week/month
     - Top 3 most-performed exercises with set counts
     - PRs and achievements earned during period
     - Volume milestones and trends
     - Percent change from previous period
     - Shareable report cards (generate image or link for social sharing)
     - **Rationale**: Research shows these "year in review" summaries are fantastic for retention

5. **Insights & Recommendations**
   - [x] Generate workout summary statistics ✅
   - [x] Track most frequent exercises ✅
   - [ ] **Comparative Strength Standards** - HIGH PRIORITY (from ProgTracking.pdf research)
     - Compare user's 1RM to strength standards (Beginner/Intermediate/Advanced/Elite)
     - Segment by age, weight, and sex for accuracy
     - Show rating for the big 3 lifts (squat, bench, deadlift)
     - Display progress toward next level (e.g., "85% to Advanced")
     - **Rationale**: Gamifies strength progression, motivates users to reach next tier
   - [ ] Identify training imbalances - deferred to Phase 7
   - [ ] Suggest under-trained muscle groups - deferred to Phase 7
   - [ ] Calculate recovery time between muscle groups - deferred to Phase 7
   - [ ] Provide progressive overload readiness score - deferred to Phase 7

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

## Phase 3.5: Enhanced Analytics & Engagement Features
**Timeline:** Weeks 9-10
**Status:** ✅ COMPLETED (2025-10-21)
**Dependencies:** Phase 3
**Priority:** HIGH (Based on ProgTracking.pdf research)

### Objectives
- Implement aggregated progress reports for retention
- Add consistency tracking with calendar heatmap
- Build comparative strength standards system
- Enhance engagement through better progress visualization

### Tasks

1. **Aggregated Progress Reports** (Alpha Progression-style)
   - [x] Create report generation system (weekly, monthly, yearly) ✅
   - [x] Calculate report metrics: ✅
     - [x] Total workouts and percent change from previous period ✅
     - [x] Total hours trained ✅
     - [x] Training frequency chart (workouts per week/month) ✅
     - [x] Top 3 most-performed exercises with set counts ✅
     - [x] PRs and achievements earned during period ✅
     - [x] Volume milestones reached ✅
   - [x] Build report UI with shareable card design ✅
   - [ ] Add social sharing functionality (generate image or link) - deferred to Phase 6
   - [x] Implement "year in review" summary ✅

2. **Training Frequency Calendar & Streaks**
   - [x] Build calendar heatmap component ✅
   - [x] Mark workout days with color coding (volume-based intensity) ✅
   - [x] Implement weekly streak counter (consecutive weeks with ≥1 workout) ✅
   - [x] Show "days since last workout" indicator ✅
   - [x] Add click-to-view workout details from calendar ✅
   - [x] Create workout details modal with full exercise breakdown ✅
   - [x] Add compact streak display to Dashboard header ✅
   - [x] Add full streak display to Analytics page ✅
   - [x] Month navigation in calendar ✅
   - [x] Color intensity legend ✅
   - [x] Loss aversion messaging ("Don't break your X week streak!") ✅
   - [x] Streak milestone tracking (4, 8, 12, 26, 52 weeks) ✅
   - [ ] Support retroactive workout logging - deferred (already can edit workouts)
   - [ ] Create streak celebration animations - deferred to Phase 6

3. **Comparative Strength Standards**
   - [x] Research and implement strength standard formulas ✅
   - [x] Create strength level classifications (Beginner/Novice/Intermediate/Advanced/Elite) ✅
   - [x] Segment by bodyweight and sex ✅
   - [x] Build strength level display for big 4 lifts (Squat, Bench, Deadlift, OHP) ✅
   - [x] Show progress toward next level (percentage + progress bar) ✅
   - [x] Implement rank badge system with color coding ✅
   - [ ] Add level-up celebrations when user advances - deferred to Phase 6 gamification

### Deliverables
- ✅ Weekly, monthly, and yearly progress reports
- ✅ Calendar heatmap with streak tracking
- ✅ Strength standard comparison system
- ✅ Enhanced user engagement features

### Engagement Milestones
- Users receive weekly summary notifications
- Streak counter drives consistent training
- Strength level progression provides clear goals
- Shareable reports increase social engagement

**Rationale:** Research from ProgTracking.pdf emphasizes that aggregated reports, consistency tracking, and comparative standards are critical for intermediate lifter engagement and retention. These features should be implemented before programming tools.

---

## Phase 4: Programming & Scheduling System
**Timeline:** Weeks 11-13
**Status:** ✅ COMPLETE
**Dependencies:** Phase 3.5

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
   - [x] Add program templates (Push/Pull/Legs 3-day/6-day, Upper/Lower, Full Body) ✅
   - [x] Create deload week support ✅
   - [x] Create custom multi-week program editor ✅
   - [x] Build week-by-week workout assignment ✅
   - [x] Assign workout templates to specific days ✅
   - [x] Week names and notes support ✅
   - [x] Copy week functionality ✅
   - [ ] Add drag-and-drop workout scheduling - deferred to future
   - [ ] Implement program duplication - deferred to future
   - [ ] Add progressive overload planning (% increases) - deferred to Phase 7

3. **Calendar & Scheduling**
   - [x] Build monthly calendar view ✅
   - [x] Display scheduled workouts on calendar ✅
   - [x] Show completed vs planned workouts (green checkmark for completed) ✅
   - [x] Support rest days in programming ✅
   - [x] Handle missed workouts gracefully (adherence % with color coding) ✅
   - [ ] Add workout rescheduling (drag-and-drop) - deferred
   - [ ] Create workout reminders/notifications - deferred to Phase 6

4. **Program Templates**
   - [x] Create 4 pre-built programs: ✅
     - [x] Push/Pull/Legs (3-day split) ✅
     - [x] Push/Pull/Legs (6-day split) ✅
     - [x] Upper/Lower (4-day split) ✅
     - [x] Full Body (3-day) ✅
   - [x] Add program description and goals ✅
   - [x] Include exercise selection guidelines (templateName references) ✅
   - [ ] Provide progression recommendations - deferred to Phase 7

5. **Workout History & Analytics Integration**
   - [x] Link completed workouts to program calendar (adherence tracking) ✅
   - [x] Show program completion percentage (time-based progress bar) ✅
   - [x] Track adherence (completed vs planned workouts) ✅
   - [x] Display adherence percentage with color coding (green/yellow/red) ✅
   - [x] Show workout completion status on calendar ✅
   - [ ] Calculate program effectiveness metrics - deferred to Phase 7
   - [ ] Generate detailed program reports - deferred to Phase 7

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
   - [ ] **Actual 1RM Tracking:**
     - [ ] Input fields for actual tested 1RMs (Squat, Bench, Deadlift, OHP, custom)
     - [ ] Last tested date for each lift
     - [ ] Display alongside calculated 1RM in Analytics
     - [ ] Comparison: "Estimated: 102kg | Actual: 100kg (+2kg)"
     - [ ] Note: App calculates 1RM using both Brzycki and Epley formulas
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
- ✅ Complete profile management with actual 1RM tracking
- ✅ 1RM comparison: Calculated (Brzycki + Epley) vs Actual
- ✅ Cloud sync for all user data
- ✅ Cross-device data access
- ✅ Backup and restore functionality

### Multi-User Milestones
- Users can create accounts in <1 minute
- Data syncs reliably across devices
- Offline changes sync when reconnected
- No data loss during sync conflicts

---

## Phase 6: Gamification & Social Features
**Timeline:** Weeks 15-18
**Status:** Not Started
**Dependencies:** Phase 5

### Objectives
- **Gamification System** (Duolingo-inspired engagement)
- **Quest/Challenge System** for motivation
- **Social Features** for workout buddies
- **Template Sharing** with friends
- Add achievement/milestone system
- Integrate video demonstrations
- Implement body measurements tracking
- Polish UI/UX

### Tasks

1. **Gamification & Quest System** (Duolingo-Inspired)
   - [ ] **Daily Quests:**
     - [ ] "Complete 3 sets of any exercise"
     - [ ] "Hit a new PR today"
     - [ ] "Complete a full workout"
     - [ ] "Log 500kg total volume"
   - [ ] **Weekly Quests:**
     - [ ] "Train 4 times this week"
     - [ ] "Hit 5 PRs this week"
     - [ ] "Complete 20 sets of chest exercises"
     - [ ] "Train all major muscle groups"
   - [ ] **Monthly Challenges:**
     - [ ] "Complete 16 workouts this month"
     - [ ] "Hit 10 PRs this month"
     - [ ] "Lift 50,000kg total volume"
   - [ ] **Quest UI:**
     - [ ] Daily quest tracker widget on Dashboard
     - [ ] Quest progress bars with animations
     - [ ] Quest completion celebrations
     - [ ] Quest history and statistics
   - [ ] **Rewards System (Honor System):**
     - [ ] XP/Points for completing quests
     - [ ] Level system (1-100+)
     - [ ] Unlockable badges and titles
     - [ ] Streak bonuses for consistency
   - [ ] **Quest Generation:**
     - [ ] Auto-generate daily quests at midnight
     - [ ] Personalized quests based on training history
     - [ ] Special event quests (holidays, milestones)

2. **Social Features for Workout Buddies**
   - [ ] **Friend System:**
     - [ ] Add friends by username/code
     - [ ] Friend list with activity feed
     - [ ] See friends' recent workouts (opt-in)
     - [ ] Friend workout streak tracking
   - [ ] **Template Sharing:**
     - [ ] Generate shareable template link/code
     - [ ] Import template from friend's link
     - [ ] Browse community templates (optional)
     - [ ] Template rating system
   - [ ] **Challenges with Friends:**
     - [ ] Create group challenges
     - [ ] "Who can hit more PRs this week?"
     - [ ] "Who can lift more volume this month?"
     - [ ] Challenge leaderboards
   - [ ] **Workout Comparisons:**
     - [ ] Compare stats with friends
     - [ ] Side-by-side exercise progress
     - [ ] Friendly competition tracking
   - [ ] **Motivation Features:**
     - [ ] Send/receive encouragement messages
     - [ ] Celebrate friend's PRs
     - [ ] Workout reminders from friends
     - [ ] Virtual gym buddy notifications

3. **Achievement System**
   - [ ] Define achievement types:
     - [ ] Workout milestones (10, 50, 100, 500 workouts)
     - [ ] Volume milestones (100k, 500k, 1M lbs lifted)
     - [ ] Consistency streaks (7, 30, 100, 365 days)
     - [ ] PR achievements (first PR, 10 PRs, etc.)
     - [ ] Strength milestones (bench 225, squat 315, deadlift 405)
     - [ ] Social achievements (help 5 friends, share 10 templates)
   - [ ] Create achievement badge designs
   - [ ] Implement achievement detection logic
   - [ ] Build achievement notification system
   - [ ] Design achievements showcase page
   - [ ] Add progress toward locked achievements
   - [ ] Share achievements with friends

4. **Video Demonstrations**
   - [ ] Source or create exercise videos (50+ exercises)
   - [ ] Set up video hosting (YouTube embed or CDN)
   - [ ] Add video player to exercise detail modal
   - [ ] Implement multiple angles (optional)
   - [ ] Add video playback controls
   - [ ] Optimize video loading (lazy load)

5. **Body Measurements Tracking**
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

6. **UI/UX Polish**
   - [ ] Add loading states and skeletons
   - [ ] Implement error boundaries
   - [ ] Add success/error toast notifications
   - [ ] Create empty states for new users
   - [ ] Add onboarding tooltips
   - [ ] Implement smooth transitions/animations
   - [ ] Optimize for mobile (touch gestures)
   - [ ] Add keyboard shortcuts documentation

7. **Data Export Enhancement**
   - [ ] CSV export for all data types
   - [ ] JSON export for complete backup
   - [ ] PDF workout reports (optional)
   - [ ] Export analytics charts as images
   - [ ] Add export scheduling (automatic weekly exports)

### Deliverables
- ✅ Complete gamification system with daily/weekly/monthly quests
- ✅ Friend system with activity feed and challenges
- ✅ Template sharing via links/codes
- ✅ Achievement system with 30+ achievements (including social)
- ✅ Video demonstrations for 50+ exercises
- ✅ Body measurements tracking with charts
- ✅ Polished UI with animations and feedback
- ✅ Enhanced data export options

### Enhancement Milestones
- Quests feel engaging and achievable (like Duolingo)
- Friend features encourage long-distance workout buddies
- Template sharing is effortless
- Achievements feel rewarding and motivating
- Videos load quickly and play smoothly
- UI feels premium and responsive
- Users understand all features intuitively

### Design Notes (Gamification)
- **Honor System:** All tracking is self-reported, based on trust
- **Non-Competitive Option:** Users can opt out of leaderboards
- **Positive Reinforcement:** Focus on encouragement, not shame
- **Streak Protection:** Allow 1-2 "freeze days" per month for life events
- **Friend Privacy:** All social features are opt-in with granular controls

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
| **Phase 3.5** | Weeks 9-10 | Enhanced Analytics | Progress reports, streaks, strength standards |
| **Phase 4** | Weeks 11-13 | Programming | Multi-week programs, scheduling |
| **Phase 5** | Weeks 14-15 | Multi-User | Auth, profiles, cloud sync |
| **Phase 6** | Weeks 16-18 | Enhancements | Achievements, videos, measurements |
| **Phase 7** | Weeks 19-21 | Optimization | RPE/RIR, suggestions, performance |

**Total Estimated Timeline:** 21 weeks (~5.5 months)

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

_Last Updated: 2025-10-21_
_Project Status: Phase 4 COMPLETED ✅_
_Current Focus: Phase 4 complete! Programming & Scheduling System implemented with 4 pre-built templates, calendar view, and adherence tracking. Ready for Phase 5 (Multi-User & Profile System)_

**UI/Design Refresh Planned:**
- Consider adding dedicated UI/Design phase before public release
- Explore different color palettes and modern design systems
- Move beyond "basic React" look with refined styling
- Potential themes: Gradient accents, glassmorphism, custom illustrations

### Recent Updates (2025-10-18)

**Phase 2 Updates:**
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

**Phase 3 Updates (Analytics Engine):**
- ✅ **ANALYTICS UTILITIES COMPLETE** (`src/utils/analytics.ts`):
  - Volume calculation with dumbbell 2x multiplier
  - 1RM estimation (Brzycki and Epley formulas)
  - PR detection for 4 types: weight, reps, volume, 1RM
  - Workout statistics calculation
  - Workout streak tracking
  - Volume by muscle group analysis
  - Exercise progression tracking
- ✅ **PR DETECTION & TRACKING COMPLETE:**
  - Automatic PR detection on workout save
  - Historical data comparison against all past workouts
  - PR storage in IndexedDB `personalRecords` table
  - PR celebration modal with animations
  - Multiple PR type support (weight/reps/volume/1RM)
  - Previous record comparison and improvement tracking
- ✅ **PROGRESS DASHBOARD COMPLETE** (`src/pages/Analytics.tsx`):
  - 4 stat cards: Total Workouts, Total Volume, Recent PRs (30d), Workout Streak
  - Time filter: 7 days, 30 days, 90 days, All Time
  - Volume Over Time bar chart (Recharts)
  - Exercise Progression line chart with dual-axis (weight + 1RM)
  - Exercise selector dropdown for progression tracking
  - Personal Records timeline with full history
  - PR detail cards showing type, value, and improvement
  - Overall statistics panel (total sets, reps, avg duration/volume)
  - Most Frequent Exercises with usage bars
- ✅ **PR CELEBRATION SYSTEM:**
  - Animated trophy modal on PR achievement
  - Gradient title with pulse animations
  - Slide-in animations for PR cards
  - Type-specific icons (TrendingUp, Zap, Dumbbell, Trophy)
  - Detailed PR information (previous record, improvement)
  - Celebration CSS animations

**Phase 3+ Additional Features (Post-Analytics):**
- ✅ **CSV EXPORT/IMPORT SYSTEM** (`src/utils/csvExport.ts`):
  - Template export to CSV (ID, name, exercises, sets/reps, weights, RIR, rest times)
  - Template import from CSV with conflict resolution (auto-generates new IDs)
  - Workout history export with full set data (weight, reps, RIR, RPE, set types)
  - File download/upload utilities for cross-device data sharing
  - CSV parsing with proper quote handling for special characters
  - Export buttons in WorkoutLogger (templates) and Analytics (history)
  - Import functionality with user-friendly file picker
  - **Use Case:** Share templates with workout buddies, backup data, transfer between devices
- ✅ **CRITICAL BUG FIX: Active Workout Persistence:**
  - Added localStorage auto-save for active workouts
  - Workout data now survives HMR (Hot Module Reload) during development
  - Automatic recovery of active workout on app reload
  - beforeunload warning when closing app during active workout
  - Prevents data loss during workout sessions
  - **Impact:** Fixes critical bug where workout data was lost on page refresh

**Status:** Phase 3 Complete! Ready for Phase 4 (Programming & Scheduling System)

### Recent Updates (2025-10-20)

**Phase 3 Review & ProgTracking.pdf Research Integration:**
- ✅ **Phase 3 Complete:** Core analytics engine validated and working
- ✅ **Research Analysis:** Reviewed ProgTracking.pdf - comprehensive research on intermediate lifter engagement
- ✅ **New Phase 3.5 Created:** Added high-priority engagement features identified in research

**Key Findings from ProgTracking.pdf:**
- Intermediate lifters want "convenient, powerful way to log and review" without beginner fluff
- **Critical metrics**: 1RMs, PRs, volume per muscle group, progression graphs ✅ (already have)
- **Missing features identified**:
  1. Aggregated Progress Reports (weekly/monthly/yearly summaries) - like Alpha Progression
  2. Training Frequency Calendar with streak tracking - like Hevy's consistency calendar
  3. Comparative Strength Standards (Beginner/Intermediate/Advanced/Elite) - like Hevy's strength levels
- **Gamification insights**: Streaks, badges, achievements work IF tied to real training milestones
- **Social features**: Community sharing of templates and progress reports drives retention

**Phase 3.5 Added (Weeks 9-10):**
- Aggregated Progress Reports (yearly/monthly/weekly summaries)
- Training Frequency Calendar & Heatmap with weekly streak counter
- Comparative Strength Standards (Beginner → Elite progression)
- **Rationale**: Research shows these features are critical for retention BEFORE implementing programming tools

**Phase Timeline Adjustment:**
- Phase 4 (Programming) moved to Weeks 11-13 (was 10-12)
- Phase 5 (Multi-User) moved to Weeks 14-15 (was 13-14)
- Phase 6 (Gamification) moved to Weeks 16-18 (was 15-17)
- Total timeline: 21 weeks (was 20 weeks)

**Next Steps:**
- Complete Phase 3.5 features before starting Phase 4
- Prioritize features that drive daily/weekly engagement
- Ensure all features respect intermediate lifters' need for efficiency (no "fluff")

**Phase 5 Enhancement (2025-10-20):**
- Added actual 1RM tracking to profile system
- Users can input their tested 1RMs (Squat, Bench, Deadlift, OHP, custom lifts)
- Compare calculated 1RM (using Brzycki + Epley formulas) vs actual tested 1RM
- Show both in Analytics: "Estimated: 102kg | Actual: 100kg (+2kg above!)"
- **Rationale**: Calculated 1RMs are estimates; letting users track actual tested maxes provides validation and more accurate strength standards comparison

### Recent Updates (2025-10-21)

**Phase 4 Complete - Programming & Scheduling System:**
- ✅ **PROGRAM DATA MODELS** (`src/types/workout.ts`):
  - Program interface with multi-week structure
  - ProgramWeek with scheduled workouts
  - ScheduledWorkout with day-of-week mapping
  - Program goal types (strength/hypertrophy/endurance/general)
  - Active program tracking with start dates

- ✅ **PRE-BUILT PROGRAM TEMPLATES** (`src/data/programTemplates.ts`):
  - Push/Pull/Legs 3-Day (4 weeks, 3 days/week)
  - Push/Pull/Legs 6-Day (6 weeks, 6 days/week) - high frequency split
  - Upper/Lower 4-Day (6 weeks, 4 days/week)
  - Full Body 3-Day (8 weeks, 3 days/week)
  - Deload week support in week 4
  - Template factory functions for program generation

- ✅ **PROGRAM PAGE COMPLETE** (`src/pages/Program.tsx`):
  - Active program card with gradient styling
  - Program information display (duration, days/week, goal)
  - Time-based progress bar (days elapsed / total duration)
  - Adherence tracking with color-coded percentage (green ≥80%, yellow ≥60%, red <60%)
  - Completed vs scheduled workouts counter
  - Program activation/deactivation logic
  - Template browser modal with 4 pre-built programs
  - "My Programs" list showing all saved programs

- ✅ **CALENDAR & SCHEDULING** (`src/pages/Program.tsx`):
  - Monthly calendar view with navigation
  - Automatic workout scheduling based on program weeks
  - Day-of-week workout assignment (Sunday=0 through Saturday=6)
  - Week number calculation from program start date
  - Scheduled workout display on calendar days
  - Completed workout detection (green background, checkmark icon)
  - Upcoming workout highlighting (blue background, play icon for today)
  - Click-to-start workout from calendar
  - Rest day support (days without scheduled workouts)
  - Past day visual dimming

- ✅ **ADHERENCE TRACKING SYSTEM**:
  - Load workout logs to match against scheduled workouts
  - Date-based completion checking (workout logged on scheduled day)
  - Adherence percentage calculation (completed / scheduled * 100)
  - Color-coded adherence display:
    - Green (≥80%): Excellent adherence
    - Yellow (≥60%): Good adherence
    - Red (<60%): Needs improvement
  - Visual completion indicators on calendar
  - Missed workout handling (shows as incomplete on calendar)

- ✅ **BUG FIXES**:
  - Fixed program activation bug (was calling handleActivateTemplate with program ID instead of template ID)
  - Added separate handleActivateProgram function for re-activating existing programs
  - Reset start date when re-activating a program

- ✅ **CUSTOM PROGRAM BUILDER** (`src/components/ProgramBuilder.tsx`):
  - Full-featured modal for creating custom programs from existing templates
  - Program details form (name, description, duration 1-52 weeks, goal selection)
  - Week-by-week editor with visual navigation tabs
  - Day-by-day workout assignment (Sunday through Saturday)
  - Dropdown template selector for each day
  - Remove workouts with trash icon
  - Week names and notes support (e.g., "Deload Week - reduce weight by 20%")
  - Copy week functionality to duplicate schedules
  - Validation before saving (name required, at least one workout)
  - Automatic days-per-week calculation
  - Two-button system in Program page: "Create Custom" (green) and "From Template" (blue)
  - Integrates with existing workout templates from database
  - Saves to programs table and auto-reloads list

**Features Deferred to Later Phases:**
- Drag-and-drop workout scheduling - deferred to future
- Workout rescheduling - deferred to future
- Program duplication - deferred to future
- Progressive overload planning (% increases) - deferred to Phase 7
- Program effectiveness metrics - deferred to Phase 7
- Detailed program reports - deferred to Phase 7
- Workout reminders/notifications - deferred to Phase 6

**Status:** Phase 4 Complete! Users can now:
1. Browse and activate pre-built program templates
2. **Create custom programs using their own workout templates**
3. View scheduled workouts on a monthly calendar
4. Track program progress and adherence
5. See which workouts have been completed (green) vs upcoming (blue)
6. Start workouts directly from the calendar
7. Monitor their consistency with color-coded adherence percentages

**Custom Program Builder Features:**
- Create programs with custom duration (1-52 weeks)
- Assign existing workout templates to specific days of the week
- Add week names and notes (e.g., "Deload Week - reduce weight by 20%")
- Copy week schedules to other weeks
- Set training goals (strength/hypertrophy/endurance/general)
- Full week-by-week editor with visual navigation
- Automatic days-per-week calculation

**Next Steps:** Ready for Phase 5 (Multi-User & Profile System) with authentication, cloud sync, and cross-device support.
