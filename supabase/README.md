# Supabase Database Setup

## Step 1: Run the Initial Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mrcyoqptqqeajpndjkmq

2. Navigate to: **SQL Editor** (in left sidebar)

3. Click **+ New Query**

4. Copy and paste the entire contents of `migrations/001_initial_schema.sql`

5. Click **Run** (or press Ctrl+Enter)

6. You should see: "Success. No rows returned"

## Step 2: Verify Tables Created

1. Navigate to: **Table Editor** (in left sidebar)

2. You should see these tables:
   - ✅ profiles
   - ✅ exercises
   - ✅ workout_templates
   - ✅ workout_logs
   - ✅ personal_records
   - ✅ programs
   - ✅ body_measurements
   - ✅ achievements

## Step 3: Verify Row Level Security (RLS)

1. Navigate to: **Authentication** → **Policies**

2. Each table should have policies like:
   - "Users can view own [table]"
   - "Users can create own [table]"
   - "Users can update own [table]"
   - "Users can delete own [table]"

## What This Migration Does

### Tables Created
- **profiles**: User profile information (linked to auth.users)
- **exercises**: Custom user exercises (built-in 1,146 exercises stay local)
- **workout_templates**: Workout templates with exercises and configuration
- **workout_logs**: Completed workout history
- **personal_records**: PR tracking (weight, reps, volume, 1RM)
- **programs**: Multi-week training programs
- **body_measurements**: Body stats tracking (Phase 6)
- **achievements**: Milestone tracking (Phase 6)

### Security Features
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Automatic profile creation on signup
- ✅ All policies use `auth.uid()` for security

### Performance Optimizations
- ✅ Indexes on frequently queried columns
- ✅ JSONB for flexible nested data (exercises in templates, sets in logs)
- ✅ Triggers for automatic `updated_at` timestamps

## Troubleshooting

### Error: "relation already exists"
- Tables already created! You're good to go.
- You can skip Step 1.

### Error: "permission denied"
- Make sure you're logged into your Supabase project
- Check you're on the correct project: gym-tracker-production

### Tables not showing up
- Refresh the page
- Check the SQL Editor for any error messages
- Make sure the migration ran successfully

## Next Steps

After migration is complete, we'll:
1. ✅ Build authentication UI (login/signup)
2. ✅ Create user profile page
3. ✅ Implement sync service
4. ✅ Test data syncing between devices
