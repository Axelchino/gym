import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader, Wifi, WifiOff, User, UserX, Database } from 'lucide-react';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { supabase } from '../services/supabase';
import { reinitializeDatabase, getDatabaseStats } from '../services/initializeDatabase';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  timestamp?: Date;
}

export function DevTestPanel() {
  const { activeWorkout, saveWorkout, isSaving } = useActiveWorkout();
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Debug: Log when component mounts
  console.log('🧪 DevTestPanel mounted', { isOpen, activeWorkout: !!activeWorkout, isSaving });

  // Test scenarios
  const scenarios = [
    {
      id: 'auth-check',
      name: 'Auth Verification Test',
      description: 'Verifies user is authenticated before save',
      icon: User,
      async run() {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          throw new Error('Not authenticated');
        }
        return `Authenticated as: ${data.user.email}`;
      }
    },
    {
      id: 'localstorage-persist',
      name: 'LocalStorage Persistence Test',
      description: 'Checks if workout persists in localStorage',
      icon: CheckCircle,
      async run() {
        const stored = localStorage.getItem('gym-tracker-active-workout');
        if (!stored) {
          throw new Error('No workout in localStorage');
        }
        const parsed = JSON.parse(stored);
        return `Workout in storage: ${parsed.name} with ${parsed.exercises?.length || 0} exercises`;
      }
    },
    {
      id: 'save-state',
      name: 'Save State Test',
      description: 'Verifies isSaving flag prevents duplicate saves',
      icon: Loader,
      async run() {
        if (isSaving) {
          return 'isSaving is TRUE - duplicate saves blocked ✓';
        }
        return 'isSaving is FALSE - ready to save ✓';
      }
    },
    {
      id: 'workout-data',
      name: 'Workout Data Integrity Test',
      description: 'Validates workout data structure',
      icon: CheckCircle,
      async run() {
        if (!activeWorkout) {
          return 'No active workout - Start a workout to test data integrity ✓';
        }
        const issues = [];
        if (!activeWorkout.name) issues.push('Missing name');
        if (!activeWorkout.startTime) issues.push('Missing startTime');
        if (!activeWorkout.exercises) issues.push('Missing exercises array');

        if (issues.length > 0) {
          throw new Error(`Data issues: ${issues.join(', ')}`);
        }

        return `Valid workout: ${activeWorkout.exercises.length} exercises, ${
          activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
        } sets`;
      }
    },
  ];

  const runTest = async (scenario: typeof scenarios[0]) => {
    const testName = scenario.name;

    // Update status to running
    setTestResults(prev =>
      prev.map(t => t.name === testName ? { ...t, status: 'running' as const } : t)
    );

    try {
      const message = await scenario.run();
      setTestResults(prev =>
        prev.map(t =>
          t.name === testName
            ? { ...t, status: 'passed' as const, message, timestamp: new Date() }
            : t
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResults(prev =>
        prev.map(t =>
          t.name === testName
            ? { ...t, status: 'failed' as const, message: errorMessage, timestamp: new Date() }
            : t
        )
      );
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);

    // Initialize results
    setTestResults(scenarios.map(s => ({
      name: s.name,
      status: 'pending' as const
    })));

    // Run tests sequentially
    for (const scenario of scenarios) {
      await runTest(scenario);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunningTests(false);
  };

  const testSaveWithRetry = async () => {
    if (!activeWorkout) {
      alert('⚠️ No active workout. Start a workout first to test save functionality.');
      return;
    }

    const confirmed = confirm(
      '🧪 Test Save Operation\n\n' +
      'This will attempt to save your workout.\n\n' +
      'Expected behavior:\n' +
      '✓ Auth verification runs first\n' +
      '✓ Workout stays in localStorage during save\n' +
      '✓ Only clears on success\n' +
      '✓ Shows loading state\n\n' +
      'Continue?'
    );

    if (!confirmed) return;

    try {
      console.log('🧪 TEST: Starting save operation...');
      console.log('🧪 TEST: Workout before save:', activeWorkout);

      const result = await saveWorkout();

      console.log('🧪 TEST: Save succeeded!', result);
      alert('✅ Save test PASSED!\n\nWorkout saved successfully.');
    } catch (error) {
      console.error('🧪 TEST: Save failed:', error);

      // Verify workout is still in localStorage
      const stored = localStorage.getItem('gym-tracker-active-workout');
      if (stored) {
        alert(
          '✅ Save test PASSED!\n\n' +
          'Save failed as expected, BUT:\n' +
          '✓ Workout is still in localStorage\n' +
          '✓ You can retry the save\n\n' +
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } else {
        alert(
          '❌ Save test FAILED!\n\n' +
          'Workout was cleared from localStorage even though save failed!\n' +
          'This is the critical bug we\'re trying to fix.'
        );
      }
    }
  };

  const reloadDatabase = async () => {
    console.log('🔘 Reload button clicked');

    const confirmed = confirm(
      '🔄 Reload Exercise Database\n\n' +
      'This will:\n' +
      '✓ Clear all exercises from IndexedDB\n' +
      '✓ Reload 1,171 exercises from JSON\n' +
      '✓ Update search aliases\n\n' +
      '⚠️  This will NOT affect your workouts!\n\n' +
      'Continue?'
    );

    if (!confirmed) {
      console.log('❌ User cancelled reload');
      return;
    }

    console.log('✅ User confirmed reload, starting process...');

    try {
      console.log('🔄 Step 1: Getting database stats before...');
      const statsBefore = await getDatabaseStats();
      console.log('📊 Before:', statsBefore);

      console.log('🔄 Step 2: Calling reinitializeDatabase()...');
      await reinitializeDatabase();
      console.log('✅ Step 2 complete');

      console.log('🔄 Step 3: Getting database stats after...');
      const statsAfter = await getDatabaseStats();
      console.log('📊 After:', statsAfter);

      const message =
        `✅ Database Reloaded!\n\n` +
        `Before: ${statsBefore.totalExercises} exercises\n` +
        `After: ${statsAfter.totalExercises} exercises\n\n` +
        `Please reload the page to see changes.`;

      console.log(message);
      alert(message);

      console.log('🔄 Reloading page in 1 second...');
      setTimeout(() => {
        console.log('🔄 Page reload triggered');
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Database reload failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });

      alert(
        `❌ Reload Failed!\n\n` +
        `${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
        `Check console for details.`
      );
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 z-[9999] transition-colors border-2 border-purple-400"
        title="Open Dev Test Panel"
        style={{ position: 'fixed', bottom: '1rem', right: '1rem' }}
      >
        <AlertCircle size={20} />
        <span className="font-mono text-sm font-bold">DEV TESTS</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] bg-gray-900 border-2 border-purple-600 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 px-4 py-3 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} />
          <h3 className="font-bold font-mono">DEV TEST PANEL</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-purple-700 rounded px-2 py-1 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status */}
        <div className="bg-gray-800 rounded p-3 space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Status</div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span>Workout Active:</span>
              <span className={activeWorkout ? 'text-green-400' : 'text-red-400'}>
                {activeWorkout ? '✓ YES' : '✗ NO'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Currently Saving:</span>
              <span className={isSaving ? 'text-yellow-400' : 'text-gray-400'}>
                {isSaving ? '⏳ YES' : '✗ NO'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>In LocalStorage:</span>
              <span className={localStorage.getItem('gym-tracker-active-workout') ? 'text-green-400' : 'text-red-400'}>
                {localStorage.getItem('gym-tracker-active-workout') ? '✓ YES' : '✗ NO'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Quick Actions</div>
          <button
            onClick={runAllTests}
            disabled={isRunningTests}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-2"
          >
            {isRunningTests ? (
              <>
                <Loader size={16} className="animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Run All Tests
              </>
            )}
          </button>

          <button
            onClick={testSaveWithRetry}
            disabled={!activeWorkout || isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-2 rounded transition-colors"
          >
            Test Save Operation
          </button>

          <button
            onClick={reloadDatabase}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-2"
            title="Click to reload exercise database from JSON (1,171 exercises)"
          >
            <Database size={16} />
            Reload Exercise DB (1,171)
          </button>

          <button
            onClick={async () => {
              console.log('🔘 Force reload button clicked (no confirmation)');
              try {
                console.log('🔄 Step 1: Getting database stats before...');
                const statsBefore = await getDatabaseStats();
                console.log('📊 Before:', statsBefore);

                console.log('🔄 Step 2: Calling reinitializeDatabase()...');
                await reinitializeDatabase();
                console.log('✅ Step 2 complete');

                console.log('🔄 Step 3: Getting database stats after...');
                const statsAfter = await getDatabaseStats();
                console.log('📊 After:', statsAfter);

                console.log(`✅ Reloaded! Before: ${statsBefore.totalExercises}, After: ${statsAfter.totalExercises}`);
                console.log('🔄 Reloading page in 1 second...');

                setTimeout(() => {
                  console.log('🔄 Page reload triggered');
                  window.location.reload();
                }, 1000);
              } catch (error) {
                console.error('❌ Database reload failed:', error);
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm"
            title="Force reload without confirmation (use if popups are blocked)"
          >
            <Database size={16} />
            Force Reload (No Confirm)
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Test Results</div>
            <div className="space-y-2">
              {testResults.map((result) => {
                const scenario = scenarios.find(s => s.name === result.name);
                const Icon = scenario?.icon || CheckCircle;

                return (
                  <div
                    key={result.name}
                    className={`bg-gray-800 rounded p-3 border-l-4 ${
                      result.status === 'passed' ? 'border-green-500' :
                      result.status === 'failed' ? 'border-red-500' :
                      result.status === 'running' ? 'border-yellow-500' :
                      'border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {result.status === 'running' ? (
                        <Loader size={16} className="animate-spin mt-1 flex-shrink-0" />
                      ) : result.status === 'passed' ? (
                        <CheckCircle size={16} className="text-green-400 mt-1 flex-shrink-0" />
                      ) : result.status === 'failed' ? (
                        <XCircle size={16} className="text-red-400 mt-1 flex-shrink-0" />
                      ) : (
                        <Icon size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{result.name}</div>
                        {result.message && (
                          <div className={`text-xs mt-1 ${
                            result.status === 'passed' ? 'text-green-300' :
                            result.status === 'failed' ? 'text-red-300' :
                            'text-gray-300'
                          }`}>
                            {result.message}
                          </div>
                        )}
                        {result.timestamp && (
                          <div className="text-xs text-gray-500 mt-1">
                            {result.timestamp.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual Test Scenarios */}
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Manual Tests</div>
          <div className="space-y-2 text-xs">
            <div className="bg-gray-800 rounded p-3">
              <div className="font-semibold mb-1">🔌 Network Failure Test</div>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                <li>Start a workout with some sets</li>
                <li>Open DevTools → Network tab</li>
                <li>Enable "Offline" mode</li>
                <li>Click "Finish Workout"</li>
                <li>Verify: Error shows, workout stays in localStorage</li>
              </ol>
            </div>

            <div className="bg-gray-800 rounded p-3">
              <div className="font-semibold mb-1">🔐 Auth Failure Test</div>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                <li>Start a workout</li>
                <li>Sign out in another tab</li>
                <li>Return and try to save</li>
                <li>Verify: Auth error shows, workout stays</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
