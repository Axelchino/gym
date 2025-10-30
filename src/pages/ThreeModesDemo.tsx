import React, { useState } from 'react';
import { Dumbbell, TrendingUp, Zap, Award, Sun, Moon } from 'lucide-react';

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
            <h2 className={`text-2xl font-bold ${bgDark ? 'text-white' : 'text-gray-900'}`}>👑 Light Mode (Queen)</h2>
            <p className={`text-sm ${bgDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Karina's elegant day look</p>

            {/* A. Hero Card */}
            <div className="mb-2">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>A. Hero Card</span>
            </div>
            <div className="bg-white rounded-xl shadow-lg border-2 border-[#B482FF] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold bg-[#F5EDFF] text-[#B482FF] px-3 py-1 rounded-full">
                    👑 NEW PR
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">Bench Press</h3>
                  <p className="text-sm text-gray-600">Today at 2:34 PM</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#B482FF]">225</div>
                  <div className="text-xs text-gray-500">lbs × 8</div>
                </div>
              </div>
              <button className="w-full bg-[#B482FF] text-white py-3 rounded-lg font-bold hover:bg-[#9D6EE8] transition-colors">
                Log Another Set
              </button>
            </div>

            {/* B. Stats */}
            <div className="mb-2 mt-6">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>B. Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F5EDFF] p-4 rounded-xl border border-[#B482FF]">
                <div className="text-2xl font-bold text-[#B482FF]">127</div>
                <div className="text-xs text-gray-600">Workouts</div>
              </div>
              <div className="bg-[#E5F7FF] p-4 rounded-xl border border-[#00B4FF]">
                <div className="text-2xl font-bold text-[#0090CC]">12</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
            </div>

            {/* C. Exercise Cards */}
            <div className="mb-2 mt-6">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>C. Exercise Cards</span>
            </div>
            <div className="space-y-2">
              <div className="bg-white rounded-lg border border-[#C8C8DC] p-4 hover:border-[#B482FF] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#B482FF] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Barbell Squat</h4>
                    <p className="text-sm text-gray-600">4 × 8 @ 315 lbs</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#B482FF]" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#C8C8DC] p-4 hover:border-[#00B4FF] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00B4FF] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Deadlift</h4>
                    <p className="text-sm text-gray-600">5 × 5 @ 405 lbs</p>
                  </div>
                  <Award className="w-5 h-5 text-[#00B4FF]" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#C8C8DC] p-4 hover:border-[#00B4FF] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00B4FF] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Overhead Press</h4>
                    <p className="text-sm text-gray-600">3 × 10 @ 135 lbs</p>
                  </div>
                  <div className="w-2 h-2 bg-[#B482FF] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* D. Navigation */}
            <div className="mb-2 mt-6">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>D. Navigation</span>
            </div>
            <div className="bg-white rounded-xl border border-[#C8C8DC] p-3">
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-[#B482FF] text-white rounded-lg font-medium text-sm">
                  Workout
                </button>
                <button className="flex-1 py-2 bg-[#F5EDFF] text-[#B482FF] rounded-lg font-medium text-sm hover:bg-[#E8D9FF]">
                  History
                </button>
                <button className="flex-1 py-2 bg-[#F5EDFF] text-[#B482FF] rounded-lg font-medium text-sm hover:bg-[#E8D9FF]">
                  Stats
                </button>
              </div>
            </div>
          </div>

          {/* DARK MODE - KARINA */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${bgDark ? 'text-white' : 'text-gray-900'}`}>⚡ Dark Mode (Stage)</h2>
            <p className={`text-sm ${bgDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Karina's stage presence</p>

            {/* A. Hero Card */}
            <div className="mb-2">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>A. Hero Card</span>
            </div>
            <div className="bg-[#002850] rounded-xl shadow-2xl border-2 border-[#00B4FF] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold bg-[#003D66] text-[#00B4FF] px-3 py-1 rounded-full">
                    ⚡ NEW PR
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">Bench Press</h3>
                  <p className="text-sm text-[#C8F0FF]">Today at 2:34 PM</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#00B4FF]">225</div>
                  <div className="text-xs text-[#C8F0FF]">lbs × 8</div>
                </div>
              </div>
              <button className="w-full bg-[#00B4FF] text-white py-3 rounded-lg font-bold hover:bg-[#0090CC] transition-colors">
                Log Another Set
              </button>
            </div>

            {/* B. Stats */}
            <div className="mb-2 mt-6">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>B. Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#141428] p-4 rounded-xl border border-[#B482FF]">
                <div className="text-2xl font-bold text-[#B482FF]">127</div>
                <div className="text-xs text-[#C8C8DC]">Workouts</div>
              </div>
              <div className="bg-black p-4 rounded-xl border border-[#E1BE82]">
                <div className="text-2xl font-bold text-[#E1BE82]">12</div>
                <div className="text-xs text-[#C8C8DC]">Day Streak</div>
              </div>
            </div>

            {/* C. Exercise Cards */}
            <div className="mb-2 mt-6">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>C. Exercise Cards</span>
            </div>
            <div className="space-y-2">
              <div className="bg-[#141428] rounded-lg border border-[#B482FF] p-4 hover:bg-[#1A1A35] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#B482FF] to-[#9D6EE8] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">Barbell Squat</h4>
                    <p className="text-sm text-[#C8C8DC]">4 × 8 @ 315 lbs</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#B482FF]" />
                </div>
              </div>

              <div className="bg-black rounded-lg border border-[#B4965F] p-4 hover:bg-[#0A0A0A] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E1BE82] to-[#B4965F] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#E1BE82]">Deadlift</h4>
                    <p className="text-sm text-[#B4965F]">5 × 5 @ 405 lbs</p>
                  </div>
                  <Award className="w-5 h-5 text-[#E1BE82]" />
                </div>
              </div>

              <div className="bg-[#002850] rounded-lg border border-[#00B4FF] p-4 hover:bg-[#003D66] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00B4FF] to-[#0090CC] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">Overhead Press</h4>
                    <p className="text-sm text-[#C8F0FF]">3 × 10 @ 135 lbs</p>
                  </div>
                  <div className="w-2 h-2 bg-[#00B4FF] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* D. Navigation */}
            <div className="mb-2 mt-6">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>D. Navigation</span>
            </div>
            <div className="bg-[#141428] rounded-xl border border-[#B482FF] p-3">
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-gradient-to-r from-[#B482FF] to-[#9D6EE8] text-white rounded-lg font-medium text-sm">
                  Workout
                </button>
                <button className="flex-1 py-2 bg-[#1A1A35] text-[#B482FF] rounded-lg font-medium text-sm hover:bg-[#252540] border border-[#B482FF]/30">
                  History
                </button>
                <button className="flex-1 py-2 bg-black text-[#E1BE82] rounded-lg font-medium text-sm hover:bg-[#1A1A1A] border border-[#E1BE82]/30">
                  Stats
                </button>
              </div>
            </div>
          </div>

          {/* AMOLED MODE - BRUTALIST */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${bgDark ? 'text-white' : 'text-gray-900'}`}>⬛ AMOLED Mode</h2>
            <p className={`text-sm ${bgDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Pure black + brutalist grays</p>

            {/* A. Hero Card */}
            <div className="mb-2">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>A. Hero Card</span>
            </div>
            <div className="bg-black rounded-xl shadow-2xl border border-[#2A2A2A] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold bg-[#1A1A1A] text-[#B8B8B8] px-3 py-1 rounded-full border border-[#3A3A3A]">
                    NEW PR
                  </span>
                  <h3 className="text-xl font-bold text-[#E8E8E8] mt-2">Bench Press</h3>
                  <p className="text-sm text-[#8A8A8A]">Today at 2:34 PM</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#D0D0D0]">225</div>
                  <div className="text-xs text-[#707070]">lbs × 8</div>
                </div>
              </div>
              <button className="w-full bg-[#2A2A2A] text-[#E8E8E8] py-3 rounded-lg font-bold hover:bg-[#3A3A3A] transition-colors border border-[#4A4A4A]">
                Log Another Set
              </button>
            </div>

            {/* B. Stats */}
            <div className="mb-2 mt-6">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>B. Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black p-4 rounded-xl border border-[#2A2A2A]">
                <div className="text-2xl font-bold text-[#C8C8C8]">127</div>
                <div className="text-xs text-[#7A7A7A]">Workouts</div>
              </div>
              <div className="bg-black p-4 rounded-xl border border-[#E1BE82]">
                <div className="text-2xl font-bold text-[#E1BE82]">12</div>
                <div className="text-xs text-[#7A7A7A]">Day Streak</div>
              </div>
            </div>

            {/* C. Exercise Cards */}
            <div className="mb-2 mt-6">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>C. Exercise Cards</span>
            </div>
            <div className="space-y-2">
              <div className="bg-black rounded-lg border border-[#2A2A2A] p-4 hover:border-[#4A4A4A] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded border border-[#3A3A3A] flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#A8A8A8]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#E8E8E8]">Barbell Squat</h4>
                    <p className="text-sm text-[#8A8A8A]">4 × 8 @ 315 lbs</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#B8B8B8]" />
                </div>
              </div>

              <div className="bg-black rounded-lg border border-[#2A2A2A] p-4 hover:border-[#4A4A4A] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded border border-[#3A3A3A] flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#A8A8A8]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#E8E8E8]">Deadlift</h4>
                    <p className="text-sm text-[#8A8A8A]">5 × 5 @ 405 lbs</p>
                  </div>
                  <Award className="w-5 h-5 text-[#C8C8C8]" />
                </div>
              </div>

              <div className="bg-black rounded-lg border border-[#2A2A2A] p-4 hover:border-[#4A4A4A] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded border border-[#3A3A3A] flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#A8A8A8]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#E8E8E8]">Overhead Press</h4>
                    <p className="text-sm text-[#8A8A8A]">3 × 10 @ 135 lbs</p>
                  </div>
                  <div className="w-2 h-2 bg-[#B8B8B8] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* D. Navigation */}
            <div className="mb-2 mt-6">
              <span className={`text-xs font-bold ${bgDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>D. Navigation</span>
            </div>
            <div className="bg-black rounded-xl border border-[#2A2A2A] p-3">
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-[#2A2A2A] text-[#E8E8E8] rounded-lg font-medium text-sm border border-[#4A4A4A]">
                  Workout
                </button>
                <button className="flex-1 py-2 bg-[#0A0A0A] text-[#9A9A9A] rounded-lg font-medium text-sm hover:bg-[#1A1A1A] border border-[#2A2A2A]">
                  History
                </button>
                <button className="flex-1 py-2 bg-[#0A0A0A] text-[#9A9A9A] rounded-lg font-medium text-sm hover:bg-[#1A1A1A] border border-[#2A2A2A]">
                  Stats
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette Reference */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Light Mode Palette</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded"></div>
                <span className="text-sm">Background: #FFFFFF</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded"></div>
                <span className="text-sm">Primary: #2563EB</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <span className="text-sm">Surface: #E5E7EB</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3">Dark Mode Palette</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-900 rounded"></div>
                <span className="text-sm">Background: #1F2937</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded"></div>
                <span className="text-sm">Primary: #2563EB</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-800 rounded"></div>
                <span className="text-sm">Surface: #374151</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3">AMOLED Brutalist Palette</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black border border-gray-600 rounded"></div>
                <span className="text-sm">Background: #000000</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#C8C8C8] rounded"></div>
                <span className="text-sm">Text: #C8C8C8 (concrete)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#2A2A2A] rounded"></div>
                <span className="text-sm">Surface: #2A2A2A</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#8A8A8A] rounded"></div>
                <span className="text-sm">Muted: #8A8A8A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
