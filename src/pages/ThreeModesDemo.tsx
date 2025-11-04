import React, { useState } from 'react';
import { Dumbbell, TrendingUp, Award, Sun, Moon } from 'lucide-react';

/**
 * Three Modes Design System Demo
 *
 * GLOBAL RULES (all modes):
 *
 * 1. Color placement: Only Hero/CTAs may use filled brand color. Stats & Exercise cards
 *    use neutral surfaces with a colored top rule or left rail.
 *
 * 2. Gold usage (#E1BB62): Lines, icons, and tiny tags only. NEVER use gold as a
 *    card/tile fill in Dark or AMOLED. Gold ONLY on pure black backgrounds.
 *
 * 3. Icon & microtext contrast: Small glyphs/badges must be one step brighter than
 *    body text on dark backgrounds.
 *
 * 4. Borders on dark: Every dark/black surface gets a 1px border.
 *    - Dark Mode: a step lighter than surface
 *    - AMOLED: #1A1A1A
 *
 * 5. Inactive vs active: Inactive tabs/buttons = outline; active = filled with brand color.
 *
 * 6. Accessibility:
 *    - Body text ≥ 4.5:1 contrast
 *    - Large text ≥ 3:1 contrast
 *    - Focus ring = 2px action blue with ≥ 3:1 contrast
 *    - Touch targets ≥ 44px
 *
 * COLOR PALETTE:
 *
 * Light Mode:
 *   L.Surface: #FFFFFF
 *   L.AccentSurface: #F5F5F5, mid: #EEF0F4
 *   L.Purple: #B482FF, deeper: #8E63FF
 *   L.Blue: #0090CC, tougher: #007DB2
 *   L.Text: #0F131A (dark neutral)
 *
 * Dark Mode:
 *   D.Surface: #1A1A2E
 *   D.Purple: #8B42FF
 *   D.Blue: #0084FF, calmer: #0A78E0
 *   D.Gold: #E1BB62 (accents only)
 *   D.Border: one step lighter than surface
 *
 * AMOLED Mode:
 *   A.Background: #000000
 *   A.Text: #F0F0F0
 *   A.Surface: #3A3A3A (buttons/strips only)
 *   A.Border: #1A1A1A
 *   A.Muted: #A0A0A0
 *   A.Gold: #E1BB62 (micro-accents only)
 */
