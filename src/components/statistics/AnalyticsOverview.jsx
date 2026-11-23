import React, { useMemo } from 'react';
import {
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import StatCard from '../common/StatCard';
import { calculateHabitStreak } from '../../utils/streakCalculator';
import { getTodayDate, parseDate, formatDisplayDate } from '../../utils/dateUtils';

export default function AnalyticsOverview({ habits = [], habitLogsMap = new Map() }) {
  const activeHabits = habits.filter((h) => !h.is_archived);
  const todayStr = getTodayDate();

  // Compute metrics for all habits
  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      const logs = habitLogsMap.get(habit.id) || new Set();
      const metrics = calculateHabitStreak(habit, logs, todayStr);

      let healthStatus = 'strong';
      let healthLabel = 'Strong';
      if (metrics.completionRate < 50) {
        healthStatus = 'critical';
        healthLabel = 'Needs Attention';
      } else if (metrics.completionRate < 80) {
        healthStatus = 'moderate';
        healthLabel = 'Moderate';
      }

      return {
        habit,
        metrics,
        healthStatus,
        healthLabel
      };
    });
  }, [habits, habitLogsMap, todayStr]);

  // Overall aggregates
  const totalCompletionsAllTime = useMemo(() => {
    let sum = 0;
    for (const stat of habitStats) {
      sum += stat.metrics.totalCompletions;
    }
    return sum;
  }, [habitStats]);

  const averageConsistency = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    const activeStats = habitStats.filter((s) => !s.habit.is_archived);
    const sumRate = activeStats.reduce((acc, s) => acc + s.metrics.completionRate, 0);
    return Math.round(sumRate / activeStats.length);
  }, [activeHabits, habitStats]);

  // Best habit and struggling habits
  const bestHabit = useMemo(() => {
    const activeStats = habitStats.filter((s) => !s.habit.is_archived);
    if (activeStats.length === 0) return null;
    return [...activeStats].sort((a, b) => b.metrics.longestStreak - a.metrics.longestStreak)[0];
  }, [habitStats]);

  const strugglingHabits = useMemo(() => {
    return habitStats
      .filter((s) => !s.habit.is_archived && s.healthStatus === 'critical')
      .sort((a, b) => a.metrics.completionRate - b.metrics.completionRate);
  }, [habitStats]);

  // Longest streak records leaderboard
  const streakLeaderboard = useMemo(() => {
    return [...habitStats]
      .sort((a, b) => b.metrics.longestStreak - a.metrics.longestStreak)
      .slice(0, 5);
  }, [habitStats]);

  if (habits.length === 0) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Performance & Analytics</h1>
            <p className="page-subtitle">Historical completion data, consistency patterns, and habit health</p>
          </div>
        </div>
        <div className="empty-state">
          <BarChart3 className="empty-icon" />
          <h4 className="empty-title">No analytics available</h4>
          <p className="empty-text">
            Add habits and record completions to generate detailed statistical insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance & Analytics</h1>
          <p className="page-subtitle">Track consistency, analyze habit health, and identify friction points</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Avg Consistency"
          value={`${averageConsistency}%`}
          subtext="Across active habits"
          icon={TrendingUp}
          color="var(--primary)"
        />
        <StatCard
          label="Total Completions"
          value={totalCompletionsAllTime}
          subtext="All-time checks"
          icon={CheckCircle2}
          color="var(--success)"
        />
        <StatCard
          label="Top Streak Record"
          value={bestHabit ? `${bestHabit.metrics.longestStreak} days` : '0 days'}
          subtext={bestHabit ? bestHabit.habit.name : 'No streaks yet'}
          icon={Award}
          color="#8b5cf6"
        />
        <StatCard
          label="At-Risk Habits"
          value={strugglingHabits.length}
          subtext="< 50% consistency"
          icon={AlertTriangle}
          color={strugglingHabits.length > 0 ? 'var(--danger)' : 'var(--text-subtle)'}
        />
      </div>

      {/* Struggling Habits Alert if any */}
      {strugglingHabits.length > 0 && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <AlertTriangle size={20} style={{ color: '#ea580c', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 600, color: '#9a3412', marginBottom: '0.2rem' }}>
              Habits Requiring Attention ({strugglingHabits.length})
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#c2410c', lineHeight: 1.4 }}>
              The following habits have a completion rate below 50%:
              {' '}
              <strong>
                {strugglingHabits.map((s) => `${s.habit.name} (${s.metrics.completionRate}%)`).join(', ')}
              </strong>.
              Consider reducing frequency or scheduling reminders to rebuild momentum.
            </p>
          </div>
        </div>
      )}

      {/* Detailed Habit Performance Table */}
      <div className="surface-card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title-wrap">
          <h3 className="section-title" style={{ marginBottom: 0 }}>Habit Health & Consistency Breakdown</h3>
          <span className="mobile-scroll-hint">Scroll table &rarr;</span>
        </div>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Habit Name</th>
                <th>Category</th>
                <th>Frequency</th>
                <th>Current Streak</th>
                <th>Longest Streak</th>
                <th>Total Done</th>
                <th>Consistency Rate</th>
                <th>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {habitStats.map(({ habit, metrics, healthStatus, healthLabel }) => (
                <tr key={habit.id}>
                  <td>
                    <strong>{habit.name}</strong>
                    {habit.is_archived && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          marginLeft: '0.4rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        (Archived)
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="category-tag">{habit.category}</span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {habit.frequency === 'weekly'
                      ? `${habit.target_days_per_week || 3}x / wk`
                      : 'Daily'}
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontWeight: 600,
                        color: metrics.currentStreak > 0 ? '#d97706' : 'var(--text-muted)'
                      }}
                    >
                      <Flame size={13} />
                      <span>{metrics.currentStreak}</span>
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#7c3aed' }}>
                      {metrics.longestStreak}
                    </span>
                  </td>
                  <td>{metrics.totalCompletions}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{metrics.completionRate}%</span>
                      <div
                        style={{
                          width: '50px',
                          height: '6px',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${metrics.completionRate}%`,
                            height: '100%',
                            backgroundColor:
                              healthStatus === 'strong'
                                ? 'var(--success)'
                                : healthStatus === 'moderate'
                                ? 'var(--warning)'
                                : 'var(--danger)'
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          healthStatus === 'strong'
                            ? 'var(--success-light)'
                            : healthStatus === 'moderate'
                            ? 'var(--warning-light)'
                            : 'var(--danger-light)',
                        color:
                          healthStatus === 'strong'
                            ? 'var(--success-text)'
                            : healthStatus === 'moderate'
                            ? 'var(--warning-text)'
                            : 'var(--danger-text)'
                      }}
                    >
                      {healthLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Streak Hall of Fame */}
      <div className="surface-card">
        <h3 className="section-title">
          <span>Streak Records Hall of Fame</span>
          <Award size={18} style={{ color: '#8b5cf6' }} />
        </h3>
        <div className="fame-list">
          {streakLeaderboard.map(({ habit, metrics }, idx) => (
            <div
              key={habit.id}
              className={`fame-item-card ${idx === 0 ? 'top-record' : ''}`}
            >
              <div className="fame-item-left">
                <span className={`fame-rank-badge ${idx === 0 ? 'top-rank' : ''}`}>
                  #{idx + 1}
                </span>
                <div className="fame-habit-info">
                  <h4>{habit.name}</h4>
                  <span className="fame-habit-sub">
                    {habit.category} • Current: {metrics.currentStreak}
                  </span>
                </div>
              </div>

              <div className="fame-item-right">
                <div className="fame-streak-val">
                  {metrics.longestStreak} {habit.frequency === 'weekly' ? 'wks' : 'days'}
                </div>
                <div className="fame-streak-label">
                  All-time record
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
