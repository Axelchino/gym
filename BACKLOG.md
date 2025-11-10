# GymTracker Pro - Development Backlog

**Last Updated:** 2025-11-09
**Current Phase:** Phase 5 Complete, Phase 5.5 Next
**Version:** v0.5.0

---

## 🎯 Current Sprint (What's Next Immediately)

### Critical Bug Fixes & Polish
**Priority:** HIGH - Polish before public release

- [ ] **Theme System - UX Issues Across Light/Dark/AMOLED**
  - [ ] Verify all components look correct in all 3 themes
  - [ ] Check Recent Activity cards styling across themes
  - [ ] Update Analytics chart components to use CSS variables (`--chart-primary`, `--chart-secondary`)
  - [ ] Test chart colors/text/axis labels across all themes
  - [ ] Fix any hardcoded color values in Recharts components
  - [ ] Ensure consistent borders, hover states, and contrast ratios

- [ ] **Strength Standards Persistence Bug** (if still present)
  - [ ] Verify if data resets when profile changes
  - [ ] Create separate persistent storage for strength standards if needed
  - [ ] Decouple from profile state management

- [ ] **Dashboard Recent Activity - Filter Functionality Missing**
  - [ ] Implement time period filter (7 days, 30 days, 90 days, All)
  - [ ] Implement type filter (All, Program, Free)
  - [ ] Implement sort options (Newest, Heaviest, Duration)
  - [ ] Currently dropdowns exist but have no functionality

- [ ] **Dashboard Recent Activity - Share Feature**
  - [ ] Implement workout sharing (currently shows "Share feature coming soon!")
  - [ ] This connects to Phase 6 social features (database-backed short URLs)

### High-Priority UX Improvements

- [ ] **Guest/Demo Mode - Unauthenticated Access** (In Progress)
  - [x] Remove auth requirement for browsing the app
  - [x] Add persistent "Sign up to save your workouts" banner for guest users
  - [x] Show "Sign In" button and "Try Workout" button in header for guests
  - [ ] Allow users to log workouts locally (localStorage only, no cloud save)
  - [ ] Allow browsing Exercise Library without login (currently works)
  - [ ] Show empty states with CTAs on Dashboard/Analytics for guests
  - [ ] Disable cloud-dependent features (Save Template, Sync, Edit History)
  - [ ] Clear messaging: "Your workout will be lost on refresh - sign up to keep it"
  - [ ] Convert guest workout to cloud on signup (preserve data during registration)
  - **Goal:** Let users try the app and get invested before requiring signup

- [ ] **Exercise Library Enhancements**
  - [ ] Add category/muscle group filters (dropdown or sidebar)
  - [ ] Add movement type filters (compound/isolation/stretch)
  - [ ] Create exercise detail modal with full instructions and form cues
  - [ ] Add muscle diagram visualization to exercise detail
  - [ ] Implement exercise favoriting/bookmarking
  - [ ] Add custom exercise creation flow

- [ ] **Active Workout Improvements**
  - [x] **BUG: Adding exercise to empty workout doesn't create initial set**
    - [x] Auto-create 1 empty set when adding exercise to workout
    - [x] Allows user to start logging immediately without clicking "Add Set"
  - [ ] Display previous workout data side-by-side (same exercise, last session)
  - [ ] Pre-fill weight/reps with last workout data
  - [ ] Add exercise notes during workout (not just set notes)
  - [ ] Implement keyboard shortcuts (Enter to log, Tab to next field)
  - [ ] Add touch-optimized input fields with larger tap targets
  - [ ] Optimize set logging to <3 seconds consistently

- [ ] **Template System Polish**
  - [x] **FEATURE: Save completed workout as template** ✅
    - [x] Add "Save as Template" button on workout completion screen (PR celebration modal)
    - [x] Add "Convert to Template" action in workout history (Dashboard)
    - [x] Template name prompt modal with pre-filled workout name
    - [x] Converts workout log → template with target sets/reps from actual performance
  - [ ] Implement drag-and-drop exercise ordering in template builder
  - [ ] Add template duplication feature
  - [ ] Create template categories/tags (Push, Pull, Legs, etc.)
  - [ ] Add template search and filtering

---

## 📋 Phase 5.5: Migration Strategy - The Trojan Horse
**Timeline:** 1 week sprint
**Status:** Not Started
**Priority:** CRITICAL - This is the user acquisition strategy

### Core Strategy
Lower switching cost to ZERO. Let product quality speak for itself.

**The Pitch:** "Strong has ugly UI. Hevy has aggressive paywalls. I built something better. Bring your data, try it for free, see the difference. If you don't like it, your original data is still there. Zero risk."

### 1. Strong App Import
**Technical Requirements:**

- [ ] **CSV Parser for Strong Format**
  - [ ] Parse Strong CSV schema:
    ```csv
    Date,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Name,RPE
    2024-01-15,Bench Press,1,225,5,,,First set,Push Day,7
    ```
  - [ ] Map Strong schema → GymTracker schema
  - [ ] Auto-detect units (lbs vs kg) from data patterns
  - [ ] Handle set types (warmup, drop set, failure)
  - [ ] Preserve notes and RPE data
  - [ ] Group sets by date + workout name

- [ ] **Data Import Processing**
  - [ ] Bulk insert to Supabase (optimize for 1000+ workouts)
  - [ ] Show progress bar during import
  - [ ] Validate data integrity before committing
  - [ ] Generate import summary: "✅ Imported 247 workouts from 2022-2024"
  - [ ] Error handling for malformed CSV files
  - [ ] Rollback mechanism if import fails

- [ ] **Exercise Mapping**
  - [ ] Map Strong exercise names to our exercise library
  - [ ] Handle variations in naming (e.g., "Bench Press" vs "Barbell Bench Press")
  - [ ] Create custom exercises for unmatched names
  - [ ] Preserve Strong's muscle group categorizations

### 2. Hevy Import
**Technical Requirements:**

- [ ] **CSV Parser for Hevy Format**
  - [ ] Parse Hevy CSV schema:
    ```csv
    Date,Workout Name,Exercise Name,Set Type,Weight (kg),Reps,RPE,Notes
    2024-01-15,Push Day,Bench Press,Normal,102,5,8,
    ```
  - [ ] Map Hevy schema → GymTracker schema
  - [ ] Handle Hevy-specific fields (set types, superset indicators)
  - [ ] Preserve workout notes and exercise notes
  - [ ] Detect unit from column headers

- [ ] **Superset Handling**
  - [ ] Parse Hevy's superset notation
  - [ ] Group superset exercises appropriately
  - [ ] Preserve superset relationships in our schema

