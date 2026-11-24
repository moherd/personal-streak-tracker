import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  getMonthCalendarGrid,
  getTodayDate,
  isToday
} from '../../utils/dateUtils';
import DayDetailsModal from './DayDetailsModal';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarView({
  habits = [],
  habitLogsMap = new Map(),
  onToggleCompletion,
  isPending
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
          <div className="calendar-title-wrap">
            <CalendarIcon size={20} className="calendar-title-icon" />
            <h2 className="calendar-month-title">{monthName}</h2>
          </div>

          <div className="calendar-nav-controls">
            <button
              type="button"
              className="btn btn-secondary calendar-today-btn"
              onClick={handleGoToday}
            >
              Today
            </button>
            <button
              type="button"
              className="btn-icon calendar-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="btn-icon calendar-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="calendar-grid calendar-weekdays-row">
          {DAY_NAMES.map((day) => (
            <div key={day} className="calendar-day-head">
              {day}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="calendar-grid">
          {calendarGrid.map((cell) => {
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedDate(cell.date);
                }}
                title={`${cell.date}: ${count} / ${totalActive} habits completed (Click to view)`}
              >
                <div className="calendar-cell-top">
                  <span className="calendar-day-num">{cell.dayOfMonth}</span>
                  {count > 0 && (
                    <span
                      className={`calendar-count-badge ${count === totalActive ? 'all-done' : ''}`}
                    >
                      <span className="count-full">{count}/{totalActive}</span>
                      <span className="count-compact">{count}</span>
                    </span>
                  )}
                </div>

                <div className="calendar-dots">
                  {completedHabits.slice(0, 4).map((h) => (
                    <span
                      key={h.id}
                      className="calendar-dot"
                      style={{ backgroundColor: h.color || 'var(--primary)' }}
                    />
                  ))}
                  {completedHabits.length > 4 && (
                    <span className="calendar-dot-more">+</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <div className="calendar-legend-item">
            <span className="legend-box-today" />
            <span>Today</span>
          </div>
          <div className="calendar-legend-item">
            <span className="calendar-dot" style={{ backgroundColor: 'var(--primary)' }} />
            <span>Completed</span>
          </div>
          <div className="calendar-legend-item">
            <span className="legend-badge-done">
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
        isPending={isPending}
      />
    </div>
  );
}
