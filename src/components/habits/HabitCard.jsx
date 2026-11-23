import React from 'react';
import { Flame, Award, Edit2, Archive, Trash2, RotateCcw } from 'lucide-react';
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
            <div className="habit-card-tags">
              <span className="category-tag">{habit.category}</span>
              <span className="frequency-tag">
                {habit.frequency === 'weekly'
                  ? `${habit.target_days_per_week || 3}x/week`
                  : 'Daily'}
              </span>
              {habit.is_archived && (
                <span className="archived-tag">
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
          <div className="habit-stat-col">
            <div className="stat-mini-label">Current Streak</div>
            <div
              className="stat-mini-val"
              style={{
                color: metrics.currentStreak > 0 ? '#d97706' : 'var(--text-muted)'
              }}
            >
              <Flame size={14} />
              <span>{metrics.currentStreak}</span>
            </div>
          </div>
          <div className="habit-stat-col">
            <div className="stat-mini-label">Longest Streak</div>
            <div
              className="stat-mini-val"
              style={{ color: '#7c3aed' }}
            >
              <Award size={14} />
              <span>{metrics.longestStreak}</span>
            </div>
          </div>
          <div className="habit-stat-col">
            <div className="stat-mini-label">Consistency</div>
            <div className="stat-mini-val" style={{ color: 'var(--primary)' }}>
              {metrics.completionRate}%
            </div>
          </div>
        </div>

        <div className="habit-card-submeta">
          Started: {formatDisplayDate(habit.start_date)} • Total completions: {metrics.totalCompletions}
        </div>
      </div>

      <div className="habit-card-footer">
        <div className="habit-card-actions">
          <button
            type="button"
            className="btn-icon habit-action-btn"
            onClick={() => onEdit(habit)}
            title="Edit Habit"
            aria-label={`Edit ${habit.name}`}
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            className="btn-icon habit-action-btn"
            onClick={() => onToggleArchive(habit.id, !habit.is_archived)}
            title={habit.is_archived ? 'Unarchive Habit' : 'Archive Habit'}
            aria-label={habit.is_archived ? `Unarchive ${habit.name}` : `Archive ${habit.name}`}
          >
            {habit.is_archived ? <RotateCcw size={16} /> : <Archive size={16} />}
          </button>
          <button
            type="button"
            className="btn-icon habit-action-btn habit-delete-btn"
            onClick={() => onDelete(habit)}
            title="Delete Habit"
            aria-label={`Delete ${habit.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
