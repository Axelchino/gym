import { Dumbbell, TrendingUp, Flame, Trophy } from 'lucide-react';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import '../styles/themes.css';

/**
 * Theme Demo Page
 *
 * Clean demo using CSS classes from themes.css
 * Switch themes with the floating button in bottom-right
 * Edit colors/shadows in src/styles/themes.css
 */
export default function ThemeDemo() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface)',
      padding: '2rem',
      transition: 'background-color 0.3s'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 className="text-primary" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Theme System Demo
        </h1>
        <p className="text-secondary" style={{ marginBottom: '2rem' }}>
          Switch themes using the button in the bottom-right. Edit colors in <code>src/styles/themes.css</code>
        </p>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* A. Hero Card */}
          <section>
            <h2 className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              A. Hero Card
            </h2>
            <div className="hero-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <span className="badge-pr">NEW PR</span>
                  <h3 className="text-primary" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    Bench Press
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Today at 2:34 PM
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-primary" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    225
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    lbs × 8
                  </div>
                </div>
              </div>
              <button className="button-primary">
                Log Another Set
              </button>
            </div>
          </section>

          {/* B. Stats */}
          <section>
            <h2 className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              B. Stats
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="stats-tile accent-purple">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Dumbbell size={20} style={{ color: 'var(--color-purple)' }} />
                  <span className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: '600' }}>Workouts</span>
                </div>
                <div className="text-primary" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  127
                </div>
              </div>
              <div className="stats-tile accent-blue">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Flame size={20} style={{ color: 'var(--color-blue)' }} />
                  <span className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: '600' }}>Day Streak</span>
                </div>
                <div className="text-primary" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  12
                </div>
              </div>
            </div>
          </section>

          {/* C. Exercise Cards */}
          <section>
            <h2 className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              C. Exercise Cards
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="exercise-card accent-purple">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'var(--surface-accent)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Dumbbell size={20} style={{ color: 'var(--color-purple)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 className="text-primary" style={{ fontWeight: 'bold' }}>Barbell Squat</h4>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>4 × 8 @ 315 lbs</p>
                  </div>
                  <TrendingUp size={20} className="text-secondary" />
                </div>
              </div>

              <div className="exercise-card accent-blue">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'var(--surface-accent)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Dumbbell size={20} style={{ color: 'var(--color-blue)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 className="text-primary" style={{ fontWeight: 'bold' }}>Overhead Press</h4>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>3 × 10 @ 135 lbs</p>
                  </div>
                  <span className="badge-pr" style={{ fontSize: '0.75rem' }}>PR</span>
                </div>
              </div>
            </div>
          </section>

          {/* D. Navigation */}
          <section>
            <h2 className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              D. Navigation
            </h2>
            <div style={{
              background: 'var(--card-bg)',
              border: 'var(--card-border)',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button className="nav-button active">
                <Trophy size={16} style={{ display: 'inline-block', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                Workout
              </button>
              <button className="nav-button inactive">
                History
              </button>
              <button className="nav-button inactive">
                Stats
              </button>
            </div>
          </section>
        </div>
      </div>

      <ThemeSwitcher />
    </div>
  );
}
