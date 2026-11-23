import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  getMonthCalendarGrid,
  getTodayDate,
  formatDate,
  isToday
} from '../../utils/dateUtils';
import DayDetailsModal from './DayDetailsModal';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarView({
  habits = [],
  habitLogsMap = new Map(),
  onToggleCompletion
}) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const activeHabits = habits.filter((h) => !h.is_archived);
  const totalActive = activeHabits.length;

  const calendarGrid = getMonthCalendarGrid(currentYear, currentMonth);

  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(currentYear, currentMonth, 1));

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar History</h1>
          <p className="page-subtitle">Inspect daily performance, completions, and track past consistency</p>
        </div>
      </div>

      <div className="calendar-card">
        <div className="calendar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CalendarIcon size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {monthName}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              onClick={handleGoToday}
            >
              Today
            </button>
            <button
              type="button"
              className="btn-icon"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="btn-icon"
              onClick={handleNextMonth}
              aria-label="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="calendar-grid" style={{ marginBottom: '6px' }}>
          {DAY_NAMES.map((day) => (
            <div key={day} className="calendar-day-head">
              {day}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="calendar-grid">
          {calendarGrid.map((cell) => {
            // Count completions on this date
            let completedHabits = [];
            if (totalActive > 0) {
              for (const habit of activeHabits) {
                const logs = habitLogsMap.get(habit.id);
                if (logs && logs.has(cell.date)) {
                  completedHabits.push(habit);
                }
              }
            }

            const isCurrentDay = isToday(cell.date);
            const count = completedHabits.length;

            return (
              <div
                key={cell.date}
                className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${
                  isCurrentDay ? 'is-today' : ''
                }`}
                onClick={() => setSelectedDate(cell.date)}
                title={`${cell.date}: ${count} / ${totalActive} habits completed (Click to view)`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="calendar-day-num">{cell.dayOfMonth}</span>
                  {count > 0 && (
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        backgroundColor: count === totalActive ? 'var(--success-light)' : 'var(--bg-subtle)',
                        color: count === totalActive ? 'var(--success-text)' : 'var(--text-muted)',
                        padding: '0.05rem 0.35rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {count}/{totalActive}
                    </span>
                  )}
                </div>

                <div className="calendar-dots">
                  {completedHabits.slice(0, 5).map((h) => (
                    <span
                      key={h.id}
                      className="calendar-dot"
                      style={{ backgroundColor: h.color || 'var(--primary)' }}
                    />
                  ))}
                  {completedHabits.length > 5 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.775rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                border: '2px solid var(--primary)',
                borderRadius: 'var(--radius-sm)'
              }}
            />
            <span>Today</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="calendar-dot" style={{ backgroundColor: 'var(--primary)' }} />
            <span>Completed Habit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                padding: '0.1rem 0.35rem',
                backgroundColor: 'var(--success-light)',
                color: 'var(--success-text)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            >
              100%
            </span>
            <span>All Habits Done</span>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      <DayDetailsModal
        isOpen={Boolean(selectedDate)}
        onClose={() => setSelectedDate(null)}
        selectedDate={selectedDate}
        habits={habits}
        habitLogsMap={habitLogsMap}
        onToggleCompletion={onToggleCompletion}
      />
    </div>
  );
}