- [ ] **Same Optimization as Strong**
  - [ ] Bulk insert optimization
  - [ ] Progress tracking
  - [ ] Validation and error handling
  - [ ] Import summary screen

### 3. Onboarding Flow for Existing Users
**UI/UX Components:**

- [ ] **Welcome Screen with Import Option**
  - [ ] Create first-launch detection
  - [ ] Design modal: "Do you currently use Strong or Hevy?"
  - [ ] Two paths: "Import your data" (big CTA) vs "Start fresh"
  - [ ] Show benefits of importing (see your history immediately)

- [ ] **Import Instruction Modal**
  - [ ] Screenshot carousel: How to export from Strong
  - [ ] Screenshot carousel: How to export from Hevy
  - [ ] Clear step-by-step instructions
  - [ ] "Takes 30 seconds" messaging
  - [ ] Link to video tutorial (optional)

- [ ] **File Upload Interface**
  - [ ] Drag-and-drop zone for CSV files
  - [ ] File picker fallback
  - [ ] Accept .csv files only
  - [ ] Show file name and size after selection
  - [ ] Preview first 5 workouts before import
  - [ ] "Looks good? Import" confirmation

- [ ] **Import Progress Screen**
  - [ ] Progress bar with percentage
  - [ ] Show current operation: "Parsing workouts...", "Importing to database..."
  - [ ] Estimated time remaining
  - [ ] Prevent navigation during import

- [ ] **Import Success Screen**
  - [ ] 🎉 Celebration animation
  - [ ] Summary stats: "Imported 247 workouts, 42 exercises, 1,847 sets"
  - [ ] Date range: "Oldest: Jan 2022 | Newest: Nov 2024"
  - [ ] Show sample workout from their history
  - [ ] CTA: "See Your Analytics" (showcase our strength)
  - [ ] Secondary CTA: "Start New Workout"

### 4. Import Analytics Dashboard (Internal)
**Tracking & Metrics:**

- [ ] **User Import Metrics**
  - [ ] Track: # users who import vs start fresh
  - [ ] Track: Which app they import from (Strong vs Hevy)
  - [ ] Track: Average # of workouts imported
  - [ ] Track: Import success rate
  - [ ] Track: Time to complete import

- [ ] **Power User Identification**
  - [ ] Identify users with 2+ years of data
  - [ ] Flag users with 500+ workouts
  - [ ] Track retention of imported users vs fresh starts

- [ ] **A/B Testing Setup**
  - [ ] Test import messaging variations
  - [ ] Test onboarding flow variations
  - [ ] Track conversion rates

### 5. Landing Page Messaging (Marketing)
**Content Strategy:**

- [ ] **Hero Section Rewrite**
  - [ ] Old: "Track your workouts with better analytics"
  - [ ] New: "Switch from Strong or Hevy in 30 seconds"
  - [ ] Add screenshot of import flow
  - [ ] CTA: "Import Your Data" (not "Sign Up")

- [ ] **Feature Comparison Section**
  - [ ] ✅ Import your entire workout history
  - [ ] ✅ Better analytics than Strong
  - [ ] ✅ No ads, unlike Hevy
  - [ ] ✅ Actually good UI
  - [ ] ✅ Free to use, no paywalls
  - [ ] Side-by-side feature comparison table

- [ ] **Social Proof Section**
  - [ ] "Join 500+ lifters who switched" (update as we grow)
  - [ ] Testimonial quotes
  - [ ] Screenshot gallery

- [ ] **How It Works Section**
  - [ ] Step 1: Export from Strong/Hevy (30 seconds)
  - [ ] Step 2: Upload to GymTracker (15 seconds)
  - [ ] Step 3: See your analytics (immediately)
  - [ ] Visual flow diagram

### 6. Reddit/Forum Launch Strategy
**Community Outreach:**

- [ ] **Launch Post Structure**
  - [ ] Title: "[Tool] Import your Strong/Hevy data and see what you've been missing"
  - [ ] Problem statement: Strong UI sucks, Hevy has paywalls
  - [ ] Solution: Built better tracker, can import entire history in 30s
  - [ ] Proof: Screenshots of import flow + analytics comparison
  - [ ] Transparency: Free to try, no commitment, open to feedback
  - [ ] CTA: Link to app

- [ ] **Target Subreddits**
  - [ ] /r/fitness (2.5M members) - Sunday Victory thread
  - [ ] /r/weightroom (500k members) - Self-promotion thread
  - [ ] /r/bodybuilding (400k members)
  - [ ] /r/SideProject (200k members)
  - [ ] /r/leangains
  - [ ] /r/naturalbodybuilding

- [ ] **Prepare for Feedback**
  - [ ] Create FAQ doc
  - [ ] Plan for feature requests
  - [ ] Set up monitoring for comments
  - [ ] Have bug fix pipeline ready

### Success Metrics
- **Week 1:** 10+ users import their data
- **Week 2:** 50+ users, 20% retention after 7 days
- **Week 4:** 200+ users, users posting screenshots on Reddit
- **Month 2:** 500+ users, organic word-of-mouth growth
- **Month 3:** First "I switched from Hevy" post appears organically

### Deliverables
- [ ] Strong CSV import (tested with 1000+ workout files)
- [ ] Hevy CSV import (tested with 1000+ workout files)
- [ ] Onboarding flow for import vs fresh start
- [ ] Import success screen showcasing analytics
- [ ] Landing page rewrite (migration-focused)
- [ ] Reddit launch post (ready to deploy)

---

## 🎮 Phase 6: Gamification & Social Features
**Timeline:** Weeks 16-19
**Status:** Not Started
**Priority:** HIGH

### 1. Gamification & Quest System (Duolingo-Inspired)
**Honor System Approach - No Anti-Cheat**

#### Daily Quests
- [ ] **Quest Types:**
  - [ ] "Complete 3 sets of any exercise"
  - [ ] "Hit a new PR today"
  - [ ] "Complete a full workout"
  - [ ] "Log 500kg total volume"
  - [ ] "Train a specific muscle group (chest/back/legs)"

- [ ] **Quest UI Components:**
  - [ ] Daily quest tracker widget on Dashboard
  - [ ] Quest progress bars with smooth animations
  - [ ] Quest completion celebrations (confetti animation)
  - [ ] Quest history page

