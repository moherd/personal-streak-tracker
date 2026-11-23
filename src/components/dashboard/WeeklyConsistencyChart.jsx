import React from 'react';
import { getLastNDays, parseDate, getTodayDate } from '../../utils/dateUtils';

export default function WeeklyConsistencyChart({ habits = [], habitLogsMap = new Map() }) {
  const activeHabits = habits.filter((h) => !h.is_archived);
  const totalActive = activeHabits.length;
  const last7Days = getLastNDays(7);
  const todayStr = getTodayDate();

  const daysData = last7Days.map((dateStr) => {
    let completedCount = 0;
    if (totalActive > 0) {
      for (const habit of activeHabits) {
        const dates = habitLogsMap.get(habit.id);
        if (dates && dates.has(dateStr)) {
          completedCount++;
        }
      }
    }

    const percentage = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;
    const dateObj = parseDate(dateStr);
    const dayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj);
    const dayNum = dateObj.getDate();

    return {
      dateStr,
      dayLabel,
      dayNum,
      completedCount,
      percentage,
      isToday: dateStr === todayStr
    };
  });

  return (
    <div className="surface-card">
      <h3 className="section-title">
        <span>7-Day Consistency</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          {totalActive} active {totalActive === 1 ? 'habit' : 'habits'}
        </span>
      </h3>

      <div className="consistency-bars">
        {daysData.map((day) => (
          <div key={day.dateStr} className="consistency-bar-col">
            <span style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {day.percentage}%
            </span>
            <div className="bar-track" title={`${day.dateStr}: ${day.completedCount}/${totalActive} completed (${day.percentage}%)`}>
              <div
                className="bar-fill"
                style={{
                  height: `${Math.max(day.percentage > 0 ? 8 : 0, day.percentage)}%`,
                  backgroundColor: day.isToday
                    ? 'var(--primary)'
                    : day.percentage === 100
                    ? 'var(--success)'
                    : day.percentage > 0
                    ? '#60a5fa'
                    : 'transparent'
                }}
              />
            </div>
            <div className="bar-label" style={{ fontWeight: day.isToday ? 700 : 500 }}>
              {day.dayLabel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
