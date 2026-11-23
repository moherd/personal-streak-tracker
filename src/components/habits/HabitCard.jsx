import React from 'react';
import { Flame, Award, Calendar, Edit2, Archive, Trash2, CheckCircle, RotateCcw } from 'lucide-react';
import { calculateHabitStreak } from '../../utils/streakCalculator';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function HabitCard({
  habit,
  logs = new Set(),
  onEdit,
  onToggleArchive,
  onDelete
}) {
  const metrics = calculateHabitStreak(habit, logs);

  return (
    <div
      className="habit-card"
      style={{
        borderLeft: `4px solid ${habit.color || 'var(--primary)'}`,
        opacity: habit.is_archived ? 0.75 : 1
      }}
    >
      <div>
        <div className="habit-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="category-tag">{habit.category}</span>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)'
                }}
              >
                {habit.frequency === 'weekly'
                  ? `${habit.target_days_per_week || 3}x/week`
                  : 'Daily'}
              </span>
              {habit.is_archived && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    background: '#e2e8f0',
                    color: '#475569',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  Archived
                </span>
              )}
            </div>
            <h3 className="habit-card-title">{habit.name}</h3>
          </div>
        </div>

        {habit.description && (
          <p className="habit-card-desc">{habit.description}</p>
        )}

        <div className="habit-card-stats">
          <div>
            <div className="stat-mini-label">Current Streak</div>
            <div
              className="stat-mini-val"
              style={{
                color: metrics.currentStreak > 0 ? '#d97706' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem'
              }}
            >
              <Flame size={14} />
              <span>{metrics.currentStreak}</span>
            </div>
          </div>
          <div>
            <div className="stat-mini-label">Longest Streak</div>
            <div
              className="stat-mini-val"
              style={{
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem'
              }}
            >
              <Award size={14} />
              <span>{metrics.longestStreak}</span>
            </div>
          </div>
          <div>
            <div className="stat-mini-label">Consistency</div>
            <div className="stat-mini-val" style={{ color: 'var(--primary)' }}>
              {metrics.completionRate}%
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Started: {formatDisplayDate(habit.start_date)} • Total completions: {metrics.totalCompletions}
        </div>
      </div>

      <div className="habit-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => onEdit(habit)}
            title="Edit Habit"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => onToggleArchive(habit.id, !habit.is_archived)}
            title={habit.is_archived ? 'Unarchive Habit' : 'Archive Habit'}
          >
            {habit.is_archived ? <RotateCcw size={15} /> : <Archive size={15} />}
          </button>
          <button
            type="button"
            className="btn-icon"
            style={{ color: 'var(--danger)' }}
            onClick={() => onDelete(habit)}
            title="Delete Habit"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