export default function ThreeModesDemo() {
  const [bgDark, setBgDark] = useState(false);

  return (
    <div className={`min-h-screen ${bgDark ? 'bg-gray-900' : 'bg-gray-50'} p-8 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${bgDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              3-Mode System Comparison
            </h1>
            <p className={`${bgDark ? 'text-gray-400' : 'text-gray-600'}`}>Choose your aesthetic</p>
          </div>

          {/* Background Toggle */}
          <button
            onClick={() => setBgDark(!bgDark)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              bgDark
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {bgDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {bgDark ? 'Light BG' : 'Dark BG'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LIGHT MODE - KARINA */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${bgDark ? 'text-white' : 'text-gray-900'}`}>
              Light Mode
            </h2>
            <p className={`text-sm ${bgDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Elegant day look
            </p>

            {/* A. Hero Card */}
            <div className="mb-2">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                A. Hero Card
              </span>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold bg-[#E8D9FF] text-[#6B3FC2] px-3 py-1 rounded-full">
                    NEW PR
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">Bench Press</h3>
                  <p className="text-sm text-gray-600">Today at 2:34 PM</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#B482FF]">225</div>
                  <div className="text-xs text-gray-500">lbs × 8</div>
                </div>
              </div>
              <button className="w-full bg-[#B482FF] text-white py-3 rounded-lg font-bold hover:bg-[#C596FF] active:bg-[#9D6EE8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B482FF] focus:ring-offset-2">
                Log Another Set
              </button>
            </div>

            {/* B. Stats */}
            <div className="mb-2 mt-6">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                B. Stats
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl border border-[#E3E7EE] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#B482FF]"></div>
                <div className="text-2xl font-bold text-[#B482FF]">127</div>
                <div className="text-xs text-gray-700">Workouts</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E3E7EE] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#0090CC]"></div>
                <div className="text-2xl font-bold text-[#0090CC]">12</div>
                <div className="text-xs text-gray-900">Day Streak</div>
              </div>
            </div>

            {/* C. Exercise Cards */}
            <div className="mb-2 mt-6">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                C. Exercise Cards
              </span>
            </div>
            <div className="space-y-2">
              <div className="bg-white rounded-lg border border-[#E3E7EE] p-4 hover:border-[#C596FF] transition-colors cursor-pointer relative">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#B482FF] rounded-l-lg"></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#B482FF]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Barbell Squat</h4>
                    <p className="text-sm text-gray-600">4 × 8 @ 315 lbs</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#B482FF]" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#E3E7EE] p-4 hover:border-[#7FC4E6] transition-colors cursor-pointer relative">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0090CC] rounded-l-lg"></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#0090CC]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Deadlift</h4>
                    <p className="text-sm text-gray-600">5 × 5 @ 405 lbs</p>
                  </div>
                  <Award className="w-5 h-5 text-[#0090CC]" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#E3E7EE] p-4 hover:border-[#7FC4E6] transition-colors cursor-pointer relative">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0090CC] rounded-l-lg"></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#0090CC]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Overhead Press</h4>
                    <p className="text-sm text-gray-600">3 × 10 @ 135 lbs</p>
                  </div>
                  <span className="text-xs px-2 py-1 text-[#0090CC] rounded border border-[#0090CC]">
                    PR
                  </span>
                </div>
              </div>
            </div>

            {/* D. Navigation */}
            <div className="mb-2 mt-6">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                D. Navigation
              </span>
            </div>
            <div className="bg-white rounded-xl border border-[#E3E7EE] p-3">
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-[#B482FF] text-white rounded-lg font-medium text-sm hover:bg-[#C596FF] active:bg-[#9D6EE8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B482FF] focus:ring-offset-2">
                  Workout
                </button>
                <button className="flex-1 py-2 bg-white text-[#B482FF] rounded-lg font-medium text-sm hover:border-[#C596FF] active:border-[#9D6EE8] transition-colors border-2 border-[#B482FF] focus:outline-none focus:ring-2 focus:ring-[#B482FF] focus:ring-offset-2">
                  History
                </button>
                <button className="flex-1 py-2 bg-white text-[#B482FF] rounded-lg font-medium text-sm hover:border-[#C596FF] active:border-[#9D6EE8] transition-colors border-2 border-[#B482FF] focus:outline-none focus:ring-2 focus:ring-[#B482FF] focus:ring-offset-2">
                  Stats
                </button>
              </div>
            </div>
          </div>

          {/* DARK MODE - KARINA */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${bgDark ? 'text-white' : 'text-gray-900'}`}>
              Dark Mode (Stage)
            </h2>
            <p className={`text-sm ${bgDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Stage presence
            </p>

            {/* A. Hero Card */}
            <div className="mb-2">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                A. Hero Card
              </span>
            </div>
            <div className="bg-[#083B73] rounded-xl overflow-hidden ring-1 ring-inset ring-white/10 p-6 shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold bg-[#006DD4] text-white px-3 py-1 rounded-full">
                    NEW PR
                  </span>
                  <h3 className="text-xl font-bold text-[#EAF2FF] mt-2">Bench Press</h3>
                  <p className="text-sm text-[#CFDAF5]">Today at 2:34 PM</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#EAF2FF]">225</div>
                  <div className="text-xs text-[#CFDAF5]">lbs × 8</div>
                </div>
              </div>
              <button className="w-full bg-[#0092E6] hover:bg-[#00A2FF] active:bg-[#007FCC] text-white py-3 rounded-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B3FF] focus:ring-offset-0">
                Log Another Set
              </button>
            </div>

            {/* B. Stats */}
            <div className="mb-2 mt-6">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                B. Stats
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1A1A2E] p-4 rounded-xl border border-[#2A2A3E] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#8B42FF]"></div>
                <div className="text-2xl font-bold text-[#8B42FF]">127</div>
                <div className="text-xs text-[#C8C8DC]">Workouts</div>
              </div>
              <div className="bg-[#1A1A2E] p-4 rounded-xl border border-[#2A2A3E] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#E1BB62]"></div>
                <div className="text-2xl font-bold text-[#E1BB62]">12</div>
                <div className="text-xs text-[#C8C8DC]">Day Streak</div>
              </div>
            </div>

            {/* C. Exercise Cards */}
            <div className="mb-2 mt-6">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                C. Exercise Cards
              </span>
            </div>
            <div className="space-y-2">
              <div className="bg-[#1A1A2E] rounded-lg border border-[#2A2A3E] p-4 hover:border-[#A56BFF] active:border-[#7433CC] transition-colors cursor-pointer relative">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#8B42FF] rounded-l-lg"></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 bg-[#2A2A3E] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#8B42FF]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">Barbell Squat</h4>
                    <p className="text-sm text-[#B8B8C8]">4 × 8 @ 315 lbs</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#E0E0EC]" />
                </div>
              </div>

              <div className="bg-[#1A1A2E] rounded-lg border border-[#2A2A3E] p-4 hover:border-[#EDD08A] active:border-[#C9A240] transition-colors cursor-pointer relative">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E1BB62] rounded-l-lg"></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 bg-[#2A2A3E] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#E1BB62]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">Deadlift</h4>
                    <p className="text-sm text-[#B8B8C8]">5 × 5 @ 405 lbs</p>
                  </div>
                  <Award className="w-5 h-5 text-[#E0E0EC]" />
                </div>
              </div>

              <div className="bg-[#1A1A2E] rounded-lg border border-[#2A2A3E] p-4 hover:border-[#3AA0FF] active:border-[#006DD4] transition-colors cursor-pointer relative">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0084FF] rounded-l-lg"></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 bg-[#2A2A3E] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#0084FF]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">Overhead Press</h4>
                    <p className="text-sm text-[#B8B8C8]">3 × 10 @ 135 lbs</p>
                  </div>
                  <span className="text-xs px-2 py-1 text-[#3AA0FF] rounded border border-[#0084FF]">
                    PR
                  </span>
                </div>
              </div>
            </div>

            {/* D. Navigation */}
            <div className="mb-2 mt-6">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                D. Navigation
              </span>
            </div>
            <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-3">
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-[#8B42FF] text-white rounded-lg font-medium text-sm hover:bg-[#A56BFF] active:bg-[#7433CC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B42FF] focus:ring-offset-2 focus:ring-offset-[#1A1A2E]">
                  Workout
                </button>
                <button className="flex-1 py-2 bg-[#1A1A2E] text-[#E0E0EC] rounded-lg font-medium text-sm hover:border-[#A56BFF] active:border-[#7433CC] transition-colors border-2 border-[#3A3A4E] focus:outline-none focus:ring-2 focus:ring-[#8B42FF] focus:ring-offset-2 focus:ring-offset-[#1A1A2E]">
                  History
                </button>
                <button className="flex-1 py-2 bg-[#1A1A2E] text-[#E0E0EC] rounded-lg font-medium text-sm hover:border-[#A56BFF] active:border-[#7433CC] transition-colors border-2 border-[#3A3A4E] focus:outline-none focus:ring-2 focus:ring-[#8B42FF] focus:ring-offset-2 focus:ring-offset-[#1A1A2E]">
                  Stats
                </button>
              </div>
            </div>
          </div>

          {/* AMOLED MODE - BRUTALIST */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${bgDark ? 'text-white' : 'text-gray-900'}`}>
              ⬛ AMOLED Mode
            </h2>
            <p className={`text-sm ${bgDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Pure black + brutalist grays
            </p>

            {/* A. Hero Card */}
            <div className="mb-2">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                A. Hero Card
              </span>
            </div>
            <div className="bg-black rounded-xl shadow-2xl border border-[#1A1A1A] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold bg-[#1A1A1A] text-[#C8C8C8] px-3 py-1 rounded-full border border-[#2A2A2A]">
                    NEW PR
                  </span>
                  <h3 className="text-xl font-bold text-[#F0F0F0] mt-2">Bench Press</h3>
                  <p className="text-sm text-[#A0A0A0]">Today at 2:34 PM</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#E0E0E0]">225</div>
                  <div className="text-xs text-[#A0A0A0]">lbs × 8</div>
                </div>
              </div>
              <button className="w-full bg-[#3A3A3A] text-white py-3 rounded-lg font-bold hover:bg-[#4A4A4A] active:bg-[#2A2A2A] transition-colors border border-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C8C8C8] focus:ring-offset-2 focus:ring-offset-black">
                Log Another Set
              </button>
            </div>

            {/* B. Stats */}
            <div className="mb-2 mt-6">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                B. Stats
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black p-4 rounded-xl border border-[#1A1A1A]">
                <div className="text-2xl font-bold text-[#D8D8D8]">127</div>
                <div className="text-xs text-[#A0A0A0]">Workouts</div>
              </div>
              <div className="bg-black p-4 rounded-xl border border-[#E1BB62]">
                <div className="text-2xl font-bold text-[#E1BB62]">12</div>
                <div className="text-xs text-[#A0A0A0]">Day Streak</div>
              </div>
            </div>

            {/* C. Exercise Cards */}
            <div className="mb-2 mt-6">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                C. Exercise Cards
              </span>
            </div>
            <div className="space-y-2">
              <div className="bg-black rounded-lg border border-[#1A1A1A] p-4 hover:border-[#3A3A3A] active:border-[#0A0A0A] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded border border-[#2A2A2A] flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#D8D8D8]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#F0F0F0]">Barbell Squat</h4>
                    <p className="text-sm text-[#B0B0B0]">4 × 8 @ 315 lbs</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#D8D8D8]" />
                </div>
              </div>

              <div className="bg-black rounded-lg border border-[#1A1A1A] p-4 hover:border-[#3A3A3A] active:border-[#0A0A0A] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded border border-[#2A2A2A] flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#D8D8D8]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#F0F0F0]">Deadlift</h4>
                    <p className="text-sm text-[#B0B0B0]">5 × 5 @ 405 lbs</p>
                  </div>
                  <Award className="w-5 h-5 text-[#D8D8D8]" />
                </div>
              </div>

              <div className="bg-black rounded-lg border border-[#1A1A1A] p-4 hover:border-[#3A3A3A] active:border-[#0A0A0A] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded border border-[#2A2A2A] flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#D8D8D8]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#F0F0F0]">Overhead Press</h4>
                    <p className="text-sm text-[#B0B0B0]">3 × 10 @ 135 lbs</p>
                  </div>
                  <span className="text-xs px-2 py-1 text-[#D8D8D8] rounded border border-[#3A3A3A]">
                    PR
                  </span>
                </div>
              </div>
            </div>

            {/* D. Navigation */}
            <div className="mb-2 mt-6">
              <span
                className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}
              >
                D. Navigation
              </span>
            </div>
            <div className="bg-black rounded-xl border border-[#3A3A3A] p-3">
              <div className="flex gap-2">
                {/* Active: filled with A.Surface (#3A3A3A), white text, hover lighten 6-8%, active darken 6-8% */}
                <button className="flex-1 py-2 bg-[#3A3A3A] text-white rounded-lg font-medium text-sm border border-[#1A1A1A] hover:bg-[#4A4A4A] active:bg-[#2A2A2A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8C8C8] focus:ring-offset-2 focus:ring-offset-black">
                  Workout
                </button>
                {/* Inactive: outline only, brighter labels (#D8D8D8), hover lighten border 6-8% */}
                <button className="flex-1 py-2 bg-black text-[#D8D8D8] rounded-lg font-medium text-sm border-2 border-[#3A3A3A] hover:border-[#4A4A4A] active:border-[#2A2A2A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8C8C8] focus:ring-offset-2 focus:ring-offset-black">
                  History
                </button>
                <button className="flex-1 py-2 bg-black text-[#D8D8D8] rounded-lg font-medium text-sm border-2 border-[#3A3A3A] hover:border-[#4A4A4A] active:border-[#2A2A2A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8C8C8] focus:ring-offset-2 focus:ring-offset-black">
                  Stats
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette Reference */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h3 className={`font-bold ${bgDark ? 'text-white' : 'text-gray-900'} mb-3`}>
              Light Mode Palette
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Surface: #FFFFFF
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#B482FF] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Purple: #B482FF
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0090CC] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Blue: #0090CC
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Accent surface: #F5F5F5
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`font-bold ${bgDark ? 'text-white' : 'text-gray-900'} mb-3`}>
              Dark Mode Palette
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1A1A2E] border border-[#2A2A3E] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Surface: #1A1A2E
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#8B42FF] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Purple: #8B42FF
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0084FF] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Blue: #0084FF
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#E1BB62] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Gold: #E1BB62 (accents only)
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`font-bold ${bgDark ? 'text-white' : 'text-gray-900'} mb-3`}>
              AMOLED Brutalist Palette
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black border border-[#1A1A1A] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Background: #000000
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F0F0F0] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Text: #F0F0F0
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#3A3A3A] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Surface: #3A3A3A
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1A1A1A] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Border: #1A1A1A
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#A0A0A0] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Muted: #A0A0A0
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#E1BB62] rounded"></div>
                <span className={`text-sm ${bgDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Gold: #E1BB62 (micro-accents)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