- [ ] **Quest Generation System:**
  - [ ] Auto-generate daily quests at midnight
  - [ ] Personalized quests based on training history
  - [ ] Difficulty scaling based on user level
  - [ ] Variety algorithm (don't repeat same quest 3 days in a row)

#### Weekly Quests
- [ ] **Quest Types:**
  - [ ] "Train 4 times this week"
  - [ ] "Hit 5 PRs this week"
  - [ ] "Complete 20 sets of chest exercises"
  - [ ] "Train all major muscle groups"
  - [ ] "Lift 5,000kg total volume"

- [ ] **Weekly Progress Tracking:**
  - [ ] Week-to-date progress bars
  - [ ] Time remaining until reset
  - [ ] Notification when close to completion

#### Monthly Challenges
- [ ] **Challenge Types:**
  - [ ] "Complete 16 workouts this month"
  - [ ] "Hit 10 PRs this month"
  - [ ] "Lift 50,000kg total volume"
  - [ ] "30-day streak"
  - [ ] "Train 6 days/week for entire month"

- [ ] **Challenge Rewards:**
  - [ ] Special badges for monthly completions
  - [ ] Achievement showcase
  - [ ] Shareable completion cards

#### Rewards System (Honor System)
- [ ] **XP/Points System:**
  - [ ] XP for completing quests (Daily: 10XP, Weekly: 50XP, Monthly: 200XP)
  - [ ] XP for PRs (varies by type)
  - [ ] XP for workout consistency
  - [ ] Level progression system (1-100+)

- [ ] **Unlockable Badges:**
  - [ ] Design 50+ badge types
  - [ ] Badge showcase page
  - [ ] Rarity tiers (Common, Rare, Epic, Legendary)
  - [ ] Badge sharing to social

- [ ] **Titles System:**
  - [ ] Unlockable titles ("Novice", "Intermediate", "Advanced", "Elite")
  - [ ] Custom title display on profile
  - [ ] Title progression tracking

- [ ] **Streak Bonuses:**
  - [ ] XP multiplier for active streaks
  - [ ] Streak protection (1-2 freeze days per month)
  - [ ] Streak milestone rewards

### 2. Social Features for Workout Buddies
**Privacy-First, Opt-In Only**

#### Friend System
- [ ] **Friend Management:**
  - [ ] Add friends by username/friend code
  - [ ] Friend requests and approvals
  - [ ] Friend list with avatars and status
  - [ ] Remove friends
  - [ ] Block users

- [ ] **Activity Feed:**
  - [ ] See friends' recent workouts (opt-in)
  - [ ] Filter by friend
  - [ ] Like/comment on friend's workouts
  - [ ] Celebrate friend's PRs (send emoji reactions)

- [ ] **Friend Stats:**
  - [ ] Compare workout streaks
  - [ ] See friend's training frequency
  - [ ] View friend's PRs (opt-in)
  - [ ] Side-by-side progress comparison

#### Template & Workout Sharing System
**Database-Backed Short URLs (NOT Encoded Strings)**

**Why Database Approach:**
- Clean, shareable links: `gymtracker.app/shared/abc123`
- Can revoke/disable shares without deleting content
- Track views and analytics
- Support expiring links (auto-delete after 30 days)
- Enable social previews (Open Graph cards on Discord/Twitter)
- Scalable: 10,000 shared links = 2MB storage

**Database Schema:**
```sql
shared_workouts:
  - id (short code: "abc123")
  - workout_id (reference to original)
  - user_id (who shared it)
  - created_at
  - expires_at (optional 30-day auto-delete)
  - views (track engagement)
  - is_active (revoke without deleting)

shared_templates:
  - id (short code: "xyz789")
  - template_id (reference to original)
  - user_id (who shared it)
  - created_at
  - expires_at
  - views
  - is_active
```

- [ ] **Share Functionality:**
  - [ ] Generate unique short link on share button click
  - [ ] Create read-only share page (`/shared/:id`)
  - [ ] "Clone to My Workouts" button for viewers
  - [ ] View counter on shared links
  - [ ] Revoke link from profile/manage shares page
  - [ ] Optional expiration (7/30/90 days, or never)

- [ ] **Social Media Integration:**
  - [ ] Open Graph meta tags for preview cards
  - [ ] Twitter Card support
  - [ ] Copy link to clipboard
  - [ ] Share to Discord/WhatsApp

- [ ] **Community Templates (Optional):**
  - [ ] Browse community templates
  - [ ] Template rating system (upvotes/favorites)
  - [ ] Popular templates leaderboard
  - [ ] Search community templates

#### Challenges with Friends
- [ ] **Group Challenges:**
  - [ ] Create private group challenges
  - [ ] "Who can hit more PRs this week?"
  - [ ] "Who can lift more volume this month?"
  - [ ] Challenge leaderboards
  - [ ] Auto-track progress from workouts

- [ ] **Challenge UI:**
  - [ ] Challenge creation modal
  - [ ] Invite friends to challenge
  - [ ] Live leaderboard updates
  - [ ] Challenge completion celebrations

#### Workout Comparisons
- [ ] **Side-by-Side Stats:**
  - [ ] Compare total volume with friends
  - [ ] Compare PRs per exercise
  - [ ] Compare workout frequency
  - [ ] Visual charts for comparisons

- [ ] **Friendly Competition:**
  - [ ] "Close to beating [Friend]'s bench PR!"
  - [ ] Volume competition tracker
  - [ ] Consistency comparison

#### Motivation Features
- [ ] **Encouragement System:**
  - [ ] Send encouragement messages to friends
  - [ ] Pre-written encouragement templates
  - [ ] Celebrate friend's PRs with reactions
  - [ ] Workout reminders from friends

- [ ] **Virtual Gym Buddy:**
  - [ ] "Your friend [Name] just logged a workout!"
  - [ ] "It's been 3 days since your last workout, [Friend] is on a 7-day streak!"
  - [ ] Opt-in/opt-out for all notifications

### 3. Achievement System
**Milestone-Based Gamification**

#### Achievement Types
- [ ] **Workout Milestones:**
  - [ ] First workout, 10, 50, 100, 250, 500, 1000 workouts
  - [ ] Badge designs for each tier
  - [ ] Progress tracking to next milestone

- [ ] **Volume Milestones:**
  - [ ] 100k, 500k, 1M, 5M, 10M lbs/kg lifted
  - [ ] Lifetime volume tracking
  - [ ] Visual progress bar

- [ ] **Consistency Streaks:**
  - [ ] 7, 30, 100, 365 day streaks
  - [ ] Weekly streak milestones (4, 8, 12, 26, 52 weeks)
  - [ ] Streak recovery grace period

- [ ] **PR Achievements:**
  - [ ] First PR, 10 PRs, 50 PRs, 100 PRs, 500 PRs
  - [ ] PR types breakdown (weight/reps/volume/1RM)
  - [ ] Special badges for each PR type

- [ ] **Strength Milestones:**
  - [ ] Bench 225lbs/100kg, squat 315lbs/140kg, deadlift 405lbs/180kg
  - [ ] Custom milestone creation
  - [ ] Progress toward next milestone

- [ ] **Social Achievements:**
  - [ ] Help 5 friends (share template, encouragement)
  - [ ] Share 10 templates
  - [ ] 100 workout reactions received
  - [ ] Community contributor badges

#### Achievement UI
- [ ] **Achievement Detection:**
  - [ ] Real-time achievement detection on workout save
  - [ ] Background achievement scanning (weekly cron)
  - [ ] Multiple achievements per workout support

- [ ] **Achievement Notifications:**
  - [ ] Toast notification on achievement unlock
  - [ ] Full-screen celebration for major milestones
  - [ ] Sound effects (optional, user preference)

- [ ] **Achievement Showcase:**
  - [ ] Achievements page with grid layout
  - [ ] Locked/unlocked states
  - [ ] Progress bars for locked achievements
  - [ ] Rarity indicators (% of users who have it)

- [ ] **Achievement Sharing:**
  - [ ] Share to social media
  - [ ] Generate achievement card images
  - [ ] Share to friend's activity feed

### 4. Video Demonstrations
**Exercise Form Guidance**

#### Video Sourcing
- [ ] **Content Strategy:**
  - [ ] Partner with fitness content creators
  - [ ] OR source public domain/Creative Commons videos
  - [ ] OR create own demonstration videos
  - [ ] Target: 50+ exercises to start

- [ ] **Video Quality Standards:**
  - [ ] HD quality (1080p minimum)
  - [ ] Multiple angles (front, side) for compound lifts
  - [ ] Proper form demonstration
  - [ ] Consistent lighting and framing

#### Video Infrastructure
- [ ] **Video Hosting:**
  - [ ] YouTube embed (free, reliable)
  - [ ] OR Cloudflare Stream (paid, better control)
  - [ ] OR Vimeo (paid, no ads)

- [ ] **Video Player:**
  - [ ] Embed video in exercise detail modal
  - [ ] Playback controls (play/pause, seek, speed)
  - [ ] Fullscreen support
  - [ ] Lazy loading (don't load until opened)

- [ ] **Performance Optimization:**
  - [ ] Thumbnail preview images
  - [ ] Lazy load video only when modal opens
  - [ ] Adaptive streaming (quality based on connection)

#### Video Features
- [ ] **Multiple Angles (Optional):**
  - [ ] Angle selector (front/side/top)
  - [ ] Synchronized playback
  - [ ] Picture-in-picture for comparisons

- [ ] **Form Cues Overlay:**
  - [ ] Text overlays with key form points
  - [ ] Timed annotations
  - [ ] Common mistakes section

### 5. Body Measurements Tracking
**Physique Progress Monitoring**

#### Data Model
```typescript
interface BodyMeasurement {
  id: string;
  userId: string;
  date: Date;
  weight?: number; // kg or lbs
  bodyFat?: number; // percentage
  neck?: number; // cm or inches
  shoulders?: number;
  chest?: number;
  leftArm?: number;
  rightArm?: number;
  waist?: number;
  hips?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  notes?: string;
}
```

#### Measurement Input
- [ ] **Input Form:**
  - [ ] Date picker (default: today)
  - [ ] Weight input (with unit toggle)
  - [ ] Body fat % (optional)
  - [ ] Measurement inputs for all body parts
  - [ ] Left/right inputs side-by-side
  - [ ] Notes field
  - [ ] Save/cancel buttons

- [ ] **Quick Entry Mode:**
  - [ ] Weight-only quick entry
  - [ ] Reminder to measure other stats monthly
  - [ ] Pre-fill with last measurement values

- [ ] **Measurement Schedule:**
  - [ ] Suggested measurement frequency (weekly for weight, monthly for body parts)
  - [ ] Reminder notifications
  - [ ] Measurement history calendar

#### Measurement Analytics
- [ ] **Measurement History:**
  - [ ] Timeline view of all measurements
  - [ ] Edit/delete past measurements
  - [ ] Trend visualization

- [ ] **Progress Charts:**
  - [ ] Weight over time (line chart)
  - [ ] Body fat % over time
  - [ ] Muscle measurements over time
  - [ ] Multiple metrics on same chart (overlay)

- [ ] **Trend Calculations:**
  - [ ] Moving average (7-day, 30-day)
  - [ ] Rate of change (kg/week, inches/month)
  - [ ] Correlate with training volume

- [ ] **Comparison Over Time:**
  - [ ] Before/after date range selection
  - [ ] Side-by-side measurement comparison
  - [ ] Visual body diagram with changes

### 6. UI/UX Polish
**Final Touches for Public Release**

#### Loading States & Feedback
- [ ] **Loading Skeletons:**
  - [ ] Dashboard skeleton (stat cards, activity feed)
  - [ ] Analytics page skeleton (charts)
  - [ ] Exercise library skeleton (card grid)
  - [ ] Workout logger skeleton

- [ ] **Toast Notifications:**
  - [ ] Success toasts (workout saved, template created)
  - [ ] Error toasts (save failed, network error)
  - [ ] Info toasts (sync completed, new feature)
  - [ ] Positioning and animation

#### Error Handling
- [ ] **Error Boundaries:**
  - [ ] Page-level error boundaries
  - [ ] Component-level error boundaries
  - [ ] Graceful fallback UI
  - [ ] Error reporting (optional telemetry)

- [ ] **Network Error Handling:**
  - [ ] Offline detection banner
  - [ ] Retry mechanisms
  - [ ] Queue failed requests
  - [ ] User-friendly error messages

#### Empty States
- [ ] **New User Empty States:**
  - [ ] Dashboard: "Start your first workout!"
  - [ ] Analytics: "Log workouts to see your progress"
  - [ ] Templates: "Create your first template"
  - [ ] Programs: "Choose a pre-built program or create custom"

- [ ] **Empty State Illustrations:**
  - [ ] Custom SVG illustrations for each page
  - [ ] CTA buttons to get started
  - [ ] Quick tips for new users

#### Onboarding
- [ ] **First-Time User Flow:**
  - [ ] Welcome tour (optional skip)
  - [ ] Interactive tooltips on key features
  - [ ] Progressive disclosure (show features as needed)

- [ ] **Feature Highlights:**
  - [ ] Tooltip system (react-joyride or custom)
  - [ ] Highlight new features after updates
  - [ ] Dismissable and remembers state

#### Animations & Transitions
- [x] **Smooth Transitions:** ✅ COMPLETE
  - [x] Page transitions
  - [x] Modal open/close animations
  - [x] Theme switching transitions (0.3s)

- [ ] **Micro-Interactions:**
  - [ ] Button hover states with scale
  - [ ] Card hover elevation
  - [ ] Checkbox/toggle animations
  - [ ] Form input focus states

#### Mobile Optimization
- [ ] **Touch Gestures:**
  - [ ] Swipe to delete (workout history, templates)
  - [ ] Pull to refresh (activity feed)
  - [ ] Long press for quick actions
  - [ ] Swipe between pages

- [ ] **Mobile-Specific UI:**
  - [ ] Bottom sheet modals (instead of center modals)
  - [ ] Larger touch targets (48px minimum)
  - [ ] Thumb-zone optimization
  - [ ] Reduce tap-to-action time

#### Keyboard Shortcuts
- [ ] **Shortcuts Documentation:**
  - [ ] Create shortcuts reference page
  - [ ] Add "?" key to show shortcuts modal
  - [ ] Visual keyboard shortcut hints

- [ ] **Implement Shortcuts:**
  - [ ] "N" - New workout
  - [ ] "T" - New template
  - [ ] "E" - Search exercises
  - [ ] "/" - Focus search
  - [ ] "Esc" - Close modal
  - [ ] Arrow keys - Navigate lists

### 7. Data Export Enhancement
**Complete Backup & Export System**

#### CSV Export
- [ ] **Export All Data Types:**
  - [ ] Workout history (already implemented, needs update for new exercise DB)
  - [ ] Templates (already implemented, needs update for new exercise DB)
  - [ ] Personal records
  - [ ] Body measurements
  - [ ] Programs
  - [ ] Achievements

- [ ] **Export UI:**
  - [ ] Export page in Profile/Settings
  - [ ] Checkboxes for data types
  - [ ] Date range selection
  - [ ] Export format selection (CSV/JSON)
  - [ ] Download as single file or separate files

#### JSON Export
- [ ] **Complete Backup:**
  - [ ] Export entire database as JSON
  - [ ] Include all user data, settings, preferences
  - [ ] Versioned export format (v1.0, v2.0, etc.)
  - [ ] Restore from JSON backup

- [ ] **Backup Features:**
  - [ ] One-click "Download Backup" button
  - [ ] Automatic weekly backup (optional)
  - [ ] Email backup to user (optional)
  - [ ] Cloud backup to Google Drive/Dropbox (optional)

#### PDF Workout Reports (Optional)
- [ ] **Report Generation:**
  - [ ] Weekly workout summary PDF
  - [ ] Monthly progress report PDF
  - [ ] Exercise-specific report
  - [ ] Include charts and graphs

- [ ] **PDF Styling:**
  - [ ] Professional layout
  - [ ] Brand colors and logo
  - [ ] Print-friendly formatting

#### Export Analytics Charts as Images
- [ ] **Chart Export:**
  - [ ] Export any chart as PNG/SVG
  - [ ] High-resolution (2x for retina)
  - [ ] Transparent background option
  - [ ] Social media optimized sizes

- [ ] **Sharing:**
  - [ ] Share chart directly to social
  - [ ] Copy chart to clipboard
  - [ ] Download chart for reports

#### Export Scheduling
- [ ] **Automatic Exports:**
  - [ ] Schedule weekly/monthly exports
  - [ ] Email exports to user
  - [ ] Cloud sync exports
  - [ ] Export history and logs

---

## 🚀 Phase 7: Optimization & Low-Priority Features
**Timeline:** Weeks 20-22
**Status:** Not Started
**Priority:** MODERATE

### 1. RPE/RIR Tracking
**Rate of Perceived Exertion & Reps in Reserve**

- [ ] **RPE Scale UI (1-10):**
  - [ ] Add RPE slider/buttons to set logging
  - [ ] Visual scale with descriptions (1=Very Easy, 10=Max Effort)
  - [ ] Optional field (not required)
  - [ ] Store RPE with set data

- [ ] **RIR Option (Reps in Reserve):**
  - [ ] Add RIR input (0-5+)
  - [ ] Quick buttons for common values (0, 1, 2, 3)
  - [ ] Alternative to RPE (user preference)

- [ ] **RPE/RIR Analytics:**
  - [ ] Display RPE trends over time
  - [ ] Average RPE per exercise
  - [ ] Correlate RPE with volume
  - [ ] Identify overtraining signals

- [ ] **Auto-Regulation (Optional):**
  - [ ] Suggest weight based on RPE target
  - [ ] "Last time RPE was 9, try reducing weight"
  - [ ] Progressive overload with RPE guidance

### 2. Progressive Overload Suggestions (Low Priority)
**Smart Training Recommendations**

#### Stagnation Detection
- [ ] **Analysis Algorithm:**
  - [ ] Detect same weight for 3+ weeks
  - [ ] Identify rep consistency
  - [ ] Check if user is ready for increase
  - [ ] Consider RPE/RIR data if available

- [ ] **Suggestion Types:**
  - [ ] Weight increase: "You've hit 135lbs for 3 weeks. Try 140lbs for 10 reps."
  - [ ] Rep increase: "Hit 12 reps last time. Try 14 reps at same weight."
  - [ ] Volume increase: "Add an extra set this week."
  - [ ] Deload suggestion: "Consider a deload week after 6 weeks of progression."

#### Suggestion UI
- [ ] **Contextual Suggestions:**
  - [ ] Show suggestions in active workout
  - [ ] "Try This" button to apply suggestion
  - [ ] Dismiss/ignore option
  - [ ] Suggestion confidence level display

- [ ] **Suggestion History:**
  - [ ] Track which suggestions were accepted
  - [ ] Track success rate of suggestions
  - [ ] Refine algorithm based on user feedback

- [ ] **User Controls:**
  - [ ] Enable/disable suggestions globally
  - [ ] Set aggressiveness (conservative/moderate/aggressive)
  - [ ] Customize suggestion frequency

#### Progressive Overload Calculator
- [ ] **Calculation Logic:**
  - [ ] Suggested weight increase (2.5-5% based on lift)
  - [ ] Suggested rep increase (1-3 reps)
  - [ ] Consider user's experience level
  - [ ] Account for exercise difficulty

- [ ] **Personalization:**
  - [ ] Learn from user's progression patterns
  - [ ] Adapt to user's recovery ability
  - [ ] Factor in training age and goals

### 3. Performance Optimization
**Speed & Efficiency Improvements**

#### Bundle Size Optimization
- [ ] **Code Splitting:**
  - [ ] Lazy load route components
  - [ ] Split vendor bundles
  - [ ] Dynamic imports for heavy libraries (Recharts)
  - [ ] Analyze bundle with webpack-bundle-analyzer

- [ ] **Tree Shaking:**
  - [ ] Ensure proper ES6 imports
  - [ ] Remove unused dependencies
  - [ ] Optimize Tailwind CSS (PurgeCSS)

- [ ] **Lighthouse Audit:**
  - [ ] Run Lighthouse tests
  - [ ] Target: Performance 90+, Accessibility 90+, Best Practices 90+, SEO 90+
  - [ ] Fix all critical issues
  - [ ] Document remaining opportunities

#### Database Query Optimization
- [ ] **Index Analysis:**
  - [ ] Add indexes for frequently queried fields
  - [ ] Composite indexes for common queries
  - [ ] Analyze slow queries in Supabase

- [ ] **Query Optimization:**
  - [ ] Reduce number of queries (batch requests)
  - [ ] Use select() to fetch only needed fields
  - [ ] Implement pagination for large datasets
  - [ ] Cache frequent queries

#### Virtual Scrolling
- [ ] **Long Lists:**
  - [ ] Implement react-window for workout history
  - [ ] Virtual scroll for exercise library (1000+ exercises)
  - [ ] Maintain scroll position on navigation

- [ ] **Infinite Scroll:**
  - [ ] Workout history infinite scroll
  - [ ] Exercise library infinite scroll
  - [ ] Load more on scroll threshold

#### Image Optimization
- [ ] **Exercise Images:**
  - [ ] Optimize image sizes (WebP format)
  - [ ] Serve responsive images (srcset)
  - [ ] Lazy load images (IntersectionObserver)
  - [ ] Blur-up placeholders (LQIP)

- [ ] **Image CDN:**
  - [ ] Use Cloudflare Images or imgix
  - [ ] On-the-fly resizing
  - [ ] Automatic format conversion (WebP/AVIF)

#### API Response Caching
- [ ] **Client-Side Caching:**
  - [ ] Cache exercise library in IndexedDB
  - [ ] Cache user profile and settings
  - [ ] Cache recent workouts
  - [ ] Stale-while-revalidate strategy

- [ ] **Service Worker:**
  - [ ] Cache API responses
  - [ ] Offline fallback for static content
  - [ ] Update cache on new version

#### React Performance
- [ ] **Re-Render Optimization:**
  - [ ] Use React.memo for expensive components
  - [ ] Use useMemo for expensive calculations
  - [ ] Use useCallback for event handlers
  - [ ] Avoid inline functions in render

- [ ] **Profiling:**
  - [ ] Use React DevTools Profiler
  - [ ] Identify unnecessary re-renders
  - [ ] Optimize component tree
  - [ ] Reduce state updates

### 4. Accessibility (A11y)
**WCAG 2.1 AA Compliance**

#### ARIA Labels
- [ ] **Interactive Elements:**
  - [ ] Add aria-label to icon buttons
  - [ ] Add aria-describedby for form fields
  - [ ] Add role attributes where appropriate
  - [ ] Label all form inputs

- [ ] **Dynamic Content:**
  - [ ] aria-live regions for notifications
  - [ ] aria-busy for loading states
  - [ ] Announce page changes to screen readers

#### Keyboard Navigation
- [ ] **Focus Management:**
  - [ ] Visible focus indicators (outline)
  - [ ] Focus trap in modals
  - [ ] Restore focus on modal close
  - [ ] Skip to main content link

- [ ] **Tab Order:**
  - [ ] Logical tab order throughout app
  - [ ] No keyboard traps
  - [ ] All interactive elements reachable

#### Screen Reader Support
- [ ] **Testing:**
  - [ ] Test with NVDA (Windows)
  - [ ] Test with JAWS (Windows)
  - [ ] Test with VoiceOver (macOS/iOS)
  - [ ] Test with TalkBack (Android)

- [ ] **Semantic HTML:**
  - [ ] Use proper heading hierarchy (h1-h6)
  - [ ] Use semantic tags (nav, main, article, section)
  - [ ] Alt text for all images
  - [ ] Descriptive link text

#### Accessibility Tools
- [ ] **Automated Testing:**
  - [ ] Run axe DevTools
  - [ ] Run WAVE accessibility checker
  - [ ] Fix all critical issues
  - [ ] Document known issues

- [ ] **Manual Testing:**
  - [ ] Navigate entire app with keyboard only
  - [ ] Test with screen reader
  - [ ] Test with high contrast mode
  - [ ] Test with zoom (200%+)

#### High Contrast Mode
- [ ] **Color Contrast:**
  - [ ] Ensure 4.5:1 contrast for text
  - [ ] Ensure 3:1 contrast for UI elements
  - [ ] Test with high contrast mode enabled
  - [ ] Support Windows High Contrast

- [ ] **Visual Indicators:**
  - [ ] Don't rely solely on color for information
  - [ ] Add patterns/icons for color-coded data
  - [ ] Ensure interactive elements are distinguishable

### 5. PWA Enhancements
**Progressive Web App Features**

#### Service Worker
- [ ] **Offline Caching:**
  - [ ] Cache app shell (HTML, CSS, JS)
  - [ ] Cache static assets (fonts, images)
  - [ ] Cache API responses (with expiration)
  - [ ] Cache exercise library

- [ ] **Update Strategy:**
  - [ ] Prompt user for update when new version available
  - [ ] Skip waiting on user approval
  - [ ] Clear old caches on update

#### Add to Home Screen
- [ ] **Install Prompt:**
  - [ ] Detect beforeinstallprompt event
  - [ ] Show custom install banner
  - [ ] Track install conversions
  - [ ] Hide prompt after install

- [ ] **App Icons:**
  - [ ] Generate icons for all sizes (192x192, 512x512, etc.)
  - [ ] Maskable icons for adaptive icons (Android)
  - [ ] Favicon for browser tabs
  - [ ] Apple touch icons for iOS

#### Splash Screens
- [ ] **Generate Splash Screens:**
  - [ ] Create splash screens for iOS (multiple sizes)
  - [ ] Use brand colors and logo
  - [ ] Test on various devices

#### Background Sync
- [ ] **Offline Changes:**
  - [ ] Queue workout saves when offline
  - [ ] Sync when connection restored
  - [ ] Retry failed syncs
  - [ ] Notify user of sync status

- [ ] **Periodic Background Sync:**
  - [ ] Sync data periodically (daily)
  - [ ] Update exercise library
  - [ ] Fetch new achievements

#### Push Notifications (Optional)
- [ ] **Notification Types:**
  - [ ] Workout reminders
  - [ ] Friend activity
  - [ ] PR celebrations
  - [ ] Quest completions

- [ ] **Notification Permissions:**
  - [ ] Request permission at appropriate time
  - [ ] Explain benefits before asking
  - [ ] Respect user's choice
  - [ ] Allow granular notification settings

- [ ] **Notification Center:**
  - [ ] In-app notification center
  - [ ] Mark as read
  - [ ] Delete notifications
  - [ ] Notification history

---

## 🐛 Known Issues & Tech Debt

### Critical Bugs
1. **Recent Activity Card Styling**
   - Some cards not rendering correctly with theme system
   - Need to investigate and apply proper CSS variables
   - Test across all 3 themes (Light/Dark/AMOLED)

2. **Strength Standards Resetting**
   - Data resets when profile changes
   - Needs separate persistent storage
   - Decouple from profile state management

3. **Analytics Chart Theme Integration**
   - Charts not using CSS variable-based theming
   - Hardcoded colors in Recharts components
   - Need to update to respect theme colors

### Data Integrity Issues
- [ ] **CSV Export/Import Outdated**
  - Current implementation doesn't account for new 1,146 exercise database
  - Exercise name mapping broken
  - Needs update to handle exercise IDs vs names

- [ ] **Migration Tool Needed**
  - Users with old exercise data (191 exercises) need migration path
  - Auto-migrate old exercise references to new IDs
  - Preserve workout history during migration

### Performance Issues
- [ ] **Exercise Library Pagination**
  - Currently loads all 1,146 exercises at once
  - Should implement virtual scrolling or pagination
  - Impacts initial page load time

- [ ] **Analytics Page Load Time**
  - Multiple heavy calculations on mount
  - Should memoize calculations
  - Consider web workers for heavy computations

- [ ] **Workout History Query**
  - Fetching all workout history at once
  - Should implement pagination or infinite scroll
  - Limit initial query to last 30 days

### UX Debt
- [ ] **No Loading States on Forms**
  - Form submissions have no loading feedback
  - Should add spinners/disabled states during save
  - Prevent double-submissions

- [ ] **No Error Messages on Failed Operations**
  - Silent failures in some cases
  - Should show user-friendly error messages
  - Add retry mechanisms

- [ ] **No Confirmation on Destructive Actions**
  - Deleting workouts/templates has minimal confirmation
  - Should add "Are you sure?" modals
  - Consider undo/restore functionality

### Code Quality Issues
- [ ] **Duplicate Code in Analytics Calculations**
  - Volume calculations scattered across multiple files
  - Should centralize in analytics service
  - Create single source of truth

- [ ] **Inconsistent Error Handling**
  - Some functions throw errors, some return null
  - Should standardize error handling approach
  - Implement error boundary system

- [ ] **Type Safety Gaps**
  - Some `any` types in database queries
  - Missing types for API responses
  - Should add stricter TypeScript config

### Database Schema Issues
- [ ] **No Soft Deletes**
  - Deleted workouts/templates are hard deleted
  - Should implement `deleted_at` column
  - Enable restore functionality

- [ ] **Missing Indexes**
  - Queries on `userId` + `date` not optimized
  - Should add composite indexes
  - Analyze slow query logs in Supabase

- [ ] **No Data Versioning**
  - Schema changes could break old data
  - Should implement migration system
  - Version all database schemas

### Security Concerns
- [ ] **No Rate Limiting on API Calls**
  - Supabase calls not rate-limited
  - Could lead to abuse or accidental overuse
  - Implement client-side throttling

- [ ] **CSV Export Contains Sensitive Data**
  - User email in export files
  - Should sanitize before download
  - Add privacy warnings

- [ ] **No Input Sanitization**
  - User inputs not sanitized before storage
  - Risk of XSS in notes fields
  - Add DOMPurify or similar library

### Accessibility Gaps
- [ ] **No Skip to Main Content Link**
  - Keyboard users have to tab through header
  - Should add skip link at top

- [ ] **Poor Focus Indicators**
  - Default browser focus styles
  - Should add high-visibility custom styles

- [ ] **Missing Alt Text on Some Images**
  - Exercise images missing alt text
  - Should add descriptive alt text

### Documentation Debt
- [ ] **No API Documentation**
  - Database schema not documented
  - Service functions not documented
  - Should add JSDoc comments

- [ ] **No Component Documentation**
  - Components lack prop descriptions
  - No usage examples
  - Should add Storybook or similar

- [ ] **No Deployment Guide**
  - Setup steps not documented
  - Environment variables not listed
  - Should create comprehensive setup guide

---

## 🔮 Future Backlog (Post-v1.0 Items)

### Advanced Programming Features
- [ ] Auto-regulation based on RPE/RIR
- [ ] Periodization support (linear, undulating, block)
- [ ] Deload week automation
- [ ] Program effectiveness scoring
- [ ] AI-generated program recommendations

### Advanced Analytics
- [ ] Muscle SRA (Stimulus-Recovery-Adaptation) tracking
- [ ] Fatigue management scores
- [ ] Volume landmarks (MEV, MRV)
- [ ] Identify training imbalances
- [ ] Calculate recovery time between muscle groups
- [ ] Provide progressive overload readiness score

### AI/ML Features
- [ ] Form analysis via computer vision (analyze uploaded videos)
- [ ] Injury risk prediction based on volume/frequency
- [ ] Personalized program recommendations
- [ ] Automatic exercise substitution
- [ ] Smart warmup suggestions

### Integrations
- [ ] Wearable devices (Apple Watch, Garmin)
- [ ] Nutrition apps (MyFitnessPal integration)
- [ ] Fitness communities (Strava integration)
- [ ] Google Fit / Apple Health sync
- [ ] Spotify workout playlists

### Progress Photos
- [ ] Upload progress photos
- [ ] Photo timeline with date labels
- [ ] Side-by-side comparisons
- [ ] Privacy controls (never shared without permission)
- [ ] Photo grid view

### Advanced Social Features
- [ ] Public profile pages
- [ ] Follow/followers system
- [ ] Global leaderboards (opt-in)
- [ ] Community programs library
- [ ] Fitness influencer partnerships

### Mobile Apps
- [ ] Native iOS app (React Native or Swift)
- [ ] Native Android app (React Native or Kotlin)
- [ ] Apple Watch companion app
- [ ] Wear OS app
- [ ] Offline-first mobile experience

### Premium Features (If Monetization Considered)
- [ ] Advanced analytics reports
- [ ] AI coaching
- [ ] Unlimited cloud storage
- [ ] Priority support
- [ ] Custom branding
- [ ] Team/gym management features

---

## 📊 Technical Specifications for Upcoming Features

### Data Models for Phase 6

#### Quest System
```typescript
interface Quest {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'workout' | 'pr' | 'volume' | 'consistency' | 'muscle_group';
  description: string; // "Complete 3 sets of any exercise"
  target: number; // Target value (3 sets, 500kg volume, etc.)
  progress: number; // Current progress
  completed: boolean;
  completedAt?: Date;
  expiresAt: Date; // End of day/week/month
  reward: {
    xp: number;
    badges?: string[];
  };
  createdAt: Date;
}

interface UserLevel {
  id: string;
  userId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  title?: string; // "Novice", "Intermediate", "Advanced"
  badges: string[];
  achievements: string[];
}
```

#### Friend System
```typescript
interface Friend {
  id: string;
  userId: string; // Current user
  friendId: string; // Friend's user ID
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  acceptedAt?: Date;
}

interface FriendActivity {
  id: string;
  userId: string;
  type: 'workout' | 'pr' | 'achievement' | 'streak';
  workoutLogId?: string;
  prId?: string;
  achievementId?: string;
  message: string; // "[Name] completed Push Day A"
  createdAt: Date;
}

interface Challenge {
  id: string;
  createdBy: string;
  name: string;
  description: string;
  type: 'pr_count' | 'volume' | 'workout_count';
  startDate: Date;
  endDate: Date;
  participants: string[]; // User IDs
  leaderboard: {
    userId: string;
    value: number;
    rank: number;
  }[];
}
```

#### Shared Content
```typescript
interface SharedWorkout {
  id: string; // Short code: "abc123"
  workoutLogId: string;
  userId: string;
  createdAt: Date;
  expiresAt?: Date; // Auto-delete after X days
  views: number;
  isActive: boolean; // Can be revoked
}

interface SharedTemplate {
  id: string; // Short code: "xyz789"
  templateId: string;
  userId: string;
  createdAt: Date;
  expiresAt?: Date;
  views: number;
  clones: number; // How many times cloned
  rating: number; // Average rating
  isActive: boolean;
}
```

#### Body Measurements
```typescript
interface BodyMeasurement {
  id: string;
  userId: string;
  date: Date;
  weight?: number;
  unit: 'kg' | 'lbs';
  bodyFat?: number;
  measurements: {
    neck?: number;
    shoulders?: number;
    chest?: number;
    leftArm?: number;
    rightArm?: number;
    waist?: number;
    hips?: number;
    leftThigh?: number;
    rightThigh?: number;
    leftCalf?: number;
    rightCalf?: number;
  };
  notes?: string;
  createdAt: Date;
}
```

### API Specifications for Phase 5.5

#### Strong Import API
```typescript
// POST /api/import/strong
interface StrongImportRequest {
  file: File; // CSV file
  userId: string;
  options: {
    unitPreference?: 'kg' | 'lbs';
    createMissingExercises?: boolean;
  };
}

interface StrongImportResponse {
  success: boolean;
  summary: {
    workoutsImported: number;
    exercisesCreated: number;
    setsImported: number;
    dateRange: {
      oldest: Date;
      newest: Date;
    };
  };
  errors?: string[];
}
```

#### Hevy Import API
```typescript
// POST /api/import/hevy
interface HevyImportRequest {
  file: File; // CSV file
  userId: string;
  options: {
    createMissingExercises?: boolean;
  };
}

interface HevyImportResponse {
  success: boolean;
  summary: {
    workoutsImported: number;
    exercisesCreated: number;
    setsImported: number;
    dateRange: {
      oldest: Date;
      newest: Date;
    };
  };
  errors?: string[];
}
```

### Component Architecture for Unbuilt Features

#### Phase 5.5: Import Components
```
src/components/import/
├── ImportWelcome.tsx        # Choose Strong/Hevy/Start Fresh
├── ImportInstructions.tsx   # How to export from other apps
├── FileUploadZone.tsx       # Drag-drop CSV upload
├── ImportPreview.tsx        # Preview data before import
├── ImportProgress.tsx       # Progress bar during import
├── ImportSuccess.tsx        # Success screen with summary
└── ImportError.tsx          # Error handling
```

#### Phase 6: Gamification Components
```
src/components/gamification/
├── QuestTracker.tsx         # Daily quest widget
├── QuestList.tsx            # All quests page
├── QuestCard.tsx            # Individual quest
├── LevelDisplay.tsx         # XP and level progress
├── BadgeShowcase.tsx        # Achievements page
├── BadgeCard.tsx            # Individual badge
├── RewardAnimation.tsx      # Quest completion celebration
└── StreakProtection.tsx     # Freeze days UI
```

#### Phase 6: Social Components
```
src/components/social/
├── FriendList.tsx           # Friend management
├── FriendRequest.tsx        # Friend request card
├── ActivityFeed.tsx         # Friend activity stream
├── ActivityCard.tsx         # Individual activity
├── ChallengeList.tsx        # Active challenges
├── ChallengeCard.tsx        # Challenge details
├── Leaderboard.tsx          # Challenge rankings
├── ShareModal.tsx           # Share workout/template
├── SharedWorkoutView.tsx    # Read-only shared workout
└── CloneButton.tsx          # Clone template to account
```

#### Phase 6: Measurements Components
```
src/components/measurements/
├── MeasurementForm.tsx      # Input measurements
├── MeasurementHistory.tsx   # Timeline of measurements
├── MeasurementChart.tsx     # Progress charts
├── BodyDiagram.tsx          # Interactive body diagram
└── MeasurementComparison.tsx # Before/after comparison
```

---

## 🎯 Priority Order Summary

### Immediate (This Week)
1. Fix theme system bugs (Recent Activity, Strength Standards)
2. Update CSV export/import for new exercise database
3. Exercise Library filters and detail modal

### Next 2 Weeks (Phase 5.5 Critical)
1. Strong/Hevy import system (CRITICAL for user acquisition)
2. Onboarding flow for import vs fresh start
3. Landing page rewrite (migration-focused)
4. Reddit launch preparation

### Following Month (Phase 6 High-Priority)
1. Achievement system (workout milestones, streaks, PRs)
2. Quest system (daily/weekly/monthly challenges)
3. Friend system and activity feed
4. Template sharing via short URLs
5. Body measurements tracking

### Later (Phase 6 Moderate-Priority)
1. Video demonstrations (50+ exercises)
2. Advanced data export (JSON, PDF)
3. UI/UX polish (loading states, animations, empty states)

### Eventually (Phase 7)
1. RPE/RIR tracking
2. Progressive overload suggestions
3. Performance optimization (Lighthouse 90+)
4. Accessibility compliance (WCAG 2.1 AA)
5. PWA enhancements (offline, push notifications)

---

**End of Backlog**
