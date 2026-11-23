/**
 * Timezone-safe Date Utilities for Personal Streak Tracker
 * Works with calendar dates as 'YYYY-MM-DD' strings to eliminate timezone/DST shifts.
 */

/**
 * Format a Date object to 'YYYY-MM-DD' using local calendar parts.
 * @param {Date} [date=new Date()]
 * @returns {string} 'YYYY-MM-DD'
 */
export function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get today's local date string
 * @returns {string} 'YYYY-MM-DD'
 */
export function getTodayDate() {
  return formatDate(new Date());
}

/**
 * Parse 'YYYY-MM-DD' string safely into a Date object at noon (to avoid DST jumps)
 * @param {string} dateStr
 * @returns {Date}
 */
export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0, 0);
}

/**
 * Add or subtract days from a 'YYYY-MM-DD' date string
 * @param {string} dateStr
 * @param {number} days
 * @returns {string} 'YYYY-MM-DD'
 */
export function addDays(dateStr, days) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * Calculate difference in calendar days between two 'YYYY-MM-DD' strings (b - a)
 * @param {string} dateStrA
 * @param {string} dateStrB
 * @returns {number}
 */
export function diffInDays(dateStrA, dateStrB) {
  const a = parseDate(dateStrA);
  const b = parseDate(dateStrB);
  const diffTime = b.getTime() - a.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if dateStrA is before dateStrB
 * @param {string} dateStrA
 * @param {string} dateStrB
 * @returns {boolean}
 */
export function isBefore(dateStrA, dateStrB) {
  return dateStrA < dateStrB;
}

/**
 * Check if dateStrA is after dateStrB
 * @param {string} dateStrA
 * @param {string} dateStrB
 * @returns {boolean}
 */
export function isAfter(dateStrA, dateStrB) {
  return dateStrA > dateStrB;
}

/**
 * Check if date is today
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isToday(dateStr) {
  return dateStr === getTodayDate();
}

/**
 * Format date for friendly human display
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDisplayDate(dateStr, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

/**
 * Format relative day (e.g. "Today", "Yesterday", or "Oct 24")
 * @param {string} dateStr
 * @returns {string}
 */
export function formatRelativeDate(dateStr) {
  const today = getTodayDate();
  const yesterday = addDays(today, -1);
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return formatDisplayDate(dateStr, { month: 'short', day: 'numeric' });
}

/**
 * Get start of week (Monday) for a given date
 * @param {string} dateStr
 * @returns {string} 'YYYY-MM-DD'
 */
export function getStartOfWeek(dateStr) {
  const d = parseDate(dateStr);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

/**
 * Get array of 7 dates (Mon-Sun) for the week of dateStr
 * @param {string} dateStr
 * @returns {string[]}
 */
export function getWeekDates(dateStr = getTodayDate()) {
  const monday = getStartOfWeek(dateStr);
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(monday, i));
  }
  return days;
}

/**
 * Get days array for a specific month calendar view
 * Returns 35 or 42 calendar slots including padding
 * @param {number} year
 * @param {number} month 0-indexed (0 = Jan, 11 = Dec)
 * @returns {Array<{ date: string, isCurrentMonth: boolean, dayOfMonth: number }>}
 */
export function getMonthCalendarGrid(year, month) {
  const firstDayOfMonth = new Date(year, month, 1, 12, 0, 0);
  const lastDayOfMonth = new Date(year, month + 1, 0, 12, 0, 0);

  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const totalDays = lastDayOfMonth.getDate();

  const grid = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0, 12, 0, 0).getDate();
  for (let i = startDayIndex - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const d = new Date(year, month - 1, day, 12, 0, 0);
    grid.push({
      date: formatDate(d),
      isCurrentMonth: false,
      dayOfMonth: day
    });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day, 12, 0, 0);
    grid.push({
      date: formatDate(d),
      isCurrentMonth: true,
      dayOfMonth: day
    });
  }

  // Next month padding to fill complete rows of 7 (up to 35 or 42 items)
  const remainingSlots = (7 - (grid.length % 7)) % 7;
  for (let day = 1; day <= remainingSlots; day++) {
    const d = new Date(year, month + 1, day, 12, 0, 0);
    grid.push({
      date: formatDate(d),
      isCurrentMonth: false,
      dayOfMonth: day
    });
  }

  return grid;
}

/**
 * Get the last N days up to today
 * @param {number} n
 * @returns {string[]}
 */
export function getLastNDays(n = 7) {
  const today = getTodayDate();
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(addDays(today, -i));
  }
  return days;
}
