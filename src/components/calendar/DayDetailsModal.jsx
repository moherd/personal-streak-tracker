import React from 'react';
import Modal from '../common/Modal';
import { formatDisplayDate, isToday } from '../../utils/dateUtils';
import { Check, CheckCircle2, Circle } from 'lucide-react';

export default function DayDetailsModal({
  isOpen,
  onClose,
  selectedDate,
  habits = [],
  habitLogsMap = new Map(),
  onToggleCompletion
}) {
  if (!selectedDate) return null;

  const activeHabits = habits.filter((h) => !h.is_archived);
  const formattedDate = formatDisplayDate(selectedDate, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Habits for ${isToday(selectedDate) ? 'Today' : formattedDate}`}
      maxWidth="480px"
    >
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Review or update your completions for {formattedDate}.
        </p>
      </div>

      {activeHabits.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
          No active habits found.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {activeHabits.map((habit) => {
            const logs = habitLogsMap.get(habit.id) || new Set();
            const isCompleted = logs.has(selectedDate);

            return (
              <div
                key={habit.id}
                className={`day-details-item ${isCompleted ? 'completed' : ''}`}
              >
                <div className="day-details-left">
                  <button
                    type="button"
                    className="btn-icon checklist-check-btn"
                    style={{
                      color: isCompleted ? 'var(--success)' : 'var(--text-subtle)',
                      padding: 0
                    }}
                    onClick={() => onToggleCompletion(habit.id, selectedDate)}
                    aria-label={isCompleted ? `Undo ${habit.name}` : `Complete ${habit.name}`}
                  >
                    {isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  <div className="day-details-info">
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                      {habit.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {habit.category} • {habit.frequency}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`checklist-toggle-btn ${isCompleted ? 'btn-completed' : 'btn-complete'}`}
                  onClick={() => onToggleCompletion(habit.id, selectedDate)}
                >
                  {isCompleted ? (
                    <>
                      <Check size={12} />
                      <span>Done</span>
                    </>
                  ) : (
                    <span>Complete</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
