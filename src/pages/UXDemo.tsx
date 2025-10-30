import React, { useState } from 'react';
import { Dumbbell, TrendingUp, Calendar, BarChart3, Zap, Layout, Palette } from 'lucide-react';

type DemoSection = 'cards' | 'navigation' | 'inputs' | 'stats' | 'colors';

export default function UXDemo() {
  const [activeSection, setActiveSection] = useState<DemoSection>('cards');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">UX Demo Gallery</h1>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveSection('cards')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeSection === 'cards'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Layout className="inline w-4 h-4 mr-2" />
              Card Layouts
            </button>
            <button
              onClick={() => setActiveSection('navigation')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeSection === 'navigation'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="inline w-4 h-4 mr-2" />
              Navigation
            </button>
            <button
              onClick={() => setActiveSection('inputs')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeSection === 'inputs'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Dumbbell className="inline w-4 h-4 mr-2" />
              Input Styles
            </button>
            <button
              onClick={() => setActiveSection('stats')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeSection === 'stats'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="inline w-4 h-4 mr-2" />
              Stats Display
            </button>
            <button
              onClick={() => setActiveSection('colors')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeSection === 'colors'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Palette className="inline w-4 h-4 mr-2" />
              Color Themes
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'cards' && <CardLayoutsDemo />}
        {activeSection === 'navigation' && <NavigationDemo />}
        {activeSection === 'inputs' && <InputStylesDemo />}
        {activeSection === 'stats' && <StatsDisplayDemo />}
        {activeSection === 'colors' && <ColorThemesDemo />}
      </div>
    </div>
  );
}

// Card Layouts Demo
function CardLayoutsDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Option 1: Minimal Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Bench Press</h3>
              <span className="text-xs text-gray-500">Chest</span>
            </div>
            <p className="text-sm text-gray-600">3 sets × 12 reps</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Barbell Squat</h3>
              <span className="text-xs text-gray-500">Legs</span>
            </div>
            <p className="text-sm text-gray-600">4 sets × 8 reps</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 2: Card with Icons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Dumbbell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Bench Press</h3>
                <p className="text-sm text-gray-600">Chest • Compound</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">3 sets</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">12 reps</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Dumbbell className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Barbell Squat</h3>
                <p className="text-sm text-gray-600">Legs • Compound</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">4 sets</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">8 reps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 3: Gradient Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white cursor-pointer hover:scale-105 transition-transform">
            <h3 className="font-bold text-lg mb-2">Bench Press</h3>
            <p className="text-blue-100 text-sm mb-3">Chest • Compound Movement</p>
            <div className="flex gap-2">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                3 sets
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                12 reps
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white cursor-pointer hover:scale-105 transition-transform">
            <h3 className="font-bold text-lg mb-2">Barbell Squat</h3>
            <p className="text-purple-100 text-sm mb-3">Legs • Compound Movement</p>
            <div className="flex gap-2">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                4 sets
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                8 reps
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 4: List View</h2>
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Bench Press</h3>
                <p className="text-xs text-gray-500">3 × 12 • Chest</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Barbell Squat</h3>
                <p className="text-xs text-gray-500">4 × 8 • Legs</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Deadlift</h3>
                <p className="text-xs text-gray-500">5 × 5 • Back</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation Demo
function NavigationDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Option 1: Bottom Tab Bar (Current)</h2>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex justify-around py-2">
            <button className="flex flex-col items-center gap-1 text-blue-500">
              <Dumbbell className="w-6 h-6" />
              <span className="text-xs font-medium">Workouts</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400">
              <Calendar className="w-6 h-6" />
              <span className="text-xs font-medium">History</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400">
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-medium">Analytics</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 2: Floating Action Button</h2>
        <div className="relative bg-white rounded-lg p-4 border border-gray-200 h-64">
          <p className="text-gray-500 text-sm">Main content area...</p>
          <button className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
            <Dumbbell className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 3: Sidebar Navigation</h2>
        <div className="flex bg-white rounded-lg overflow-hidden border border-gray-200 h-64">
          <div className="w-64 bg-gray-50 p-4 border-r border-gray-200">
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 bg-blue-500 text-white rounded-lg">
                <Dumbbell className="w-5 h-5" />
                <span className="font-medium">Workouts</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">History</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Analytics</span>
              </button>
            </nav>
          </div>
          <div className="flex-1 p-4">
            <p className="text-gray-500">Main content area...</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 4: Pill Navigation</h2>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button className="flex-1 py-2 bg-white rounded-md shadow-sm font-medium text-sm">
              Workouts
            </button>
            <button className="flex-1 py-2 text-gray-600 font-medium text-sm">
              History
            </button>
            <button className="flex-1 py-2 text-gray-600 font-medium text-sm">
              Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Input Styles Demo
function InputStylesDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Option 1: Standard Inputs</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (lbs)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="135"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reps
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="12"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 2: Minimal Inputs</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (lbs)
            </label>
            <input
              type="number"
              className="w-full px-3 py-3 bg-gray-50 border-b-2 border-gray-300 focus:border-blue-500 focus:bg-white transition-colors"
              placeholder="135"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reps
            </label>
            <input
              type="number"
              className="w-full px-3 py-3 bg-gray-50 border-b-2 border-gray-300 focus:border-blue-500 focus:bg-white transition-colors"
              placeholder="12"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 3: Number Steppers</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (lbs)
            </label>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold">
                −
              </button>
              <input
                type="number"
                className="flex-1 text-center text-lg font-semibold px-3 py-2 border border-gray-300 rounded-lg"
                value="135"
              />
              <button className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold">
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reps
            </label>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold">
                −
              </button>
              <input
                type="number"
                className="flex-1 text-center text-lg font-semibold px-3 py-2 border border-gray-300 rounded-lg"
                value="12"
              />
              <button className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold">
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 4: Quick Entry Buttons</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (lbs)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button className="py-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-lg font-medium transition-colors">
                95
              </button>
              <button className="py-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-lg font-medium transition-colors">
                135
              </button>
              <button className="py-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-lg font-medium transition-colors">
                185
              </button>
              <button className="py-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-lg font-medium transition-colors">
                225
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reps
            </label>
            <div className="grid grid-cols-6 gap-2">
              {[6, 8, 10, 12, 15, 20].map((rep) => (
                <button
                  key={rep}
                  className="py-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-lg font-medium transition-colors"
                >
                  {rep}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Display Demo
function StatsDisplayDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Option 1: Card Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Workouts</p>
            <p className="text-2xl font-bold">127</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">This Week</p>
            <p className="text-2xl font-bold">4</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Best Streak</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Volume</p>
            <p className="text-2xl font-bold">45.2k</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 2: Gradient Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <p className="text-sm text-blue-100 mb-1">Total Workouts</p>
            <p className="text-3xl font-bold">127</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
            <p className="text-sm text-green-100 mb-1">This Week</p>
            <p className="text-3xl font-bold">4</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <p className="text-sm text-purple-100 mb-1">Best Streak</p>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <p className="text-sm text-orange-100 mb-1">Total Volume</p>
            <p className="text-3xl font-bold">45.2k</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 3: With Icons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Dumbbell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Workouts</p>
              <p className="text-2xl font-bold">127</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Option 4: Progress Bars</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Weekly Goal</span>
              <span className="text-sm font-bold">4/5 workouts</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '80%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Monthly Streak</span>
              <span className="text-sm font-bold">18/30 days</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Color Themes Demo
function ColorThemesDemo() {
  const themes = [
    {
      name: "Deep Ocean",
      colors: [
        { bg: "bg-[#0A4D68]", text: "text-white", label: "Navy Primary" },
        { bg: "bg-[#088395]", text: "text-white", label: "Teal Accent" },
        { bg: "bg-[#05BFDB]", text: "text-black", label: "Bright Cyan" },
        { bg: "bg-[#00FFCA]", text: "text-black", label: "Aqua Pop" },
      ],
      demo: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[#0A4D68] p-4 rounded-lg text-white border border-[#00FFCA]">
            <h3 className="font-bold mb-2">Bench Press</h3>
            <p className="text-sm text-[#00FFCA]">225 lbs × 5 reps</p>
          </div>
          <div className="bg-[#088395] p-4 rounded-lg text-white">
            <h3 className="font-bold mb-2">Workout Complete</h3>
            <p className="text-sm">3 sets logged</p>
          </div>
        </div>
      )
    },
    {
      name: "Sunset Energy",
      colors: [
        { bg: "bg-[#FF6B35]", text: "text-white", label: "Sunset Orange" },
        { bg: "bg-[#F7931E]", text: "text-black", label: "Golden Hour" },
        { bg: "bg-[#C1292E]", text: "text-white", label: "Deep Red" },
        { bg: "bg-[#235789]", text: "text-white", label: "Twilight Blue" },
      ],
      demo: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gradient-to-br from-[#FF6B35] to-[#C1292E] p-4 rounded-lg text-white">
            <h3 className="font-bold mb-2">Active Now</h3>
            <p className="text-sm">315 lbs × 3 reps</p>
          </div>
          <div className="bg-[#235789] p-4 rounded-lg text-white">
            <h3 className="font-bold mb-2">Rest Timer</h3>
            <p className="text-sm text-[#F7931E]">2:30 remaining</p>
          </div>
        </div>
      )
    },
    {
      name: "Midnight Power",
      colors: [
        { bg: "bg-[#1A1A2E]", text: "text-white", label: "Deep Navy" },
        { bg: "bg-[#16213E]", text: "text-white", label: "Dark Slate" },
        { bg: "bg-[#0F3460]", text: "text-white", label: "Royal Blue" },
        { bg: "bg-[#E94560]", text: "text-white", label: "Neon Pink" },
      ],
      demo: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[#1A1A2E] p-4 rounded-lg text-white border border-[#E94560]">
            <h3 className="font-bold mb-2 text-[#E94560]">PR BROKEN</h3>
            <p className="text-sm">405 lbs Deadlift</p>
          </div>
          <div className="bg-[#0F3460] p-4 rounded-lg text-white">
            <h3 className="font-bold mb-2">Volume Today</h3>
            <p className="text-sm">18,500 lbs</p>
          </div>
        </div>
      )
    },
    {
      name: "Forest Strength",
      colors: [
        { bg: "bg-[#2C5F2D]", text: "text-white", label: "Forest Green" },
        { bg: "bg-[#97BC62]", text: "text-black", label: "Sage Green" },
        { bg: "bg-[#F4A259]", text: "text-black", label: "Warm Gold" },
        { bg: "bg-[#FFFAEB]", text: "text-[#2C5F2D]", label: "Cream" },
      ],
      demo: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[#2C5F2D] p-4 rounded-lg text-white">
            <h3 className="font-bold mb-2">Natural Power</h3>
            <p className="text-sm text-[#97BC62]">185 lbs × 12 reps</p>
          </div>
          <div className="bg-[#FFFAEB] p-4 rounded-lg text-[#2C5F2D] border-2 border-[#F4A259]">
            <h3 className="font-bold mb-2">Organic Gains</h3>
            <p className="text-sm">4 sets complete</p>
          </div>
        </div>
      )
    },
    {
      name: "Electric Volt",
      colors: [
        { bg: "bg-[#0D0D0D]", text: "text-white", label: "Pure Black" },
        { bg: "bg-[#DFFF00]", text: "text-black", label: "Neon Yellow" },
        { bg: "bg-[#39FF14]", text: "text-black", label: "Electric Green" },
        { bg: "bg-[#FF10F0]", text: "text-white", label: "Hot Pink" },
      ],
      demo: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[#0D0D0D] p-4 rounded-lg text-white border-2 border-[#DFFF00]">
            <h3 className="font-bold mb-2 text-[#DFFF00]">BEAST MODE</h3>
            <p className="text-sm text-[#39FF14]">500 lbs × 1 rep</p>
          </div>
          <div className="bg-[#DFFF00] p-4 rounded-lg text-black">
            <h3 className="font-bold mb-2">MAX EFFORT</h3>
            <p className="text-sm">New PR!</p>
          </div>
        </div>
      )
    },
    {
      name: "Iron & Steel",
      colors: [
        { bg: "bg-[#2B2B2B]", text: "text-white", label: "Charcoal" },
        { bg: "bg-[#4A4A4A]", text: "text-white", label: "Steel Gray" },
        { bg: "bg-[#B8B8B8]", text: "text-black", label: "Silver" },
        { bg: "bg-[#D4AF37]", text: "text-black", label: "Gold" },
      ],
      demo: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[#2B2B2B] p-4 rounded-lg text-white border border-[#D4AF37]">
            <h3 className="font-bold mb-2 text-[#D4AF37]">Premium Gains</h3>
            <p className="text-sm">225 lbs × 8 reps</p>
          </div>
          <div className="bg-[#4A4A4A] p-4 rounded-lg text-white">
            <h3 className="font-bold mb-2">Total Volume</h3>
            <p className="text-sm text-[#D4AF37]">15,600 lbs</p>
          </div>
        </div>
      )
    },
    {
      name: "Fire & Ice",
      colors: [
        { bg: "bg-[#FF0000]", text: "text-white", label: "Hot Red" },
        { bg: "bg-[#DC143C]", text: "text-white", label: "Crimson" },
        { bg: "bg-[#00CED1]", text: "text-black", label: "Ice Cyan" },
        { bg: "bg-[#87CEEB]", text: "text-black", label: "Sky Blue" },
      ],
      demo: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[#DC143C] p-4 rounded-lg text-white">
            <h3 className="font-bold mb-2">INTENSITY</h3>
            <p className="text-sm">405 lbs × 2 reps</p>
          </div>
          <div className="bg-[#00CED1] p-4 rounded-lg text-black">
            <h3 className="font-bold mb-2">RECOVERY</h3>
            <p className="text-sm">Rest day active</p>
          </div>
        </div>
      )
    },
    {
      name: "Karina's Aura ✨ (Full Demo)",
      colors: [
        { bg: "bg-[#B482FF]", text: "text-white", label: "Queen Purple" },
        { bg: "bg-[#E1BE82]", text: "text-black", label: "Luxury Gold" },
        { bg: "bg-[#00B4FF]", text: "text-white", label: "Stage Blue" },
        { bg: "bg-[#C8C8DC]", text: "text-[#14141E]", label: "Soft Casual" },
        { bg: "bg-[#141428]", text: "text-white", label: "Sophisticated Dark" },
        { bg: "bg-[#002850]", text: "text-white", label: "Stage Dark" },
      ],
      demo: (
        <div className="space-y-8 mt-4">
          {/* LIGHT MODE SECTION */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">☀️ Light Mode (Queen's Day Look)</h3>

            {/* Hero Card - Queen Tier */}
            <div className="bg-white p-6 rounded-xl border-2 border-[#B482FF] shadow-xl mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-[#B482FF] bg-[#F5EDFF] px-3 py-1 rounded-full">
                    👑 QUEEN TIER
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">New Personal Record!</h3>
                  <p className="text-gray-600">Bench Press - Today at 2:34 PM</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#B482FF]">405</div>
                  <div className="text-sm text-gray-500">lbs × 1 rep</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-[#B482FF] text-white py-3 rounded-lg font-bold hover:bg-[#9D6EE8] transition-colors">
                  Share Achievement
                </button>
                <button className="flex-1 bg-[#F5EDFF] text-[#B482FF] py-3 rounded-lg font-bold hover:bg-[#E8D9FF] transition-colors">
                  View History
                </button>
              </div>
            </div>

            {/* Stats Grid - Light */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-[#F5EDFF] p-4 rounded-xl border border-[#B482FF]">
                <div className="text-2xl font-bold text-[#B482FF]">127</div>
                <div className="text-xs text-gray-600">Total Workouts</div>
              </div>
              <div className="bg-[#FFF9ED] p-4 rounded-xl border border-[#E1BE82]">
                <div className="text-2xl font-bold text-[#B4965F]">18.5k</div>
                <div className="text-xs text-gray-600">Volume (lbs)</div>
              </div>
              <div className="bg-[#E8F7FF] p-4 rounded-xl border border-[#00B4FF]">
                <div className="text-2xl font-bold text-[#0090CC]">12</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
            </div>

            {/* Exercise Cards - Light */}
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-[#C8C8DC] hover:border-[#B482FF] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#B482FF] rounded-lg flex items-center justify-center text-white font-bold">
                      B
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Bench Press</h4>
                      <p className="text-sm text-gray-500">3 × 12 @ 185 lbs</p>
                    </div>
                  </div>
                  <div className="text-[#B482FF] font-bold">→</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-[#C8C8DC] hover:border-[#E1BE82] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E1BE82] rounded-lg flex items-center justify-center text-black font-bold">
                      S
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Squat</h4>
                      <p className="text-sm text-gray-500">4 × 8 @ 225 lbs</p>
                    </div>
                  </div>
                  <div className="text-[#E1BE82] font-bold">→</div>
                </div>
              </div>
            </div>
          </div>

          {/* DARK MODE SECTION */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">🌙 Dark Mode (Queen's Stage Look)</h3>

            {/* Hero Card - Stage Presence */}
            <div className="bg-[#002850] p-6 rounded-xl border-2 border-[#00B4FF] shadow-2xl mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-[#00B4FF] bg-[#003D66] px-3 py-1 rounded-full">
                    ⚡ STAGE PRESENCE MODE
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2">Active Workout</h3>
                  <p className="text-[#C8F0FF]">Set 3 of 4 - 2:30 rest remaining</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#00B4FF]">315</div>
                  <div className="text-sm text-[#C8F0FF]">lbs × 5 reps</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-[#00B4FF] text-white py-3 rounded-lg font-bold hover:bg-[#0090CC] transition-colors">
                  Complete Set
                </button>
                <button className="flex-1 bg-[#003D66] text-[#00B4FF] py-3 rounded-lg font-bold hover:bg-[#004D7A] transition-colors border border-[#00B4FF]">
                  Skip Rest
                </button>
              </div>
            </div>

            {/* Stats Grid - Dark */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-[#141428] p-4 rounded-xl border border-[#B482FF]">
                <div className="text-2xl font-bold text-[#B482FF]">6</div>
                <div className="text-xs text-[#C8C8DC]">Sets Done</div>
              </div>
              <div className="bg-[#141428] p-4 rounded-xl border border-[#E1BE82]">
                <div className="text-2xl font-bold text-[#E1BE82]">4,850</div>
                <div className="text-xs text-[#C8C8DC]">Volume Today</div>
              </div>
              <div className="bg-[#141428] p-4 rounded-xl border border-[#00B4FF]">
                <div className="text-2xl font-bold text-[#00B4FF]">48</div>
                <div className="text-xs text-[#C8C8DC]">Minutes</div>
              </div>
            </div>

            {/* Luxury Gold Card - Sophisticated */}
            <div className="bg-black p-6 rounded-xl border-2 border-[#B4965F] mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#E1BE82] bg-[#1A1610] px-3 py-1 rounded-full">
                  ✨ SOPHISTICATED LUXURY
                </span>
                <span className="text-[#E1BE82]">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-[#E1BE82] mb-2">Weekly Achievement</h3>
              <p className="text-[#B4965F] mb-4">5 workouts completed - Consistency is elegance</p>
              <div className="bg-[#1A1610] rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-[#B4965F] to-[#E1BE82] h-full" style={{width: '100%'}}></div>
              </div>
            </div>

            {/* Exercise Cards - Dark */}
            <div className="space-y-3">
              <div className="bg-[#141428] p-4 rounded-lg border border-[#B482FF] hover:bg-[#1A1A35] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#B482FF] to-[#9D6EE8] rounded-lg flex items-center justify-center text-white font-bold">
                      D
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Deadlift</h4>
                      <p className="text-sm text-[#C8C8DC]">5 × 5 @ 405 lbs</p>
                    </div>
                  </div>
                  <div className="text-[#B482FF] font-bold">→</div>
                </div>
              </div>

              <div className="bg-[#002850] p-4 rounded-lg border border-[#00B4FF] hover:bg-[#003D66] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00B4FF] to-[#0090CC] rounded-lg flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Pull-ups</h4>
                      <p className="text-sm text-[#C8F0FF]">3 × 10 @ BW</p>
                    </div>
                  </div>
                  <div className="text-[#00B4FF] font-bold">→</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs Demo */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">🎯 Navigation Styles</h3>

            {/* Light Mode Tabs */}
            <div className="bg-white p-4 rounded-xl border border-[#C8C8DC] mb-3">
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-[#B482FF] text-white rounded-lg font-medium">
                  Workout
                </button>
                <button className="flex-1 py-2 bg-[#F5EDFF] text-[#B482FF] rounded-lg font-medium">
                  History
                </button>
                <button className="flex-1 py-2 bg-[#F5EDFF] text-[#B482FF] rounded-lg font-medium">
                  Stats
                </button>
              </div>
            </div>

            {/* Dark Mode Tabs */}
            <div className="bg-[#141428] p-4 rounded-xl border border-[#B482FF]">
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-gradient-to-r from-[#B482FF] to-[#9D6EE8] text-white rounded-lg font-medium">
                  Workout
                </button>
                <button className="flex-1 py-2 bg-[#1A1A35] text-[#B482FF] rounded-lg font-medium border border-[#B482FF]/30">
                  History
                </button>
                <button className="flex-1 py-2 bg-[#1A1A35] text-[#E1BE82] rounded-lg font-medium border border-[#E1BE82]/30">
                  Stats
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      name: "Mint Green Minimalist",
      colors: [
        { bg: "bg-[#10B981]", text: "text-white", label: "Mint Green" },
        { bg: "bg-[#059669]", text: "text-white", label: "Dark Green" },
        { bg: "bg-[#D1FAE5]", text: "text-[#059669]", label: "Light Mint" },
        { bg: "bg-white", text: "text-gray-900", label: "White" },
      ],
      demo: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[#10B981] p-4 rounded-lg text-white">
            <h3 className="font-bold mb-2">Rest Day</h3>
            <p className="text-sm">Recovery mode</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-[#10B981]">
            <h3 className="font-bold mb-2 text-[#10B981]">Next Workout</h3>
            <p className="text-sm text-gray-600">Push Day</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-12">
      {themes.map((theme, index) => (
        <div key={index} className="space-y-4">
          <h2 className="text-xl font-bold">{theme.name}</h2>

          {/* Color Swatches */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {theme.colors.map((color, i) => (
              <div key={i} className={`${color.bg} ${color.text} h-24 rounded-lg flex flex-col items-center justify-center font-medium border-2 border-gray-300 shadow-sm`}>
                <span className="text-sm font-semibold">{color.label}</span>
              </div>
            ))}
          </div>

          {/* Live Demo */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Live Demo:</h3>
            {theme.demo}
          </div>
        </div>
      ))}
    </div>
  );
}
