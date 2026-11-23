import React from 'react';
import { Check, CheckCircle2, Circle, Flame, Plus } from 'lucide-react';
import { getTodayDate } from '../../utils/dateUtils';
import { calculateHabitStreak } from '../../utils/streakCalculator';

export default function TodayHabitsList({
  habits = [],
  habitLogsMap = new Map(),
  onToggleCompletion,
  onCreateHabit
}) {
  const activeHabits = habits.filter((h) => !h.is_archived);
  const todayStr = getTodayDate();

  if (activeHabits.length === 0) {
    return (
      <div className="surface-card">
        <h3 className="section-title">Today's Habits</h3>
        <div className="empty-state">
          <Circle className="empty-icon" />
          <h4 className="empty-title">No habits created yet</h4>
          <p className="empty-text">
            Start by adding a habit you want to track consistently. Maintain streaks and watch your progress grow.
          </p>
          <button className="btn btn-primary" onClick={onCreateHabit}>
            <Plus size={16} />
            <span>Create First Habit</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card">
      <div className="section-title">
        <span>Today's Habits</span>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          onClick={onCreateHabit}
        >
          <Plus size={14} />
          <span>New Habit</span>
        </button>
      </div>

      <div className="habit-checklist">
        {activeHabits.map((habit) => {
          const logs = habitLogsMap.get(habit.id) || new Set();
          const metrics = calculateHabitStreak(habit, logs, todayStr);
          const isCompleted = metrics.isCompletedToday;

          return (
            <div
              key={habit.id}
              className={`checklist-item ${isCompleted ? 'completed' : ''}`}
            >
              <div className="checklist-left">
                <button
                  type="button"
                  className="btn-icon"
                  style={{
                    color: isCompleted ? 'var(--success)' : 'var(--text-subtle)',
                    padding: 0
                  }}
                  onClick={() => onToggleCompletion(habit.id, todayStr)}
                  title={isCompleted ? 'Undo completion' : 'Mark complete'}
                >
                  {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div className="checklist-info">
                  <h4>{habit.name}</h4>
                  <div className="checklist-meta">
                    <span className="category-tag">{habit.category}</span>
                    <span>•</span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {habit.frequency === 'weekly'
                        ? `${habit.target_days_per_week || 3}x/week`
                        : 'Daily'}
                    </span>
                    <span>•</span>
                    <span className={`streak-pill ${metrics.currentStreak === 0 ? 'zero' : ''}`}>
                      <Flame size={12} />
                      <span>{metrics.currentStreak} {habit.frequency === 'weekly' ? 'wks' : 'days'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className={`checklist-toggle-btn ${isCompleted ? 'btn-completed' : 'btn-complete'}`}
                  onClick={() => onToggleCompletion(habit.id, todayStr)}
                >
                  {isCompleted ? (
                    <>
                      <Check size={14} />
                      <span>Done</span>
                    </>
                  ) : (
                    <span>Complete</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
